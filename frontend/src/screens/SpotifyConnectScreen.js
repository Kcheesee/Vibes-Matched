/**
 * Spotify Connect Screen - Connect Spotify account
 * Burnt orange theme with glassmorphism
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as AuthSession from 'expo-auth-session';
import * as Haptics from 'expo-haptics';
import spotifyService from '../services/spotifyService';

const THEME = {
  orange: '#CC5500',
  copper: '#D87227',
  charcoal: '#0B0B0C',
  ink: '#121212',
  cream: '#F8F3E9',
};

export default function SpotifyConnectScreen({ navigation }) {
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Spotify auth hook
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    spotifyService.getAuthConfig(),
    spotifyService.getDiscovery()
  );

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleAuthSuccess(code);
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Spotify authentication failed');
      setConnecting(false);
    }
  }, [response]);

  const checkConnection = async () => {
    try {
      const authenticated = await spotifyService.isAuthenticated();
      setIsConnected(authenticated);

      if (authenticated) {
        loadUserProfile();
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await spotifyService.getCurrentUser();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading Spotify profile:', error);
    }
  };

  const handleAuthSuccess = async (code) => {
    try {
      setConnecting(true);
      await spotifyService.exchangeCodeForTokens(code, request.codeVerifier);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsConnected(true);
      await loadUserProfile();

      Alert.alert('Success!', 'Your Spotify account has been connected', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error connecting Spotify:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to connect Spotify account');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Redirect URI:', spotifyService.getRedirectUri());

      // Start OAuth flow
      await promptAsync();
    } catch (error) {
      console.error('Error starting Spotify auth:', error);
      Alert.alert('Error', 'Failed to start Spotify authentication');
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Spotify?',
      'You will need to reconnect to use Spotify features',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await spotifyService.disconnect();
            setIsConnected(false);
            setUserProfile(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradients */}
      <View style={styles.backgroundGradients}>
        <View style={[styles.gradient, styles.gradientTop]} />
        <View style={[styles.gradient, styles.gradientBottom]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>MUSIC INTEGRATION</Text>
          <Text style={styles.headerTitle}>Spotify</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Spotify Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🎧</Text>
          </View>
          <LinearGradient
            colors={[`${THEME.orange}40`, 'transparent']}
            style={styles.logoGlow}
          />
        </View>

        {/* Info Card */}
        <BlurView intensity={20} tint="dark" style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {isConnected ? 'Connected to Spotify' : 'Connect Your Spotify'}
          </Text>
          <Text style={styles.infoDescription}>
            {isConnected
              ? userProfile
                ? `Signed in as ${userProfile.display_name || userProfile.email}`
                : 'Your Spotify account is connected'
              : 'Link your Spotify account to play music during workouts matched to your heart rate and intensity.'}
          </Text>

          {isConnected && userProfile && (
            <View style={styles.profileInfo}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Plan:</Text>
                <Text style={styles.profileValue}>
                  {userProfile.product === 'premium' ? 'Spotify Premium ✓' : 'Spotify Free'}
                </Text>
              </View>
              {userProfile.product !== 'premium' && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ Spotify Premium is required for full playback control
                  </Text>
                </View>
              )}
            </View>
          )}
        </BlurView>

        {/* Features List */}
        <View style={styles.featuresList}>
          <FeatureItem
            icon="🎵"
            title="Workout Playlists"
            description="Access your Spotify playlists and liked songs"
          />
          <FeatureItem
            icon="⚡"
            title="BPM Matching"
            description="Automatic song selection based on your heart rate"
          />
          <FeatureItem
            icon="🎮"
            title="Playback Control"
            description="Play, pause, and skip tracks during workouts"
          />
          <FeatureItem
            icon="📊"
            title="Listening History"
            description="Track which songs energized your best workouts"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, connecting && styles.actionButtonDisabled]}
          onPress={isConnected ? handleDisconnect : handleConnect}
          disabled={connecting || !request}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isConnected
                ? ['#666', '#444']
                : [THEME.orange, THEME.copper]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            {connecting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.actionButtonText}>
                {isConnected ? 'Disconnect Spotify' : 'Connect with Spotify'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.charcoal,
  },
  backgroundGradients: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  gradient: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  gradientTop: {
    top: -100,
    left: -100,
    backgroundColor: `${THEME.orange}2E`,
  },
  gradientBottom: {
    bottom: -100,
    right: -100,
    backgroundColor: `${THEME.copper}22`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: THEME.orange,
    fontSize: 24,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: THEME.orange,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoIcon: {
    fontSize: 60,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -40,
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  profileInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  profileValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  warningBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    fontSize: 12,
    color: '#FFC107',
    lineHeight: 18,
  },
  featuresList: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  actionButton: {
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
