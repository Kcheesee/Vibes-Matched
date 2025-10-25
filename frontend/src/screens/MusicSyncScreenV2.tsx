/**
 * MusicSyncScreenV2 - Music service management with V2 design
 * Features: Spotify, Apple Music, Now Playing with bottom nav
 * Full V2 design language with theme system
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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from '../theme';
import { BottomNav, Waveform } from '../components';

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

function MusicSyncScreenContent({ navigation }: any) {
  const theme = useTheme();
  const [connectedServices, setConnectedServices] = useState({
    spotify: false,
    apple_music: false,
    now_playing: false,
  });
  const [selectedService, setSelectedService] = useState<string | null>(null);
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

  const handleServiceTap = (service: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedService(selectedService === service.id ? null : service.id);
  };

  const handleConnect = async (service: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
      Alert.alert(
        'Now Playing',
        'Now Playing sync is enabled by default. The app will automatically detect what\'s playing on your device.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDisconnect = async (service: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      `Disconnect ${service.name}?`,
      'You can always reconnect later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnectedServices((prev) => ({
              ...prev,
              [service.id]: false,
            }));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Waveform background */}
      <Waveform />

      {/* Header */}
      <View style={[styles.header, { marginTop: theme.spacing.xxl + 20 }]}>
        <View>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, letterSpacing: 1.5 }]}>
            MUSIC
          </Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: theme.spacing.xs }]}>
            Sync Services
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xl }]}>
          Connect your music services to automatically match songs to your workout intensity
        </Text>

        {/* Music Service Cards */}
        {MUSIC_SERVICES.map((service) => {
          const isConnected = connectedServices[service.id as keyof typeof connectedServices];
          const isExpanded = selectedService === service.id;

          return (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.9}
              onPress={() => handleServiceTap(service)}
            >
              <BlurView
                intensity={theme.isDark ? 20 : 25}
                tint={theme.isDark ? 'dark' : 'light'}
                style={[
                  styles.serviceCard,
                  {
                    borderRadius: theme.radius.lg,
                    borderColor: isConnected ? theme.colors.orange : theme.colors.border,
                    borderWidth: isConnected ? 2 : 1,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.md,
                  },
                ]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.serviceInfo}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: `${service.color}20`,
                          borderRadius: theme.radius.md,
                        },
                      ]}
                    >
                      <Text style={styles.serviceIcon}>{service.icon}</Text>
                    </View>
                    <View style={styles.serviceText}>
                      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                        {service.name}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        {service.description}
                      </Text>
                    </View>
                  </View>
                  {isConnected && (
                    <View
                      style={[
                        styles.connectedBadge,
                        {
                          backgroundColor: `${theme.colors.orange}20`,
                          borderRadius: theme.radius.sm,
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 4,
                        },
                      ]}
                    >
                      <Text style={[theme.typography.caption, { color: theme.colors.orange, fontWeight: '600' }]}>
                        Connected
                      </Text>
                    </View>
                  )}
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={[styles.expandedContent, { marginTop: theme.spacing.md }]}>
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: theme.colors.border,
                          height: 1,
                          marginBottom: theme.spacing.md,
                        },
                      ]}
                    />
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
                      {service.longDescription}
                    </Text>

                    {/* Action Button */}
                    {isConnected ? (
                      <TouchableOpacity
                        style={[
                          styles.disconnectButton,
                          {
                            backgroundColor: 'rgba(255, 59, 48, 0.2)',
                            borderColor: 'rgba(255, 59, 48, 0.3)',
                            borderWidth: 1,
                            borderRadius: theme.radius.sm,
                            padding: theme.spacing.md,
                          },
                        ]}
                        onPress={() => handleDisconnect(service)}
                      >
                        <Text style={[theme.typography.body, { color: '#FF3B30', fontWeight: '600', textAlign: 'center' }]}>
                          Disconnect
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.connectButton, { borderRadius: theme.radius.sm, overflow: 'hidden' }]}
                        onPress={() => handleConnect(service)}
                      >
                        <LinearGradient
                          colors={[theme.colors.orange, theme.colors.copper]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.connectGradient, { padding: theme.spacing.md }]}
                        >
                          <Text style={[theme.typography.body, { color: '#FFF', fontWeight: '600', textAlign: 'center' }]}>
                            Connect {service.name}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </BlurView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="music"
        onNavigate={(screen) => navigation.navigate(screen)}
      />
    </View>
  );
}

// Wrapper with ThemeProvider
export default function MusicSyncScreenV2(props: any) {
  return (
    <ThemeProvider>
      <MusicSyncScreenContent {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Extra padding for bottom nav
  },
  serviceCard: {
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceText: {
    flex: 1,
  },
  connectedBadge: {
    // Styles applied inline
  },
  expandedContent: {
    // Spacing applied inline
  },
  divider: {
    // Styles applied inline
  },
  disconnectButton: {
    // Styles applied inline
  },
  connectButton: {
    // Styles applied inline
  },
  connectGradient: {
    // Styles applied inline
  },
});
