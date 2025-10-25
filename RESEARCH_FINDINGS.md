# Vibes Matched - Research Findings

## 🎵 Spotify Audio Features API

### What Spotify Gives Us (FOR FREE!)

Spotify's Audio Features API provides AMAZING data about every song:

#### **Tempo (BPM)** 🥁
- The actual beats per minute of the song
- Example: 118.2 BPM
- This is the song's BPM, NOT the user's heart rate BPM
- API Endpoint: `https://api.spotify.com/v1/audio-features/{track_id}`

#### **Energy** ⚡ (0.0 to 1.0)
- How intense and active the song feels
- **High energy (0.8-1.0)**: Death metal, EDM, hard rock
- **Low energy (0.0-0.3)**: Bach preludes, ambient, chill music
- Features that make it high: fast, loud, noisy, dynamic range

#### **Valence** 😊😢 (0.0 to 1.0)
- Musical "positiveness" - how happy/sad the song sounds
- **High valence (0.7-1.0)**: Happy, cheerful, euphoric
- **Low valence (0.0-0.3)**: Sad, depressed, angry
- Example: Upbeat pop = high valence, sad ballad = low valence

#### **Other Cool Features**:
- **Danceability** (0.0 to 1.0): How suitable for dancing
- **Acousticness** (0.0 to 1.0): How acoustic vs electronic
- **Instrumentalness** (0.0 to 1.0): Likelihood of no vocals
- **Loudness** (dB): Overall loudness
- **Speechiness** (0.0 to 1.0): Presence of spoken words

### Example API Response:
```json
{
  "tempo": 118.211,
  "energy": 0.842,
  "valence": 0.428,
  "danceability": 0.735,
  "acousticness": 0.012,
  "loudness": -5.234,
  "duration_ms": 234567
}
```

### 💡 How We'll Use This:
1. When a song plays during workout, we'll grab its audio features
2. Compare song's energy/tempo to user's heart rate response
3. See if high-energy songs actually pump THIS user up (or not!)
4. Build smart correlations: "Oh, you respond better to 120+ BPM songs"

---

## ❤️ Heart Rate Zones by Workout Type

### The 5 Heart Rate Zones

Formula: **Max Heart Rate = 220 - Your Age**
- 20 year old: Max HR = 200 BPM
- 30 year old: Max HR = 190 BPM
- 40 year old: Max HR = 180 BPM

#### **Zone 1: Warm-Up / Recovery** (50-60% of Max HR)
- **20 yr old**: 100-120 BPM
- **30 yr old**: 95-114 BPM
- **40 yr old**: 90-108 BPM
- **Activities**: Walking, light stretching, yoga, warm-up
- **Feel**: Easy breathing, can talk easily
- **Music Vibe**: Chill, low energy, relaxing

#### **Zone 2: Fat Burn / Easy Cardio** (60-70% of Max HR)
- **20 yr old**: 120-140 BPM
- **30 yr old**: 114-133 BPM
- **40 yr old**: 108-126 BPM
- **Activities**: Light jogging, cycling, swimming
- **Feel**: Comfortable pace, can hold conversation
- **Music Vibe**: Moderate energy, steady rhythm

#### **Zone 3: Aerobic / Endurance** (70-80% of Max HR)
- **20 yr old**: 140-160 BPM
- **30 yr old**: 133-152 BPM
- **40 yr old**: 126-144 BPM
- **Activities**: Running, cycling, moderate weightlifting
- **Feel**: Breathing harder, short sentences only
- **Music Vibe**: Higher energy, motivating, pumping

#### **Zone 4: Anaerobic / Hard Training** (80-90% of Max HR)
- **20 yr old**: 160-180 BPM
- **30 yr old**: 152-171 BPM
- **40 yr old**: 144-162 BPM
- **Activities**: Heavy weightlifting, boxing, HIIT, sprints
- **Feel**: Very hard effort, gasping for air
- **Music Vibe**: HIGH energy, aggressive, intense

#### **Zone 5: Maximum Effort** (90-100% of Max HR)
- **20 yr old**: 180-200 BPM
- **30 yr old**: 171-190 BPM
- **40 yr old**: 162-180 BPM
- **Activities**: All-out sprints, max lifts, competitive sports
- **Feel**: Cannot sustain for long, max effort
- **Music Vibe**: Absolute bangers, pure hype

---

## 🏋️ Workout Type Profiles

### Pre-Built Workout Profiles We'll Offer:

