/**
 * HomeScreenV2 - New visual system with burnt orange + kinetic motion
 * Features: Horizontal scrolling workout cards, animated waves, new theme
 *
 * UNCHANGED: All API calls, navigation, data flow - ONLY UI/UX changes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { workoutService, profileService } from '../services/api';
import { ThemeProvider, useTheme } from '../theme';
import { WorkoutCard, Waveform, StatCard, BottomNav } from '../components';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8; // Wider cards for better readability
const CARD_SPACING = 20; // More breathing room

// Mock workout profiles - in real app, these come from profileService.getAllProfiles()
const MOCK_WORKOUTS = [
  { id: 1, name: 'HIIT Session', profile_type: 'HIIT', target_zone_min: 80, target_zone_max: 95, icon: '🔥' },
  { id: 2, name: 'Running', profile_type: 'Running', target_zone_min: 70, target_zone_max: 85, icon: '🏃' },
  { id: 3, name: 'Cycling', profile_type: 'Cycling', target_zone_min: 65, target_zone_max: 80, icon: '🚴' },
  { id: 4, name: 'Strength', profile_type: 'Strength', target_zone_min: 60, target_zone_max: 75, icon: '💪' },
  { id: 5, name: 'Yoga', profile_type: 'Yoga', target_zone_min: 50, target_zone_max: 65, icon: '🧘' },
];

function HomeScreenV2Content({ navigation }: any) {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [workoutProfiles, setWorkoutProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check for active workout (UNCHANGED API call)
      const activeRes = await workoutService.getActiveWorkout();
      if (activeRes.data.active) {
        setActiveWorkout(activeRes.data.workout);
      }

      // Load recent workouts (UNCHANGED API call)
      const historyRes = await workoutService.getWorkoutHistory();
      setRecentWorkouts(historyRes.data.workouts.slice(0, 5));

      // Load workout profiles (UNCHANGED API call)
      try {
        const profilesRes = await profileService.getAllProfiles();
        setWorkoutProfiles(profilesRes.data.profiles || MOCK_WORKOUTS);
      } catch (error) {
        // Fallback to mock data if API fails
        setWorkoutProfiles(MOCK_WORKOUTS);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = (profile: any) => {
    // UNCHANGED: Same navigation as original screen
    navigation.navigate('WorkoutStart', { profile });
  };

  const handleViewWorkoutDetails = (workout: any) => {
    // UNCHANGED: Same navigation as original screen
    navigation.navigate('WorkoutDetails', { workoutId: workout.id });
  };

  const calculateStats = () => {
    if (recentWorkouts.length === 0) return { totalWorkouts: 0, totalMinutes: 0, avgBPM: 0 };

    const totalMinutes = recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalBPM = recentWorkouts.reduce((sum, w) => sum + (w.avg_heart_rate || 0), 0);
    const avgBPM = Math.round(totalBPM / recentWorkouts.length);

    return {
      totalWorkouts: recentWorkouts.length,
      totalMinutes: Math.round(totalMinutes),
      avgBPM: isNaN(avgBPM) ? 0 : avgBPM,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.orange} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated wave background */}
      <Waveform />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { marginTop: theme.spacing.xxl + 20 }]}>
          <View>
            <Text style={[styles.greeting, theme.typography.caption, { color: theme.colors.textSecondary }]}>
              WELCOME BACK
            </Text>
            <Text style={[styles.userName, theme.typography.h1, { color: theme.colors.text, marginTop: theme.spacing.xs }]}>
              {user?.name || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            style={[
              styles.logoutButton,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
              },
            ]}
          >
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, fontWeight: '600' }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Row */}
        {recentWorkouts.length > 0 && (
          <View style={[styles.statsRow, { marginTop: theme.spacing.xl }]}>
            <StatCard
              label="Workouts"
              value={stats.totalWorkouts}
              icon="💪"
              style={styles.statCard}
            />
            <StatCard
              label="Minutes"
              value={stats.totalMinutes}
              icon="⏱️"
              style={styles.statCard}
            />
            <StatCard
              label="Avg BPM"
              value={stats.avgBPM}
              icon="❤️"
              style={styles.statCard}
            />
          </View>
        )}

        {/* Active Workout Alert */}
        {activeWorkout && (
          <TouchableOpacity
            style={[
              styles.activeWorkoutBanner,
              {
                backgroundColor: `${theme.colors.orange}20`,
                borderColor: theme.colors.orange,
                borderRadius: theme.radius.md,
                padding: theme.spacing.lg,
                marginTop: theme.spacing.xl,
              },
            ]}
            onPress={() => navigation.navigate('WorkoutTracking', { workout: activeWorkout })}
          >
            <Text style={[theme.typography.h3, { color: theme.colors.orange, marginBottom: theme.spacing.xs }]}>
              Workout In Progress
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
              Tap to resume your {activeWorkout.profile_type} workout
            </Text>
          </TouchableOpacity>
        )}

        {/* Favorite Workouts Section */}
        <View style={[styles.section, { marginTop: theme.spacing.xl }]}>
          <Text style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
            Favorite Workouts
          </Text>

          <FlatList
            data={workoutProfiles}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}>
                <WorkoutCard
                  title={item.name}
                  bpmRange={`${item.target_zone_min}-${item.target_zone_max}`}
                  icon={item.icon}
                  onPress={() => handleStartWorkout(item)}
                  isFavorite={true}
                />
              </View>
            )}
          />
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { marginTop: theme.spacing.xl }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.md,
              },
            ]}
            onPress={() => navigation.navigate('WorkoutStart')}
          >
            <Text style={styles.actionIcon}>💪</Text>
            <View style={styles.actionText}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Start Workout</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                Choose a workout profile
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.md,
              },
            ]}
            onPress={() => navigation.navigate('MusicSync')}
          >
            <Text style={styles.actionIcon}>🎧</Text>
            <View style={styles.actionText}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Music Sync</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                Connect Spotify, Apple Music
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.md,
              },
            ]}
            onPress={() => navigation.navigate('TopSongs')}
          >
            <Text style={styles.actionIcon}>🎵</Text>
            <View style={styles.actionText}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Your Playlists</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                Hype, cooldown & song library
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.md,
              },
            ]}
            onPress={() => navigation.navigate('Friends')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <View style={styles.actionText}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Friends</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                See your friends' workouts
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
              },
            ]}
            onPress={() => navigation.navigate('ActivityFeed')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionText}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Activity Feed</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                Recent friend activity
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <View style={[styles.section, { marginTop: theme.spacing.xl, marginBottom: theme.spacing.xxl }]}>
            <Text style={[styles.sectionTitle, theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
              Recent Workouts
            </Text>
            {recentWorkouts.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={[
                  styles.recentWorkoutItem,
                  {
                    backgroundColor: theme.colors.glass,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
                onPress={() => handleViewWorkoutDetails(workout)}
              >
                <View style={styles.workoutItemContent}>
                  <View style={styles.workoutItemLeft}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                      {workout.profile_type}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                      {Math.round(workout.duration || 0)} min • {workout.avg_heart_rate || '--'} BPM
                    </Text>
                  </View>
                  <Text style={{ fontSize: 24 }}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="home"
        onNavigate={(screen) => navigation.navigate(screen)}
      />
    </View>
  );
}

// Wrapper with ThemeProvider
export default function HomeScreenV2(props: any) {
  return (
    <ThemeProvider>
      <HomeScreenV2Content {...props} />
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
    paddingHorizontal: 20,
    paddingBottom: 120, // Extra padding for bottom nav bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  userName: {
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  activeWorkoutBanner: {
    borderWidth: 2,
  },
  section: {
    // Container for sections
  },
  sectionTitle: {
    fontWeight: '600',
  },
  carouselContent: {
    paddingRight: CARD_SPACING,
  },
  quickActions: {
    // Container for action buttons
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  recentWorkoutItem: {
    borderWidth: 1,
  },
  workoutItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutItemLeft: {
    flex: 1,
  },
});
