/**
 * Top Songs Screen - Display user's top hype and cooldown songs with glassmorphism
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { workoutService } from '../services/api';

export default function TopSongsScreen({ navigation }) {
  const [hypeSongs, setHypeSongs] = useState([]);
  const [cooldownSongs, setCooldownSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hype'); // 'hype' or 'cooldown'

  useEffect(() => {
    loadTopSongs();
  }, []);

  const loadTopSongs = async () => {
    try {
      const response = await workoutService.getTopSongs();
      setHypeSongs(response.data.hype_songs || []);
      setCooldownSongs(response.data.cooldown_songs || []);
    } catch (error) {
      console.error('Error loading top songs:', error);
      Alert.alert('Error', 'Failed to load top songs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSongCard = (song, index) => (
    <BlurView
      key={song.song_id || index}
      intensity={25}
      tint="dark"
      style={styles.songCard}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'transparent']}
        style={styles.cardGradient}
      />
      <View style={styles.songRank}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>

      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{song.title || 'Unknown Title'}</Text>
        <Text style={styles.songArtist}>{song.artist || 'Unknown Artist'}</Text>

        <View style={styles.songStats}>
          {song.hype_score !== undefined && (
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Hype</Text>
              <Text style={styles.statValue}>{song.hype_score.toFixed(1)}</Text>
            </View>
          )}

          {song.cooldown_score !== undefined && (
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Cooldown</Text>
              <Text style={styles.statValue}>{song.cooldown_score.toFixed(1)}</Text>
            </View>
          )}

          {song.times_played && (
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Played</Text>
              <Text style={styles.statValue}>{song.times_played}x</Text>
            </View>
          )}
        </View>

        {song.tempo && (
          <Text style={styles.songTempo}>BPM: {Math.round(song.tempo)}</Text>
        )}
      </View>
    </BlurView>
  );

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

  const currentSongs = activeTab === 'hype' ? hypeSongs : cooldownSongs;

  return (
    <View style={styles.container}>
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#0B0B0C', '#1A1A1D', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Gradient orbs */}
      <View style={[styles.orb, { top: 150, right: -80 }]} />
      <View style={[styles.orb, { bottom: 300, left: -80, opacity: 0.08 }]} />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('hype')}
          activeOpacity={0.8}
        >
          {activeTab === 'hype' ? (
            <BlurView intensity={40} tint="dark" style={styles.tabActive}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <Text style={styles.tabTextActive}>🔥 Hype Songs</Text>
              </LinearGradient>
            </BlurView>
          ) : (
            <BlurView intensity={20} tint="dark" style={styles.tabInactive}>
              <Text style={styles.tabText}>🔥 Hype Songs</Text>
            </BlurView>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('cooldown')}
          activeOpacity={0.8}
        >
          {activeTab === 'cooldown' ? (
            <BlurView intensity={40} tint="dark" style={styles.tabActive}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <Text style={styles.tabTextActive}>😌 Cooldown Songs</Text>
              </LinearGradient>
            </BlurView>
          ) : (
            <BlurView intensity={20} tint="dark" style={styles.tabInactive}>
              <Text style={styles.tabText}>😌 Cooldown Songs</Text>
            </BlurView>
          )}
        </TouchableOpacity>
      </View>

      {/* Songs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentSongs.length === 0 ? (
          <BlurView intensity={20} tint="dark" style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'hype' ? '🔥' : '😌'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'hype'
                ? 'No hype songs yet!'
                : 'No cooldown songs yet!'}
            </Text>
            <Text style={styles.emptySubtext}>
              Complete workouts with music to see your top songs here
            </Text>
          </BlurView>
        ) : (
          <View style={styles.songsList}>
            {currentSongs.map((song, index) => renderSongCard(song, index))}
          </View>
        )}
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
  orb: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.primary,
    opacity: 0.12,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    paddingTop: 60,
  },
  tab: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  tabActive: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  tabInactive: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  tabGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  songsList: {
    padding: 15,
  },
  songCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    overflow: 'hidden',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  songRank: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  songArtist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 10,
  },
  songStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statBadge: {
    backgroundColor: 'rgba(204,85,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(204,85,0,0.3)',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  songTempo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
    marginTop: 60,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
