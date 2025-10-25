"""
Workout Profile Routes
Manage workout profiles (presets and custom)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.workout_profile import WorkoutProfile

bp = Blueprint('profiles', __name__, url_prefix='/api/profiles')


@bp.route('/', methods=['GET'])
@jwt_required()
def get_profiles():
    """
    Get all workout profiles (presets + user's custom profiles)
    """
    user_id = int(get_jwt_identity())

    # Get all preset profiles + user's custom profiles
    profiles = WorkoutProfile.query.filter(
        db.or_(
            WorkoutProfile.is_preset == True,
            WorkoutProfile.user_id == user_id
        )
    ).all()

    return jsonify({
        'profiles': [p.to_dict() for p in profiles]
    }), 200


@bp.route('/presets', methods=['GET'])
def get_presets():
    """
    Get all preset workout profiles (no auth required)
    """
    presets = WorkoutProfile.query.filter_by(is_preset=True).all()

    return jsonify({
        'presets': [p.to_dict() for p in presets]
    }), 200


@bp.route('/custom', methods=['GET'])
@jwt_required()
def get_custom_profiles():
    """
    Get user's custom workout profiles
    """
    user_id = int(get_jwt_identity())

    custom_profiles = WorkoutProfile.query.filter_by(
        user_id=user_id,
        is_preset=False
    ).all()

    return jsonify({
        'profiles': [p.to_dict() for p in custom_profiles]
    }), 200


@bp.route('/', methods=['POST'])
@jwt_required()
def create_profile():
    """
    Create a custom workout profile
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Validate required fields
    if not data.get('name'):
        return jsonify({'error': 'Profile name is required'}), 400

    if not data.get('target_zone_min') or not data.get('target_zone_max'):
        return jsonify({'error': 'Target HR zones are required'}), 400

    # Validate zone ranges
    zone_min = int(data['target_zone_min'])
    zone_max = int(data['target_zone_max'])

    if zone_min < 50 or zone_min > 100:
        return jsonify({'error': 'Minimum zone must be between 50-100%'}), 400

    if zone_max < 50 or zone_max > 100:
        return jsonify({'error': 'Maximum zone must be between 50-100%'}), 400

    if zone_min >= zone_max:
        return jsonify({'error': 'Minimum zone must be less than maximum zone'}), 400

    # Create profile
    profile = WorkoutProfile(
        user_id=user_id,
        name=data['name'],
        description=data.get('description', ''),
        profile_type='Custom',
        target_zone_min=zone_min,
        target_zone_max=zone_max,
        icon=data.get('icon', '💪'),
        is_preset=False
    )

    db.session.add(profile)
    db.session.commit()

    return jsonify({
        'message': 'Workout profile created successfully',
        'profile': profile.to_dict()
    }), 201


@bp.route('/<int:profile_id>', methods=['GET'])
@jwt_required()
def get_profile(profile_id):
    """
    Get a specific workout profile
    """
    user_id = int(get_jwt_identity())

    profile = WorkoutProfile.query.get(profile_id)

    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    # Check if user has access (preset or their own custom profile)
    if not profile.is_preset and profile.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify({'profile': profile.to_dict()}), 200


@bp.route('/<int:profile_id>', methods=['PUT'])
@jwt_required()
def update_profile(profile_id):
    """
    Update a custom workout profile (only user's own profiles)
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    profile = WorkoutProfile.query.get(profile_id)

    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    # Can't update preset profiles
    if profile.is_preset:
        return jsonify({'error': 'Cannot update preset profiles'}), 403

    # Can only update own profiles
    if profile.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403

    # Update fields
    if 'name' in data:
        profile.name = data['name']

    if 'description' in data:
        profile.description = data['description']

    if 'icon' in data:
        profile.icon = data['icon']

    if 'target_zone_min' in data:
        zone_min = int(data['target_zone_min'])
        if zone_min < 50 or zone_min > 100:
            return jsonify({'error': 'Minimum zone must be between 50-100%'}), 400
        profile.target_zone_min = zone_min

    if 'target_zone_max' in data:
        zone_max = int(data['target_zone_max'])
        if zone_max < 50 or zone_max > 100:
            return jsonify({'error': 'Maximum zone must be between 50-100%'}), 400
        profile.target_zone_max = zone_max

    # Validate zones
    if profile.target_zone_min >= profile.target_zone_max:
        return jsonify({'error': 'Minimum zone must be less than maximum zone'}), 400

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict()
    }), 200


@bp.route('/<int:profile_id>', methods=['DELETE'])
@jwt_required()
def delete_profile(profile_id):
    """
    Delete a custom workout profile (only user's own profiles)
    """
    user_id = int(get_jwt_identity())

    profile = WorkoutProfile.query.get(profile_id)

    if not profile:
        return jsonify({'error': 'Profile not found'}), 404

    # Can't delete preset profiles
    if profile.is_preset:
        return jsonify({'error': 'Cannot delete preset profiles'}), 403

    # Can only delete own profiles
    if profile.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403

    db.session.delete(profile)
    db.session.commit()

    return jsonify({'message': 'Profile deleted successfully'}), 200
