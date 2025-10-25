# Vibes Matched - Project Plan

## Concept
An intelligent workout music app that learns which songs get YOU pumped and which help YOU cool down based on YOUR heart rate response, then automatically creates personalized playlists.

## Core Value Proposition
Unlike apps that just match song BPM to workout intensity, Vibes Matched tracks YOUR BODY'S response to specific songs. The same song might pump one person up and calm another down - this app learns your unique physiological response.

## Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **State Management**: React Context + Hooks
- **Storage**: AsyncStorage (local) + Backend API (cloud sync)

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL (better for time-series data than SQLite)
- **ORM**: SQLAlchemy
- **Auth**: JWT + OAuth (for Spotify/Apple Music)
- **Cron Jobs**: For post-workout analysis

### Integrations
- **Health Data**:
  - iOS: react-native-health (Apple HealthKit)
  - Android: Google Fit (future)
- **Music Services**:
  - Spotify API (Web API + OAuth)
  - Apple Music API (@lomray/react-native-apple-music)

## Database Schema

### Users
```sql
- id (primary key)
- email
- password_hash
- created_at
- spotify_access_token (encrypted)
- spotify_refresh_token (encrypted)
- apple_music_token (encrypted)
- preferred_music_service (spotify | apple_music)
```

### WorkoutSessions
```sql
- id (primary key)
- user_id (foreign key)
- start_time (timestamp)
- end_time (timestamp)
- workout_type (detected | manual: cardio, weights, yoga, etc.)
- status (active | completed | analyzing)
- avg_heart_rate
- max_heart_rate
- min_heart_rate
```

### HeartRateData
```sql
- id (primary key)
- workout_session_id (foreign key)
- timestamp
- bpm (beats per minute)
- created_at
```

### SongPlays
```sql
- id (primary key)
- workout_session_id (foreign key)
- song_id (foreign key to Songs table)
- start_time (timestamp)
- end_time (timestamp)
- avg_bpm_during_song (calculated from HeartRateData)
- max_bpm_during_song
- bpm_change (delta from previous song)
- song_position_in_workout (beginning | middle | cooldown)
```

### Songs
```sql
- id (primary key)
- spotify_id (nullable)
- apple_music_id (nullable)
- title
- artist
- album
- duration_ms
- external_url
- audio_features (JSON: energy, valence, danceability, tempo from Spotify API)
```

### SongStats (User-specific song performance)
```sql
- id (primary key)
- user_id (foreign key)
- song_id (foreign key)
- times_played_during_workout
- avg_bpm_response (average heart rate when this song plays)
- hype_score (calculated: how much this song increases BPM)
- cooldown_score (calculated: how much this song decreases BPM)
- last_played_at
```

### GeneratedPlaylists
```sql
- id (primary key)
- user_id (foreign key)
- playlist_type (hype | cooldown)
- name
- created_at
- spotify_playlist_id (if synced to Spotify)
- apple_music_playlist_id (if synced to Apple Music)
- song_count
```

### PlaylistSongs (junction table)
```sql
- id (primary key)
- playlist_id (foreign key)
- song_id (foreign key)
- position (order in playlist)
- added_at
```

## Key Features

### Phase 1: MVP (Proof of Concept)
1. **User Authentication**
   - Email/password signup
   - JWT auth

2. **Music Service Connection**
   - Spotify OAuth flow
   - Get currently playing track from Spotify

3. **Health Data Connection**
   - Request HealthKit permissions
   - Read heart rate data in real-time

4. **Manual Workout Tracking**
   - "Start Workout" button
   - Track heart rate every 5-10 seconds
   - Track currently playing song
   - "End Workout" button
   - Post-workout: analyze which songs correlated with high BPM

5. **Simple Playlist Generation**
   - Identify top 10 songs with highest avg BPM
   - Create "Hype Playlist"
   - Display in app (no Spotify sync yet)

### Phase 2: Intelligence
1. **Automatic Workout Detection**
   - Detect when heart rate elevates consistently
   - Auto-start tracking

2. **Cooldown Detection**
   - Detect when BPM starts declining after peak
   - Track songs during cooldown period
   - Continue tracking for 1 hour after BPM returns to resting

3. **Advanced Analytics**
   - Calculate "hype score" per song (BPM increase relative to baseline)
   - Calculate "cooldown score" (BPM decrease effectiveness)
   - Factor in:
     - When song plays in workout (beginning vs end)
     - How many times song has been played
     - Recency of plays

4. **Dual Playlist Generation**
   - "My Workout Bangers" - Top hype songs
   - "My Cooldown Vibes" - Top cooldown songs

### Phase 3: Music Service Integration
1. **Spotify Playlist Sync**
   - Create actual Spotify playlists
   - Add songs to user's Spotify account
   - Update playlists automatically as new data comes in

2. **Apple Music Playlist Sync**
   - Same as Spotify but for Apple Music

3. **Smart Playlist Updates**
   - Weekly refresh based on recent workouts
   - Option for manual refresh
   - Notifications when playlists update

### Phase 4: Social & Advanced
1. **Workout Insights**
   - Dashboard showing workout stats
   - Heart rate trends over time
   - Most played workout songs
   - Workout streaks