#### 1. **HIIT (High-Intensity Interval Training)**
- **Warmup Zone**: Zone 2 (60-70% max HR) - 5 mins
- **Work Intervals**: Zone 4-5 (80-95% max HR) - 30-60 seconds
- **Rest Intervals**: Zone 2-3 (60-75% max HR) - 30-90 seconds
- **Cooldown Zone**: Zone 1-2 (50-65% max HR) - 5-10 mins
- **Total Duration**: 20-30 minutes
- **Music Strategy**:
  - Warmup: Moderate energy (0.5-0.7)
  - Work: MAX energy (0.8-1.0), high tempo
  - Rest: Lower energy, catch breath
  - Cooldown: Chill vibes

#### 2. **Cardio / Running**
- **Warmup**: Zone 2 (60-70% max HR) - 5-10 mins
- **Steady State**: Zone 3 (70-80% max HR) - 20-40 mins
- **Cooldown**: Zone 1-2 (50-65% max HR) - 5-10 mins
- **Total Duration**: 30-60 minutes
- **Music Strategy**: Consistent energy, steady rhythm

#### 3. **Weightlifting / Strength Training**
- **Warmup**: Zone 2 (60-70% max HR) - 5-10 mins
- **Working Sets**: Zone 3-4 (70-85% max HR) - spikes during heavy lifts
- **Rest Between Sets**: Zone 2 (60-70% max HR)
- **Cooldown**: Zone 1-2 (50-65% max HR) - 5 mins
- **Total Duration**: 45-90 minutes
- **Music Strategy**: Hype songs for heavy lifts, moderate during rest

#### 4. **Yoga / Pilates**
- **Entire Session**: Zone 1-2 (50-65% max HR)
- **Total Duration**: 30-60 minutes
- **Music Strategy**: Calm, low energy, meditative

#### 5. **Boxing / Martial Arts**
- **Warmup**: Zone 2 (60-70% max HR) - 10 mins
- **Technique Work**: Zone 3 (70-80% max HR)
- **Sparring/Bags**: Zone 4-5 (80-95% max HR)
- **Cooldown**: Zone 1-2 (50-65% max HR) - 5-10 mins
- **Total Duration**: 45-90 minutes
- **Music Strategy**: Aggressive, high-energy, rhythmic

#### 6. **Cycling / Spinning**
- **Warmup**: Zone 2 (60-70% max HR) - 5-10 mins
- **Hills/Intervals**: Zone 3-4 (70-85% max HR)
- **Sprints**: Zone 4-5 (80-95% max HR) - optional
- **Cooldown**: Zone 1-2 (50-65% max HR) - 5-10 mins
- **Total Duration**: 30-60 minutes
- **Music Strategy**: Tempo matching pedal cadence

---

## 🎨 Custom Workout Profile Feature

### What Users Can Customize:

#### **Profile Settings:**
1. **Workout Name** (e.g., "My Morning Run", "Leg Day", "Sunday HIIT")

2. **Age** (for calculating max HR automatically)
   - Calculates: Max HR = 220 - Age

3. **Resting Heart Rate** (optional, for better accuracy)
   - User can measure first thing in morning
   - Helps calculate more personalized zones

4. **Workout Phases** (User can define each phase):
   ```
   Phase 1: Warmup
   - Target HR Zone: 60-70%
   - Duration: 10 minutes
   - Music Energy: 0.4-0.6

   Phase 2: Main Work
   - Target HR Zone: 75-85%
   - Duration: 30 minutes
   - Music Energy: 0.7-0.9

   Phase 3: Cooldown
   - Target HR Zone: 50-60%
   - Duration: 10 minutes
   - Music Energy: 0.2-0.4
   ```

5. **Music Preferences:**
   - Minimum energy level (0.0-1.0)
   - Minimum tempo (BPM)
   - Maximum tempo (BPM)
   - Prefer high valence (happy) vs low valence (intense)

6. **Auto-Detection Settings:**
   - "Start tracking when HR > X for Y minutes"
   - "Detect cooldown when HR drops below X"
   - "Auto-end after Z hours"

### Example Custom Profile:

**"Jack's Morning Lift"**
```json
{
  "name": "Jack's Morning Lift",
  "age": 25,
  "max_hr": 195,
  "resting_hr": 60,
  "phases": [
    {
      "name": "Warmup",
      "hr_range_percent": [60, 70],
      "hr_range_bpm": [117, 137],
      "target_duration_mins": 10,
      "music_energy_range": [0.4, 0.6],
      "music_tempo_range": [100, 130]
    },
    {
      "name": "Heavy Lifts",
      "hr_range_percent": [70, 85],
      "hr_range_bpm": [137, 166],
      "target_duration_mins": 45,
      "music_energy_range": [0.7, 1.0],
      "music_tempo_range": [130, 180],
      "prefer_high_valence": false
    },
    {
      "name": "Cooldown",
      "hr_range_percent": [50, 65],
      "hr_range_bpm": [98, 127],
      "target_duration_mins": 10,
      "music_energy_range": [0.2, 0.5],
      "music_tempo_range": [80, 110]
    }
  ],
  "auto_detect": {
    "start_when_hr_above": 110,
    "for_duration_minutes": 5,
    "cooldown_when_hr_below": 120,
    "auto_end_after_hours": 2
  }
}
```

