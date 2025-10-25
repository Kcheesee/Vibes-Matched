/**
 * Workout Details Screen - Beautiful detailed view of completed workout
 * Burnt orange theme matching the rest of the app
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { workoutService } from '../services/api';

const THEME = {
  orange: '#CC5500',
  copper: '#D87227',
  charcoal: '#0B0B0C',
  ink: '#121212',
  cream: '#F8F3E9',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkoutDetailsScreen({ route, navigation }) {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState(null);
  const [heartRateData, setHeartRateData] = useState([]);
  const [songPlays, setSongPlays] = useState([]);
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

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const calculateZoneBreakdown = () => {
    if (heartRateData.length === 0 || !workout.avg_heart_rate) {
      return null;
    }

    // Calculate time in each zone based on heart rate readings
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.orange} />
      </View>
    );
  }

  if (!workout) {
    return null;
  }

  const zoneBreakdown = calculateZoneBreakdown();

  return (
    <View style={styles.container}>
      {/* Background gradients */}
      <View style={styles.backgroundGradients}>
        <View style={[styles.gradient, styles.gradientTop]} />
        <View style={[styles.gradient, styles.gradientBottom]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>WORKOUT COMPLETED</Text>
            <Text style={styles.headerTitle}>{workout.workout_type}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Date & Time */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formatDate(workout.start_time)}</Text>
          <Text style={styles.timeText}>{formatTime(workout.start_time)}</Text>
        </View>

        {/* Main Stats Card */}
        <BlurView intensity={20} tint="dark" style={styles.mainStatsCard}>
          <View style={styles.statsGrid}>
            <StatBox
              icon="⏱️"
              value={formatDuration(workout.duration_minutes)}
              label="Duration"
            />
            <StatBox
              icon="❤️"
              value={workout.avg_heart_rate || '--'}
              label="Avg HR"
              color={THEME.orange}
            />
            <StatBox
              icon="🔥"
              value={workout.max_heart_rate || '--'}
              label="Max HR"
              color={THEME.copper}
            />
            <StatBox
              icon="⚡"
              value={heartRateData.length}
              label="HR Readings"
            />
          </View>
        </BlurView>

        {/* Intensity Zone Breakdown */}
        {zoneBreakdown && (
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Intensity Breakdown</Text>
            <View style={styles.zonesList}>
              <ZoneItem
                label="Warm Up"
                percentage={zoneBreakdown.warm}
                color="#60a5fa"
              />
              <ZoneItem
                label="Match"
                percentage={zoneBreakdown.match}
                color="#22c55e"
              />
              <ZoneItem
                label="Push"
                percentage={zoneBreakdown.push}
                color={THEME.orange}
              />
              <ZoneItem
                label="Sprint"
                percentage={zoneBreakdown.sprint}
                color={THEME.copper}
              />
            </View>
          </BlurView>
        )}

        {/* Heart Rate Timeline */}
        {heartRateData.length > 0 && (
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Heart Rate Timeline</Text>
            <View style={styles.hrTimeline}>
              <Text style={styles.hrTimelineLabel}>
                {Math.min(...heartRateData.map(r => r.bpm))} BPM
              </Text>
              <View style={styles.hrBars}>
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
                          backgroundColor: reading.bpm > workout.avg_heart_rate
                            ? THEME.orange
                            : '#22c55e'
                        }
                      ]}
                    />
                  );
                })}
              </View>
              <Text style={styles.hrTimelineLabel}>
                {Math.max(...heartRateData.map(r => r.bpm))} BPM
              </Text>
            </View>
            <Text style={styles.hrTimelineSubtext}>
              {heartRateData.length} readings over {formatDuration(workout.duration_minutes)}
            </Text>
          </BlurView>
        )}

        {/* Songs Played */}
        {songPlays.length > 0 && (
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>Songs Played ({songPlays.length})</Text>
            {songPlays.map((songPlay, index) => (
              <View key={index} style={styles.songItem}>
                <View style={styles.songIcon}>
                  <Text style={styles.songIconText}>🎵</Text>
                </View>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{songPlay.song.title}</Text>
                  <Text style={styles.songArtist}>{songPlay.song.artist}</Text>
                </View>
                {songPlay.song.hype_score && (
                  <View style={styles.hypeScore}>
                    <Text style={styles.hypeScoreText}>
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
          <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No detailed data available</Text>
            <Text style={styles.emptySubtext}>
              Heart rate and song data will be recorded in future workouts
            </Text>
          </BlurView>
        )}
      </ScrollView>
    </View>
  );
}

// Stat Box Component
function StatBox({ icon, value, label, color = '#fff' }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Zone Item Component
function ZoneItem({ label, percentage, color }) {
  return (
    <View style={styles.zoneItem}>
      <View style={styles.zoneHeader}>
        <View style={styles.zoneLabel}>
          <View style={[styles.zoneDot, { backgroundColor: color }]} />
          <Text style={styles.zoneText}>{label}</Text>
        </View>
        <Text style={styles.zonePercentage}>{percentage.toFixed(0)}%</Text>
      </View>
      <View style={styles.zoneBarContainer}>
        <View
          style={[
            styles.zoneBar,
            { width: `${percentage}%`, backgroundColor: color }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.charcoal,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.charcoal,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 20,
    marginBottom: 10,
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
  dateSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  mainStatsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
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
    paddingVertical: 12,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  zonesList: {
    gap: 16,
  },
  zoneItem: {
    gap: 8,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  zonePercentage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  zoneBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  zoneBar: {
    height: '100%',
    borderRadius: 4,
  },
  hrTimeline: {
    marginBottom: 12,
  },
  hrBars: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'flex-end',
    gap: 2,
    marginVertical: 8,
  },
  hrBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  hrTimelineLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontWeight: '600',
  },
  hrTimelineSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  songIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songIconText: {
    fontSize: 18,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  hypeScore: {
    backgroundColor: 'rgba(204, 85, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(204, 85, 0, 0.3)',
  },
  hypeScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.orange,
  },
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 40,
    padding: 40,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
