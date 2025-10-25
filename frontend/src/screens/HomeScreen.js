/**
 * Home Screen - Main dashboard with glassmorphism design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { workoutService } from '../services/api';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const loadData = async () => {
    try {
      // Check for active workout
      const activeRes = await workoutService.getActiveWorkout();
      if (activeRes.data.active) {
        setActiveWorkout(activeRes.data.workout);
      }

      // Load recent workouts
      const historyRes = await workoutService.getWorkoutHistory();
      setRecentWorkouts(historyRes.data.workouts.slice(0, 5));

      // Quick Start section removed - users go directly to WorkoutStart screen
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0B0B0C', '#1A1A1D', '#0B0B0C']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0B0B0C', '#1A1A1D', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated gradient orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Card with Glassmorphism */}
          <BlurView intensity={30} tint="dark" style={styles.statsCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'transparent']}
              style={styles.cardGradient}
            />
            <Text style={styles.statsTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.max_heart_rate || '--'}</Text>
                <Text style={styles.statLabel}>Max HR</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{recentWorkouts.length}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {recentWorkouts.reduce((acc, w) => acc + (w.duration_minutes || 0), 0).toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
            </View>
          </BlurView>

          {/* Start Workout Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('WorkoutStart')}
            activeOpacity={0.9}
          >
            <BlurView intensity={40} tint="dark" style={styles.startButtonBlur}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>
                  {activeWorkout ? '🏃 Resume Active Workout' : '💪 Start New Workout'}
                </Text>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>

          {/* Recent Workouts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {recentWorkouts.length === 0 ? (
              <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
                <Text style={styles.emptyText}>No workouts yet!</Text>
                <Text style={styles.emptySubtext}>
                  Start your first workout to see results here
                </Text>
              </BlurView>
            ) : (
              recentWorkouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  onPress={() =>
                    navigation.navigate('WorkoutDetails', { workoutId: workout.id })
                  }
                  activeOpacity={0.8}
                >
                  <BlurView intensity={25} tint="dark" style={styles.workoutCard}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.05)', 'transparent']}
                      style={styles.cardGradient}
                    />
                    <View style={styles.workoutCardHeader}>
                      <Text style={styles.workoutType}>{workout.workout_type}</Text>
                      <Text style={styles.workoutDate}>
                        {new Date(workout.start_time).toLocaleDateString()}
                      </Text>
                    </View>
                    {workout.avg_heart_rate && (
                      <View style={styles.workoutStats}>
                        <Text style={styles.workoutStat}>
                          ❤️ Avg: {workout.avg_heart_rate} BPM
                        </Text>
                        <Text style={styles.workoutStat}>
                          ⏱️ {Math.round(workout.duration_minutes)} min
                        </Text>
                      </View>
                    )}
                  </BlurView>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TopSongs')}
              activeOpacity={0.8}
            >
              <BlurView intensity={25} tint="dark" style={styles.actionButton}>
                <LinearGradient
                  colors={['rgba(216,114,39,0.2)', 'transparent']}
                  style={styles.cardGradient}
                />
                <Text style={styles.actionButtonText}>🎵 View Top Songs</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
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
  content: {
    flex: 1,
  },
  orb1: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.15,
    blur: 60,
  },
  orb2: {
    position: 'absolute',
    bottom: 200,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.secondary,
    opacity: 0.1,
    blur: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(204,85,0,0.2)',
  },
  v2ToggleButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  v2ToggleBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  v2ToggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  v2ToggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  v2ToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoutText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
  section: {
    padding: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  favoriteCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  favoriteGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  favoriteIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  favoriteIntensity: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  favoriteBar: {
    height: '100%',
    borderRadius: 2,
  },
  startButton: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  startButtonBlur: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  startButtonGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  workoutCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    overflow: 'hidden',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 15,
  },
  workoutStat: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  actionButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
