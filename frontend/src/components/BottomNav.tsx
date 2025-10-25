/**
 * BottomNav - Fixed bottom navigation bar
 * Features: Social, Music Libraries, Account Tools
 * Glassmorphism design with burnt orange accents
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

interface BottomNavProps {
  activeTab?: 'home' | 'social' | 'music' | 'account';
  onNavigate: (screen: string) => void;
}

export function BottomNav({ activeTab = 'home', onNavigate }: BottomNavProps) {
  const theme = useTheme();

  const handlePress = (screen: string, tab: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onNavigate(screen);
  };

  const isActive = (tab: string) => activeTab === tab;

  return (
    <BlurView
      intensity={theme.isDark ? 30 : 40}
      tint={theme.isDark ? 'dark' : 'light'}
      style={styles.container}
    >
      <View
        style={[
          styles.navBar,
          {
            borderTopColor: theme.colors.border,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Safe area for iOS
          },
        ]}
      >
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handlePress('Home', 'home')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              isActive('home') && {
                backgroundColor: `${theme.colors.orange}20`,
                borderColor: theme.colors.orange,
              },
            ]}
          >
            <Text style={[styles.icon, isActive('home') && { fontSize: 26 }]}>
              🏠
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              theme.typography.caption,
              {
                color: isActive('home')
                  ? theme.colors.orange
                  : theme.colors.textSecondary,
                fontWeight: isActive('home') ? '600' : '400',
              },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Social Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handlePress('Friends', 'social')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              isActive('social') && {
                backgroundColor: `${theme.colors.orange}20`,
                borderColor: theme.colors.orange,
              },
            ]}
          >
            <Text style={[styles.icon, isActive('social') && { fontSize: 26 }]}>
              👥
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              theme.typography.caption,
              {
                color: isActive('social')
                  ? theme.colors.orange
                  : theme.colors.textSecondary,
                fontWeight: isActive('social') ? '600' : '400',
              },
            ]}
          >
            Social
          </Text>
        </TouchableOpacity>

        {/* Music Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handlePress('MusicSync', 'music')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              isActive('music') && {
                backgroundColor: `${theme.colors.orange}20`,
                borderColor: theme.colors.orange,
              },
            ]}
          >
            <Text style={[styles.icon, isActive('music') && { fontSize: 26 }]}>
              🎧
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              theme.typography.caption,
              {
                color: isActive('music')
                  ? theme.colors.orange
                  : theme.colors.textSecondary,
                fontWeight: isActive('music') ? '600' : '400',
              },
            ]}
          >
            Music
          </Text>
        </TouchableOpacity>

        {/* Account Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handlePress('Account', 'account')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              isActive('account') && {
                backgroundColor: `${theme.colors.orange}20`,
                borderColor: theme.colors.orange,
              },
            ]}
          >
            <Text style={[styles.icon, isActive('account') && { fontSize: 26 }]}>
              ⚙️
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              theme.typography.caption,
              {
                color: isActive('account')
                  ? theme.colors.orange
                  : theme.colors.textSecondary,
                fontWeight: isActive('account') ? '600' : '400',
              },
            ]}
          >
            Account
          </Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
