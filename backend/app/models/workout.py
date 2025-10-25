"""
Workout Models - Stores workout sessions and heart rate data
"""

from app import db
from datetime import datetime

class WorkoutSession(db.Model):
    """
    Workout Session table - stores each workout
    """
    __tablename__ = 'workout_sessions'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Key to User
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Workout timing
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)

    # Workout details
    workout_type = db.Column(db.String(50))  # 'HIIT', 'Cardio', 'Weightlifting', 'Custom', etc.
    workout_profile_name = db.Column(db.String(100))  # e.g., "Jack's Morning Lift"
    status = db.Column(db.String(20), default='active')  # 'active', 'completed', 'analyzing'

    # Heart rate statistics (calculated after workout)
    avg_heart_rate = db.Column(db.Integer)
    max_heart_rate = db.Column(db.Integer)
    min_heart_rate = db.Column(db.Integer)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    analyzed_at = db.Column(db.DateTime)  # When we finished analyzing song correlations

    # Relationships
    heart_rate_data = db.relationship('HeartRateData', backref='workout', lazy=True, cascade='all, delete-orphan')
    song_plays = db.relationship('SongPlay', backref='workout', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<WorkoutSession {self.id} - {self.workout_type}>'

    def duration_minutes(self):
        """Calculate workout duration in minutes"""
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            return delta.total_seconds() / 60
        return None

    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_minutes': self.duration_minutes(),
            'workout_type': self.workout_type,
            'workout_profile_name': self.workout_profile_name,
            'status': self.status,
            'avg_heart_rate': self.avg_heart_rate,
            'max_heart_rate': self.max_heart_rate,
            'min_heart_rate': self.min_heart_rate,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'analyzed_at': self.analyzed_at.isoformat() if self.analyzed_at else None,
            'total_songs': len(self.song_plays) if self.song_plays else 0
        }


class HeartRateData(db.Model):
    """
    Heart Rate Data table - stores heart rate readings every 10 seconds during workout
    """
    __tablename__ = 'heart_rate_data'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Key to Workout
    workout_session_id = db.Column(db.Integer, db.ForeignKey('workout_sessions.id'), nullable=False, index=True)

    # Heart rate reading
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    bpm = db.Column(db.Integer, nullable=False)  # Beats per minute

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<HeartRateData {self.bpm} BPM at {self.timestamp}>'

    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'workout_session_id': self.workout_session_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'bpm': self.bpm
        }


class SongPlay(db.Model):
    """
    Song Play table - stores which songs played during workout and heart rate correlation
    """
    __tablename__ = 'song_plays'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    workout_session_id = db.Column(db.Integer, db.ForeignKey('workout_sessions.id'), nullable=False, index=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False, index=True)

    # When the song played
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)

    # Heart rate during this song (calculated after song ends)
    avg_bpm_during_song = db.Column(db.Integer)
    max_bpm_during_song = db.Column(db.Integer)
    bpm_change = db.Column(db.Integer)  # Delta from previous 30 seconds

    # Where in the workout was this song?
    song_position_in_workout = db.Column(db.String(20))  # 'warmup', 'peak', 'cooldown'

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<SongPlay song_id={self.song_id} avg_bpm={self.avg_bpm_during_song}>'

    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        from app.models.song import Song
        song = Song.query.get(self.song_id)

        return {
            'id': self.id,
            'workout_session_id': self.workout_session_id,
            'song': song.to_dict() if song else None,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'avg_bpm_during_song': self.avg_bpm_during_song,
            'max_bpm_during_song': self.max_bpm_during_song,
            'bpm_change': self.bpm_change,
            'song_position_in_workout': self.song_position_in_workout
        }
