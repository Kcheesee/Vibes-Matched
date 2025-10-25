# Music Service Integration Guide

This guide explains how to integrate Spotify and Apple Music APIs into Vibes Matched for both iOS and Android platforms.

---

## Table of Contents
1. [Spotify Integration](#spotify-integration)
2. [Apple Music Integration](#apple-music-integration)
3. [Platform-Specific Notes](#platform-specific-notes)
4. [Testing](#testing)

---

## Spotify Integration

### Prerequisites
- Spotify Developer Account: https://developer.spotify.com/dashboard
- Spotify Premium account (required for playback control)

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Fill in:
   - **App Name**: Vibes Matched
   - **App Description**: Workout music matching based on heart rate
   - **Redirect URI**:
     - For development: `exp://localhost:19000`
     - For production: `vibesmatched://oauth/callback`
4. Save your **Client ID** and **Client Secret**

### Step 2: Configure Backend

Create `backend/.env` file:

```bash
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:5001/api/spotify/callback
```

Update `backend/app/routes/spotify.py`:

```python
import os
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth

# Initialize Spotify OAuth
sp_oauth = SpotifyOAuth(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'),
    redirect_uri=os.getenv('SPOTIFY_REDIRECT_URI'),
    scope='user-read-playback-state user-modify-playback-state user-read-currently-playing'
)

@bp.route('/connect', methods=['GET'])
@jwt_required()
def connect_spotify():
    """Start Spotify OAuth flow"""
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({'auth_url': auth_url}), 200

@bp.route('/callback', methods=['GET'])
def spotify_callback():
    """Handle Spotify OAuth callback"""
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)

    # Store token in user's record
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    user.spotify_access_token = token_info['access_token']
    user.spotify_refresh_token = token_info['refresh_token']
    db.session.commit()

    return jsonify({'message': 'Spotify connected!'}), 200
```

### Step 3: Configure Frontend

Install Spotify SDK for React Native:

```bash
cd frontend
npm install react-native-spotify-remote
```

For iOS:
```bash
cd ios && pod install
```

Update `frontend/src/services/spotify.js`:

```javascript
import { auth, remote } from 'react-native-spotify-remote';

// Spotify Configuration
const spotifyConfig = {
  clientID: 'YOUR_SPOTIFY_CLIENT_ID',
  redirectURL: 'vibesmatched://oauth/callback',
  tokenRefreshURL: 'http://YOUR_BACKEND_URL/api/spotify/refresh',
  tokenSwapURL: 'http://YOUR_BACKEND_URL/api/spotify/swap',
  scopes: [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ]
};

export const connectSpotify = async () => {
  try {
    const session = await auth.authorize(spotifyConfig);
    return session;
  } catch (error) {
    console.error('Spotify auth failed:', error);
    throw error;
  }
};

export const getCurrentlyPlaying = async () => {
  try {
    const playerState = await remote.getPlayerState();
    return {
      track: playerState.track.name,
      artist: playerState.track.artist.name,
      uri: playerState.track.uri,
      duration: playerState.track.duration,
      position: playerState.playbackPosition
    };
  } catch (error) {
    console.error('Failed to get current track:', error);
    return null;
  }
};

export const getAudioFeatures = async (trackUri) => {
  const trackId = trackUri.split(':')[2];
  const response = await fetch(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    }
  );
  return response.json();
};
```

### Step 4: iOS Configuration

Update `ios/VibesMatched/Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>spotify</string>
</array>

<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>vibesmatched</string>
        </array>
    </dict>
</array>
```

### Step 5: Android Configuration

Update `android/app/src/main/AndroidManifest.xml`:

```xml
<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="vibesmatched"
            android:host="oauth" />
    </intent-filter>
</activity>
```

---

## Apple Music Integration

### Prerequisites
- Apple Developer Account ($99/year)
- MusicKit API Key

### Step 1: Create MusicKit Identifier

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Keys** → **+** (Create new key)
4. Enable **MusicKit**
5. Download the `.p8` key file
6. Note your **Key ID** and **Team ID**

### Step 2: Generate MusicKit Token (Backend)

Install dependencies:

```bash
cd backend
pip install pyjwt cryptography
```

Create `backend/app/utils/apple_music.py`:

```python
import jwt
import time
import os

def generate_apple_music_token():
    """Generate Apple Music API developer token"""

    # Load your .p8 key
    with open('path/to/AuthKey_XXXXXXXXXX.p8', 'r') as f:
        private_key = f.read()

    # Token payload
    payload = {
        'iss': 'YOUR_TEAM_ID',  # Team ID from Apple Developer
        'iat': int(time.time()),
        'exp': int(time.time()) + 15777000,  # 6 months expiry
    }

    # Token headers
    headers = {
        'alg': 'ES256',
        'kid': 'YOUR_KEY_ID'  # Key ID from MusicKit key
    }

    # Generate token
    token = jwt.encode(
        payload,
        private_key,
        algorithm='ES256',
        headers=headers
    )

    return token
```

### Step 3: Frontend Integration

Install Apple Music SDK:

```bash
cd frontend
npx expo install react-native-music-kit
```

Update `frontend/src/services/appleMusic.js`:

```javascript
import MusicKit from 'react-native-music-kit';

// Initialize MusicKit
export const initializeAppleMusic = async () => {
  try {
    await MusicKit.configure({
      developerToken: 'YOUR_DEVELOPER_TOKEN_FROM_BACKEND',
      app: {
        name: 'Vibes Matched',
        build: '1.0.0'
      }
    });
  } catch (error) {
    console.error('MusicKit initialization failed:', error);
  }
};

// Request user authorization
export const authorizeAppleMusic = async () => {
  try {
    const status = await MusicKit.authorize();
    return status === 'authorized';
  } catch (error) {
    console.error('Apple Music authorization failed:', error);
    return false;
  }
};

// Get currently playing track
export const getCurrentlyPlaying = async () => {
  try {
    const player = MusicKit.getInstance().player;
    const currentItem = player.nowPlayingItem;

    if (!currentItem) return null;

    return {
      id: currentItem.id,
      title: currentItem.attributes.name,
      artist: currentItem.attributes.artistName,
      album: currentItem.attributes.albumName,
      duration: currentItem.attributes.durationInMillis,
      artwork: currentItem.attributes.artwork.url
    };
  } catch (error) {
    console.error('Failed to get current track:', error);
    return null;
  }
};

// Play a song
export const playSong = async (songId) => {
  try {
    const player = MusicKit.getInstance().player;
    await player.setQueue({ song: songId });
    await player.play();
  } catch (error) {
    console.error('Failed to play song:', error);
  }
};
```

### Step 4: iOS Configuration (Apple Music)

Update `ios/Podfile`:

```ruby
pod 'AppleMusicKit', '~> 1.0'
```

Run:
```bash
cd ios && pod install
```

Update `ios/VibesMatched/Info.plist`:

```xml
<key>NSAppleMusicUsageDescription</key>
<string>We need access to Apple Music to play songs during your workout</string>

<key>SKCloudServiceCapability</key>
<string>musicCatalogPlayback</string>
```

### Step 5: Android Configuration (Apple Music)

**Note**: Apple Music is not officially supported on Android. Consider using:
- Web-based Apple Music API (limited functionality)
- Encourage users to use Spotify on Android
- Build iOS-first, Android with Spotify only

---

## Platform-Specific Notes

### iOS
- **Spotify**: Requires Spotify app installed for best experience
- **Apple Music**: Native integration, best performance
- **Background Audio**: Enable background modes in Xcode
  - Go to **Signing & Capabilities** → **Background Modes**
  - Enable "Audio, AirPlay, and Picture in Picture"

### Android
- **Spotify**: Better support than Apple Music
- **Apple Music**: Limited or no native support
- **Permissions**: Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

---

## Testing

### Test Spotify Integration

```javascript
// In your React Native component
import { connectSpotify, getCurrentlyPlaying } from '../services/spotify';

const testSpotify = async () => {
  try {
    // Connect
    await connectSpotify();
    console.log('✅ Spotify connected!');

    // Get current track
    const track = await getCurrentlyPlaying();
    console.log('🎵 Now playing:', track);

  } catch (error) {
    console.error('❌ Spotify test failed:', error);
  }
};
```

### Test Apple Music Integration

```javascript
// In your React Native component
import { initializeAppleMusic, authorizeAppleMusic, getCurrentlyPlaying } from '../services/appleMusic';

const testAppleMusic = async () => {
  try {
    // Initialize
    await initializeAppleMusic();
    console.log('✅ MusicKit initialized!');

    // Authorize
    const authorized = await authorizeAppleMusic();
    if (!authorized) {
      console.log('❌ User denied Apple Music access');
      return;
    }

    // Get current track
    const track = await getCurrentlyPlaying();
    console.log('🎵 Now playing:', track);

  } catch (error) {
    console.error('❌ Apple Music test failed:', error);
  }
};
```

---

## Environment Variables

Create a `.env` file in both frontend and backend:

**Backend `.env`:**
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5001/api/spotify/callback

APPLE_MUSIC_TEAM_ID=your_apple_team_id
APPLE_MUSIC_KEY_ID=your_apple_key_id
APPLE_MUSIC_PRIVATE_KEY_PATH=path/to/AuthKey.p8
```

**Frontend `.env`:**
```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
BACKEND_URL=http://192.168.x.x:5001
```

---

## Resources

### Spotify
- [Spotify for Developers](https://developer.spotify.com/documentation/)
- [Web API Reference](https://developer.spotify.com/documentation/web-api/)
- [React Native Spotify](https://github.com/cjam/react-native-spotify-remote)

### Apple Music
- [MusicKit Documentation](https://developer.apple.com/documentation/musickit)
- [Apple Music API](https://developer.apple.com/documentation/applemusicapi)
- [React Native Music Kit](https://github.com/react-native-music-kit/react-native-music-kit)

---

## Troubleshooting

### Spotify Issues

**"Invalid Client" Error**
- Double-check Client ID and Secret in `.env`
- Ensure Redirect URI matches exactly in Spotify Dashboard

**"Premium Required" Error**
- Playback control requires Spotify Premium
- Fallback to "Now Playing" sync only for free users

### Apple Music Issues

**"Authorization Failed"**
- Verify developer token is valid
- Check Team ID and Key ID are correct
- Ensure `.p8` key file path is correct

**"Not Available in Region"**
- Apple Music availability varies by country
- Handle gracefully with error message

---

## Next Steps

After integrating music services:
1. Implement song caching for offline playback
2. Add playlist creation/modification
3. Implement smart shuffle based on workout zones
4. Add music recommendation algorithm based on workout history
