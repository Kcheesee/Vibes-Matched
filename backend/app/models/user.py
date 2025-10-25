"""
User Model - Stores user account information
"""

from app import db
from datetime import datetime
import bcrypt

class User(db.Model):
    """
    User table - stores all user accounts
    """
    __tablename__ = 'users'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # User credentials
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # User profile
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)  # Used to calculate max heart rate
    resting_heart_rate = db.Column(db.Integer)  # Optional, for better zone calculations

    # Music service tokens (encrypted in production!)
    spotify_access_token = db.Column(db.String(500))
    spotify_refresh_token = db.Column(db.String(500))
    apple_music_token = db.Column(db.String(500))
    preferred_music_service = db.Column(db.String(20), default='spotify')  # 'spotify' or 'apple_music'

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships (one user has many workouts)
    workouts = db.relationship('WorkoutSession', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, password):
        """
        Hash the password using bcrypt
        NEVER store plain text passwords!
        """
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def check_password(self, password):
        """
        Verify password against the stored hash
        Returns True if password matches, False otherwise
        """
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)

    def calculate_max_heart_rate(self):
        """
        Calculate max heart rate using the formula: 220 - age
        Returns None if age is not set
        """
        if self.age:
            return 220 - self.age
        return None

    def to_dict(self):
        """
        Convert user object to dictionary (for JSON responses)
        NEVER include password_hash or tokens in API responses!
        """
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'age': self.age,
            'resting_heart_rate': self.resting_heart_rate,
            'max_heart_rate': self.calculate_max_heart_rate(),
            'preferred_music_service': self.preferred_music_service,
            'has_spotify_connected': bool(self.spotify_access_token),
            'has_apple_music_connected': bool(self.apple_music_token),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
