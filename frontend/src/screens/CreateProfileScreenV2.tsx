/**
 * CreateProfileScreenV2 - Create custom workout profiles
 * Features: Icon selector, heart rate zone inputs with live preview, music library selection
 *
 * UNCHANGED: All API calls, validation, form submission - ONLY UI/UX changes
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
import { ThemeProvider, useTheme } from '../theme';
import { Waveform } from '../components';

const EMOJI_OPTIONS = ['💪', '🏃', '🚴', '🏋️', '🧘', '⚡', '🔥', '💯', '🎯', '🚀', '⭐', '✨'];

const MUSIC_LIBRARIES = [
  { id: 'default', name: 'Default Mix', icon: '🎵', description: 'Curated workout music' },
  { id: 'spotify', name: 'Spotify', icon: '🎧', description: 'Your Spotify playlists' },
  { id: 'apple', name: 'Apple Music', icon: '🎶', description: 'Your Apple Music library' },
  { id: 'custom', name: 'Custom Playlist', icon: '📱', description: 'Device music library' },
];

function CreateProfileScreenV2Content({ navigation }: any) {
  const theme = useTheme();
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
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await profileService.createProfile({
        name: name.trim(),
        description: description.trim(),
        target_zone_min: minZone,
        target_zone_max: maxZone,
        icon: selectedIcon,
        music_library: selectedLibrary,
      });

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success!', 'Your custom workout profile has been created', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', error.response?.data?.error || 'Failed to create profile');
    } finally {
      setCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Animated wave background */}
      <Waveform />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              CREATE CUSTOM
            </Text>
            <Text
              style={[
                styles.headerTitle,
                theme.typography.h2,
                { color: theme.colors.text, marginTop: theme.spacing.xs },
              ]}
            >
              Workout Profile
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Form Card */}
        <BlurView
          intensity={theme.isDark ? 20 : 25}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[
            styles.formCard,
            {
              borderRadius: theme.radius.xl,
              borderColor: theme.colors.border,
              padding: theme.spacing.lg,
              marginHorizontal: theme.spacing.lg,
            },
          ]}
        >
          {/* Icon Selector */}
          <View style={{ marginBottom: theme.spacing.xl }}>
            <Text
              style={[
                styles.label,
                theme.typography.body,
                { color: theme.colors.text, marginBottom: theme.spacing.sm },
              ]}
            >
              Profile Icon
            </Text>
            <View style={styles.iconGrid}>
              {EMOJI_OPTIONS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor: theme.colors.glass,
                      borderColor:
                        selectedIcon === emoji ? theme.colors.orange : 'transparent',
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                  onPress={() => {
                    setSelectedIcon(emoji);
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <Text style={styles.iconEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name Input */}
          <View style={{ marginBottom: theme.spacing.xl }}>
            <Text
              style={[
                styles.label,
                theme.typography.body,
                { color: theme.colors.text, marginBottom: theme.spacing.sm },
              ]}
            >
              Profile Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.glass,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                  color: theme.colors.text,
                },
                theme.typography.body,
              ]}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Run, HIIT Session"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={50}
            />
            <Text
              style={[
                styles.helperText,
                theme.typography.caption,
                { color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
              ]}
            >
              Give your workout a memorable name
            </Text>
          </View>

          {/* Description Input */}
          <View style={{ marginBottom: theme.spacing.xl }}>
            <Text
              style={[
                styles.label,
                theme.typography.body,
                { color: theme.colors.text, marginBottom: theme.spacing.sm },
              ]}
            >
              Description (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.colors.glass,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                  color: theme.colors.text,
                  minHeight: 80,
                  textAlignVertical: 'top',
                },
                theme.typography.body,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your workout goals..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* Music Library Selection */}
          <View style={{ marginBottom: theme.spacing.xl }}>
            <Text
              style={[
                styles.label,
                theme.typography.body,
                { color: theme.colors.text, marginBottom: theme.spacing.xs },
              ]}
            >
              Music Library (Optional)
            </Text>
            <Text
              style={[
                styles.helperText,
                theme.typography.caption,
                { color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
              ]}
            >
              Choose where your workout music comes from
            </Text>

            <View style={styles.libraryGrid}>
              {MUSIC_LIBRARIES.map(library => (
                <TouchableOpacity
                  key={library.id}
                  style={[
                    styles.libraryCard,
                    {
                      backgroundColor: theme.colors.glass,
                      borderColor:
                        selectedLibrary === library.id
                          ? theme.colors.orange
                          : 'transparent',
                      borderRadius: theme.radius.md,
                    },
                  ]}
                  onPress={() => {
                    setSelectedLibrary(library.id);
                    if (Platform.OS === 'ios') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                >
                  <View style={[styles.libraryCardContent, { padding: theme.spacing.md }]}>
                    <Text style={styles.libraryIcon}>{library.icon}</Text>
                    <Text
                      style={[
                        styles.libraryName,
                        theme.typography.body,
                        { color: theme.colors.text, marginTop: theme.spacing.sm },
                      ]}
                    >
                      {library.name}
                    </Text>
                    <Text
                      style={[
                        styles.libraryDescription,
                        theme.typography.caption,
                        { color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
                      ]}
                    >
                      {library.description}
                    </Text>

                    {selectedLibrary === library.id && (
                      <View
                        style={[
                          styles.libraryCheckmark,
                          {
                            backgroundColor: theme.colors.orange,
                            borderRadius: theme.radius.full,
                          },
                        ]}
                      >
                        <Text style={styles.libraryCheckmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Heart Rate Zones */}
          <View style={{ marginBottom: theme.spacing.xl }}>
            <Text
              style={[
                styles.label,
                theme.typography.body,
                { color: theme.colors.text, marginBottom: theme.spacing.xs },
              ]}
            >
              Target Heart Rate Zone *
            </Text>
            <Text
              style={[
                styles.helperText,
                theme.typography.caption,
                { color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
              ]}
            >
              Percentage of your maximum heart rate
            </Text>

            <View style={styles.zoneInputs}>
              <View style={styles.zoneInput}>
                <Text
                  style={[
                    styles.zoneLabel,
                    theme.typography.caption,
                    { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
                  ]}
                >
                  Min %
                </Text>
                <TextInput
                  style={[
                    styles.zoneTextInput,
                    {
                      backgroundColor: theme.colors.glass,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.md,
                      padding: theme.spacing.md,
                      color: theme.colors.orange,
                    },
                    theme.typography.h1,
                  ]}
                  value={targetZoneMin}
                  onChangeText={setTargetZoneMin}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={styles.zoneSeparator}>
                <View style={[styles.zoneLine, { backgroundColor: theme.colors.border }]} />
                <Text
                  style={[
                    styles.zoneToText,
                    theme.typography.caption,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  to
                </Text>
                <View style={[styles.zoneLine, { backgroundColor: theme.colors.border }]} />
              </View>

              <View style={styles.zoneInput}>
                <Text
                  style={[
                    styles.zoneLabel,
                    theme.typography.caption,
                    { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm },
                  ]}
                >
                  Max %
                </Text>
                <TextInput
                  style={[
                    styles.zoneTextInput,
                    {
                      backgroundColor: theme.colors.glass,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.md,
                      padding: theme.spacing.md,
                      color: theme.colors.orange,
                    },
                    theme.typography.h1,
                  ]}
                  value={targetZoneMax}
                  onChangeText={setTargetZoneMax}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>

            {/* Zone Preview */}
            <View style={{ marginTop: theme.spacing.md }}>
              <View
                style={[
                  styles.zonePreviewBar,
                  {
                    backgroundColor: theme.colors.glass,
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <View
                  style={[
                    styles.zonePreviewFill,
                    {
                      marginLeft: `${targetZoneMin}%`,
                      width: `${Math.max(0, parseInt(targetZoneMax) - parseInt(targetZoneMin))}%`,
                      backgroundColor: theme.colors.orange,
                      borderRadius: theme.radius.sm,
                    },
                  ]}
                />
              </View>
              <View style={[styles.zonePreviewLabels, { marginTop: theme.spacing.xs }]}>
                <Text
                  style={[
                    styles.zonePreviewLabel,
                    theme.typography.caption,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  50%
                </Text>
                <Text
                  style={[
                    styles.zonePreviewLabel,
                    theme.typography.caption,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  100%
                </Text>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              { borderRadius: theme.radius.md },
              creating && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={creating}
          >
            <LinearGradient
              colors={creating ? ['#666', '#444'] : [theme.colors.orange, theme.colors.copper]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.createButtonGradient, { padding: theme.spacing.lg }]}
            >
              <Text style={[styles.createButtonText, theme.typography.h3, { color: '#fff' }]}>
                {creating ? 'Creating...' : 'Create Profile'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Wrapper with ThemeProvider
export default function CreateProfileScreenV2(props: any) {
  return (
    <ThemeProvider>
      <CreateProfileScreenV2Content {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 20,
    paddingHorizontal: 20,
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
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontWeight: '600',
  },
  formCard: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
  },
  helperText: {
    // Helper text styles
  },
  input: {
    borderWidth: 1,
  },
  textArea: {
    // Text area specific styles
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  libraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  libraryCard: {
    width: '48%',
    minHeight: 120,
    borderWidth: 2,
    overflow: 'hidden',
  },
  libraryCardContent: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryIcon: {
    fontSize: 32,
  },
  libraryName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  libraryDescription: {
    textAlign: 'center',
    lineHeight: 15,
  },
  libraryCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
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
  },
  zoneInput: {
    flex: 1,
  },
  zoneLabel: {
    textAlign: 'center',
  },
  zoneTextInput: {
    borderWidth: 1,
    fontWeight: 'bold',
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
  },
  zoneToText: {
    // Zone separator text
  },
  zonePreviewBar: {
    height: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  zonePreviewFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  zonePreviewLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zonePreviewLabel: {
    // Zone preview label styles
  },
  createButton: {
    overflow: 'hidden',
    shadowColor: '#CC5500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    alignItems: 'center',
  },
  createButtonText: {
    fontWeight: 'bold',
  },
});
