"""
Spotify Integration Routes - OAuth and API interactions
"""

from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from urllib.parse import urlencode
from app import db
from app.models import User, Song
from datetime import datetime
import os

# Create Blueprint
bp = Blueprint('spotify', __name__, url_prefix='/api/spotify')

# Spotify API URLs
SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
SPOTIFY_API_BASE = 'https://api.spotify.com/v1'


@bp.route('/connect', methods=['GET'])
@jwt_required()
def connect_spotify():
    """
    Step 1 of Spotify OAuth flow
    Redirects user to Spotify login page
    """
    user_id = get_jwt_identity()

    # Scopes we need from Spotify
    scopes = [
        'user-read-currently-playing',  # See what song is playing now
        'user-read-playback-state',     # Get playback info
        'playlist-read-private',         # Read user's playlists
        'playlist-modify-public',        # Create/modify playlists
        'playlist-modify-private',       # Create/modify private playlists
    ]

    # Build authorization URL
    params = {
        'client_id': os.environ.get('SPOTIFY_CLIENT_ID'),
        'response_type': 'code',
        'redirect_uri': os.environ.get('SPOTIFY_REDIRECT_URI'),
        'scope': ' '.join(scopes),
        'state': user_id,  # Pass user_id to callback
        'show_dialog': True
    }

    auth_url = f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"

    return jsonify({
        'auth_url': auth_url,
        'message': 'Redirect user to this URL to connect Spotify'
    }), 200


@bp.route('/callback', methods=['GET'])
def spotify_callback():
    """
    Step 2 of Spotify OAuth flow
    Spotify redirects here after user authorizes
    """
    # Get authorization code and user_id from callback
    code = request.args.get('code')
    user_id = request.args.get('state')
    error = request.args.get('error')

    if error:
        return jsonify({'error': f'Spotify authorization failed: {error}'}), 400

    if not code or not user_id:
        return jsonify({'error': 'Missing code or state parameter'}), 400

    # Exchange authorization code for access token
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': os.environ.get('SPOTIFY_REDIRECT_URI'),
        'client_id': os.environ.get('SPOTIFY_CLIENT_ID'),
        'client_secret': os.environ.get('SPOTIFY_CLIENT_SECRET')
    }

    try:
        response = requests.post(SPOTIFY_TOKEN_URL, data=token_data)
        response.raise_for_status()
        tokens = response.json()

        # Save tokens to user
        user = User.query.get(int(user_id))
        if user:
            user.spotify_access_token = tokens['access_token']
            user.spotify_refresh_token = tokens['refresh_token']
            user.preferred_music_service = 'spotify'
            db.session.commit()

            return jsonify({
                'message': 'Spotify connected successfully! 🎵',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to get Spotify tokens: {str(e)}'}), 500


@bp.route('/currently-playing', methods=['GET'])
@jwt_required()
def get_currently_playing():
    """
    Get the song currently playing on user's Spotify
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or not user.spotify_access_token:
        return jsonify({'error': 'Spotify not connected'}), 400

    # Call Spotify API
    headers = {'Authorization': f'Bearer {user.spotify_access_token}'}

    try:
        response = requests.get(
            f'{SPOTIFY_API_BASE}/me/player/currently-playing',
            headers=headers
        )

        if response.status_code == 204:
            return jsonify({'playing': False, 'message': 'No song currently playing'}), 200

        response.raise_for_status()
        data = response.json()

        if not data or not data.get('item'):
            return jsonify({'playing': False}), 200

        track = data['item']

        # Return song info
        return jsonify({
            'playing': True,
            'song': {
                'spotify_id': track['id'],
                'title': track['name'],
                'artist': ', '.join([artist['name'] for artist in track['artists']]),
                'album': track['album']['name'],
                'duration_ms': track['duration_ms'],
                'external_url': track['external_urls']['spotify']
            }
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to get currently playing: {str(e)}'}), 500


@bp.route('/audio-features/<spotify_id>', methods=['GET'])
@jwt_required()
def get_audio_features(spotify_id):
    """
    Get Spotify audio features (tempo, energy, valence) for a song
    This is the MAGIC data we use for categorization!
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or not user.spotify_access_token:
        return jsonify({'error': 'Spotify not connected'}), 400

    headers = {'Authorization': f'Bearer {user.spotify_access_token}'}

    try:
        # Get audio features
        response = requests.get(
            f'{SPOTIFY_API_BASE}/audio-features/{spotify_id}',
            headers=headers
        )
        response.raise_for_status()
        features = response.json()

        # Check if song exists in our database
        song = Song.query.filter_by(spotify_id=spotify_id).first()

        if not song:
            # Get track info too
            track_response = requests.get(
                f'{SPOTIFY_API_BASE}/tracks/{spotify_id}',
                headers=headers
            )
            track_response.raise_for_status()
            track = track_response.json()

            # Create new song in database
            song = Song(
                spotify_id=spotify_id,
                title=track['name'],
                artist=', '.join([artist['name'] for artist in track['artists']]),
                album=track['album']['name'],
                duration_ms=track['duration_ms'],
                external_url=track['external_urls']['spotify'],
                tempo=features.get('tempo'),
                energy=features.get('energy'),
                valence=features.get('valence'),
                danceability=features.get('danceability'),
                acousticness=features.get('acousticness'),
                instrumentalness=features.get('instrumentalness'),
                loudness=features.get('loudness'),
                speechiness=features.get('speechiness'),
                audio_features_fetched_at=datetime.utcnow()
            )

            # Calculate hype score and category
            song.update_categorization()

            db.session.add(song)
            db.session.commit()

        return jsonify({
            'song': song.to_dict(),
            'message': 'Audio features fetched successfully!'
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to get audio features: {str(e)}'}), 500


@bp.route('/disconnect', methods=['POST'])
@jwt_required()
def disconnect_spotify():
    """
    Disconnect user's Spotify account
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user:
        user.spotify_access_token = None
        user.spotify_refresh_token = None
        db.session.commit()

        return jsonify({'message': 'Spotify disconnected successfully'}), 200

    return jsonify({'error': 'User not found'}), 404
