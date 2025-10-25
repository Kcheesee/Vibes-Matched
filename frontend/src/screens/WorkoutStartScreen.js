/**
 * Workout Start Screen - Premium Glass

morphism Design
 * Inspired by modern fitness apps with animated cards and smooth interactions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { profileService, workoutService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function WorkoutStartScreen({ navigation }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [starting, setStarting] = useState(false);
  const [showTransitionCountdown, setShowTransitionCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [activeWorkout, setActiveWorkout] = useState(null);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const footerSlide = useRef(new Animated.Value(100)).current;
  const countdownOpacity = useRef(new Animated.Value(0)).current;

  // Countdown timer ref
  const countdownTimerRef = useRef(null);

  useEffect(() => {
    loadProfiles();
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Reload profiles when screen comes into focus (e.g., after creating a profile)
  useFocusEffect(
    React.useCallback(() => {
      loadProfiles();
    }, [])
  );

  useEffect(() => {
    // Animate footer when profile is selected
    Animated.spring(footerSlide, {
      toValue: selectedProfile ? 0 : 100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [selectedProfile]);

  useEffect(() => {
    // Handle countdown timer
    if (showTransitionCountdown && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showTransitionCountdown && countdown === 0) {
      // Auto-transition when countdown reaches 0
      performTransition();
    }
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [showTransitionCountdown, countdown]);

  useEffect(() => {
    // Animate countdown overlay
    Animated.timing(countdownOpacity, {
      toValue: showTransitionCountdown ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showTransitionCountdown]);

  const loadProfiles = async () => {
    try {
      const response = await profileService.getAllProfiles();
      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
      Alert.alert('Error', 'Failed to load workout profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (profile) => {
    setSelectedProfile(selectedProfile?.id === profile.id ? null : profile);
  };

  const performTransition = async () => {
    if (!activeWorkout || !selectedProfile) return;

    try {
      // End the current workout first
      await workoutService.endWorkout(activeWorkout.id);

      // Start a new workout with the selected profile
      const response = await workoutService.startWorkout(selectedProfile.profile_type);
      const workout = response.data.workout;

      setShowTransitionCountdown(false);
      navigation.navigate('WorkoutTracking', {
        workout,
        profile: selectedProfile,
      });
    } catch (error) {
      console.error('Error transitioning workout:', error);
      Alert.alert('Error', 'Failed to transition workout');
      setShowTransitionCountdown(false);
      setStarting(false);
    }
  };

  const handleCancelTransition = () => {
    setShowTransitionCountdown(false);
    setCountdown(3);
    setActiveWorkout(null);
    setStarting(false);
  };

  const handleStartWorkout = async () => {
    if (!selectedProfile) return;

    setStarting(true);
    try {
      const response = await workoutService.startWorkout(selectedProfile.profile_type);
      const workout = response.data.workout;

      navigation.navigate('WorkoutTracking', {
        workout,
        profile: selectedProfile,
      });
    } catch (error) {
      console.error('Error starting workout:', error);

      if (error.response?.status === 400 && error.response?.data?.error?.includes('active workout')) {
        // Active workout detected - start countdown to auto-transition
        const workout = error.response.data.workout;
        setActiveWorkout(workout);
        setCountdown(3);
        setShowTransitionCountdown(true);
      } else {
        Alert.alert('Error', 'Failed to start workout. Please try again.');
        setStarting(false);
      }
    }
  };

  const getTargetHR = (profile) => {
    if (!user?.max_heart_rate || !profile?.target_zone_min || !profile?.target_zone_max) return null;
    const minHR = Math.round((profile.target_zone_min / 100) * user.max_heart_rate);
    const maxHR = Math.round((profile.target_zone_max / 100) * user.max_heart_rate);
    return { minHR, maxHR };
  };

  const getIntensityWidth = (profile) => {
    // Map target zone to visual intensity (40% to 85%)
    if (!profile?.target_zone_max) return '60%';
    const zoneRange = profile.target_zone_max - 50; // 0-50 range
    return `${40 + (zoneRange * 0.9)}%`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Orbs */}
      <View style={styles.backgroundOrbs}>
        <LinearGradient
          colors={[`${Colors.primary}40`, 'transparent']}
          style={[styles.orb, styles.orb1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={[`${Colors.secondary}30`, 'transparent']}
          style={[styles.orb, styles.orb2]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>❤️</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerSubtitle}>VIBES MATCHED</Text>
            <Text style={styles.headerTitle}>Choose Your Workout</Text>
          </View>
        </View>
      </BlurView>

      {/* Workout Cards */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Create Custom Profile Button */}
        <TouchableOpacity
          style={styles.createProfileButton}
          onPress={() => navigation.navigate('CreateProfile')}
          activeOpacity={0.9}
        >
          <BlurView intensity={60} tint="dark" style={styles.createProfileBlur}>
            <LinearGradient
              colors={['rgba(204, 85, 0, 0.3)', 'rgba(216, 114, 39, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createProfileGradient}
            >
              <View style={styles.createProfileIcon}>
                <Text style={styles.createProfileIconText}>+</Text>
              </View>
              <View style={styles.createProfileText}>
                <Text style={styles.createProfileTitle}>Create Custom Profile</Text>
                <Text style={styles.createProfileSubtitle}>Design your own workout with custom heart rate zones</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>

        {profiles
          .filter(p => p && p.id && p.icon && p.name && p.target_zone_min && p.target_zone_max)
          .map((profile, index) => (
            <WorkoutCard
              key={profile.id}
              profile={profile}
              isSelected={selectedProfile?.id === profile.id}
              onPress={() => handleSelectProfile(profile)}
              targetHR={getTargetHR(profile)}
              intensityWidth={getIntensityWidth(profile)}
              index={index}
            />
          ))}
        <View style={{ height: 140 }} />
      </Animated.ScrollView>

      {/* Bottom Preview Bar */}
      <Animated.View
        style={[
          styles.footerContainer,
          {
            transform: [{ translateY: footerSlide }],
          },
        ]}
      >
        <BlurView intensity={80} tint="dark" style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <View style={styles.footerIconContainer}>
                <Text style={styles.footerIcon}>▶️</Text>
              </View>
              <View>
                <Text style={styles.footerLabel}>SELECTED</Text>
                <Text style={styles.footerTitle}>
                  {selectedProfile?.name} • {selectedProfile?.target_zone_min}-{selectedProfile?.target_zone_max}%
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.startButton, starting && styles.startButtonDisabled]}
              onPress={handleStartWorkout}
              disabled={starting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButtonGradient}
              >
                {starting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.startButtonText}>Start Workout</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

function WorkoutCard({ profile, isSelected, onPress, targetHR, intensityWidth, index }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(glowAnim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true, // Changed to true to match scaleAnim
      tension: 50,
      friction: 7,
    }).start();
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: Animated.subtract(1, Animated.multiply(glowAnim, -0.2)),
        },
      ]}
    >
      {/* Selection Glow */}
      <Animated.View
        style={[
          styles.cardGlow,
          {
            opacity: glowAnim,
          },
        ]}
      >
        <LinearGradient
          colors={[`${Colors.primary}80`, `${Colors.secondary}70`, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <BlurView intensity={30} tint="dark" style={styles.card}>
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'transparent']}
            style={styles.cardGradient}
          />

          {/* Card Content */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.profileIcon}>{profile?.icon || '💪'}</Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{profile?.name || 'Workout'}</Text>
                  <View style={styles.bpmChip}>
                    <Text style={styles.bpmText}>
                      {profile?.target_zone_min || 60}-{profile?.target_zone_max || 80}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDescription}>{profile?.description || 'Get moving!'}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>

            {/* Intensity Bar */}
            <View style={styles.intensitySection}>
              <View style={styles.intensityLabels}>
                <Text style={styles.intensityLabel}>Intensity</Text>
                <Text style={styles.intensityLabel}>Music Match</Text>
              </View>
              <View style={styles.intensityTrack}>
                <Animated.View
                  style={[
                    styles.intensityFill,
                    {
                      width: isSelected ? '88%' : intensityWidth,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>

              {targetHR && (
                <Text style={styles.targetHRText}>
                  Target: {targetHR.minHR}-{targetHR.maxHR} BPM
                </Text>
              )}
            </View>
          </View>

          {/* Preset Badge */}
          {profile.is_preset && (
            <View style={styles.presetBadge}>
              <Text style={styles.presetText}>PRESET</Text>
            </View>
          )}

          {/* Border Ring */}
          <View style={[styles.cardBorder, isSelected && styles.cardBorderSelected]} />
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0B0C',
  },
  backgroundOrbs: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 320,
    height: 320,
    top: -100,
    left: -100,
  },
  orb2: {
    width: 380,
    height: 380,
    bottom: -120,
    right: -120,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerIconText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  createProfileButton: {
    marginBottom: 20,
  },
  createProfileBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(204, 85, 0, 0.3)',
  },
  createProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  createProfileIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(204, 85, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(204, 85, 0, 0.5)',
  },
  createProfileIconText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFF',
  },
  createProfileText: {
    flex: 1,
  },
  createProfileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  createProfileSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  cardGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    zIndex: -1,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  cardContent: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profileIcon: {
    fontSize: 26,
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
  bpmChip: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  bpmText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  intensitySection: {
    marginTop: 4,
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  intensityLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  intensityTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetHRText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 10,
    textAlign: 'center',
  },
  presetBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardBorderSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  footerIcon: {
    fontSize: 18,
  },
  footerLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 3,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  startButton: {
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
