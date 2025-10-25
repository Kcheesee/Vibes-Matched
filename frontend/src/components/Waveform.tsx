/**
 * Waveform - Animated background wave effect
 * Subtle pulsing gradient opacity
 * Uses built-in Animated API (no native modules needed)
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface WaveformProps {
  style?: ViewStyle;
  duration?: number; // milliseconds for one full cycle
}

export function Waveform({ style, duration = 4000 }: WaveformProps) {
  const theme = useTheme();

  // Animated value for opacity pulse
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Infinite pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [duration]);

  return (
    <AnimatedLinearGradient
      colors={[
        'transparent',
        `${theme.colors.orange}10`,
        `${theme.colors.copper}08`,
        'transparent',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style, { opacity }]}
    />
  );
}
