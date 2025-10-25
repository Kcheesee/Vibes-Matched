"""
Vibes Matched - Flask Application Factory
This file creates and configures the Flask app
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

# Initialize extensions (but don't attach to app yet)
db = SQLAlchemy()  # Database
jwt = JWTManager()  # JWT authentication

def create_app():
    """
    Application factory pattern
    Creates and configures the Flask application
    """

    # Create Flask app
    app = Flask(__name__)

    # Load configuration from config.py
    app.config.from_object(Config)

    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)  # Enable CORS for React Native to connect

    # Register blueprints (routes)
    from app.routes import auth, spotify, workouts, profiles, social
    app.register_blueprint(auth.bp)
    app.register_blueprint(spotify.bp)
    app.register_blueprint(workouts.bp)
    app.register_blueprint(profiles.bp)
    app.register_blueprint(social.bp)

    # Create database tables
    with app.app_context():
        # Import models so they're registered with SQLAlchemy
        from app.models import user, workout, song, workout_profile, friendship

        db.create_all()

        # Create preset workout profiles
        from app.models.workout_profile import create_preset_profiles
        create_preset_profiles()

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Vibes Matched API is running! 🎵💪'}

    # Root endpoint
    @app.route('/')
    def index():
        return {
            'app': 'Vibes Matched API',
            'version': '1.0.0',
            'description': 'Smart workout music matching based on your heart rate! 🎵❤️',
            'endpoints': {
                'health': '/health',
                'auth': '/api/auth/*',
                'workouts': '/api/workouts/*',
                'spotify': '/api/spotify/*'
            }
        }

    return app