2. **Music Discovery**
   - Suggest songs based on similar hype scores from other users
   - "This song pumps people up - try it?"

3. **Social Features**
   - Share playlists with friends
   - Compare workout songs
   - Challenges

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

### Music Services
- `POST /api/spotify/connect` - OAuth callback
- `GET /api/spotify/currently-playing`
- `POST /api/apple-music/connect`
- `GET /api/apple-music/currently-playing`

### Workouts
- `POST /api/workouts/start` - Start new workout session
- `POST /api/workouts/:id/heartrate` - Log heart rate data point
- `POST /api/workouts/:id/song` - Log song play
- `POST /api/workouts/:id/end` - End workout, trigger analysis
- `GET /api/workouts/active` - Get current active workout
- `GET /api/workouts/history` - Get past workouts

### Analysis
- `POST /api/analysis/analyze-workout/:id` - Run post-workout analysis
- `GET /api/stats/songs` - Get user's song stats
- `GET /api/stats/top-hype` - Get top hype songs
- `GET /api/stats/top-cooldown` - Get top cooldown songs

### Playlists
- `POST /api/playlists/generate` - Generate playlists
- `GET /api/playlists/` - Get user's playlists
- `POST /api/playlists/:id/sync-spotify` - Sync to Spotify
- `POST /api/playlists/:id/sync-apple-music` - Sync to Apple Music

## Real-Time Tracking Algorithm

### During Workout:
```
Every 10 seconds:
1. Get current heart rate from HealthKit
2. Get currently playing song from Spotify/Apple Music
3. Send to backend:
   {
     workout_session_id: xxx,
     timestamp: now,
     bpm: 145,
     song: {
       spotify_id: "abc123",
       title: "Song Name",
       artist: "Artist Name"
     }
   }
4. Backend stores in HeartRateData and SongPlays tables
```

### Post-Workout Analysis:
```python
def analyze_workout(workout_session_id):
    # Get all song plays during workout
    song_plays = get_song_plays(workout_session_id)

    for song_play in song_plays:
        # Get all heart rate data during this song
        hr_data = get_hr_data_for_song(song_play)

        # Calculate stats
        avg_bpm = mean(hr_data.bpm)
        max_bpm = max(hr_data.bpm)

        # Calculate BPM change (delta from previous 30 seconds)
        previous_avg = get_previous_avg_bpm(song_play.start_time - 30s)
        bpm_change = avg_bpm - previous_avg

        # Determine position in workout
        workout_duration = workout_session.end_time - workout_session.start_time
        song_start_offset = song_play.start_time - workout_session.start_time

        if song_start_offset < workout_duration * 0.2:
            position = "warmup"
        elif song_start_offset > workout_duration * 0.8:
            position = "cooldown"
        else:
            position = "peak"

        # Update SongStats
        update_song_stats(user_id, song_id, {
            avg_bpm_response: avg_bpm,
            hype_score: calculate_hype_score(bpm_change, position),
            cooldown_score: calculate_cooldown_score(bpm_change, position)
        })
```

## MVP Development Steps

1. ✅ Set up React Native + Expo project
2. Set up Flask backend with PostgreSQL
3. Implement user authentication (JWT)
4. Integrate react-native-health for iOS
5. Implement Spotify OAuth flow
6. Get currently playing track from Spotify
7. Build "Start Workout" screen
8. Implement real-time tracking (10-second intervals)
9. Store heart rate + song data
10. Build "End Workout" screen
11. Implement post-workout analysis algorithm
12. Generate simple "Top 10 Hype Songs" list
13. Display results in app
14. Test with real workout!

## Challenges & Solutions

### Challenge: Battery Drain
**Solution**:
- Only track when workout is active
- Use 10-second intervals (not every second)
- Use background modes efficiently
- Auto-stop after 1 hour of cooldown

### Challenge: Song Matching Accuracy
**Solution**:
- Use song ID (not title) to avoid duplicates
- Handle cases where no music is playing
- Handle rapid song skips

### Challenge: Workout Detection
**Solution**:
- Phase 1: Manual start/stop
- Phase 2: Auto-detect based on sustained elevated HR (>100 BPM for 5+ minutes)
- Let user confirm/deny auto-detected workouts

### Challenge: Privacy
**Solution**:
- All data stored with encryption
- User can delete all data anytime
- Clear privacy policy
- No sharing without explicit permission

## Success Metrics

### MVP Success:
- Successfully track 1 full workout end-to-end
- Correctly identify top 5 songs that increased BPM
- Generate a playlist of those songs

### Product Success:
- User completes 5+ workouts
- Generated playlists are actually used in subsequent workouts
- User reports playlists are "accurate" to their taste

## Timeline Estimate

- **Week 1**: Setup + Auth + Health Integration
- **Week 2**: Spotify Integration + Manual Tracking
- **Week 3**: Real-time tracking + Data storage
- **Week 4**: Analysis algorithm + Playlist generation
- **Week 5**: UI polish + Testing
- **Week 6**: Beta testing with real users

## Next Steps

1. Create new Expo project
2. Set up Flask backend with PostgreSQL
3. Design database schema
4. Implement authentication
5. Start with Spotify integration (larger user base)
6. Build manual workout tracking
