/**
 * API Service - Connects frontend to backend
 * Change API_URL to your computer's IP address
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Change this to your Mac's IP address!
// Run: ipconfig getifaddr en0
const API_URL = 'http://192.168.0.188:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (email, password, name, age) =>
    api.post('/auth/register', { email, password, name, age }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  getMe: () =>
    api.get('/auth/me'),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }),
};

// Workout endpoints
export const workoutService = {
  startWorkout: (workoutType, profileName) =>
    api.post('/workouts/start', {
      workout_type: workoutType,
      workout_profile_name: profileName,
    }),

  // Transition to different workout type in same session
  transitionWorkout: (workoutId, new_workout_type, new_profile_name) =>
    api.post(`/workouts/${workoutId}/transition`, { new_workout_type, new_profile_name }),

  logHeartRate: (workoutId, bpm, timestamp = null) =>
    api.post(`/workouts/${workoutId}/heartrate`, { bpm, timestamp }),

  logSong: (workoutId, spotifyId, title, artist, startTime = null) =>
    api.post(`/workouts/${workoutId}/song`, {
      spotify_id: spotifyId,
      title,
      artist,
      start_time: startTime,
    }),

  endWorkout: (workoutId) =>
    api.post(`/workouts/${workoutId}/end`),

  analyzeWorkout: (workoutId) =>
    api.post(`/workouts/${workoutId}/analyze`),

  getActiveWorkout: () =>
    api.get('/workouts/active'),

  getWorkoutHistory: () =>
    api.get('/workouts/history'),

  getWorkoutDetails: (workoutId) =>
    api.get(`/workouts/${workoutId}`),

  getTopSongs: (type = 'hype', limit = 20) =>
    api.get('/workouts/top-songs', { params: { type, limit } }),

  getSongLibrary: (zone = null, limit = null) =>
    api.get('/workouts/songs/library', { params: { zone, limit } }),
};

// Spotify endpoints
export const spotifyService = {
  connectSpotify: () =>
    api.get('/spotify/connect'),

  getCurrentlyPlaying: () =>
    api.get('/spotify/currently-playing'),

  getAudioFeatures: (spotifyId) =>
    api.get(`/spotify/audio-features/${spotifyId}`),

  disconnectSpotify: () =>
    api.post('/spotify/disconnect'),
};

// Social endpoints
export const socialService = {
  // Friends
  getFriends: () =>
    api.get('/social/friends'),

  getFriendRequests: () =>
    api.get('/social/friends/requests'),

  sendFriendRequest: (email) =>
    api.post('/social/friends/add', { email }),

  acceptFriendRequest: (requestId) =>
    api.post(`/social/friends/accept/${requestId}`),

  rejectFriendRequest: (requestId) =>
    api.post(`/social/friends/reject/${requestId}`),

  removeFriend: (friendId) =>
    api.delete(`/social/friends/remove/${friendId}`),

  // Activity Feed
  getActivityFeed: () =>
    api.get('/social/activity/feed'),

  // User Search
  searchUsers: (query) =>
    api.get('/social/users/search', { params: { q: query } }),

  // Workout Sharing
  shareWorkout: (workoutId) =>
    api.post(`/social/workouts/${workoutId}/share`),
};

// Workout Profile endpoints
export const profileService = {
  // Get all profiles (presets + user's custom)
  getAllProfiles: () =>
    api.get('/profiles/'),

  // Get preset profiles only
  getPresets: () =>
    api.get('/profiles/presets'),

  // Get user's custom profiles
  getCustomProfiles: () =>
    api.get('/profiles/custom'),

  // Create custom profile
  createProfile: (profileData) =>
    api.post('/profiles/', profileData),

  // Get specific profile
  getProfile: (profileId) =>
    api.get(`/profiles/${profileId}`),

  // Update custom profile
  updateProfile: (profileId, profileData) =>
    api.put(`/profiles/${profileId}`, profileData),

  // Delete custom profile
  deleteProfile: (profileId) =>
    api.delete(`/profiles/${profileId}`),
};

export default api;
