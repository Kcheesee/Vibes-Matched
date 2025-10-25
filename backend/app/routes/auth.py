"""
Authentication Routes - User registration and login
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models import User

# Create a Blueprint for authentication routes
# All routes in this file will start with /api/auth
bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user

    Expected JSON body:
    {
        "email": "user@example.com",
        "password": "securepassword123",
        "name": "John Doe",
        "age": 25
    }
    """
    # Get data from request
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email'].lower()).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409

    # Create new user
    new_user = User(
        email=data['email'].lower(),
        name=data.get('name'),
        age=data.get('age')
    )

    # Hash and set password (NEVER store plain text!)
    new_user.set_password(data['password'])

    # Save to database
    try:
        db.session.add(new_user)
        db.session.commit()

        # Create JWT access token for the new user
        access_token = create_access_token(identity=str(new_user.id))
        refresh_token = create_refresh_token(identity=str(new_user.id))

        return jsonify({
            'message': 'User registered successfully! Welcome to Vibes Matched! 🎵',
            'user': new_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create user: {str(e)}'}), 500


@bp.route('/login', methods=['POST'])
def login():
    """
    Login existing user

    Expected JSON body:
    {
        "email": "user@example.com",
        "password": "securepassword123"
    }
    """
    # Get data from request
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # Find user by email
    user = User.query.filter_by(email=data['email'].lower()).first()

    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Check if user account is active
    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 403

    # Create JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful! Let\'s match those vibes! 🎵💪',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current user's profile
    Requires JWT token in Authorization header

    Header: Authorization: Bearer <your_token_here>
    """
    # Get user ID from JWT token
    user_id = int(get_jwt_identity())

    # Find user in database
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'user': user.to_dict()
    }), 200


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token
    Requires refresh token in Authorization header
    """
    # Get user ID from refresh token
    user_id = get_jwt_identity()

    # Create new access token
    new_access_token = create_access_token(identity=user_id)

    return jsonify({
        'access_token': new_access_token
    }), 200
