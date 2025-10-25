import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Flask application configuration class
    Loads all settings from environment variables with sensible defaults
    """

    # Basic Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # Database config
    # Uses SQLite for development, but can switch to PostgreSQL for production
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///vibes_matched.db'
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable Flask-SQLAlchemy event system (saves memory)

    # JWT (JSON Web Token) config for authentication
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Access tokens last 24 hours
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)  # Refresh tokens last 30 days

    # Spotify API credentials
    SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
    SPOTIFY_REDIRECT_URI = os.environ.get('SPOTIFY_REDIRECT_URI') or 'http://localhost:5000/api/spotify/callback'

    # Apple Music API credentials (for future)
    APPLE_MUSIC_KEY_ID = os.environ.get('APPLE_MUSIC_KEY_ID')
    APPLE_MUSIC_TEAM_ID = os.environ.get('APPLE_MUSIC_TEAM_ID')

    # App config
    DEBUG = os.environ.get('DEBUG', 'True') == 'True'
    PORT = int(os.environ.get('PORT', 5000))
