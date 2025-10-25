/**
 * WorkoutTrackingScreenV2 - Live workout tracking with music controls
 * Features: Album art with progress ring, BPM-synced animations, waveform scrubber, zone indicators
 *
 * UNCHANGED: All API calls, timers, heart rate monitoring - ONLY UI/UX changes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { workoutService } from '../services/api';
import healthService from '../services/healthService';
import { ThemeProvider, useTheme } from '../theme';
import { Waveform } from '../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function WorkoutTrackingScreenV2Content({ route, navigation }: any) {
  const theme = useTheme();
  const { workout, profile } = route.params;

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<any>(null);

  // Workout stats
  const [currentHR, setCurrentHR] = useState(0);
  const [calories, setCalories] = useState(0);
  const [currentSong] = useState({
    title: 'Keep Moving',
    artist: 'Rhythm Pulse',
    bpm: 132,
    album: 'Midnight Cadence',
    duration: 220,
  });

  // Music player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackPosition, setTrackPosition] = useState(36);
  const [previousZone, setPreviousZone] = useState('Warm');

  // Calculate derived values
  const targetBpm = Math.round(((profile?.target_zone_min || 70) + (profile?.target_zone_max || 85)) / 2);
  const bpmDelta = currentHR - targetBpm;
  const workoutGoal = 30 * 60; // 30 minutes
  const pctWorkout = Math.min(elapsedTime / workoutGoal, 1);
  const pctTrack = trackPosition / currentSong.duration;

  // Animation values
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // Timer effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        setTrackPosition(prev => (prev + 1) % currentSong.duration);
        setCalories(prev => prev + 0.25); // ~15 cal/min
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, currentSong.duration]);

  // Initialize HealthKit and start heart rate monitoring
  useEffect(() => {
    let stopMonitoring: any = null;
    let simulationInterval: any = null;

    const startHeartRateTracking = async () => {
      try {
        await healthService.initialize();
        console.log('HealthKit initialized, starting heart rate monitoring...');

        stopMonitoring = healthService.startHeartRateMonitoring((bpm: number) => {
          console.log('Heart rate from HealthKit:', bpm);
          setCurrentHR(bpm);
        }, 3000);
      } catch (error: any) {
        console.log('HealthKit not available, using simulated heart rate:', error.message);

        // Fallback to simulated heart rate
        simulationInterval = setInterval(() => {
          const minHR = (profile?.target_zone_min || 70) * 2;
          const maxHR = (profile?.target_zone_max || 85) * 2;
          const randomHR = Math.floor(Math.random() * (maxHR - minHR) + minHR);
          setCurrentHR(randomHR);
        }, 3000);
      }
    };

    startHeartRateTracking();

    return () => {
      if (stopMonitoring) stopMonitoring();
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [profile]);

  // BPM-synced pulsing glow
  useEffect(() => {
    if (currentHR > 0) {
      const intervalMs = (60 / currentHR) * 1000;

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.2,
            duration: intervalMs / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: intervalMs / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.5,
            duration: intervalMs / 2,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: intervalMs / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentHR]);

  // Rotating gradient (vinyl record effect)
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 28000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const getIntensityZone = () => {
    if (currentHR >= targetBpm + 20) return { label: 'Sprint', color: theme.colors.copper };
    if (currentHR >= targetBpm + 5) return { label: 'Push', color: theme.colors.orange };
    if (currentHR >= targetBpm - 5) return { label: 'Match', color: '#22c55e' };
    return { label: 'Warm', color: '#60a5fa' };
  };

  const zone = getIntensityZone();

  // Zone transition haptic feedback
  useEffect(() => {
    if (zone.label !== previousZone) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setPreviousZone(zone.label);
    }
  }, [zone.label, previousZone]);

  const rotationDegrees = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsActive(!isActive);
    setIsPlaying(!isPlaying);
  };

  const handleEndWorkout = () => {
    Alert.alert(
      'End Workout?',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.endWorkout(workout.id);
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error ending workout:', error);
              Alert.alert('Error', 'Failed to end workout');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated wave background */}
      <Waveform />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { marginTop: theme.spacing.xxl }]}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.orange }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text
              style={[
                styles.headerSubtitle,
                theme.typography.caption,
                { color: theme.colors.textSecondary },
              ]}
            >
              VIBES MATCHED
            </Text>
            <Text
              style={[
                styles.headerTitle,
                theme.typography.body,
                { color: theme.colors.text, marginTop: 2 },
              ]}
            >
              Now Training
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.endButton,
              {
                backgroundColor: 'rgba(255, 59, 48, 0.15)',
                borderColor: 'rgba(255, 59, 48, 0.3)',
                borderRadius: theme.radius.sm,
              },
            ]}
            onPress={handleEndWorkout}
          >
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Pills */}
        <View style={[styles.statsPills, { marginBottom: theme.spacing.lg }]}>
          <View
            style={[
              styles.pill,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
                padding: theme.spacing.sm,
              },
            ]}
          >
            <Text style={styles.pillIcon}>🎯</Text>
            <Text style={[styles.pillText, { color: theme.colors.textSecondary }]}>
              Target {targetBpm} BPM
            </Text>
          </View>
          <View
            style={[
              styles.pill,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
                padding: theme.spacing.sm,
              },
            ]}
          >
            <Text style={styles.pillIcon}>⏱️</Text>
            <Text style={[styles.pillText, { color: theme.colors.textSecondary }]}>
              {formatTime(elapsedTime)} / 30:00
            </Text>
          </View>
        </View>

        {/* Album Art Section with Progress Ring */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.albumCard,
              {
                borderRadius: theme.radius.xl,
                borderColor: theme.colors.border,
                padding: theme.spacing.lg,
              },
            ]}
          >
            <View style={styles.albumArtContainer}>
              {/* Progress Ring */}
              <ProgressRing progress={pctWorkout} size={SCREEN_WIDTH - 80} theme={theme} />

              {/* Glow Effect - BPM synced */}
              <View style={styles.glowContainer}>
                <Animated.View
                  style={[
                    styles.glow,
                    {
                      transform: [{ scale: glowScale }],
                      opacity: glowOpacity,
                      backgroundColor: zone.color,
                    },
                  ]}
                />
              </View>

              {/* Album Art - Rotating */}
              <Animated.View
                style={[styles.albumArtWrapper, { transform: [{ rotate: rotationDegrees }] }]}
              >
                <LinearGradient
                  colors={[`${theme.colors.orange}66`, `${theme.colors.copper}44`, '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.albumArt,
                    {
                      borderRadius: theme.radius.lg,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.albumInfo}>
                    <Text style={[styles.albumArtist, { color: theme.colors.textSecondary }]}>
                      {currentSong.artist}
                    </Text>
                    <Text
                      style={[
                        styles.albumTitle,
                        theme.typography.h2,
                        { color: theme.colors.text, marginTop: theme.spacing.sm },
                      ]}
                    >
                      {currentSong.title}
                    </Text>
                    <Text
                      style={[
                        styles.albumName,
                        { color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
                      ]}
                    >
                      {currentSong.album}
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Media Controls */}
            <View style={[styles.controls, { marginTop: theme.spacing.xl }]}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>🔀</Text>
              </TouchableOpacity>

              <View style={styles.mainControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <Text style={styles.controlIcon}>⏮️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.playButton,
                    {
                      backgroundColor: theme.colors.orange,
                      borderRadius: theme.radius.full,
                    },
                  ]}
                  onPress={handlePauseResume}
                >
                  <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                  <Text style={styles.controlIcon}>⏭️</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>🔁</Text>
              </TouchableOpacity>
            </View>

            {/* Waveform Scrubber */}
            <View style={[styles.waveformContainer, { marginTop: theme.spacing.lg }]}>
              <WaveformScrubber progress={pctTrack} theme={theme} />
              <View style={[styles.timeLabels, { marginTop: theme.spacing.sm }]}>
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                  {formatTime(trackPosition)}
                </Text>
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                  -{formatTime(currentSong.duration - trackPosition)}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Live Stats */}
        <BlurView
          intensity={theme.isDark ? 20 : 25}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[
            styles.statsCard,
            {
              borderRadius: theme.radius.xl,
              borderColor: theme.colors.border,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          <View style={styles.statsGrid}>
            <StatItem
              label="BPM"
              value={currentHR.toString()}
              icon="❤️"
              color={zone.color}
              theme={theme}
            />
            <StatItem
              label="Delta"
              value={`${bpmDelta > 0 ? '+' : ''}${bpmDelta}`}
              icon="📊"
              theme={theme}
            />
            <StatItem
              label="Calories"
              value={Math.floor(calories).toString()}
              icon="🔥"
              theme={theme}
            />
            <StatItem label="Elapsed" value={formatTime(elapsedTime)} icon="⏱️" theme={theme} />
          </View>

          {/* Intensity Zones */}
          <View style={[styles.zonesSection, { marginTop: theme.spacing.xl }]}>
            <Text
              style={[
                styles.zonesLabel,
                theme.typography.caption,
                { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
              ]}
            >
              INTENSITY ZONE
            </Text>
            <View style={[styles.zonesBar, { borderRadius: theme.radius.xs }]}>
              <View style={[styles.zoneSegment, { flex: 18, backgroundColor: '#60a5fa' }]} />
              <View style={[styles.zoneSegment, { flex: 32, backgroundColor: '#22c55e' }]} />
              <View
                style={[styles.zoneSegment, { flex: 36, backgroundColor: theme.colors.orange }]}
              />
              <View
                style={[styles.zoneSegment, { flex: 14, backgroundColor: theme.colors.copper }]}
              />
            </View>
            <View
              style={[
                styles.currentZone,
                {
                  backgroundColor: theme.colors.glass,
                  borderRadius: theme.radius.sm,
                  marginTop: theme.spacing.sm,
                  padding: theme.spacing.sm,
                },
              ]}
            >
              <View
                style={[
                  styles.zoneDot,
                  { backgroundColor: zone.color, borderRadius: theme.radius.xs },
                ]}
              />
              <Text style={[styles.zoneText, theme.typography.body, { color: theme.colors.text }]}>
                {zone.label}
              </Text>
            </View>
          </View>
        </BlurView>

        {/* Workout Profile Info */}
        <View style={[styles.profileInfo, { paddingVertical: theme.spacing.lg }]}>
          <Text style={styles.profileIcon}>{profile?.icon || '💪'}</Text>
          <Text
            style={[
              styles.profileName,
              theme.typography.h2,
              { color: theme.colors.text, marginTop: theme.spacing.sm },
            ]}
          >
            {profile?.name || 'Workout'}
          </Text>
          <Text
            style={[
              styles.profileDescription,
              theme.typography.body,
              { color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
            ]}
          >
            {profile?.description || 'Keep up the great work!'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Progress Ring Component
function ProgressRing({ progress, size, theme }: any) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size} style={styles.progressRing}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={theme.colors.orange}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

// Waveform Scrubber Component
function WaveformScrubber({ progress, theme }: any) {
  const bars = 40;
  return (
    <View style={styles.waveform}>
      {Array.from({ length: bars }).map((_, i) => {
        const isPast = i / bars < progress;
        const height = Math.random() * 20 + 10;
        return (
          <View
            key={i}
            style={[
              styles.waveformBar,
              {
                height,
                backgroundColor: isPast ? theme.colors.orange : 'rgba(255, 255, 255, 0.2)',
                borderRadius: theme.radius.xs,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Stat Item Component
function StatItem({ label, value, icon, color, theme }: any) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text
        style={[
          styles.statValue,
          theme.typography.h1,
          { color: color || theme.colors.text, marginTop: theme.spacing.xs },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          theme.typography.caption,
          { color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// Wrapper with ThemeProvider
export default function WorkoutTrackingScreenV2(props: any) {
  return (
    <ThemeProvider>
      <WorkoutTrackingScreenV2Content {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 24,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontWeight: '600',
  },
  endButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  endButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  statsPills: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  albumCard: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  albumArtContainer: {
    position: 'relative',
    aspectRatio: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  glowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  albumArtWrapper: {
    width: '80%',
    height: '80%',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  albumInfo: {
    alignItems: 'center',
    padding: 20,
  },
  albumArtist: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  albumTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  albumName: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  mainControls: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#CC5500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playIcon: {
    fontSize: 28,
  },
  waveformContainer: {
    // Container for waveform scrubber
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 40,
    paddingHorizontal: 4,
  },
  waveformBar: {
    flex: 1,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 11,
  },
  statsCard: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  zonesSection: {
    // Container for zone indicator
  },
  zonesLabel: {
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  zonesBar: {
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
    gap: 2,
  },
  zoneSegment: {
    height: '100%',
  },
  currentZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  zoneDot: {
    width: 8,
    height: 8,
  },
  zoneText: {
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 48,
  },
  profileName: {
    fontWeight: 'bold',
  },
  profileDescription: {
    textAlign: 'center',
  },
});
