/**
 * Workout Details Screen V2 - Beautiful detailed view of completed workout
 * Features: V2 design system, waveform background, glassmorphism
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
import { Waveform } from '../components';
import { workoutService } from '../services/api';

interface WorkoutData {
  id: number;
  workout_type: string;
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  min_heart_rate?: number;
  total_songs?: number;
}

interface HeartRateReading {
  id: number;
  bpm: number;
  timestamp: string;
}

interface SongPlay {
  id: number;
  song: {
    id: number;
    title: string;
    artist: string;
    tempo?: number;
    hype_score?: number;
    auto_category_zone?: string;
  };
  avg_bpm_during_song?: number;
  max_bpm_during_song?: number;
}

function WorkoutDetailsScreenContent({ route, navigation }: any) {
  const theme = useTheme();
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [heartRateData, setHeartRateData] = useState<HeartRateReading[]>([]);
  const [songPlays, setSongPlays] = useState<SongPlay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutDetails();
  }, []);

  const loadWorkoutDetails = async () => {
    try {
      const response = await workoutService.getWorkoutDetails(workoutId);
      const data = response.data;

      setWorkout(data.workout);
      setHeartRateData(data.heart_rate_data || []);
      setSongPlays(data.song_plays || []);
    } catch (error) {
      console.error('Error loading workout details:', error);
      Alert.alert('Error', 'Failed to load workout details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const calculateZoneBreakdown = () => {
    if (heartRateData.length === 0 || !workout?.avg_heart_rate) {
      return null;
    }

    const avgHR = workout.avg_heart_rate;
    const maxHR = workout.max_heart_rate || avgHR * 1.2;

    const zones = {
      warm: 0,
      match: 0,
      push: 0,
      sprint: 0,
    };

    heartRateData.forEach(reading => {
      const bpm = reading.bpm;
      if (bpm < avgHR - 10) zones.warm++;
      else if (bpm < avgHR + 10) zones.match++;
      else if (bpm < maxHR - 10) zones.push++;
      else zones.sprint++;
    });

    const total = heartRateData.length;
    return {
      warm: (zones.warm / total) * 100,
      match: (zones.match / total) * 100,
      push: (zones.push / total) * 100,
      sprint: (zones.sprint / total) * 100,
    };
  };

  const handleBackPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.orange} />
      </View>
    );
  }

  if (!workout) {
    return null;
  }

  const zoneBreakdown = calculateZoneBreakdown();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Waveform background */}
      <Waveform />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { marginTop: theme.spacing.xxl + 20 }]}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={handleBackPress}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.orange }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text
              style={[
                theme.typography.caption,
                {
                  color: theme.colors.textSecondary,
                  letterSpacing: 1.5,
                },
              ]}
            >
              WORKOUT COMPLETED
            </Text>
            <Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 2 }]}>
              {workout.workout_type}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Date & Time */}
        <View style={[styles.dateSection, { marginBottom: theme.spacing.lg }]}>
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>
            {formatDate(workout.start_time)}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {formatTime(workout.start_time)}
          </Text>
        </View>

        {/* Main Stats Card */}
        <BlurView
          intensity={theme.isDark ? 20 : 25}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[
            styles.mainStatsCard,
            {
              borderRadius: theme.radius.xl,
              borderColor: theme.colors.border,
              padding: theme.spacing.lg,
              marginHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          <View style={styles.statsGrid}>
            <StatBox
              icon="⏱️"
              value={formatDuration(workout.duration_minutes)}
              label="Duration"
              theme={theme}
            />
            <StatBox
              icon="❤️"
              value={workout.avg_heart_rate?.toString() || '--'}
              label="Avg HR"
              color={theme.colors.orange}
              theme={theme}
            />
            <StatBox
              icon="🔥"
              value={workout.max_heart_rate?.toString() || '--'}
              label="Max HR"
              color={theme.colors.copper}
              theme={theme}
            />
            <StatBox
              icon="⚡"
              value={heartRateData.length.toString()}
              label="HR Readings"
              theme={theme}
            />
          </View>
        </BlurView>

        {/* Intensity Zone Breakdown */}
        {zoneBreakdown && (
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.card,
              {
                borderRadius: theme.radius.xl,
                borderColor: theme.colors.border,
                padding: theme.spacing.lg,
                marginHorizontal: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
              Intensity Breakdown
            </Text>
            <View style={styles.zonesList}>
              <ZoneItem label="Warm Up" percentage={zoneBreakdown.warm} color="#60a5fa" theme={theme} />
              <ZoneItem label="Match" percentage={zoneBreakdown.match} color="#22c55e" theme={theme} />
              <ZoneItem label="Push" percentage={zoneBreakdown.push} color={theme.colors.orange} theme={theme} />
              <ZoneItem label="Sprint" percentage={zoneBreakdown.sprint} color={theme.colors.copper} theme={theme} />
            </View>
          </BlurView>
        )}

        {/* Heart Rate Timeline */}
        {heartRateData.length > 0 && (
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.card,
              {
                borderRadius: theme.radius.xl,
                borderColor: theme.colors.border,
                padding: theme.spacing.lg,
                marginHorizontal: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
              Heart Rate Timeline
            </Text>
            <View style={styles.hrTimeline}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                {Math.min(...heartRateData.map(r => r.bpm))} BPM
              </Text>
              <View style={[styles.hrBars, { marginVertical: theme.spacing.sm }]}>
                {heartRateData.slice(0, 30).map((reading, i) => {
                  const maxBpm = Math.max(...heartRateData.map(r => r.bpm));
                  const height = (reading.bpm / maxBpm) * 100;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.hrBar,
                        {
                          height: `${height}%`,
                          backgroundColor:
                            reading.bpm > (workout.avg_heart_rate || 0)
                              ? theme.colors.orange
                              : '#22c55e',
                          borderRadius: theme.radius.xs,
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                {Math.max(...heartRateData.map(r => r.bpm))} BPM
              </Text>
            </View>
            <Text
              style={[
                theme.typography.caption,
                {
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: theme.spacing.sm,
                },
              ]}
            >
              {heartRateData.length} readings over {formatDuration(workout.duration_minutes)}
            </Text>
          </BlurView>
        )}

        {/* Songs Played */}
        {songPlays.length > 0 && (
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.card,
              {
                borderRadius: theme.radius.xl,
                borderColor: theme.colors.border,
                padding: theme.spacing.lg,
                marginHorizontal: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
              Songs Played ({songPlays.length})
            </Text>
            {songPlays.map((songPlay, index) => (
              <View
                key={index}
                style={[
                  styles.songItem,
                  {
                    borderBottomColor: theme.colors.border,
                    paddingVertical: theme.spacing.md,
                  },
                ]}
              >
                <View
                  style={[
                    styles.songIcon,
                    {
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Text style={styles.songIconText}>🎵</Text>
                </View>
                <View style={styles.songInfo}>
                  <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                    {songPlay.song.title}
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    {songPlay.song.artist}
                  </Text>
                </View>
                {songPlay.song.hype_score !== undefined && (
                  <View
                    style={[
                      styles.hypeScore,
                      {
                        backgroundColor: `${theme.colors.orange}20`,
                        borderColor: `${theme.colors.orange}40`,
                        borderRadius: theme.radius.sm,
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: 4,
                      },
                    ]}
                  >
                    <Text style={[theme.typography.caption, { color: theme.colors.orange, fontWeight: '600' }]}>
                      🔥 {songPlay.song.hype_score.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </BlurView>
        )}

        {/* Empty State */}
        {heartRateData.length === 0 && songPlays.length === 0 && (
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.emptyCard,
              {
                borderRadius: theme.radius.xl,
                borderColor: theme.colors.border,
                padding: theme.spacing.xxl,
                marginHorizontal: theme.spacing.lg,
                marginTop: theme.spacing.xxl,
              },
            ]}
          >
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
              No detailed data available
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
              Heart rate and song data will be recorded in future workouts
            </Text>
          </BlurView>
        )}
      </ScrollView>
    </View>
  );
}

// Stat Box Component
interface StatBoxProps {
  icon: string;
  value: string;
  label: string;
  color?: string;
  theme: any;
}

function StatBox({ icon, value, label, color, theme }: StatBoxProps) {
  return (
    <View style={[styles.statBox, { paddingVertical: theme.spacing.md }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text
        style={[
          theme.typography.h2,
          {
            color: color || theme.colors.text,
            marginBottom: 4,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          theme.typography.caption,
          {
            color: theme.colors.textSecondary,
            letterSpacing: 1,
          },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

// Zone Item Component
interface ZoneItemProps {
  label: string;
  percentage: number;
  color: string;
  theme: any;
}

function ZoneItem({ label, percentage, color, theme }: ZoneItemProps) {
  return (
    <View style={[styles.zoneItem, { gap: theme.spacing.xs }]}>
      <View style={styles.zoneHeader}>
        <View style={[styles.zoneLabel, { gap: theme.spacing.xs }]}>
          <View style={[styles.zoneDot, { backgroundColor: color, borderRadius: theme.radius.xs }]} />
          <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>{label}</Text>
        </View>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, fontWeight: '600' }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>
      <View
        style={[
          styles.zoneBarContainer,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.xs,
          },
        ]}
      >
        <View
          style={[
            styles.zoneBar,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              borderRadius: theme.radius.xs,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Wrapper with ThemeProvider
export default function WorkoutDetailsScreenV2(props: any) {
  return (
    <ThemeProvider>
      <WorkoutDetailsScreenContent {...props} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dateSection: {
    alignItems: 'center',
  },
  mainStatsCard: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  zonesList: {
    gap: 16,
  },
  zoneItem: {
    // gap applied inline
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneDot: {
    width: 8,
    height: 8,
  },
  zoneBarContainer: {
    height: 8,
    overflow: 'hidden',
  },
  zoneBar: {
    height: '100%',
  },
  hrTimeline: {
    // spacing applied inline
  },
  hrBars: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-end',
    gap: 2,
  },
  hrBar: {
    flex: 1,
    minHeight: 4,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
  },
  songIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songIconText: {
    fontSize: 18,
  },
  songInfo: {
    flex: 1,
  },
  hypeScore: {
    borderWidth: 1,
  },
  emptyCard: {
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
});
