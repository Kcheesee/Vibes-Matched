"""
Workout Profile Model
Defines preset and custom workout profiles with HR zone targets
"""

from app import db
from datetime import datetime

class WorkoutProfile(db.Model):
    __tablename__ = 'workout_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # NULL for preset profiles
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    # Profile type
    is_preset = db.Column(db.Boolean, default=False)  # True for system presets, False for custom
    profile_type = db.Column(db.String(50))  # HIIT, Cardio, Strength, Yoga, Custom

    # Target HR zones (percentage of max HR)
    target_zone_min = db.Column(db.Integer)  # e.g., 70 (70% of max HR)
    target_zone_max = db.Column(db.Integer)  # e.g., 85 (85% of max HR)

    # Emoji icon for visual representation
    icon = db.Column(db.String(10), default='💪')

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='workout_profiles')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'is_preset': self.is_preset,
            'profile_type': self.profile_type,
            'target_zone_min': self.target_zone_min,
            'target_zone_max': self.target_zone_max,
            'icon': self.icon,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<WorkoutProfile {self.name}>'


def create_preset_profiles():
    """
    Create default workout profiles based on research
    From RESEARCH_FINDINGS.md:
    - Zone 1 (50-60%): Warmup/Recovery
    - Zone 2 (60-70%): Fat Burn
    - Zone 3 (70-80%): Cardio/Aerobic
    - Zone 4 (80-90%): Anaerobic/Threshold
    - Zone 5 (90-100%): Max Effort
    """

    presets = [
        # High Intensity
        {'name': 'HIIT', 'description': 'High-intensity interval training', 'profile_type': 'HIIT', 'target_zone_min': 80, 'target_zone_max': 95, 'icon': '🔥'},
        {'name': 'Sprint Training', 'description': 'Maximum effort sprints', 'profile_type': 'Sprint', 'target_zone_min': 85, 'target_zone_max': 100, 'icon': '💨'},
        {'name': 'CrossFit', 'description': 'High-intensity functional fitness', 'profile_type': 'CrossFit', 'target_zone_min': 75, 'target_zone_max': 90, 'icon': '⚡'},
        {'name': 'Kickboxing', 'description': 'Martial arts cardio', 'profile_type': 'Kickboxing', 'target_zone_min': 75, 'target_zone_max': 90, 'icon': '🥊'},

        # Cardio
        {'name': 'Running', 'description': 'Outdoor or treadmill running', 'profile_type': 'Running', 'target_zone_min': 70, 'target_zone_max': 85, 'icon': '🏃'},
        {'name': 'Cycling', 'description': 'Indoor or outdoor cycling', 'profile_type': 'Cycling', 'target_zone_min': 70, 'target_zone_max': 85, 'icon': '🚴'},
        {'name': 'Rowing', 'description': 'Full-body rowing workout', 'profile_type': 'Rowing', 'target_zone_min': 70, 'target_zone_max': 85, 'icon': '🚣'},
        {'name': 'Swimming', 'description': 'Pool or open water swimming', 'profile_type': 'Swimming', 'target_zone_min': 65, 'target_zone_max': 80, 'icon': '🏊'},
        {'name': 'Elliptical', 'description': 'Low-impact cardio', 'profile_type': 'Elliptical', 'target_zone_min': 65, 'target_zone_max': 80, 'icon': '⚙️'},
        {'name': 'Stair Climbing', 'description': 'Stair stepper workout', 'profile_type': 'Stairs', 'target_zone_min': 70, 'target_zone_max': 85, 'icon': '🪜'},
        {'name': 'Dance', 'description': 'Energetic dance cardio', 'profile_type': 'Dance', 'target_zone_min': 65, 'target_zone_max': 80, 'icon': '💃'},

        # Strength & Conditioning
        {'name': 'Strength Training', 'description': 'Weight lifting and resistance', 'profile_type': 'Strength', 'target_zone_min': 60, 'target_zone_max': 75, 'icon': '🏋️'},
        {'name': 'Functional Strength', 'description': 'Bodyweight movements', 'profile_type': 'Functional', 'target_zone_min': 60, 'target_zone_max': 75, 'icon': '💪'},
        {'name': 'Core Training', 'description': 'Focused abs and core', 'profile_type': 'Core', 'target_zone_min': 55, 'target_zone_max': 70, 'icon': '🎯'},

        # Mind & Body
        {'name': 'Yoga', 'description': 'Flexibility and mindfulness', 'profile_type': 'Yoga', 'target_zone_min': 50, 'target_zone_max': 65, 'icon': '🧘'},
        {'name': 'Pilates', 'description': 'Core-focused exercise', 'profile_type': 'Pilates', 'target_zone_min': 50, 'target_zone_max': 65, 'icon': '🤸'},
        {'name': 'Stretching', 'description': 'Recovery and flexibility', 'profile_type': 'Stretching', 'target_zone_min': 50, 'target_zone_max': 60, 'icon': '🙆'},
        {'name': 'Cooldown', 'description': 'Post-workout recovery', 'profile_type': 'Cooldown', 'target_zone_min': 50, 'target_zone_max': 60, 'icon': '🧊'},

        # Outdoor & Activities
        {'name': 'Hiking', 'description': 'Outdoor trail hiking', 'profile_type': 'Hiking', 'target_zone_min': 60, 'target_zone_max': 75, 'icon': '🥾'},
        {'name': 'Walking', 'description': 'Brisk or power walking', 'profile_type': 'Walking', 'target_zone_min': 55, 'target_zone_max': 70, 'icon': '🚶'},
    ]

    created_profiles = []
    for preset_data in presets:
        # Check if preset already exists
        existing = WorkoutProfile.query.filter_by(
            name=preset_data['name'],
            is_preset=True
        ).first()

        if not existing:
            profile = WorkoutProfile(
                **preset_data,
                is_preset=True,
                user_id=None
            )
            db.session.add(profile)
            created_profiles.append(profile)

    if created_profiles:
        db.session.commit()
        print(f"Created {len(created_profiles)} preset workout profiles")

    return created_profiles
