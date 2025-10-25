"""
Workout Tracking Routes - Start/stop workouts, log heart rate, track songs
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, WorkoutSession, HeartRateData, SongPlay, Song
from app.utils.workout_analysis import analyze_workout, get_user_top_songs
from datetime import datetime

# Create Blueprint
bp = Blueprint('workouts', __name__, url_prefix='/api/workouts')


@bp.route('/start', methods=['POST'])
@jwt_required()
def start_workout():
    """
    Start a new workout session

    Expected JSON body:
    {
        "workout_type": "HIIT",  # or "Cardio", "Weightlifting", etc.
        "workout_profile_name": "Jack's Morning HIIT"  # optional
    }
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Check if user already has an active workout
    active_workout = WorkoutSession.query.filter_by(
        user_id=user_id,
        status='active'
    ).first()

    if active_workout:
        return jsonify({
            'error': 'You already have an active workout',
            'workout': active_workout.to_dict()
        }), 400

    # Create new workout session
    workout = WorkoutSession(
        user_id=user_id,
        workout_type=data.get('workout_type', 'General'),
        workout_profile_name=data.get('workout_profile_name'),
        status='active',
        start_time=datetime.utcnow()
    )

    db.session.add(workout)
    db.session.commit()

    return jsonify({
        'message': 'Workout started! Let\'s match those vibes! 💪🎵',
        'workout': workout.to_dict()
    }), 201


@bp.route('/<int:workout_id>/transition', methods=['POST'])
@jwt_required()
def transition_workout(workout_id):
    """
    Transition to a different workout type within the same session
    Example: Running → HIIT → Cooldown all in one workout session

    Expected JSON body:
    {
        "new_workout_type": "HIIT",
        "new_profile_name": "Sprint Training"
    }
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Get active workout
    workout = WorkoutSession.query.get(workout_id)

    if not workout:
        return jsonify({'error': 'Workout not found'}), 404

    if workout.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    if workout.status != 'active':
        return jsonify({'error': 'Workout is not active'}), 400

    # Update workout type and profile
    new_type = data.get('new_workout_type', workout.workout_type)
    new_profile = data.get('new_profile_name')

    # Store transition in workout_type as comma-separated list
    if workout.workout_type and new_type not in workout.workout_type:
        workout.workout_type = f"{workout.workout_type},{new_type}"
    else:
        workout.workout_type = new_type

    if new_profile:
        workout.workout_profile_name = new_profile

    db.session.commit()

    return jsonify({
        'message': f'Transitioned to {new_type}! Keep going! 🔥',
        'workout': workout.to_dict()
    }), 200


@bp.route('/<int:workout_id>/heartrate', methods=['POST'])
@jwt_required()
def log_heart_rate(workout_id):
    """
    Log a heart rate reading during workout

    Expected JSON body:
    {
        "bpm": 145,
        "timestamp": "2025-01-15T10:30:00"  # optional, defaults to now
    }
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Validate BPM
    if not data or not data.get('bpm'):
        return jsonify({'error': 'BPM is required'}), 400

    # Get workout
    workout = WorkoutSession.query.get(workout_id)

    if not workout:
        return jsonify({'error': 'Workout not found'}), 404

    if workout.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    if workout.status != 'active':
        return jsonify({'error': 'Workout is not active'}), 400

    # Create heart rate data point
    timestamp = data.get('timestamp')
    if timestamp:
        timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    else:
        timestamp = datetime.utcnow()

    hr_data = HeartRateData(
        workout_session_id=workout_id,
        bpm=data['bpm'],
        timestamp=timestamp
    )

    db.session.add(hr_data)
    db.session.commit()

    return jsonify({
        'message': 'Heart rate logged',
        'data': hr_data.to_dict()
    }), 201


