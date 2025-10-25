/**
 * Spotify Service - Handles Spotify authentication and playback
 * Uses expo-auth-session for OAuth and Spotify Web API for music control
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Required for proper auth session cleanup
WebBrowser.maybeCompleteAuthSession();

// Spotify API configuration
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // TODO: Replace with actual client ID
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

// Spotify OAuth scopes
const SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'playlist-read-private',
  'playlist-read-collaborative',
];

// Auth endpoints
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Get auth request configuration (to be used in a component with useAuthRequest hook)
   */
  getAuthConfig() {
    return {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SCOPES,
      usePKCE: true,
      redirectUri: REDIRECT_URI,
    };
  }

  /**
   * Get discovery endpoints
   */
  getDiscovery() {
    return discovery;
  }

  /**
   * Get redirect URI
   */
  getRedirectUri() {
    return REDIRECT_URI;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code, codeVerifier) {
    try {
      const response = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

        // Store tokens
        await this.saveTokens();

        return true;
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Save tokens to AsyncStorage
   */
  async saveTokens() {
    try {
      await AsyncStorage.setItem('spotify_access_token', this.accessToken);
      await AsyncStorage.setItem('spotify_refresh_token', this.refreshToken);
      await AsyncStorage.setItem('spotify_token_expires_at', this.tokenExpiresAt.toString());
    } catch (error) {
      console.error('Error saving Spotify tokens:', error);
    }
  }

  /**
   * Load tokens from AsyncStorage
   */
  async loadTokens() {
    try {
      this.accessToken = await AsyncStorage.getItem('spotify_access_token');
      this.refreshToken = await AsyncStorage.getItem('spotify_refresh_token');
      const expiresAt = await AsyncStorage.getItem('spotify_token_expires_at');

      if (expiresAt) {
        this.tokenExpiresAt = parseInt(expiresAt);
      }

      // Check if token is expired
      if (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt) {
        await this.refreshAccessToken();
      }

      return !!this.accessToken;
    } catch (error) {
      console.error('Error loading Spotify tokens:', error);
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

        // Update refresh token if provided
        if (data.refresh_token) {
          this.refreshToken = data.refresh_token;
        }

        await this.saveTokens();
        return true;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    if (this.accessToken) {
      // Check if token is expired
      if (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt) {
        try {
          await this.refreshAccessToken();
          return true;
        } catch (error) {
          return false;
        }
      }
      return true;
    }

    // Try to load tokens from storage
    return await this.loadTokens();
  }

  /**
   * Get current user's profile
   */
  async getCurrentUser() {
    try {
      const response = await this.makeAuthenticatedRequest(
        'https://api.spotify.com/v1/me'
      );
      return response;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  /**
   * Search for tracks matching workout intensity (by BPM/energy)
   */
  async getWorkoutTracks(targetBPM, genre = 'workout', limit = 20) {
    try {
      // Calculate target energy and tempo based on BPM
      const minTempo = Math.max(60, targetBPM - 10);
      const maxTempo = Math.min(200, targetBPM + 10);
      const targetEnergy = targetBPM > 140 ? 0.8 : targetBPM > 100 ? 0.6 : 0.4;

      const response = await this.makeAuthenticatedRequest(
        `https://api.spotify.com/v1/recommendations?seed_genres=${genre}&min_tempo=${minTempo}&max_tempo=${maxTempo}&target_energy=${targetEnergy}&limit=${limit}`
      );

      return response.tracks || [];
    } catch (error) {
      console.error('Error getting workout tracks:', error);
      return [];
    }
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(limit = 20) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `https://api.spotify.com/v1/me/playlists?limit=${limit}`
      );
      return response.items || [];
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  }

  /**
   * Get tracks from a playlist
   */
  async getPlaylistTracks(playlistId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
      );
      return response.items || [];
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      return [];
    }
  }

  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying() {
    try {
      const response = await this.makeAuthenticatedRequest(
        'https://api.spotify.com/v1/me/player/currently-playing'
      );
      return response;
    } catch (error) {
      console.error('Error getting currently playing:', error);
      return null;
    }
  }

  /**
   * Start/Resume playback
   */
  async play(trackUris = null, deviceId = null) {
    try {
      const body = {};
      if (trackUris) {
        body.uris = Array.isArray(trackUris) ? trackUris : [trackUris];
      }

      const url = deviceId
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : 'https://api.spotify.com/v1/me/player/play';

      await this.makeAuthenticatedRequest(url, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      return false;
    }
  }

  /**
   * Pause playback
   */
  async pause() {
    try {
      await this.makeAuthenticatedRequest(
        'https://api.spotify.com/v1/me/player/pause',
        { method: 'PUT' }
      );
      return true;
    } catch (error) {
      console.error('Error pausing:', error);
      return false;
    }
  }

  /**
   * Skip to next track
   */
  async skipToNext() {
    try {
      await this.makeAuthenticatedRequest(
        'https://api.spotify.com/v1/me/player/next',
        { method: 'POST' }
      );
      return true;
    } catch (error) {
      console.error('Error skipping to next:', error);
      return false;
    }
  }

  /**
   * Skip to previous track
   */
  async skipToPrevious() {
    try {
      await this.makeAuthenticatedRequest(
        'https://api.spotify.com/v1/me/player/previous',
        { method: 'POST' }
      );
      return true;
    } catch (error) {
      console.error('Error skipping to previous:', error);
      return false;
    }
  }

  /**
   * Make authenticated request to Spotify API
   */
  async makeAuthenticatedRequest(url, options = {}) {
    // Ensure token is valid
    if (!await this.isAuthenticated()) {
      throw new Error('Not authenticated with Spotify');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 204) {
      // No content (successful PUT/POST)
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Spotify API request failed');
    }

    return await response.json();
  }

  /**
   * Disconnect Spotify account
   */
  async disconnect() {
    try {
      await AsyncStorage.removeItem('spotify_access_token');
      await AsyncStorage.removeItem('spotify_refresh_token');
      await AsyncStorage.removeItem('spotify_token_expires_at');

      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiresAt = null;

      return true;
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      return false;
    }
  }
}

export default new SpotifyService();
