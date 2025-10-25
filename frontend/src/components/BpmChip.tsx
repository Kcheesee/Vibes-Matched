/**
 * BpmChip - Displays BPM range as a pill-shaped chip
 * Used in workout cards and selection screens
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface BpmChipProps {
  bpmRange: string; // e.g., "120-140"
  style?: ViewStyle;
  variant?: 'default' | 'accent';
}

export function BpmChip({ bpmRange, style, variant = 'default' }: BpmChipProps) {
  const theme = useTheme();

  const chipStyles = [
    styles.chip,
    {
      backgroundColor: variant === 'accent'
        ? `${theme.colors.orange}20`
        : theme.colors.glass,
      borderColor: variant === 'accent'
        ? `${theme.colors.orange}40`
        : theme.colors.border,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    style,
  ];

  const textStyles = {
    ...theme.typography.caption,
    color: variant === 'accent' ? theme.colors.orange : theme.colors.textSecondary,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  };

  return (
    <View style={chipStyles}>
      <Text style={textStyles}>{bpmRange} BPM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
