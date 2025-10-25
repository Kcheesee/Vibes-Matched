/**
 * Music Sync Screen - Unified music service management
 * Connect Spotify, Apple Music, or sync with device's Now Playing
 * Burnt orange theme with glassmorphism
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const THEME = {
  orange: '#CC5500',
  copper: '#D87227',
  charcoal: '#0B0B0C',
};

const MUSIC_SERVICES = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎧',
    description: 'Connect your Spotify account',
    longDescription: 'Stream music directly from Spotify. Requires Spotify Premium for full playback control.',
    color: '#1DB954',
  },
  {
    id: 'apple_music',
    name: 'Apple Music',
    icon: '🎶',
    description: 'Connect Apple Music',
    longDescription: 'Sync with your Apple Music library and playlists.',
    color: '#FA243C',
  },
  {
    id: 'now_playing',
    name: 'Now Playing',
    icon: '📱',
    description: 'Sync with device playback',
    longDescription: 'Automatically sync with whatever is playing on your device.',
    color: '#007AFF',
  },
];

export default function MusicSyncScreen({ navigation }) {
  const [connectedServices, setConnectedServices] = useState({
    spotify: false,
    apple_music: false,
    now_playing: false,
  });
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    // TODO: Check which services are connected
    // For now, mock data
    setConnectedServices({
      spotify: false,
      apple_music: false,
      now_playing: true, // Device playback is always available
    });
  };

  const handleServiceTap = (service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedService(selectedService === service.id ? null : service.id);
  };

  const handleConnect = async (service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (service.id === 'spotify') {
      // Navigate to Spotify Connect screen
      navigation.navigate('SpotifyConnect');
      return;
    }

    if (service.id === 'apple_music') {
      Alert.alert(
        'Apple Music',
        'Apple Music integration coming soon! This will allow you to sync with your Apple Music library.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (service.id === 'now_playing') {
      // Now Playing is always available, just needs to be enabled
      Alert.alert(
        'Now Playing Sync',
        'Enable automatic sync with your device music player?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setConnectedServices(prev => ({ ...prev, now_playing: true }));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success!', 'Now Playing sync enabled');
            },
          },
        ]
      );
    }
  };

  const handleDisconnect = async (service) => {
    Alert.alert(
      `Disconnect ${service.name}?`,
      'You can always reconnect later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnectedServices(prev => ({ ...prev, [service.id]: false }));
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
          <Text style={styles.headerTitle}>Music Sync</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <BlurView intensity={20} tint="dark" style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sync Your Music</Text>
          <Text style={styles.infoDescription}>
            Connect your favorite music service to match songs to your workout intensity and heart rate.
          </Text>
        </BlurView>

        {/* Music Services */}
        {MUSIC_SERVICES.map((service) => {
          const isConnected = connectedServices[service.id];
          const isSelected = selectedService === service.id;

          return (
            <View key={service.id} style={styles.serviceWrapper}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleServiceTap(service)}
              >
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={[
                    styles.serviceCard,
                    isConnected && styles.serviceCardConnected,
                    isSelected && styles.serviceCardSelected,
                  ]}
                >
                  <View style={styles.serviceHeader}>
                    <View style={[styles.serviceIcon, { backgroundColor: `${service.color}20` }]}>
                      <Text style={styles.serviceIconText}>{service.icon}</Text>
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                    </View>
                    {isConnected && (
                      <View style={styles.connectedBadge}>
                        <Text style={styles.connectedBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>

                  {/* Expanded Details */}
                  {isSelected && (
                    <View style={styles.serviceDetails}>
                      <View style={styles.detailsDivider} />
                      <Text style={styles.detailsText}>{service.longDescription}</Text>

                      {/* Connect/Disconnect Button */}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          isConnected ? handleDisconnect(service) : handleConnect(service)
                        }
                      >
                        <LinearGradient
                          colors={
                            isConnected
                              ? ['#666', '#444']
                              : [service.color, `${service.color}CC`]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.actionButtonGradient}
                        >
                          <Text style={styles.actionButtonText}>
                            {isConnected ? 'Disconnect' : 'Connect'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What You Get</Text>
          <FeatureItem
            icon="🎵"
            title="Smart Song Matching"
            description="Songs automatically matched to your workout intensity"
          />
          <FeatureItem
            icon="❤️"
            title="BPM Sync"
            description="Music tempo adapts to your heart rate zones"
          />
          <FeatureItem
            icon="📊"
            title="Listening History"
            description="Track which songs energize your best workouts"
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  serviceWrapper: {
    marginBottom: 16,
  },
  serviceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  serviceCardConnected: {
    borderColor: `${THEME.orange}60`,
  },
  serviceCardSelected: {
    borderColor: `${THEME.orange}`,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  serviceIconText: {
    fontSize: 28,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  connectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  serviceDetails: {
    marginTop: 20,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  featuresSection: {
    marginTop: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
});
