/**
 * WorkoutCard - Interactive workout selection card
 * Features: Press animations, haptics, orange glow on focus
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { BpmChip } from './BpmChip';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface WorkoutCardProps {
  title: string;
  bpmRange: string; // e.g., "120-140"
  icon: string; // emoji
  onPress: () => void;
  isFavorite?: boolean;
  description?: string;
}

export function WorkoutCard({
  title,
  bpmRange,
  icon,
  onPress,
  isFavorite = false,
  description,
}: WorkoutCardProps) {
  const theme = useTheme();

  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    // Haptic feedback (iOS only, but we check platform)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Scale down with spring
    Animated.spring(scale, {
      toValue: 0.98,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();

    // Show glow
    Animated.timing(glowOpacity, {
      toValue: 1,
      duration: theme.timing.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Scale back up with spring
    Animated.spring(scale, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();

    // Hide glow
    Animated.timing(glowOpacity, {
      toValue: 0,
      duration: theme.timing.base,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale }],
        },
      ]}
    >
      {/* Orange glow on press */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderRadius: theme.radius.lg,
            opacity: glowOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={[
            `${theme.colors.orange}60`,
            `${theme.colors.copper}40`,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Card content */}
      <BlurView
        intensity={theme.isDark ? 20 : 25}
        tint={theme.isDark ? 'dark' : 'light'}
        style={styles.cardBlur}
      >
        <View
          style={[
            styles.card,
            {
              borderRadius: theme.radius.lg,
              borderColor: theme.colors.border,
              padding: theme.spacing.lg,
              ...theme.elevation.md,
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${theme.colors.orange}20`,
                borderColor: `${theme.colors.orange}40`,
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Title */}
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {
                ...theme.typography.h3,
                color: theme.colors.text,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            {title}
          </Text>

          {/* Description (optional) */}
          {description && (
            <Text
              numberOfLines={2}
              style={[
                styles.description,
                {
                  ...theme.typography.caption,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              {description}
            </Text>
          )}

          {/* BPM Chip */}
          <BpmChip bpmRange={bpmRange} variant="accent" />

          {/* Favorite indicator */}
          {isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Text style={styles.favoriteIcon}>⭐</Text>
            </View>
          )}
        </View>
      </BlurView>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    zIndex: -1,
  },
  cardBlur: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  card: {
    borderWidth: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontWeight: '600',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  description: {
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  favoriteIcon: {
    fontSize: 20,
  },
});
