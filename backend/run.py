"""
Vibes Matched - Backend Entry Point
This file starts the Flask server
"""

from app import create_app

# Create the Flask application
app = create_app()

if __name__ == '__main__':
    # Run the development server
    # Debug mode is set in config.py
    app.run(
        host='0.0.0.0',  # Makes server accessible on network
        port=app.config['PORT'],  # Port from config (default 5000)
        debug=app.config['DEBUG']  # Debug mode from config
    )
