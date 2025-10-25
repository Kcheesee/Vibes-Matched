/**
 * Top Songs Screen V2 - Your personalized workout playlists
 * Shows hype songs and cooldown songs based on your workout history
 * Falls back to song library when no workout data exists
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from '../theme';
import { Waveform, BottomNav } from '../components';
import { workoutService } from '../services/api';

interface Song {
  id?: number;
  song_id?: number;
  title: string;
  artist: string;
  tempo?: number;
  hype_score?: number;
  cooldown_score?: number;
  personal_hype_score?: number;
  personal_cooldown_score?: number;
  times_played?: number;
  auto_category_zone?: string;
  audio_features?: {
    energy?: number;
    valence?: number;
    tempo?: number;
  };
}

function TopSongsScreenContent({ navigation }: any) {
  const theme = useTheme();
  const [hypeSongs, setHypeSongs] = useState<Song[]>([]);
  const [cooldownSongs, setCooldownSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hype' | 'cooldown' | 'library'>('hype');
  const [libraryZones, setLibraryZones] = useState<any>(null);
  const [hasWorkoutData, setHasWorkoutData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to load personalized top songs first
      const response = await workoutService.getTopSongs();
      const hype = response.data.hype_songs || [];
      const cooldown = response.data.cooldown_songs || [];

      setHypeSongs(hype);
      setCooldownSongs(cooldown);
      setHasWorkoutData(hype.length > 0 || cooldown.length > 0);

      // If no workout data, load song library as fallback
      if (hype.length === 0 && cooldown.length === 0) {
        await loadSongLibrary();
      }
    } catch (error) {
      console.error('Error loading top songs:', error);
      // Fall back to song library if API fails
      await loadSongLibrary();
    } finally {
      setLoading(false);
    }
  };

  const loadSongLibrary = async () => {
    try {
      const response = await workoutService.getSongLibrary();
      setLibraryZones(response.data.library);

      // Set default to library tab if no workout data
      if (!hasWorkoutData) {
        setActiveTab('library');
      }
    } catch (error) {
      console.error('Error loading song library:', error);
      Alert.alert('Error', 'Failed to load songs. Please try again.');
    }
  };

  const handleTabPress = (tab: 'hype' | 'cooldown' | 'library') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const renderSongCard = (song: Song, index: number) => {
    const displayHypeScore = song.personal_hype_score || song.hype_score;
    const displayCooldownScore = song.personal_cooldown_score || song.cooldown_score;
    const bpm = song.tempo || song.audio_features?.tempo;

    return (
      <BlurView
        key={song.id || song.song_id || index}
        intensity={theme.isDark ? 20 : 25}
        tint={theme.isDark ? 'dark' : 'light'}
        style={[
          styles.songCard,
          {
            borderRadius: theme.radius.lg,
            borderColor: theme.colors.border,
            borderLeftColor: theme.colors.orange,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        <View style={styles.songRank}>
          <Text style={[theme.typography.h2, { color: theme.colors.orange }]}>#{index + 1}</Text>
        </View>

        <View style={styles.songInfo}>
          <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
            {song.title || 'Unknown Title'}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {song.artist || 'Unknown Artist'}
          </Text>

          <View style={[styles.songStats, { marginTop: theme.spacing.sm }]}>
            {displayHypeScore !== undefined && (
              <View
                style={[
                  styles.statBadge,
                  {
                    backgroundColor: `${theme.colors.orange}20`,
                    borderColor: `${theme.colors.orange}40`,
                    borderRadius: theme.radius.sm,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 4,
                  },
                ]}
              >
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, fontSize: 10 }]}>
                  Hype
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.orange, fontWeight: '700' }]}>
                  {displayHypeScore.toFixed(1)}
                </Text>
              </View>
            )}

            {displayCooldownScore !== undefined && (
              <View
                style={[
                  styles.statBadge,
                  {
                    backgroundColor: `${theme.colors.copper}20`,
                    borderColor: `${theme.colors.copper}40`,
                    borderRadius: theme.radius.sm,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 4,
                  },
                ]}
              >
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, fontSize: 10 }]}>
                  Cooldown
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.copper, fontWeight: '700' }]}>
                  {displayCooldownScore.toFixed(1)}
                </Text>
              </View>
            )}

            {song.times_played && (
              <View
                style={[
                  styles.statBadge,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.sm,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 4,
                  },
                ]}
              >
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, fontSize: 10 }]}>
                  Played
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '700' }]}>
                  {song.times_played}x
                </Text>
              </View>
            )}
          </View>

          {bpm && (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: theme.spacing.xs }]}>
              BPM: {Math.round(bpm)}
            </Text>
          )}
        </View>
      </BlurView>
    );
  };

  const renderLibraryZone = (zoneName: string, zoneData: any) => {
    if (!zoneData || zoneData.count === 0) return null;

    const zoneColors: { [key: string]: string } = {
      'Zone 5': '#ff3b30',
      'Zone 4': theme.colors.orange,
      'Zone 3': '#ffcc00',
      'Zone 2': '#34c759',
      'Zone 1': '#5ac8fa',
    };

    const zoneColor = zoneColors[zoneName] || theme.colors.orange;

    return (
      <View key={zoneName} style={[styles.zoneSection, { marginBottom: theme.spacing.lg }]}>
        <View style={[styles.zoneHeader, { marginBottom: theme.spacing.md }]}>
          <View style={styles.zoneHeaderLeft}>
            <View style={[styles.zoneDot, { backgroundColor: zoneColor, borderRadius: theme.radius.xs }]} />
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{zoneName}</Text>
          </View>
          <View
            style={[
              styles.zoneBadge,
              {
                backgroundColor: `${zoneColor}20`,
                borderRadius: theme.radius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 4,
              },
            ]}
          >
            <Text style={[theme.typography.caption, { color: zoneColor, fontWeight: '600' }]}>
              {zoneData.count} songs
            </Text>
          </View>
        </View>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
          {zoneData.description}
        </Text>

        {zoneData.songs.slice(0, 5).map((song: Song, index: number) => renderSongCard(song, index))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.orange} />
      </View>
    );
  }

  const currentSongs = activeTab === 'hype' ? hypeSongs : cooldownSongs;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Waveform background */}
      <Waveform />

      {/* Header */}
      <View style={[styles.header, { marginTop: theme.spacing.xxl + 20 }]}>
        <View>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, letterSpacing: 1.5 }]}>
            YOUR MUSIC
          </Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: theme.spacing.xs }]}>
            {hasWorkoutData ? 'Top Songs' : 'Song Library'}
          </Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }]}>
        {hasWorkoutData ? (
          <>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabPress('hype')}
              activeOpacity={0.8}
            >
              {activeTab === 'hype' ? (
                <BlurView
                  intensity={theme.isDark ? 40 : 30}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[styles.tabActive, { borderRadius: theme.radius.md, overflow: 'hidden' }]}
                >
                  <LinearGradient
                    colors={[theme.colors.orange, theme.colors.copper]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.tabGradient, { padding: theme.spacing.md }]}
                  >
                    <Text style={[theme.typography.body, { color: '#FFF', fontWeight: '600', textAlign: 'center' }]}>
                      🔥 Hype Songs
                    </Text>
                  </LinearGradient>
                </BlurView>
              ) : (
                <BlurView
                  intensity={theme.isDark ? 20 : 25}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[
                    styles.tabInactive,
                    {
                      borderRadius: theme.radius.md,
                      borderColor: theme.colors.border,
                      padding: theme.spacing.md,
                    },
                  ]}
                >
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    🔥 Hype Songs
                  </Text>
                </BlurView>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabPress('cooldown')}
              activeOpacity={0.8}
            >
              {activeTab === 'cooldown' ? (
                <BlurView
                  intensity={theme.isDark ? 40 : 30}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[styles.tabActive, { borderRadius: theme.radius.md, overflow: 'hidden' }]}
                >
                  <LinearGradient
                    colors={[theme.colors.orange, theme.colors.copper]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.tabGradient, { padding: theme.spacing.md }]}
                  >
                    <Text style={[theme.typography.body, { color: '#FFF', fontWeight: '600', textAlign: 'center' }]}>
                      😌 Cooldown Songs
                    </Text>
                  </LinearGradient>
                </BlurView>
              ) : (
                <BlurView
                  intensity={theme.isDark ? 20 : 25}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[
                    styles.tabInactive,
                    {
                      borderRadius: theme.radius.md,
                      borderColor: theme.colors.border,
                      padding: theme.spacing.md,
                    },
                  ]}
                >
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    😌 Cooldown Songs
                  </Text>
                </BlurView>
              )}
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Songs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: theme.spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'library' ? (
          // Show song library organized by zones
          <>
            {libraryZones && (
              <>
                {renderLibraryZone('Zone 5', libraryZones['Zone 5'])}
                {renderLibraryZone('Zone 4', libraryZones['Zone 4'])}
                {renderLibraryZone('Zone 3', libraryZones['Zone 3'])}
                {renderLibraryZone('Zone 2', libraryZones['Zone 2'])}
                {renderLibraryZone('Zone 1', libraryZones['Zone 1'])}
              </>
            )}
          </>
        ) : currentSongs.length === 0 ? (
          // Empty state for personalized playlists
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.emptyState,
              {
                borderRadius: theme.radius.xl,
                borderColor: theme.colors.border,
                padding: theme.spacing.xxl,
                marginTop: theme.spacing.xxl,
              },
            ]}
          >
            <Text style={styles.emptyIcon}>{activeTab === 'hype' ? '🔥' : '😌'}</Text>
            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
              {activeTab === 'hype' ? 'No hype songs yet!' : 'No cooldown songs yet!'}
            </Text>
            <Text
              style={[
                theme.typography.body,
                {
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                },
              ]}
            >
              Complete workouts with music to see your personalized playlist here
            </Text>
          </BlurView>
        ) : (
          // Show personalized top songs
          <View style={styles.songsList}>
            {currentSongs.map((song, index) => renderSongCard(song, index))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" onNavigate={(screen) => navigation.navigate(screen)} />
    </View>
  );
}

// Wrapper with ThemeProvider
export default function TopSongsScreenV2(props: any) {
  return (
    <ThemeProvider>
      <TopSongsScreenContent {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    flex: 1,
    overflow: 'hidden',
  },
  tabActive: {
    // Styles applied inline
  },
  tabInactive: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabGradient: {
    // Styles applied inline
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding for bottom nav
  },
  songsList: {
    // Songs container
  },
  songCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  songRank: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  zoneSection: {
    // Zone container
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneDot: {
    width: 12,
    height: 12,
  },
  zoneBadge: {
    borderWidth: 1,
  },
});
