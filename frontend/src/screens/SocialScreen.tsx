/**
 * SocialScreen - Unified social hub with V2 design language
 * Features: Friends management + Activity feed in one place
 * Burnt orange theme, glassmorphism, bottom nav support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from '../theme';
import { socialService } from '../services/api';
import { BottomNav, Waveform } from '../components';

function SocialScreenContent({ navigation }: any) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'friends' | 'activity'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsRes, requestsRes, activityRes] = await Promise.all([
        socialService.getFriends(),
        socialService.getFriendRequests(),
        socialService.getActivityFeed(),
      ]);

      setFriends(friendsRes.data.friends || []);
      setFriendRequests(requestsRes.data.requests || []);
      setActivityFeed(activityRes.data.activities || []);
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSendRequest = async () => {
    if (!searchEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setSending(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await socialService.sendFriendRequest(searchEmail.trim());
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success!', 'Friend request sent');
      setSearchEmail('');
    } catch (error: any) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', error.response?.data?.error || 'Failed to send friend request');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await socialService.acceptFriendRequest(requestId);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleReject = async (requestId: number) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await socialService.rejectFriendRequest(requestId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleRemove = (friend: any) => {
    Alert.alert(
      'Remove Friend?',
      `Remove ${friend.name || friend.email} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialService.removeFriend(friend.id);
              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
      {/* Waveform background */}
      <Waveform />

      {/* Header */}
      <View style={[styles.header, { marginTop: theme.spacing.xxl + 20 }]}>
        <View>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, letterSpacing: 1.5 }]}>
            SOCIAL
          </Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: theme.spacing.xs }]}>
            Connect
          </Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabSwitcher, { marginHorizontal: 20, marginTop: theme.spacing.lg }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              flex: 1,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: activeTab === 'friends' ? `${theme.colors.orange}20` : theme.colors.glass,
              borderWidth: 1,
              borderColor: activeTab === 'friends' ? theme.colors.orange : theme.colors.border,
            },
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[
              theme.typography.body,
              {
                color: activeTab === 'friends' ? theme.colors.orange : theme.colors.textSecondary,
                fontWeight: activeTab === 'friends' ? '600' : '400',
                textAlign: 'center',
              },
            ]}
          >
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>

        <View style={{ width: 12 }} />

        <TouchableOpacity
          style={[
            styles.tab,
            {
              flex: 1,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: activeTab === 'activity' ? `${theme.colors.orange}20` : theme.colors.glass,
              borderWidth: 1,
              borderColor: activeTab === 'activity' ? theme.colors.orange : theme.colors.border,
            },
          ]}
          onPress={() => setActiveTab('activity')}
        >
          <Text
            style={[
              theme.typography.body,
              {
                color: activeTab === 'activity' ? theme.colors.orange : theme.colors.textSecondary,
                fontWeight: activeTab === 'activity' ? '600' : '400',
                textAlign: 'center',
              },
            ]}
          >
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.orange}
          />
        }
      >
        {activeTab === 'friends' ? (
          <>
            {/* Add Friend Section */}
            <BlurView
              intensity={theme.isDark ? 20 : 25}
              tint={theme.isDark ? 'dark' : 'light'}
              style={[
                styles.addSection,
                {
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.border,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.xl,
                },
              ]}
            >
              <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
                Add Friend
              </Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: theme.colors.glass,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.sm,
                      padding: theme.spacing.md,
                      color: theme.colors.text,
                      ...theme.typography.body,
                    },
                  ]}
                  value={searchEmail}
                  onChangeText={setSearchEmail}
                  placeholder="Enter friend's email"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!sending}
                />
                <TouchableOpacity
                  style={[styles.sendButton, { borderRadius: theme.radius.sm }]}
                  onPress={handleSendRequest}
                  disabled={sending}
                >
                  <LinearGradient
                    colors={[theme.colors.orange, theme.colors.copper]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sendButtonGradient}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.sendButtonText}>+</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <View style={{ marginBottom: theme.spacing.xl }}>
                <Text
                  style={[
                    theme.typography.h3,
                    { color: theme.colors.text, marginBottom: theme.spacing.md },
                  ]}
                >
                  Friend Requests ({friendRequests.length})
                </Text>
                {friendRequests.map((request) => (
                  <BlurView
                    key={request.id}
                    intensity={theme.isDark ? 15 : 20}
                    tint={theme.isDark ? 'dark' : 'light'}
                    style={[
                      styles.card,
                      {
                        borderRadius: theme.radius.md,
                        borderColor: `${theme.colors.orange}40`,
                        padding: theme.spacing.lg,
                        marginBottom: theme.spacing.sm,
                      },
                    ]}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.userInfo}>
                        <View
                          style={[
                            styles.avatar,
                            {
                              backgroundColor: theme.colors.orange,
                              borderRadius: theme.radius.md,
                            },
                          ]}
                        >
                          <Text style={styles.avatarText}>
                            {request.from_user.name?.charAt(0) || request.from_user.email.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.userText}>
                          <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                            {request.from_user.name || 'User'}
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                            {request.from_user.email}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: theme.colors.orange,
                              borderRadius: theme.radius.sm,
                            },
                          ]}
                          onPress={() => handleAccept(request.id)}
                        >
                          <Text style={styles.actionButtonText}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: theme.colors.glass,
                              borderRadius: theme.radius.sm,
                            },
                          ]}
                          onPress={() => handleReject(request.id)}
                        >
                          <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </BlurView>
                ))}
              </View>
            )}

            {/* Friends List */}
            <View>
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.text, marginBottom: theme.spacing.md },
                ]}
              >
                My Friends ({friends.length})
              </Text>
              {friends.length === 0 ? (
                <BlurView
                  intensity={theme.isDark ? 15 : 20}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[
                    styles.emptyCard,
                    {
                      borderRadius: theme.radius.lg,
                      borderColor: theme.colors.border,
                      padding: theme.spacing.xxl,
                    },
                  ]}
                >
                  <Text style={styles.emptyIcon}>👥</Text>
                  <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
                    No Friends Yet
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    Add friends to see their workouts and compete together!
                  </Text>
                </BlurView>
              ) : (
                friends.map((friend) => (
                  <BlurView
                    key={friend.id}
                    intensity={theme.isDark ? 15 : 20}
                    tint={theme.isDark ? 'dark' : 'light'}
                    style={[
                      styles.card,
                      {
                        borderRadius: theme.radius.md,
                        borderColor: theme.colors.border,
                        padding: theme.spacing.lg,
                        marginBottom: theme.spacing.sm,
                      },
                    ]}
                  >
                    <View style={styles.cardContent}>
                      <View style={styles.userInfo}>
                        <View
                          style={[
                            styles.avatar,
                            {
                              backgroundColor: theme.colors.orange,
                              borderRadius: theme.radius.md,
                            },
                          ]}
                        >
                          <Text style={styles.avatarText}>
                            {friend.name?.charAt(0) || friend.email.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.userText}>
                          <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                            {friend.name || 'User'}
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                            {friend.email}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.removeButton,
                          {
                            borderRadius: theme.radius.sm,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                          },
                        ]}
                        onPress={() => handleRemove(friend)}
                      >
                        <Text style={[theme.typography.caption, { color: '#FF3B30', fontWeight: '600' }]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            {/* Activity Feed */}
            <View>
              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.text, marginBottom: theme.spacing.md },
                ]}
              >
                Recent Activity
              </Text>
              {activityFeed.length === 0 ? (
                <BlurView
                  intensity={theme.isDark ? 15 : 20}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[
                    styles.emptyCard,
                    {
                      borderRadius: theme.radius.lg,
                      borderColor: theme.colors.border,
                      padding: theme.spacing.xxl,
                    },
                  ]}
                >
                  <Text style={styles.emptyIcon}>📊</Text>
                  <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
                    No Activity Yet
                  </Text>
                  <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    When your friends complete workouts, they'll appear here!
                  </Text>
                </BlurView>
              ) : (
                activityFeed.map((activity) => (
                  <BlurView
                    key={activity.id}
                    intensity={theme.isDark ? 15 : 20}
                    tint={theme.isDark ? 'dark' : 'light'}
                    style={[
                      styles.activityCard,
                      {
                        borderRadius: theme.radius.md,
                        borderColor: theme.colors.border,
                        padding: theme.spacing.lg,
                        marginBottom: theme.spacing.sm,
                      },
                    ]}
                  >
                    <View style={styles.activityHeader}>
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: theme.colors.orange,
                            borderRadius: theme.radius.md,
                          },
                        ]}
                      >
                        <Text style={styles.avatarText}>
                          {activity.user_name?.charAt(0) || activity.user_email.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                          {activity.user_name || 'User'}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                          {formatTimeAgo(activity.created_at)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.workoutInfo, { marginTop: theme.spacing.md }]}>
                      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                        {activity.workout_type} Workout
                      </Text>
                      <View style={[styles.workoutStats, { marginTop: theme.spacing.xs }]}>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                          {Math.round(activity.duration || 0)} min • {activity.avg_heart_rate || '--'} BPM avg
                        </Text>
                      </View>
                    </View>
                  </BlurView>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="social"
        onNavigate={(screen) => navigation.navigate(screen)}
      />
    </View>
  );
}

// Wrapper with ThemeProvider
export default function SocialScreen(props: any) {
  return (
    <ThemeProvider>
      <SocialScreenContent {...props} />
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
    paddingHorizontal: 20,
  },
  tabSwitcher: {
    flexDirection: 'row',
  },
  tab: {
    // Styles applied inline
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Extra padding for bottom nav
  },
  addSection: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
  },
  sendButton: {
    width: 50,
    height: 50,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#fff',
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  userText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  emptyCard: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  activityCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  workoutInfo: {
    // Spacing applied inline
  },
  workoutStats: {
    // Spacing applied inline
  },
});