@bp.route('/<int:workout_id>/song', methods=['POST'])
@jwt_required()
def log_song_play(workout_id):
    """
    Log that a song started playing during workout

    Expected JSON body:
    {
        "spotify_id": "abc123",
        "title": "Eye of the Tiger",
        "artist": "Survivor",
        "start_time": "2025-01-15T10:30:00"  # optional, defaults to now
    }
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('spotify_id'):
        return jsonify({'error': 'spotify_id is required'}), 400

    # Get workout
    workout = WorkoutSession.query.get(workout_id)

    if not workout:
        return jsonify({'error': 'Workout not found'}), 404

    if workout.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Find or create song
    song = Song.query.filter_by(spotify_id=data['spotify_id']).first()

    if not song:
        song = Song(
            spotify_id=data['spotify_id'],
            title=data.get('title', 'Unknown'),
            artist=data.get('artist', 'Unknown')
        )
        db.session.add(song)
        db.session.flush()  # Get song ID

    # Create song play record
    start_time = data.get('start_time')
    if start_time:
        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    else:
        start_time = datetime.utcnow()

    song_play = SongPlay(
        workout_session_id=workout_id,
        song_id=song.id,
        start_time=start_time
    )

    db.session.add(song_play)
    db.session.commit()

    return jsonify({
        'message': 'Song play logged',
        'song_play': song_play.to_dict()
    }), 201


@bp.route('/<int:workout_id>/end', methods=['POST'])
@jwt_required()
def end_workout(workout_id):
    """
    End an active workout session and trigger analysis
    """
    user_id = int(get_jwt_identity())

    # Get workout
    workout = WorkoutSession.query.get(workout_id)

    if not workout:
        return jsonify({'error': 'Workout not found'}), 404

    if workout.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    if workout.status != 'active':
        return jsonify({'error': 'Workout is not active'}), 400

    # Update workout
    workout.end_time = datetime.utcnow()
    workout.status = 'completed'

    # Calculate heart rate statistics
    hr_data = HeartRateData.query.filter_by(workout_session_id=workout_id).all()

    if hr_data:
        bpms = [d.bpm for d in hr_data]
        workout.avg_heart_rate = sum(bpms) // len(bpms)
        workout.max_heart_rate = max(bpms)
        workout.min_heart_rate = min(bpms)

    db.session.commit()

    return jsonify({
        'message': 'Workout completed! Great job! 💪 Analyzing your data...',
        'workout': workout.to_dict()
    }), 200


@bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_workout():
    """
    Get user's currently active workout (if any)
    """
    user_id = int(get_jwt_identity())

    workout = WorkoutSession.query.filter_by(
        user_id=user_id,
        status='active'
    ).first()

    if not workout:
        return jsonify({'active': False}), 200

    return jsonify({
        'active': True,
        'workout': workout.to_dict()
    }), 200


@bp.route('/history', methods=['GET'])
@jwt_required()
def get_workout_history():
    """
    Get user's workout history
    """
    user_id = int(get_jwt_identity())

    workouts = WorkoutSession.query.filter_by(user_id=user_id)\
        .order_by(WorkoutSession.start_time.desc())\
        .limit(50)\
        .all()

    return jsonify({
        'workouts': [w.to_dict() for w in workouts]
    }), 200


@bp.route('/<int:workout_id>', methods=['GET'])
@jwt_required()
def get_workout_details(workout_id):
    """
    Get detailed workout information including heart rate data and songs
    """
    user_id = int(get_jwt_identity())

    workout = WorkoutSession.query.get(workout_id)

    if not workout:
        return jsonify({'error': 'Workout not found'}), 404

    if workout.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Get heart rate data
    hr_data = HeartRateData.query.filter_by(workout_session_id=workout_id)\
        .order_by(HeartRateData.timestamp)\
        .all()

    # Get song plays
    song_plays = SongPlay.query.filter_by(workout_session_id=workout_id)\
        .order_by(SongPlay.start_time)\
        .all()

    return jsonify({
        'workout': workout.to_dict(),
        'heart_rate_data': [hr.to_dict() for hr in hr_data],
        'song_plays': [sp.to_dict() for sp in song_plays]
    }), 200


@bp.route('/<int:workout_id>/analyze', methods=['POST'])
@jwt_required()
def analyze_workout_endpoint(workout_id):
    """
    Analyze a completed workout to determine which songs pumped you up!
    This is THE MAGIC ALGORITHM!
    """
    user_id = int(get_jwt_identity())

    workout = WorkoutSession.query.get(workout_id)

    if not workout:
        return jsonify({'error': 'Workout not found'}), 404

    if workout.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Run the analysis
    result = analyze_workout(workout_id)

    if 'error' in result:
        return jsonify(result), 400

    return jsonify(result), 200


@bp.route('/top-songs', methods=['GET'])
@jwt_required()
def get_top_songs():
    """
    Get user's top hype and cooldown songs based on all workouts
    """
    user_id = int(get_jwt_identity())
    song_type = request.args.get('type', 'hype')  # 'hype' or 'cooldown'
    limit = int(request.args.get('limit', 20))

    songs = get_user_top_songs(user_id, song_type, limit)

    return jsonify({
        'type': song_type,
        'songs': songs,
        'count': len(songs)
    }), 200


@bp.route('/songs/library', methods=['GET'])
@jwt_required()
def get_song_library():
    """
    Get all songs in the library organized by workout zone
    Useful for browsing available songs before workouts

    Query params:
    - zone: Filter by specific zone (Zone 1, Zone 2, etc.)
    - limit: Max songs per zone (default: all)
    """
    zone_filter = request.args.get('zone')  # e.g., "Zone 5"
    limit = request.args.get('limit', type=int)

    if zone_filter:
        # Get songs for specific zone
        query = Song.query.filter_by(auto_category_zone=zone_filter)
        if limit:
            query = query.limit(limit)
        songs = query.all()

        return jsonify({
            'zone': zone_filter,
            'songs': [song.to_dict() for song in songs],
            'count': len(songs)
        }), 200

    else:
        # Get all songs organized by zone
        zones = ['Zone 5', 'Zone 4', 'Zone 3', 'Zone 2', 'Zone 1']
        library = {}

        for zone in zones:
            query = Song.query.filter_by(auto_category_zone=zone).order_by(Song.hype_score.desc())
            if limit:
                query = query.limit(limit)
            zone_songs = query.all()
            library[zone] = {
                'zone_name': zone,
                'description': get_zone_description(zone),
                'songs': [song.to_dict() for song in zone_songs],
                'count': len(zone_songs)
            }

        return jsonify({
            'library': library,
            'total_songs': Song.query.count()
        }), 200


def get_zone_description(zone):
    """Get friendly description for each workout zone"""
    descriptions = {
        'Zone 5': 'Maximum Effort - All-out intensity, sprint finish',
        'Zone 4': 'High Intensity - Push your limits, heavy lifting',
        'Zone 3': 'Moderate - Steady pace, endurance training',
        'Zone 2': 'Warmup - Light activity, getting started',
        'Zone 1': 'Cooldown/Recovery - Gentle stretching, wind down'
    }
    return descriptions.get(zone, 'Unknown zone')
