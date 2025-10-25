# Spotify Integration Setup Guide

## Overview
Vibes Matched now includes Spotify integration to play music during workouts matched to your heart rate and intensity. This guide will help you configure Spotify OAuth and get the feature working.

## Prerequisites
- Spotify account (Premium recommended for full playback control)
- Spotify Developer account

## Setup Steps

### 1. Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the details:
   - **App Name**: Vibes Matched
   - **App Description**: Workout music matching app
   - **Redirect URI**: Get this from the console log when you first try to connect (see step 3)
5. Save the app

### 2. Get Your Credentials
1. In your app dashboard, note your **Client ID**
2. Open `/frontend/src/services/spotifyService.js`
3. Replace `YOUR_SPOTIFY_CLIENT_ID` with your actual Client ID:
   ```javascript
   const SPOTIFY_CLIENT_ID = 'your_actual_client_id_here';
   ```

### 3. Configure Redirect URI
1. Run the app and navigate to the Spotify Connect screen
2. Tap "Connect with Spotify"
3. Check the console logs - you'll see:
   ```
   Redirect URI: exp://...
   ```
4. Copy this full URI
5. Go back to your Spotify app dashboard
6. Click "Edit Settings"
7. Add this URI to the "Redirect URIs" field
8. Click "Add"
9. Click "Save"

### 4. Test the Connection
1. In the app, tap "Connect with Spotify" again
2. You'll be redirected to Spotify's OAuth page
3. Log in and approve the permissions
4. You'll be redirected back to the app
5. Your Spotify account should now be connected!

## Features

### What Works
✅ OAuth authentication with Spotify
✅ Token management (access + refresh)
✅ User profile display
✅ Playlist access
✅ Track search by BPM/energy
✅ Playback control (play, pause, skip)
✅ Currently playing track info

### Requirements
⚠️ **Spotify Premium** is required for full playback control
- Free users can browse and see recommendations
- Premium users can control playback from the app

### Permissions Requested
The app requests these Spotify scopes:
- `user-read-email` - Get your email address
- `user-read-private` - Access your subscription info
- `user-read-playback-state` - See what you're playing
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - See current track
- `streaming` - Play music through the app
- `playlist-read-private` - Access your playlists
- `playlist-read-collaborative` - Access collaborative playlists

## Architecture

### Files Created
- `/frontend/src/services/spotifyService.js` - Spotify API service
- `/frontend/src/screens/SpotifyConnectScreen.js` - OAuth connection UI
- Updated `/frontend/src/navigation/AppNavigator.js` - Added route

### How It Works
1. User taps "Connect with Spotify"
2. Opens Spotify OAuth page in browser
3. User logs in and approves permissions
4. Spotify redirects back with authorization code
5. App exchanges code for access + refresh tokens
6. Tokens stored in AsyncStorage
7. Service automatically refreshes tokens when expired

### Token Management
- Access tokens expire after 1 hour
- Refresh tokens are used to get new access tokens
- All stored securely in AsyncStorage
- Auto-refresh happens before API calls

## Usage in Code

### Check if connected
```javascript
import spotifyService from '../services/spotifyService';

const isConnected = await spotifyService.isAuthenticated();
```

### Get workout tracks by BPM
```javascript
const tracks = await spotifyService.getWorkoutTracks(140, 'workout', 20);
// Returns 20 tracks with ~140 BPM and high energy
```

### Control playback
```javascript
// Play a track
await spotifyService.play('spotify:track:...');

// Pause
await spotifyService.pause();

// Skip
await spotifyService.skipToNext();
```

### Get user's playlists
```javascript
const playlists = await spotifyService.getUserPlaylists();
```

## Navigation

Users can access Spotify Connect from:
- HomeScreen (you'll need to add a button/card)
- Or directly navigate: `navigation.navigate('SpotifyConnect')`

## Troubleshooting

### "Not authenticated with Spotify" error
- Check if Client ID is correct in spotifyService.js
- Ensure redirect URI is added to Spotify app settings
- Try disconnecting and reconnecting

### "Authentication cancelled" message
- User cancelled the OAuth flow
- Make sure the redirect URI matches exactly

### "Playback control not working"
- Spotify Premium is required
- Make sure Spotify app is installed and has an active device
- Check that user has granted all permissions

### Token refresh fails
- User may need to reconnect
- Check if Client ID is still valid
- Ensure network connectivity

## Next Steps

To fully integrate Spotify:
1. Add "Connect Spotify" button to HomeScreen
2. Update WorkoutTrackingScreen to show Spotify playback
3. Implement BPM-based song selection during workouts
4. Add playlist selection in profile creation
5. Show listening history in workout details

## Security Notes

⚠️ **Important**: Never commit your Client ID to public repos
- Use environment variables in production
- Client ID should be stored securely
- Consider using a backend proxy for token exchange in production

## Links

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Spotify OAuth Guide](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [expo-auth-session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
