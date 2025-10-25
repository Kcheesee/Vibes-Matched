/**
 * Friends Screen - Manage friends and friend requests
 * Burnt orange theme with glassmorphism
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { socialService } from '../services/api';

const THEME = {
  orange: '#CC5500',
  copper: '#D87227',
  charcoal: '#0B0B0C',
};

export default function FriendsScreen({ navigation }) {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        socialService.getFriends(),
        socialService.getFriendRequests(),
      ]);

      setFriends(friendsRes.data.friends || []);
      setFriendRequests(requestsRes.data.requests || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await socialService.sendFriendRequest(searchEmail.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', 'Friend request sent');
      setSearchEmail('');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to send friend request');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (requestId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await socialService.acceptFriendRequest(requestId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadData();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleReject = async (requestId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await socialService.rejectFriendRequest(requestId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleRemove = (friend) => {
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
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Friends</Text>
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
        {/* Add Friend Section */}
        <BlurView intensity={20} tint="dark" style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add Friend</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={searchEmail}
              onChangeText={setSearchEmail}
              placeholder="Enter friend's email"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={handleSendRequest}
              disabled={sending}
            >
              <LinearGradient
                colors={[THEME.orange, THEME.copper]}
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
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>
              Friend Requests ({friendRequests.length})
            </Text>
            {friendRequests.map((request) => (
              <BlurView key={request.id} intensity={15} tint="dark" style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {request.from_user.name?.charAt(0) || request.from_user.email.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.requestText}>
                    <Text style={styles.requestName}>
                      {request.from_user.name || 'User'}
                    </Text>
                    <Text style={styles.requestEmail}>{request.from_user.email}</Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(request.id)}
                  >
                    <Text style={styles.acceptButtonText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(request.id)}
                  >
                    <Text style={styles.rejectButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            ))}
          </View>
        )}

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            My Friends ({friends.length})
          </Text>
          {friends.length === 0 ? (
            <BlurView intensity={15} tint="dark" style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptyText}>
                Add friends to see their workouts and compete together!
              </Text>
            </BlurView>
          ) : (
            friends.map((friend) => (
              <BlurView key={friend.id} intensity={15} tint="dark" style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {friend.name?.charAt(0) || friend.email.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.friendText}>
                    <Text style={styles.friendName}>{friend.name || 'User'}</Text>
                    <Text style={styles.friendEmail}>{friend.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(friend)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </BlurView>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
  addSection: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#fff',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  requestCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${THEME.orange}40`,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  requestText: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  requestEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'bold',
  },
  friendCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendText: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
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
  },
});
