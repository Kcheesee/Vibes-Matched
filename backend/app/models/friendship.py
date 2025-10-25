"""
Friendship Model - Manages friend connections between users
"""

from app import db
from datetime import datetime

class Friendship(db.Model):
    """
    Friendship table - tracks friend relationships
    Uses a bidirectional model where both users are friends
    """
    __tablename__ = 'friendships'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True)

    # Friend relationship
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Status: 'pending', 'accepted', 'blocked'
    status = db.Column(db.String(20), default='pending', nullable=False)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    accepted_at = db.Column(db.DateTime)

    # Unique constraint - prevent duplicate friend requests
    __table_args__ = (
        db.UniqueConstraint('user_id', 'friend_id', name='unique_friendship'),
    )

    def __repr__(self):
        return f'<Friendship {self.user_id} -> {self.friend_id} ({self.status})>'

    def to_dict(self, include_user_info=False):
        """
        Convert friendship to dictionary
        """
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'friend_id': self.friend_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
        }

        if include_user_info:
            # Import here to avoid circular imports
            from app.models.user import User
            friend = User.query.get(self.friend_id)
            if friend:
                result['friend'] = {
                    'id': friend.id,
                    'name': friend.name,
                    'email': friend.email,
                }

        return result
