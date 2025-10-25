"""
Song Model - Stores song information and Spotify audio features
"""

from app import db
from datetime import datetime
import json

class Song(db.Model):
    """
    Song table - stores songs from Spotify/Apple Music with their audio features
    """
    __tablename__ = 'songs'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Music service IDs
    spotify_id = db.Column(db.String(100), unique=True, index=True)
    apple_music_id = db.Column(db.String(100), unique=True, index=True)

    # Song metadata
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(200), nullable=False)
    album = db.Column(db.String(200))
    duration_ms = db.Column(db.Integer)  # Duration in milliseconds
    external_url = db.Column(db.String(500))  # Spotify/Apple Music URL

    # Spotify Audio Features (THIS IS THE GOLD!)
    tempo = db.Column(db.Float)  # BPM of the song
    energy = db.Column(db.Float)  # 0.0 to 1.0
    valence = db.Column(db.Float)  # 0.0 to 1.0 (happy vs sad)
    danceability = db.Column(db.Float)  # 0.0 to 1.0
    acousticness = db.Column(db.Float)  # 0.0 to 1.0
    instrumentalness = db.Column(db.Float)  # 0.0 to 1.0
    loudness = db.Column(db.Float)  # dB
    speechiness = db.Column(db.Float)  # 0.0 to 1.0

    # Auto-categorization
    auto_category_zone = db.Column(db.String(20))  # 'Zone 1', 'Zone 2', etc.
    hype_score = db.Column(db.Float)  # 0-100 calculated hype score

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    audio_features_fetched_at = db.Column(db.DateTime)

    # Relationships
    song_plays = db.relationship('SongPlay', backref='song', lazy=True)
    song_stats = db.relationship('SongStats', backref='song', lazy=True)

    def __repr__(self):
        return f'<Song {self.title} by {self.artist}>'

    def calculate_hype_score(self):
        """
        Calculate hype score (0-100) based on audio features
        Formula: (energy * 50) + (tempo/200 * 30) + (valence * 20)
        """
        if not (self.energy and self.tempo and self.valence):
            return None

        # Energy contributes 50%
        energy_component = self.energy * 50

        # Tempo contributes 30% (normalized to 200 BPM max)
        tempo_component = min(self.tempo / 200, 1.0) * 30

        # Valence contributes 20% (happy songs = more hype)
        valence_component = self.valence * 20

        return round(energy_component + tempo_component + valence_component, 2)

    def categorize_zone(self):
        """
        Auto-categorize song into workout zone based on hype score
        """
        hype = self.calculate_hype_score()
        if not hype:
            return None

        if hype >= 80:
            return "Zone 5"  # Maximum Effort
        elif hype >= 65:
            return "Zone 4"  # High Intensity
        elif hype >= 50:
            return "Zone 3"  # Moderate
        elif hype >= 35:
            return "Zone 2"  # Warmup
        else:
            return "Zone 1"  # Cooldown

    def update_categorization(self):
        """
        Update hype score and auto category
        Call this after fetching audio features
        """
        self.hype_score = self.calculate_hype_score()
        self.auto_category_zone = self.categorize_zone()

    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'spotify_id': self.spotify_id,
            'apple_music_id': self.apple_music_id,
            'title': self.title,
            'artist': self.artist,
            'album': self.album,
            'duration_ms': self.duration_ms,
            'external_url': self.external_url,
            'audio_features': {
                'tempo': self.tempo,
                'energy': self.energy,
                'valence': self.valence,
                'danceability': self.danceability,
                'acousticness': self.acousticness,
                'instrumentalness': self.instrumentalness,
                'loudness': self.loudness,
                'speechiness': self.speechiness
            },
            'hype_score': self.hype_score,
            'auto_category_zone': self.auto_category_zone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SongStats(db.Model):
    """
    Song Stats table - stores user-specific performance data for songs
    Tracks how THIS user responds to each song
    """
    __tablename__ = 'song_stats'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False, index=True)

    # Performance stats
    times_played_during_workout = db.Column(db.Integer, default=0)
    avg_bpm_response = db.Column(db.Float)  # Average heart rate when this song plays
    personal_hype_score = db.Column(db.Float)  # How much this song increases user's BPM
    personal_cooldown_score = db.Column(db.Float)  # How much this song decreases user's BPM

    # Metadata
    last_played_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique constraint: one stats record per user per song
    __table_args__ = (db.UniqueConstraint('user_id', 'song_id', name='_user_song_uc'),)

    def __repr__(self):
        return f'<SongStats user={self.user_id} song={self.song_id}>'

    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        from app.models.song import Song
        song = Song.query.get(self.song_id)

        return {
            'id': self.id,
            'user_id': self.user_id,
            'song': song.to_dict() if song else None,
            'times_played': self.times_played_during_workout,
            'avg_bpm_response': self.avg_bpm_response,
            'personal_hype_score': self.personal_hype_score,
            'personal_cooldown_score': self.personal_cooldown_score,
            'last_played_at': self.last_played_at.isoformat() if self.last_played_at else None
        }
