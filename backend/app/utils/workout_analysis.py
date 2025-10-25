"""
Workout Analysis - Algorithm to correlate songs with heart rate response
This is the CORE INTELLIGENCE of Vibes Matched!
"""

from app import db
from app.models import WorkoutSession, HeartRateData, SongPlay, Song, SongStats
from datetime import datetime, timedelta
from statistics import mean


def analyze_workout(workout_id):
    """
    Analyze a completed workout to determine which songs pumped the user up

    Returns:
        dict with analysis results and top hype/cooldown songs
    """
    workout = WorkoutSession.query.get(workout_id)

    if not workout:
        return {'error': 'Workout not found'}

    if workout.status != 'completed':
        return {'error': 'Workout must be completed before analysis'}

    # Get all song plays and heart rate data
    song_plays = SongPlay.query.filter_by(workout_session_id=workout_id).all()
    hr_data = HeartRateData.query.filter_by(workout_session_id=workout_id)\
        .order_by(HeartRateData.timestamp).all()

    if not song_plays:
        return {'message': 'No songs tracked during this workout'}

    if not hr_data:
        return {'message': 'No heart rate data available for analysis'}

    # Calculate baseline heart rate (first 2 minutes or 20% of workout)
    workout_duration = (workout.end_time - workout.start_time).total_seconds()
    baseline_window = min(120, workout_duration * 0.2)  # 2 minutes or 20% of workout
    baseline_cutoff = workout.start_time + timedelta(seconds=baseline_window)

    baseline_hr_data = [hr for hr in hr_data if hr.timestamp <= baseline_cutoff]
    baseline_bpm = mean([hr.bpm for hr in baseline_hr_data]) if baseline_hr_data else None

    # Analyze each song play
    song_analysis = []

    for song_play in song_plays:
        analysis = analyze_song_play(song_play, hr_data, baseline_bpm, workout)

        if analysis:
            # Update SongPlay with calculated data
            song_play.avg_bpm_during_song = analysis['avg_bpm']
            song_play.max_bpm_during_song = analysis['max_bpm']
            song_play.bpm_change = analysis['bpm_change']
            song_play.song_position_in_workout = analysis['position']

            song_analysis.append(analysis)

            # Update user's SongStats
            update_song_stats(workout.user_id, song_play.song_id, analysis)

    # Mark workout as analyzed
    workout.status = 'analyzed'
    workout.analyzed_at = datetime.utcnow()

    db.session.commit()

    # Sort songs by hype score
    hype_songs = sorted(
        [s for s in song_analysis if s['hype_score'] > 0],
        key=lambda x: x['hype_score'],
        reverse=True
    )

    cooldown_songs = sorted(
        [s for s in song_analysis if s['cooldown_score'] > 0],
        key=lambda x: x['cooldown_score'],
        reverse=True
    )

    return {
        'workout_id': workout_id,
        'baseline_bpm': baseline_bpm,
        'songs_analyzed': len(song_analysis),
        'top_hype_songs': hype_songs[:10],
        'top_cooldown_songs': cooldown_songs[:10],
        'message': 'Workout analyzed successfully! 🎵💪'
    }


