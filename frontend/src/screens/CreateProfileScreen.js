/**
 * Create Profile Screen - Create custom workout profiles
 * Burnt orange theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { profileService } from '../services/api';

const THEME = {
  orange: '#CC5500',
  copper: '#D87227',
  charcoal: '#0B0B0C',
  ink: '#121212',
  cream: '#F8F3E9',
};

const EMOJI_OPTIONS = ['💪', '🏃', '🚴', '🏋️', '🧘', '⚡', '🔥', '💯', '🎯', '🚀', '⭐', '✨'];

const MUSIC_LIBRARIES = [
  { id: 'default', name: 'Default Mix', icon: '🎵', description: 'Curated workout music' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', description: 'Your Spotify playlists' },
  { id: 'apple', name: 'Apple Music', icon: '🎶', description: 'Your Apple Music library' },
  { id: 'custom', name: 'Custom Playlist', icon: '📱', description: 'Device music library' },
];

export default function CreateProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetZoneMin, setTargetZoneMin] = useState('70');
  const [targetZoneMax, setTargetZoneMax] = useState('85');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [selectedLibrary, setSelectedLibrary] = useState('default');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    const minZone = parseInt(targetZoneMin);
    const maxZone = parseInt(targetZoneMax);

    if (isNaN(minZone) || isNaN(maxZone)) {
      Alert.alert('Error', 'Heart rate zones must be numbers');
      return;
    }

    if (minZone < 50 || minZone > 100) {
      Alert.alert('Error', 'Minimum zone must be between 50-100%');
      return;
    }

    if (maxZone < 50 || maxZone > 100) {
      Alert.alert('Error', 'Maximum zone must be between 50-100%');
      return;
    }

    if (minZone >= maxZone) {
      Alert.alert('Error', 'Minimum zone must be less than maximum zone');
      return;
    }

    // Create profile
    setCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await profileService.createProfile({
        name: name.trim(),
        description: description.trim(),
        target_zone_min: minZone,
        target_zone_max: maxZone,
        icon: selectedIcon,
        music_library: selectedLibrary,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Success!',
        'Your custom workout profile has been created',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create profile');
    } finally {
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background gradients */}
      <View style={styles.backgroundGradients}>
        <View style={[styles.gradient, styles.gradientTop]} />
        <View style={[styles.gradient, styles.gradientBottom]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.headerSubtitle}>CREATE CUSTOM</Text>
            <Text style={styles.headerTitle}>Workout Profile</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Form Card */}
        <BlurView intensity={20} tint="dark" style={styles.formCard}>
          {/* Icon Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Profile Icon</Text>
            <View style={styles.iconGrid}>
              {EMOJI_OPTIONS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.iconOption,
                    selectedIcon === emoji && styles.iconOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedIcon(emoji);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.iconEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Profile Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Run, HIIT Session"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              maxLength={50}
            />
            <Text style={styles.helperText}>Give your workout a memorable name</Text>
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your workout goals..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* Music Library Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Music Library (Optional)</Text>
            <Text style={styles.helperText}>Choose where your workout music comes from</Text>

            <View style={styles.libraryGrid}>
              {MUSIC_LIBRARIES.map(library => (
                <TouchableOpacity
                  key={library.id}
                  style={[
                    styles.libraryCard,
                    selectedLibrary === library.id && styles.libraryCardSelected
                  ]}
                  onPress={() => {
                    setSelectedLibrary(library.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={styles.libraryCardContent}>
                    <Text style={styles.libraryIcon}>{library.icon}</Text>
                    <Text style={styles.libraryName}>{library.name}</Text>
                    <Text style={styles.libraryDescription}>{library.description}</Text>

                    {selectedLibrary === library.id && (
                      <View style={styles.libraryCheckmark}>
                        <Text style={styles.libraryCheckmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Heart Rate Zones */}
          <View style={styles.section}>
            <Text style={styles.label}>Target Heart Rate Zone *</Text>
            <Text style={styles.helperText}>Percentage of your maximum heart rate</Text>

            <View style={styles.zoneInputs}>
              <View style={styles.zoneInput}>
                <Text style={styles.zoneLabel}>Min %</Text>
                <TextInput
                  style={styles.zoneTextInput}
                  value={targetZoneMin}
                  onChangeText={setTargetZoneMin}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={styles.zoneSeparator}>
                <View style={styles.zoneLine} />
                <Text style={styles.zoneToText}>to</Text>
                <View style={styles.zoneLine} />
              </View>

              <View style={styles.zoneInput}>
                <Text style={styles.zoneLabel}>Max %</Text>
                <TextInput
                  style={styles.zoneTextInput}
                  value={targetZoneMax}
                  onChangeText={setTargetZoneMax}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>

            {/* Zone Preview */}
            <View style={styles.zonePreview}>
              <View style={styles.zonePreviewBar}>
                <View
                  style={[
                    styles.zonePreviewFill,
                    {
                      marginLeft: `${targetZoneMin}%`,
                      width: `${Math.max(0, targetZoneMax - targetZoneMin)}%`,
                      backgroundColor: THEME.orange,
                    }
                  ]}
                />
              </View>
              <View style={styles.zonePreviewLabels}>
                <Text style={styles.zonePreviewLabel}>50%</Text>
                <Text style={styles.zonePreviewLabel}>100%</Text>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={creating}
          >
            <LinearGradient
              colors={creating ? ['#666', '#444'] : [THEME.orange, THEME.copper]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            >
              <Text style={styles.createButtonText}>
                {creating ? 'Creating...' : 'Create Profile'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
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
  formCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    borderColor: THEME.orange,
    backgroundColor: 'rgba(204, 85, 0, 0.15)',
  },
  iconEmoji: {
    fontSize: 28,
  },
  libraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  libraryCard: {
    width: '48%',
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  libraryCardSelected: {
    borderColor: THEME.orange,
    backgroundColor: 'rgba(204, 85, 0, 0.1)',
  },
  libraryCardContent: {
    padding: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  libraryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  libraryDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 15,
  },
  libraryCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryCheckmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  zoneInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  zoneInput: {
    flex: 1,
  },
  zoneLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    textAlign: 'center',
  },
  zoneTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.orange,
    textAlign: 'center',
  },
  zoneSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 8,
  },
  zoneLine: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  zoneToText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  zonePreview: {
    marginTop: 12,
  },
  zonePreviewBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  zonePreviewFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  zonePreviewLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  zonePreviewLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  createButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: THEME.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
