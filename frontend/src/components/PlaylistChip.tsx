/**
 * PlaylistChip - Selectable music library/playlist chip
 * Used in stats screen for music selection
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

interface PlaylistChipProps {
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  onRemove?: () => void; // optional remove/deselect
}

export function PlaylistChip({
  label,
  isSelected = false,
  onPress,
  onRemove,
}: PlaylistChipProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handleRemove = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRemove?.();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? `${theme.colors.orange}20`
            : theme.colors.glass,
          borderColor: isSelected
            ? theme.colors.orange
            : theme.colors.border,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            ...theme.typography.body,
            color: isSelected ? theme.colors.orange : theme.colors.text,
            fontWeight: isSelected ? '600' : 'normal',
          },
        ]}
      >
        {label}
      </Text>

      {isSelected && onRemove && (
        <TouchableOpacity
          style={[
            styles.removeButton,
            {
              marginLeft: theme.spacing.xs,
            },
          ]}
          onPress={handleRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.removeIcon, { color: theme.colors.orange }]}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    // Typography handled by theme
  },
  removeButton: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
