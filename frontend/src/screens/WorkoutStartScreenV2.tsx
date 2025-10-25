/**
 * WorkoutStartScreenV2 - Choose workout profile before starting
 * Features: V2 design system with ThemeProvider, Waveform background, WorkoutCard components
 *
 * UNCHANGED: All API calls, navigation, data flow - ONLY UI/UX changes
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
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { profileService, workoutService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../theme';
import { Waveform, WorkoutCard } from '../components';

function WorkoutStartScreenV2Content({ navigation }: any) {
  const theme = useTheme();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  // Reload profiles when screen comes into focus (e.g., after creating a profile)
  useFocusEffect(
    React.useCallback(() => {
      loadProfiles();
    }, [])
  );

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

  const handleSelectProfile = (profile: any) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedProfile(selectedProfile?.id === profile.id ? null : profile);
  };

  const handleStartWorkout = async () => {
    if (!selectedProfile) return;

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setStarting(true);
    try {
      const response = await workoutService.startWorkout(selectedProfile.profile_type);
      const workout = response.data.workout;

      navigation.navigate('WorkoutTracking', {
        workout,
        profile: selectedProfile,
      });
    } catch (error: any) {
      console.error('Error starting workout:', error);

      if (error.response?.status === 400 && error.response?.data?.error?.includes('active workout')) {
        // Active workout detected
        Alert.alert(
          'Active Workout',
          'You already have an active workout. Please end it first.',
          [
            {
              text: 'Resume',
              onPress: () => {
                const workout = error.response.data.workout;
                navigation.navigate('WorkoutTracking', { workout, profile: selectedProfile });
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to start workout. Please try again.');
      }
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.orange} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated wave background */}
      <Waveform />

      {/* Header */}
      <View style={[styles.header, { marginTop: theme.spacing.xxl + 20 }]}>
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
              theme.typography.h1,
              { color: theme.colors.text, marginTop: theme.spacing.xs },
            ]}
          >
            Choose Your Workout
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Create Custom Profile Button */}
        <TouchableOpacity
          style={[styles.createProfileButton, { marginBottom: theme.spacing.lg }]}
          onPress={() => navigation.navigate('CreateProfile')}
          activeOpacity={0.9}
        >
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.createProfileBlur,
              {
                borderRadius: theme.radius.lg,
                borderColor: `${theme.colors.orange}40`,
              },
            ]}
          >
            <View
              style={[
                styles.createProfileContent,
                { padding: theme.spacing.lg },
              ]}
            >
              <View
                style={[
                  styles.createProfileIcon,
                  {
                    backgroundColor: `${theme.colors.orange}30`,
                    borderColor: `${theme.colors.orange}50`,
                    borderRadius: theme.radius.md,
                  },
                ]}
              >
                <Text style={styles.createProfileIconText}>+</Text>
              </View>
              <View style={styles.createProfileText}>
                <Text
                  style={[
                    styles.createProfileTitle,
                    theme.typography.h3,
                    { color: theme.colors.text },
                  ]}
                >
                  Create Custom Profile
                </Text>
                <Text
                  style={[
                    styles.createProfileSubtitle,
                    theme.typography.caption,
                    {
                      color: theme.colors.textSecondary,
                      marginTop: theme.spacing.xs,
                    },
                  ]}
                >
                  Design your own workout with custom heart rate zones
                </Text>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Workout Profile Cards */}
        {profiles
          .filter(p => p && p.id && p.icon && p.name && p.target_zone_min && p.target_zone_max)
          .map((profile) => (
            <View key={profile.id} style={{ marginBottom: theme.spacing.md }}>
              <WorkoutCard
                title={profile.name}
                bpmRange={`${profile.target_zone_min}-${profile.target_zone_max}`}
                icon={profile.icon}
                description={profile.description}
                onPress={() => handleSelectProfile(profile)}
                isFavorite={profile.is_preset || false}
              />
              {selectedProfile?.id === profile.id && (
                <View style={styles.selectedBadge}>
                  <Text style={[styles.selectedBadgeText, { color: theme.colors.orange }]}>
                    ✓ Selected
                  </Text>
                </View>
              )}
            </View>
          ))}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Start Button */}
      {selectedProfile && (
        <View style={styles.bottomBar}>
          <BlurView
            intensity={theme.isDark ? 80 : 90}
            tint={theme.isDark ? 'dark' : 'light'}
            style={styles.bottomBarBlur}
          >
            <View
              style={[
                styles.bottomBarContent,
                {
                  borderTopColor: theme.colors.border,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                },
              ]}
            >
              <View style={styles.bottomBarLeft}>
                <View
                  style={[
                    styles.bottomBarIcon,
                    {
                      backgroundColor: theme.colors.glass,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                >
                  <Text style={styles.bottomBarEmoji}>{selectedProfile.icon}</Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.bottomBarLabel,
                      theme.typography.caption,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    SELECTED
                  </Text>
                  <Text
                    style={[
                      styles.bottomBarTitle,
                      theme.typography.body,
                      { color: theme.colors.text, marginTop: 2 },
                    ]}
                  >
                    {selectedProfile.name} • {selectedProfile.target_zone_min}-
                    {selectedProfile.target_zone_max}%
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.startButton,
                  { borderRadius: theme.radius.md },
                  starting && styles.startButtonDisabled,
                ]}
                onPress={handleStartWorkout}
                disabled={starting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.orange, theme.colors.copper]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startButtonGradient}
                >
                  {starting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={[styles.startButtonText, theme.typography.body]}>
                      Start Workout
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
}

// Wrapper with ThemeProvider
export default function WorkoutStartScreenV2(props: any) {
  return (
    <ThemeProvider>
      <WorkoutStartScreenV2Content {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  createProfileButton: {
    // Container for create profile card
  },
  createProfileBlur: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  createProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createProfileIcon: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
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
    fontWeight: '600',
  },
  createProfileSubtitle: {
    lineHeight: 18,
  },
  selectedBadge: {
    marginTop: 8,
    alignSelf: 'center',
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBarBlur: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingBottom: 32,
  },
  bottomBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bottomBarIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  bottomBarEmoji: {
    fontSize: 20,
  },
  bottomBarLabel: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bottomBarTitle: {
    fontWeight: '600',
  },
  startButton: {
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#CC5500',
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
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
