"""
Seed Database with Test Playlists
Generates dummy songs with BPM stats for various workout types
"""

from app import create_app, db
from app.models.song import Song
from datetime import datetime
import random

# Initialize Flask app
app = create_app()

# Test playlist data - organized by workout zone
TEST_SONGS = {
    "Zone 5 - Maximum Effort": [
        # High BPM (160-180), High Energy (0.85-1.0), High Valence
        {"title": "Thunder Strike", "artist": "Electric Pulse", "tempo": 178, "energy": 0.95, "valence": 0.88, "danceability": 0.92},
        {"title": "Adrenaline Rush", "artist": "The Motivators", "tempo": 175, "energy": 0.98, "valence": 0.85, "danceability": 0.89},
        {"title": "Maximum Power", "artist": "Beast Mode", "tempo": 172, "energy": 0.96, "valence": 0.90, "danceability": 0.91},
        {"title": "Go Hard or Go Home", "artist": "Iron Will", "tempo": 168, "energy": 0.94, "valence": 0.87, "danceability": 0.90},
        {"title": "Final Sprint", "artist": "Victory Lane", "tempo": 180, "energy": 0.99, "valence": 0.92, "danceability": 0.94},
        {"title": "No Limits", "artist": "Peak Performance", "tempo": 176, "energy": 0.97, "valence": 0.89, "danceability": 0.88},
        {"title": "Beast Unleashed", "artist": "Alpha Squad", "tempo": 174, "energy": 0.95, "valence": 0.91, "danceability": 0.93},
        {"title": "Unstoppable Force", "artist": "Titan Crew", "tempo": 170, "energy": 0.93, "valence": 0.86, "danceability": 0.87},
    ],

    "Zone 4 - High Intensity": [
        # Medium-High BPM (145-160), High Energy (0.75-0.85)
        {"title": "Push Through", "artist": "Momentum", "tempo": 158, "energy": 0.84, "valence": 0.78, "danceability": 0.85},
        {"title": "Stronger Every Day", "artist": "Rise Up", "tempo": 152, "energy": 0.82, "valence": 0.75, "danceability": 0.83},
        {"title": "Heart of a Lion", "artist": "Courage Crew", "tempo": 155, "energy": 0.83, "valence": 0.80, "danceability": 0.84},
        {"title": "Never Back Down", "artist": "Warriors", "tempo": 150, "energy": 0.81, "valence": 0.77, "danceability": 0.82},
        {"title": "Climb Higher", "artist": "Summit Seekers", "tempo": 148, "energy": 0.79, "valence": 0.74, "danceability": 0.81},
        {"title": "Fire Inside", "artist": "Burn Bright", "tempo": 156, "energy": 0.85, "valence": 0.79, "danceability": 0.86},
        {"title": "Relentless", "artist": "Grind Mode", "tempo": 153, "energy": 0.80, "valence": 0.76, "danceability": 0.80},
        {"title": "Power Surge", "artist": "Electric Dreams", "tempo": 160, "energy": 0.86, "valence": 0.81, "danceability": 0.87},
    ],

    "Zone 3 - Moderate": [
        # Medium BPM (125-145), Moderate Energy (0.60-0.75)
        {"title": "Steady Rhythm", "artist": "The Groove", "tempo": 135, "energy": 0.72, "valence": 0.68, "danceability": 0.78},
        {"title": "Keep Moving Forward", "artist": "Progress", "tempo": 132, "energy": 0.70, "valence": 0.65, "danceability": 0.76},
        {"title": "In The Zone", "artist": "Flow State", "tempo": 138, "energy": 0.73, "valence": 0.70, "danceability": 0.79},
        {"title": "Momentum Builder", "artist": "Steady Pace", "tempo": 130, "energy": 0.68, "valence": 0.63, "danceability": 0.75},
        {"title": "Cruising Speed", "artist": "Highway 65", "tempo": 140, "energy": 0.74, "valence": 0.71, "danceability": 0.80},
        {"title": "Consistency Wins", "artist": "Marathon Mind", "tempo": 128, "energy": 0.67, "valence": 0.62, "danceability": 0.74},
        {"title": "Find Your Pace", "artist": "Runner's High", "tempo": 142, "energy": 0.75, "valence": 0.72, "danceability": 0.81},
        {"title": "Midpoint Energy", "artist": "Halfway There", "tempo": 136, "energy": 0.71, "valence": 0.67, "danceability": 0.77},
    ],

    "Zone 2 - Warmup": [
        # Low-Medium BPM (105-125), Lower Energy (0.50-0.65)
        {"title": "Easy Start", "artist": "Morning Vibes", "tempo": 118, "energy": 0.62, "valence": 0.58, "danceability": 0.70},
        {"title": "Gentle Motion", "artist": "Smooth Moves", "tempo": 112, "energy": 0.58, "valence": 0.55, "danceability": 0.68},
        {"title": "Warm It Up", "artist": "Starter Pack", "tempo": 120, "energy": 0.64, "valence": 0.60, "danceability": 0.72},
        {"title": "Building Heat", "artist": "Rise & Shine", "tempo": 115, "energy": 0.60, "valence": 0.57, "danceability": 0.69},
        {"title": "Getting Ready", "artist": "Prep Time", "tempo": 122, "energy": 0.65, "valence": 0.61, "danceability": 0.73},
        {"title": "Light Movement", "artist": "Easy Does It", "tempo": 110, "energy": 0.56, "valence": 0.53, "danceability": 0.67},
        {"title": "Wake Up Call", "artist": "Morning Energy", "tempo": 124, "energy": 0.63, "valence": 0.59, "danceability": 0.71},
        {"title": "Activate Mode", "artist": "Switch On", "tempo": 108, "energy": 0.55, "valence": 0.52, "danceability": 0.66},
    ],

    "Zone 1 - Cooldown/Recovery": [
        # Low BPM (80-105), Low Energy (0.30-0.50), Lower Valence
        {"title": "Wind Down", "artist": "Peaceful Mind", "tempo": 95, "energy": 0.48, "valence": 0.45, "danceability": 0.58},
        {"title": "Recovery Mode", "artist": "Rest Easy", "tempo": 88, "energy": 0.42, "valence": 0.40, "danceability": 0.52},
        {"title": "Slow Breaths", "artist": "Calm Collective", "tempo": 92, "energy": 0.45, "valence": 0.43, "danceability": 0.55},
        {"title": "Gentle Stretch", "artist": "Flexibility Flow", "tempo": 85, "energy": 0.38, "valence": 0.38, "danceability": 0.50},
        {"title": "Cool As Ice", "artist": "Chill Zone", "tempo": 98, "energy": 0.50, "valence": 0.47, "danceability": 0.60},
        {"title": "Restoration", "artist": "Healing Sounds", "tempo": 82, "energy": 0.35, "valence": 0.35, "danceability": 0.48},
        {"title": "Peaceful End", "artist": "Sunset Vibes", "tempo": 90, "energy": 0.44, "valence": 0.42, "danceability": 0.54},
        {"title": "Release & Relax", "artist": "Zen Masters", "tempo": 87, "energy": 0.40, "valence": 0.39, "danceability": 0.51},
    ]
}

