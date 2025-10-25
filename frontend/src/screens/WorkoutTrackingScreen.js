/**
 * Workout Tracking Screen - Beautiful media-focused workout experience
 * Burnt orange brand theme with album art centerpiece
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { workoutService } from '../services/api';
import healthService from '../services/healthService';

const THEME = {
  orange: '#CC5500',
  copper: '#D87227',
  charcoal: '#0B0B0C',
  ink: '#121212',
  cream: '#F8F3E9',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkoutTrackingScreen({ route, navigation }) {
  const { workout, profile } = route.params;

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);

  // Workout stats
  const [currentHR, setCurrentHR] = useState(0);
  const [calories, setCalories] = useState(0);
  const [currentSong, setCurrentSong] = useState({
    title: 'Keep Moving',
    artist: 'Rhythm Pulse',
    bpm: 132,
    album: 'Midnight Cadence',
    duration: 220,
  });

  // Music player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackPosition, setTrackPosition] = useState(36); // seconds elapsed in track
  const [previousZone, setPreviousZone] = useState('Warm');

  // Calculate derived values
  const targetBpm = Math.round(((profile?.target_zone_min || 70) + (profile?.target_zone_max || 85)) / 2);
  const bpmDelta = currentHR - targetBpm;
  const workoutGoal = 30 * 60; // 30 minutes
  const pctWorkout = Math.min(elapsedTime / workoutGoal, 1);
  const pctTrack = trackPosition / currentSong.duration;

  // Animation values (React Native Animated)
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

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
    let stopMonitoring = null;
    let simulationInterval = null;

    const startHeartRateTracking = async () => {
      try {
        // Initialize HealthKit
        await healthService.initialize();
        console.log('HealthKit initialized, starting heart rate monitoring...');

        // Start real heart rate monitoring
        stopMonitoring = healthService.startHeartRateMonitoring((bpm) => {
          console.log('Heart rate from HealthKit:', bpm);
          setCurrentHR(bpm);
        }, 3000);

      } catch (error) {
        console.log('HealthKit not available, using simulated heart rate:', error.message);

        // Fallback to simulated heart rate if HealthKit fails
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

  // Animation 1: Pulsing glow effect synced with BPM
  useEffect(() => {
    if (currentHR > 0) {
      const bpm = currentHR;
      const intervalMs = (60 / bpm) * 1000;

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

  // Animation 3: Smooth progress ring
  useEffect(() => {
    Animated.timing(progressValue, {
      toValue: pctWorkout,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [pctWorkout]);

  // Animation 4: Rotating gradient (vinyl record effect)
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
    if (currentHR >= targetBpm + 20) return { label: 'Sprint', color: THEME.copper };
    if (currentHR >= targetBpm + 5) return { label: 'Push', color: THEME.orange };
    if (currentHR >= targetBpm - 5) return { label: 'Match', color: '#22c55e' };
    return { label: 'Warm', color: '#60a5fa' };
  };

  const zone = getIntensityZone();

  // Animation 2: Zone transition with haptic feedback
  useEffect(() => {
    if (zone.label !== previousZone) {
      // Trigger haptic feedback on zone change
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPreviousZone(zone.label);
    }
  }, [zone.label]);

  // Convert rotation (0-1) to degrees for interpolation
  const rotationDegrees = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    // Animation 5: Haptic feedback on play/pause
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            <Text style={styles.headerSubtitle}>VIBES MATCHED</Text>
            <Text style={styles.headerTitle}>Now Training</Text>
          </View>
          <TouchableOpacity
            style={styles.endButtonSmall}
            onPress={handleEndWorkout}
          >
            <Text style={styles.endButtonSmallText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Pills */}
        <View style={styles.statsPills}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>🎯</Text>
            <Text style={styles.pillText}>Target {targetBpm} BPM</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>⏱️</Text>
            <Text style={styles.pillText}>{formatTime(elapsedTime)} / 30:00</Text>
          </View>
        </View>

        {/* Album Art Section with Progress Ring */}
        <View style={styles.albumSection}>
          <BlurView intensity={20} tint="dark" style={styles.albumCard}>
            <View style={styles.albumArtContainer}>
              {/* Progress Ring */}
              <ProgressRing progress={pctWorkout} size={SCREEN_WIDTH - 80} />

              {/* Glow Effect - Animated */}
              <View style={styles.glowContainer}>
                <Animated.View
                  style={[
                    styles.glow,
                    {
                      transform: [{ scale: glowScale }],
                      opacity: glowOpacity,
                      backgroundColor: zone.color,
                    }
                  ]}
                />
              </View>

              {/* Album Art - Animated Rotation */}
              <Animated.View
                style={[
                  styles.albumArtWrapper,
                  { transform: [{ rotate: rotationDegrees }] }
                ]}
              >
                <LinearGradient
                  colors={[`${THEME.orange}66`, `${THEME.copper}44`, '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.albumArt}
                >
                  <View style={styles.albumInfo}>
                    <Text style={styles.albumArtist}>{currentSong.artist}</Text>
                    <Text style={styles.albumTitle}>{currentSong.title}</Text>
                    <Text style={styles.albumName}>{currentSong.album}</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Media Controls */}
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlIcon}>🔀</Text>
              </TouchableOpacity>

              <View style={styles.mainControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <Text style={styles.controlIcon}>⏮️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playButton}
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
            <View style={styles.waveformContainer}>
              <Waveform progress={pctTrack} />
              <View style={styles.timeLabels}>
                <Text style={styles.timeText}>{formatTime(trackPosition)}</Text>
                <Text style={styles.timeText}>-{formatTime(currentSong.duration - trackPosition)}</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Live Stats */}
        <BlurView intensity={20} tint="dark" style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <StatItem
              label="BPM"
              value={currentHR.toString()}
              icon="❤️"
              color={zone.color}
            />
            <StatItem
              label="Delta"
              value={`${bpmDelta > 0 ? '+' : ''}${bpmDelta}`}
              icon="📊"
            />
            <StatItem
              label="Calories"
              value={Math.floor(calories).toString()}
              icon="🔥"
            />
            <StatItem
              label="Elapsed"
              value={formatTime(elapsedTime)}
              icon="⏱️"
            />
          </View>

          {/* Intensity Zones */}
          <View style={styles.zonesSection}>
            <Text style={styles.zonesLabel}>INTENSITY ZONE</Text>
            <View style={styles.zonesBar}>
              <View style={[styles.zoneSegment, { flex: 18, backgroundColor: '#60a5fa' }]} />
              <View style={[styles.zoneSegment, { flex: 32, backgroundColor: '#22c55e' }]} />
              <View style={[styles.zoneSegment, { flex: 36, backgroundColor: THEME.orange }]} />
              <View style={[styles.zoneSegment, { flex: 14, backgroundColor: THEME.copper }]} />
            </View>
            <View style={styles.currentZone}>
              <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
              <Text style={styles.zoneText}>{zone.label}</Text>
            </View>
          </View>
        </BlurView>

        {/* Workout Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileIcon}>{profile?.icon || '💪'}</Text>
          <Text style={styles.profileName}>{profile?.name || 'Workout'}</Text>
          <Text style={styles.profileDescription}>
            {profile?.description || 'Keep up the great work!'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Progress Ring Component
function ProgressRing({ progress, size }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size} style={styles.progressRing}>
      {/* Background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={THEME.orange}
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

// Waveform Component
function Waveform({ progress }) {
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
                backgroundColor: isPast ? THEME.orange : 'rgba(255, 255, 255, 0.2)',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Stat Item Component
function StatItem({ label, value, icon, color = '#fff' }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
  endButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  endButtonSmallText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  statsPills: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  albumSection: {
    marginBottom: 20,
  },
  albumCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  albumName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
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
    borderRadius: 32,
    backgroundColor: THEME.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playIcon: {
    fontSize: 28,
  },
  waveformContainer: {
    marginTop: 20,
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
    borderRadius: 2,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  zonesSection: {
    marginTop: 24,
  },
  zonesLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    fontWeight: '600',
  },
  zonesBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
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
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
