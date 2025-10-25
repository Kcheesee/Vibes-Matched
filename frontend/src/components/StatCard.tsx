/**
 * StatCard - Displays a stat with label, value, and optional icon
 * Used in stats overview and workout tracking screens
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string; // emoji
  colorOverride?: string;
  style?: ViewStyle;
}

export function StatCard({ label, value, icon, colorOverride, style }: StatCardProps) {
  const theme = useTheme();

  const accentColor = colorOverride || theme.colors.orange;

  return (
    <BlurView
      intensity={theme.isDark ? 15 : 20}
      tint={theme.isDark ? 'dark' : 'light'}
      style={[styles.card, style]}
    >
      <View
        style={[
          styles.cardInner,
          {
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing.lg,
          },
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}

        <Text
          style={[
            styles.value,
            {
              ...theme.typography.h1,
              color: accentColor,
              marginTop: icon ? theme.spacing.sm : 0,
            },
          ]}
        >
          {value}
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              ...theme.typography.caption,
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.5,
              color: theme.colors.textSecondary,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {label.toUpperCase()}
        </Text>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardInner: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 4,
  },
  icon: {
    fontSize: 28,
  },
  value: {
    fontWeight: 'bold',
  },
  label: {
    textAlign: 'center',
  },
});
