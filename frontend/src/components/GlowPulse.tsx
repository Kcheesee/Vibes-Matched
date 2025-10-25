/**
 * GlowPulse - Wraps content with BPM-synced pulsing glow
 * The heartbeat of the UI - literally!
 * Uses built-in Animated API (no native modules needed)
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

interface GlowPulseProps {
  bpm: number; // beats per minute
  children: React.ReactNode;
  style?: ViewStyle;
  glowSize?: number; // how far the glow extends
  intensity?: number; // 0-1, how strong the glow is
}

export function GlowPulse({
  bpm,
  children,
  style,
  glowSize = 40,
  intensity = 0.6,
}: GlowPulseProps) {
  const theme = useTheme();

  // Calculate pulse interval from BPM
  const pulseInterval = useMemo(() => {
    if (!bpm || bpm <= 0) return 1000; // fallback to 60 BPM
    return (60 / bpm) * 1000; // convert to milliseconds
  }, [bpm]);

  // Animated values
  const glowOpacity = useRef(new Animated.Value(intensity * 0.3)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  // Start pulsing animation when BPM changes
  useEffect(() => {
    // Stop any existing animations
    glowOpacity.stopAnimation();
    glowScale.stopAnimation();

    // Opacity pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: intensity,
          duration: pulseInterval / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: intensity * 0.3,
          duration: pulseInterval / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle scale pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.05,
          duration: pulseInterval / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: pulseInterval / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseInterval, intensity]);

  return (
    <View style={[styles.container, style]}>
      {/* Pulsing glow background */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            margin: -glowSize,
            borderRadius: glowSize * 2,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            `${theme.colors.orange}80`,
            `${theme.colors.copper}60`,
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    zIndex: 1,
  },
});