def analyze_song_play(song_play, all_hr_data, baseline_bpm, workout):
    """
    Analyze a single song play to determine its effect on heart rate

    Returns:
        dict with song analysis data
    """
    # Get heart rate data during this song
    if not song_play.end_time:
        # If song didn't finish, estimate end time (3 minutes max)
        song_play.end_time = song_play.start_time + timedelta(minutes=3)

    hr_during_song = [
        hr for hr in all_hr_data
        if song_play.start_time <= hr.timestamp <= song_play.end_time
    ]

    if not hr_during_song:
        return None

    # Calculate statistics
    bpms = [hr.bpm for hr in hr_during_song]
    avg_bpm = mean(bpms)
    max_bpm = max(bpms)
    min_bpm = min(bpms)

    # Calculate BPM change from previous 30 seconds
    previous_window_start = song_play.start_time - timedelta(seconds=30)
    previous_hr = [
        hr for hr in all_hr_data
        if previous_window_start <= hr.timestamp < song_play.start_time
    ]

    if previous_hr:
        previous_avg = mean([hr.bpm for hr in previous_hr])
        bpm_change = avg_bpm - previous_avg
    else:
        bpm_change = avg_bpm - baseline_bpm if baseline_bpm else 0

    # Determine position in workout
    workout_duration = (workout.end_time - workout.start_time).total_seconds()
    song_offset = (song_play.start_time - workout.start_time).total_seconds()
    position_ratio = song_offset / workout_duration

    if position_ratio < 0.2:
        position = 'warmup'
    elif position_ratio > 0.8:
        position = 'cooldown'
    else:
        position = 'peak'

    # Calculate hype score (how much this song increased BPM)
    # Higher score = better hype song
    hype_score = 0
    if bpm_change > 0:
        # Positive BPM change = hype
        hype_score = bpm_change

        # Bonus if it happened during peak workout
        if position == 'peak':
            hype_score *= 1.5

        # Bonus for reaching high BPM zones
        if avg_bpm > 160:
            hype_score *= 1.2

    # Calculate cooldown score (how well this song helps recovery)
    cooldown_score = 0
    if bpm_change < 0:
        # Negative BPM change = good for cooldown
        cooldown_score = abs(bpm_change)

        # Bonus if it happened during cooldown period
        if position == 'cooldown':
            cooldown_score *= 1.5

        # Bonus for effective recovery (bringing BPM down significantly)
        if abs(bpm_change) > 10:
            cooldown_score *= 1.2

    # Get song details
    song = Song.query.get(song_play.song_id)

    return {
        'song_play_id': song_play.id,
        'song': song.to_dict() if song else None,
        'avg_bpm': round(avg_bpm),
        'max_bpm': max_bpm,
        'min_bpm': min_bpm,
        'bpm_change': round(bpm_change, 1),
        'position': position,
        'hype_score': round(hype_score, 2),
        'cooldown_score': round(cooldown_score, 2)
    }


def update_song_stats(user_id, song_id, analysis):
    """
    Update user's personal stats for a song based on latest play
    """
    # Find or create SongStats
    stats = SongStats.query.filter_by(user_id=user_id, song_id=song_id).first()

    if not stats:
        stats = SongStats(
            user_id=user_id,
            song_id=song_id,
            times_played_during_workout=0,
            avg_bpm_response=0,
            personal_hype_score=0,
            personal_cooldown_score=0
        )
        db.session.add(stats)

    # Update running averages
    times_played = stats.times_played_during_workout

    # Calculate new averages using weighted average
    stats.avg_bpm_response = (
        (stats.avg_bpm_response * times_played + analysis['avg_bpm']) / (times_played + 1)
    )

    stats.personal_hype_score = (
        (stats.personal_hype_score * times_played + analysis['hype_score']) / (times_played + 1)
    )

    stats.personal_cooldown_score = (
        (stats.personal_cooldown_score * times_played + analysis['cooldown_score']) / (times_played + 1)
    )

    stats.times_played_during_workout += 1
    stats.last_played_at = datetime.utcnow()

    db.session.commit()


def get_user_top_songs(user_id, song_type='hype', limit=20):
    """
    Get user's top hype or cooldown songs based on all workout history

    Args:
        user_id: User ID
        song_type: 'hype' or 'cooldown'
        limit: Number of songs to return

    Returns:
        List of songs sorted by personal score
    """
    if song_type == 'hype':
        stats = SongStats.query.filter_by(user_id=user_id)\
            .filter(SongStats.personal_hype_score > 0)\
            .order_by(SongStats.personal_hype_score.desc())\
            .limit(limit)\
            .all()
    else:  # cooldown
        stats = SongStats.query.filter_by(user_id=user_id)\
            .filter(SongStats.personal_cooldown_score > 0)\
            .order_by(SongStats.personal_cooldown_score.desc())\
            .limit(limit)\
            .all()

    return [stat.to_dict() for stat in stats]