---

## 💪 Implementation Strategy

### Phase 1: Basic Profiles
- Offer 6 pre-built workout profiles
- User picks their age
- App calculates their zones automatically
- Simple "Start Workout" → "End Workout" flow

### Phase 2: Smart Detection
- Auto-detect which profile they're doing based on HR patterns
- "Looks like you're doing HIIT - want me to track it?"

### Phase 3: Custom Profiles
- Let users create unlimited custom profiles
- Save favorites
- Clone and modify existing profiles
- Share profiles with friends

### Phase 4: AI Learning
- App learns user's actual zones over time
- Adjusts zones based on fitness improvements
- "Your Zone 3 used to be 140-160, but now it's 145-165 - you're getting fitter!"

---

## 🎯 Key Insights

### Why This is GENIUS:

1. **Song BPM ≠ Your BPM**
   - A 180 BPM song might pump you up to 160 BPM
   - Or a 120 BPM song might be your perfect Zone 3 vibe
   - We track BOTH and find correlations

2. **Energy Matters More Than BPM**
   - Song energy (Spotify metric) often matters more than tempo
   - High energy + moderate BPM might be your sweet spot

3. **Personal Preferences**
   - Some people love aggressive music for lifting
   - Others prefer upbeat happy songs
   - Valence helps us understand this

4. **Zone-Based Playlist Generation**
   - "Your Zone 4 Hype Playlist" (songs that get you to 160+ BPM)
   - "Your Zone 2 Cooldown Playlist" (songs during recovery)
   - Super personalized, super accurate

---

## 📊 Data We'll Collect

For each workout:
```json
{
  "workout_id": "123",
  "profile_type": "HIIT",
  "user_age": 25,
  "max_hr": 195,
  "timestamp_data": [
    {
      "time": "2025-01-15T10:00:00",
      "user_bpm": 145,
      "song_id": "spotify:track:abc123",
      "song_tempo": 128,
      "song_energy": 0.85,
      "song_valence": 0.42,
      "detected_phase": "warmup"
    },
    // ... every 10 seconds
  ]
}
```

Then we analyze:
- Which songs correlated with highest BPM spikes?
- Which songs played during cooldown?
- Does high song energy = high user BPM for THIS user?
- Generate playlists based on these insights!

---

---

## 🎵 BONUS FEATURE: Playlist Import & Auto-Categorization

### The Idea:
Users can import their existing Spotify playlists, and we automatically categorize each song into workout zones based on Spotify's audio features!

### How It Works:

**Step 1: User Imports Playlist**
- "Import from Spotify" button
- Select any of their existing playlists
- "Gym Bangers", "Workout Mix", "Running Jams", etc.

**Step 2: We Analyze Every Song**
```python
for song in playlist:
    audio_features = spotify_api.get_audio_features(song.id)

    # Get: tempo, energy, valence, danceability
    categorize_song(audio_features)
```

**Step 3: Auto-Categorize into Zones**
```
Song: "Eye of the Tiger"
├── Tempo: 108 BPM
├── Energy: 0.89 (HIGH)
├── Valence: 0.65 (Positive)
└── ✅ ZONE 4 - High Intensity

Song: "Weightless" by Marconi Union
├── Tempo: 60 BPM
├── Energy: 0.18 (LOW)
├── Valence: 0.31 (Calm)
└── ✅ ZONE 1 - Cooldown
```

**Step 4: Show Breakdown**
```
Your "Gym Bangers" Playlist Analysis:
├── 15 songs → Zone 4-5 (High Intensity) 💪
├── 8 songs → Zone 3 (Moderate) 🏃
├── 3 songs → Zone 2 (Warmup) 🧘
└── 2 songs → Zone 1 (Cooldown) 😌

📊 Best For: HIIT, Cardio, Boxing
⚡ Average Energy: 0.78
🎵 Average Tempo: 135 BPM
🎭 Vibe: Energetic & Motivating
```