def generate_additional_features(base_energy, base_tempo):
    """
    Generate realistic additional audio features based on energy and tempo
    """
    # Acousticness: Lower for high-energy workout songs
    acousticness = max(0.05, min(0.95, random.uniform(0.1, 0.3) if base_energy > 0.7 else random.uniform(0.2, 0.6)))

    # Instrumentalness: Most workout songs have vocals
    instrumentalness = random.uniform(0.0, 0.15)

    # Loudness: Higher for high-energy songs (typically -60 to 0 dB)
    loudness = -15 + (base_energy * 10) + random.uniform(-3, 3)

    # Speechiness: Low to medium for music
    speechiness = random.uniform(0.03, 0.15)

    return {
        "acousticness": round(acousticness, 3),
        "instrumentalness": round(instrumentalness, 3),
        "loudness": round(loudness, 2),
        "speechiness": round(speechiness, 3)
    }

def seed_playlists():
    """
    Create test songs in database
    """
    with app.app_context():
        print("🎵 Starting playlist seed...")
        print("=" * 60)

        total_songs = 0

        for zone_name, songs in TEST_SONGS.items():
            print(f"\n{zone_name}")
            print("-" * 60)

            for song_data in songs:
                # Check if song already exists (by title and artist)
                existing = Song.query.filter_by(
                    title=song_data['title'],
                    artist=song_data['artist']
                ).first()

                if existing:
                    print(f"  ⏭️  Skipping: {song_data['title']} (already exists)")
                    continue

                # Generate additional features
                extra_features = generate_additional_features(
                    song_data['energy'],
                    song_data['tempo']
                )

                # Create song
                song = Song(
                    spotify_id=f"spotify_test_{total_songs}_{random.randint(1000, 9999)}",
                    title=song_data['title'],
                    artist=song_data['artist'],
                    album=f"{song_data['artist']} - Best Hits",
                    duration_ms=random.randint(180000, 240000),  # 3-4 minutes
                    external_url=f"https://open.spotify.com/track/test_{total_songs}",
                    tempo=song_data['tempo'],
                    energy=song_data['energy'],
                    valence=song_data['valence'],
                    danceability=song_data['danceability'],
                    acousticness=extra_features['acousticness'],
                    instrumentalness=extra_features['instrumentalness'],
                    loudness=extra_features['loudness'],
                    speechiness=extra_features['speechiness'],
                    audio_features_fetched_at=datetime.utcnow()
                )

                # Calculate hype score and zone
                song.update_categorization()

                # Add to database
                db.session.add(song)
                total_songs += 1

                print(f"  ✅ Added: {song.title} by {song.artist}")
                print(f"      BPM: {song.tempo} | Energy: {song.energy} | Hype Score: {song.hype_score}")

        # Commit all songs
        db.session.commit()

        print("\n" + "=" * 60)
        print(f"✨ Successfully added {total_songs} test songs!")
        print("=" * 60)

        # Print summary by zone
        print("\n📊 Songs by Zone:")
        print("-" * 60)
        for zone in ["Zone 5", "Zone 4", "Zone 3", "Zone 2", "Zone 1"]:
            count = Song.query.filter_by(auto_category_zone=zone).count()
            print(f"  {zone}: {count} songs")

        print("\n🎧 Ready to test in the app!")

if __name__ == '__main__':
    seed_playlists()
