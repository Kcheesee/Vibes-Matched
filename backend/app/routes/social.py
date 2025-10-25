"""
Social Routes - Friend management and activity feed
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.friendship import Friendship
from app.models.workout import WorkoutSession
from sqlalchemy import or_, and_
from datetime import datetime, timedelta

bp = Blueprint('social', __name__, url_prefix='/api/social')


@bp.route('/friends', methods=['GET'])
@jwt_required()
def get_friends():
    """
    Get user's friends list
    Returns all accepted friendships
    """
    user_id = int(get_jwt_identity())

    # Get all accepted friendships where user is either user_id or friend_id
    friendships = Friendship.query.filter(
        and_(
            or_(
                Friendship.user_id == user_id,
                Friendship.friend_id == user_id
            ),
            Friendship.status == 'accepted'
        )
    ).all()

    friends = []
    for friendship in friendships:
        # Determine which user is the friend
        friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
        friend = User.query.get(friend_id)

        if friend:
            friends.append({
                'id': friend.id,
                'name': friend.name,
                'email': friend.email,
                'friend_since': friendship.accepted_at.isoformat() if friendship.accepted_at else None,
            })

    return jsonify({'friends': friends}), 200


@bp.route('/friends/requests', methods=['GET'])
@jwt_required()
def get_friend_requests():
    """
    Get pending friend requests sent to the user
    """
    user_id = int(get_jwt_identity())

    # Get pending requests where user is the friend_id (recipient)
    requests = Friendship.query.filter_by(
        friend_id=user_id,
        status='pending'
    ).all()

    friend_requests = []
    for req in requests:
        sender = User.query.get(req.user_id)
        if sender:
            friend_requests.append({
                'id': req.id,
                'from_user': {
                    'id': sender.id,
                    'name': sender.name,
                    'email': sender.email,
                },
                'created_at': req.created_at.isoformat() if req.created_at else None,
            })

    return jsonify({'requests': friend_requests}), 200


@bp.route('/friends/add', methods=['POST'])
@jwt_required()
def send_friend_request():
    """
    Send a friend request to another user
    Can search by email
    """
    user_id = int(get_jwt_identity())
    data = request.get_json()

    friend_email = data.get('email')
    if not friend_email:
        return jsonify({'error': 'Email is required'}), 400

    # Find the user to befriend
    friend = User.query.filter_by(email=friend_email).first()
    if not friend:
        return jsonify({'error': 'User not found'}), 404

    # Can't friend yourself
    if friend.id == user_id:
        return jsonify({'error': 'You cannot add yourself as a friend'}), 400

    # Check if friendship already exists (in either direction)
    existing = Friendship.query.filter(
        or_(
            and_(Friendship.user_id == user_id, Friendship.friend_id == friend.id),
            and_(Friendship.user_id == friend.id, Friendship.friend_id == user_id)
        )
    ).first()

    if existing:
        if existing.status == 'accepted':
            return jsonify({'error': 'Already friends'}), 400
        elif existing.status == 'pending':
            return jsonify({'error': 'Friend request already pending'}), 400

    # Create new friendship request
    friendship = Friendship(
        user_id=user_id,
        friend_id=friend.id,
        status='pending'
    )

    db.session.add(friendship)
    db.session.commit()

    return jsonify({
        'message': 'Friend request sent',
        'friendship': friendship.to_dict()
    }), 201


@bp.route('/friends/accept/<int:request_id>', methods=['POST'])
@jwt_required()
def accept_friend_request(request_id):
    """
    Accept a pending friend request
    """
    user_id = int(get_jwt_identity())

    # Get the friend request
    friendship = Friendship.query.get(request_id)
    if not friendship:
        return jsonify({'error': 'Friend request not found'}), 404

    # Verify user is the recipient
    if friendship.friend_id != user_id:
        return jsonify({'error': 'Not authorized to accept this request'}), 403

    # Verify it's pending
    if friendship.status != 'pending':
        return jsonify({'error': 'Request is not pending'}), 400

    # Accept the request
    friendship.status = 'accepted'
    friendship.accepted_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'message': 'Friend request accepted',
        'friendship': friendship.to_dict(include_user_info=True)
    }), 200


@bp.route('/friends/reject/<int:request_id>', methods=['POST'])
@jwt_required()
def reject_friend_request(request_id):
    """
    Reject a pending friend request
    """
    user_id = int(get_jwt_identity())

    friendship = Friendship.query.get(request_id)
    if not friendship:
        return jsonify({'error': 'Friend request not found'}), 404

    # Verify user is the recipient
    if friendship.friend_id != user_id:
        return jsonify({'error': 'Not authorized to reject this request'}), 403

    # Delete the request
    db.session.delete(friendship)
    db.session.commit()

    return jsonify({'message': 'Friend request rejected'}), 200


@bp.route('/friends/remove/<int:friend_id>', methods=['DELETE'])
@jwt_required()
def remove_friend(friend_id):
    """
    Remove a friend (delete the friendship)
    """
    user_id = int(get_jwt_identity())

    # Find the friendship (in either direction)
    friendship = Friendship.query.filter(
        or_(
            and_(Friendship.user_id == user_id, Friendship.friend_id == friend_id),
            and_(Friendship.user_id == friend_id, Friendship.friend_id == user_id)
        )
    ).first()

    if not friendship:
        return jsonify({'error': 'Friendship not found'}), 404

    db.session.delete(friendship)
    db.session.commit()

    return jsonify({'message': 'Friend removed'}), 200


@bp.route('/activity/feed', methods=['GET'])
@jwt_required()
def get_activity_feed():
    """
    Get activity feed - recent workouts from friends
    """
    user_id = int(get_jwt_identity())

    # Get list of friend IDs
    friendships = Friendship.query.filter(
        and_(
            or_(
                Friendship.user_id == user_id,
                Friendship.friend_id == user_id
            ),
            Friendship.status == 'accepted'
        )
    ).all()

    friend_ids = []
    for friendship in friendships:
        friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
        friend_ids.append(friend_id)

    if not friend_ids:
        return jsonify({'activities': []}), 200

    # Get recent workouts from friends (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    workouts = WorkoutSession.query.filter(
        and_(
            WorkoutSession.user_id.in_(friend_ids),
            WorkoutSession.start_time >= seven_days_ago,
            WorkoutSession.end_time.isnot(None)  # Only completed workouts
        )
    ).order_by(WorkoutSession.start_time.desc()).limit(50).all()

    activities = []
    for workout in workouts:
        user = User.query.get(workout.user_id)
        if user:
            activities.append({
                'id': workout.id,
                'user': {
                    'id': user.id,
                    'name': user.name,
                },
                'workout': {
                    'profile_type': workout.profile_type,
                    'duration': workout.duration,
                    'avg_heart_rate': workout.avg_heart_rate,
                    'max_heart_rate': workout.max_heart_rate,
                    'calories': workout.calories_burned,
                    'start_time': workout.start_time.isoformat() if workout.start_time else None,
                },
            })

    return jsonify({'activities': activities}), 200


@bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    """
    Search for users by email or name
    """
    query = request.args.get('q', '').strip()

    if len(query) < 2:
        return jsonify({'error': 'Query must be at least 2 characters'}), 400

    # Search by email or name (case-insensitive)
    users = User.query.filter(
        or_(
            User.email.ilike(f'%{query}%'),
            User.name.ilike(f'%{query}%')
        )
    ).limit(20).all()

    results = []
    for user in users:
        results.append({
            'id': user.id,
            'name': user.name,
            'email': user.email,
        })

    return jsonify({'users': results}), 200


@bp.route('/workouts/<int:workout_id>/share', methods=['POST'])
@jwt_required()
def share_workout(workout_id):
    """
    Share a workout (mark it as shareable)
    Future: Can add sharing to specific platforms
    """
    user_id = int(get_jwt_identity())

    workout = WorkoutSession.query.get(workout_id)
    if not workout:
        return jsonify({'error': 'Workout not found'}), 404

    # Verify ownership
    if workout.user_id != user_id:
        return jsonify({'error': 'Not authorized to share this workout'}), 403

    # For now, just return share link data
    # In the future, could integrate with social media APIs
    share_data = {
        'workout_id': workout.id,
        'profile_type': workout.profile_type,
        'duration': workout.duration,
        'avg_heart_rate': workout.avg_heart_rate,
        'calories': workout.calories_burned,
        'message': f"Just crushed a {workout.duration}-minute {workout.profile_type} workout! 💪",
    }

    return jsonify({
        'message': 'Workout ready to share',
        'share_data': share_data
    }), 200