### Categorization Algorithm:
```python
def categorize_song(audio_features):
    """
    Smart song categorization based on Spotify audio features
    Weighted formula considering energy, tempo, and valence
    """
    tempo = audio_features['tempo']
    energy = audio_features['energy']  # 0.0 to 1.0
    valence = audio_features['valence']  # 0.0 to 1.0

    # Calculate "hype score" (0-100)
    # Energy = 50% weight (most important)
    # Tempo = 30% weight
    # Valence = 20% weight (happy = more hype)
    hype_score = (energy * 50) + (tempo / 200 * 30) + (valence * 20)

    # Categorize into zones
    if hype_score >= 80:
        return {
            "zone": "Zone 5 - Maximum Effort",
            "hr_range": "90-100% max HR",
            "activities": ["Sprints", "Max lifts", "Competition"]
        }
    elif hype_score >= 65:
        return {
            "zone": "Zone 4 - High Intensity",
            "hr_range": "80-90% max HR",
            "activities": ["HIIT", "Boxing", "Heavy lifting"]
        }
    elif hype_score >= 50:
        return {
            "zone": "Zone 3 - Moderate",
            "hr_range": "70-80% max HR",
            "activities": ["Running", "Cycling", "Cardio"]
        }
    elif hype_score >= 35:
        return {
            "zone": "Zone 2 - Warmup",
            "hr_range": "60-70% max HR",
            "activities": ["Light jog", "Warmup", "Recovery"]
        }
    else:
        return {
            "zone": "Zone 1 - Cooldown",
            "hr_range": "50-60% max HR",
            "activities": ["Walking", "Stretching", "Cooldown"]
        }
```

### Advanced Features:

#### 1. **"Playlist Surgery"**
```
⚠️ Analysis: Your "Workout Mix" playlist
Problem: 80% Zone 3 songs, missing high-intensity tracks

💡 Suggestion:
+ Add 5 Zone 4-5 songs for peak intensity
+ Add 2 Zone 1 songs for proper cooldown

[Auto-Fix Playlist] [Manual Edit]
```

#### 2. **"Smart Shuffle"**
Reorganize playlist to match workout progression:
```
Original Order:
1. High energy song
2. Slow song
3. Medium song
4. High energy song
... (random)

Smart Shuffle Order:
├── Warmup (Songs 1-3): Zone 2
├── Build (Songs 4-6): Zone 3
├── Peak (Songs 7-15): Zone 4-5
└── Cooldown (Songs 16-18): Zone 1

[Apply Smart Shuffle]
```

#### 3. **"Playlist Report Card"**
```
📊 "Beast Mode" Playlist Analysis

Grade: A-

✅ Strengths:
  - Perfect for HIIT workouts
  - High energy (avg 0.82)
  - Great tempo variety (120-160 BPM)
  - Strong motivational vibe

⚠️ Needs Improvement:
  - Only 1 cooldown song (need 3-5)
  - Missing some sub-100 BPM tracks
  - Could use more variety in Zone 3

📈 Stats:
  - Total Songs: 25
  - Average Energy: 0.82
  - Average Tempo: 145 BPM
  - Average Valence: 0.58 (Neutral-Positive)

🎯 Best For: HIIT, Boxing, Intense Cardio
⏱️ Optimal Duration: 30-45 min workouts
```

#### 4. **"Reverse Engineering" (After Tracking Workouts)**
```
🔍 Discovery: Songs that ACTUALLY pump you up!

We found these songs from your "Chill Vibes" playlist
actually get your heart racing:

1. "Song A" → Usually Zone 1, but YOU hit Zone 4!
2. "Song B" → Usually Zone 2, but YOU hit Zone 3!

💡 Want to move them to your "Hype" playlist?

[Yes, Move Them] [Keep As Is]
```

### User Workflow:

```
1. User connects Spotify ✅
2. User imports "Gym Mix" playlist
3. App analyzes 30 songs in 5 seconds
4. Shows breakdown by zone
5. User can:
   ├── Accept auto-categorization
   ├── Manually adjust songs
   ├── Apply smart shuffle
   ├── Generate new zone-specific playlists
   └── Save as custom workout profile
```

### Benefits:

✅ **Instant Value**: User gets insights without tracking a single workout
✅ **Onboarding**: Shows them how the app works before they commit
✅ **Personalization**: Can adjust categories to match their preferences
✅ **Learning**: We learn their music taste before tracking workouts
✅ **Engagement**: Fun to see your playlists analyzed

### Database Schema Update:

```sql
-- New table: ImportedPlaylists
ImportedPlaylists:
├── id
├── user_id
├── spotify_playlist_id
├── name
├── total_songs
├── analyzed_at
└── auto_categorized (boolean)

-- New table: PlaylistSongCategories
PlaylistSongCategories:
├── id
├── imported_playlist_id
├── song_id
├── auto_category (Zone 1-5)
├── user_override_category (nullable)
├── hype_score (0-100)
└── notes (user can add why they moved it)
```

---

Ready to build this thing? 🚀
