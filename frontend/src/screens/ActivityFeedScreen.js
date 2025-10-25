/**
 * Activity Feed Screen - See friends' recent workouts
 * Burnt orange theme with glassmorphism
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { socialService } from '../services/api';

const THEME = {
  orange: '#CC5500',
  copper: '#D87227',
  charcoal: '#0B0B0C',
};

export default function ActivityFeedScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await socialService.getActivityFeed();
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getTimeAgo = (isoDate) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background gradients */}
      <View style={styles.backgroundGradients}>
        <View style={[styles.gradient, styles.gradientTop]} />
        <View style={[styles.gradient, styles.gradientBottom]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>SOCIAL</Text>
          <Text style={styles.headerTitle}>Activity Feed</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME.orange}
          />
        }
      >
        {activities.length === 0 ? (
          <BlurView intensity={15} tint="dark" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Recent Activity</Text>
            <Text style={styles.emptyText}>
              Add friends to see their workouts here!{'\n'}
              Compete and motivate each other.
            </Text>
            <TouchableOpacity
              style={styles.addFriendsButton}
              onPress={() => navigation.navigate('Friends')}
            >
              <LinearGradient
                colors={[THEME.orange, THEME.copper]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addFriendsGradient}
              >
                <Text style={styles.addFriendsText}>Add Friends</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        ) : (
          activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              getTimeAgo={getTimeAgo}
              formatDuration={formatDuration}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ActivityCard({ activity, getTimeAgo, formatDuration }) {
  const { user, workout } = activity;

  return (
    <BlurView intensity={15} tint="dark" style={styles.activityCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.userName}>{user.name || 'User'}</Text>
          <Text style={styles.timeAgo}>
            {getTimeAgo(workout.start_time)}
          </Text>
        </View>
        <View style={styles.workoutBadge}>
          <Text style={styles.workoutBadgeText}>{workout.profile_type}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statValue}>{workout.avg_heart_rate || '--'}</Text>
          <Text style={styles.statLabel}>Avg BPM</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{workout.calories || '--'}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={styles.statValue}>{workout.max_heart_rate || '--'}</Text>
          <Text style={styles.statLabel}>Max BPM</Text>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.charcoal,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  activityCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  cardHeaderText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  workoutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: `${THEME.orange}20`,
    borderWidth: 1,
    borderColor: `${THEME.orange}40`,
  },
  workoutBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.orange,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFriendsButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addFriendsGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  addFriendsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
