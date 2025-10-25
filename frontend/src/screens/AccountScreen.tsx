/**
 * AccountScreen - User account settings and preferences with V2 design
 * Features: Profile info, settings, logout with bottom nav
 * Full V2 design language with theme system
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ThemeProvider, useTheme } from '../theme';
import { BottomNav, Waveform } from '../components';
import { useAuth } from '../context/AuthContext';

function AccountScreenContent({ navigation }: any) {
  const theme = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleSettingPress = (setting: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      setting,
      'This feature is coming soon!',
      [{ text: 'OK' }]
    );
  };

  const settingsSections = [
    {
      title: 'Workout Preferences',
      items: [
        { id: 'profiles', label: 'Workout Profiles', icon: '🏋️', action: () => navigation.navigate('CreateProfile') },
        { id: 'heart_rate', label: 'Heart Rate Zones', icon: '❤️', action: () => handleSettingPress('Heart Rate Zones') },
        { id: 'music_matching', label: 'Music Matching', icon: '🎵', action: () => handleSettingPress('Music Matching') },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { id: 'notifications', label: 'Notifications', icon: '🔔', action: () => handleSettingPress('Notifications') },
        { id: 'privacy', label: 'Privacy', icon: '🔒', action: () => handleSettingPress('Privacy') },
        { id: 'theme', label: 'Appearance', icon: '🎨', action: () => handleSettingPress('Appearance') },
      ],
    },
    {
      title: 'About',
      items: [
        { id: 'help', label: 'Help & Support', icon: '❓', action: () => handleSettingPress('Help & Support') },
        { id: 'terms', label: 'Terms of Service', icon: '📄', action: () => handleSettingPress('Terms of Service') },
        { id: 'privacy_policy', label: 'Privacy Policy', icon: '🛡️', action: () => handleSettingPress('Privacy Policy') },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Waveform background */}
      <Waveform />

      {/* Header */}
      <View style={[styles.header, { marginTop: theme.spacing.xxl + 20 }]}>
        <View>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, letterSpacing: 1.5 }]}>
            ACCOUNT
          </Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: theme.spacing.xs }]}>
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <BlurView
          intensity={theme.isDark ? 20 : 25}
          tint={theme.isDark ? 'dark' : 'light'}
          style={[
            styles.profileCard,
            {
              borderRadius: theme.radius.lg,
              borderColor: theme.colors.orange,
              borderWidth: 2,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.orange,
                  borderRadius: theme.radius.lg,
                },
              ]}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </BlurView>

        {/* Settings Sections */}
        {settingsSections.map((section, index) => (
          <View key={section.title} style={{ marginBottom: theme.spacing.xl }}>
            <Text
              style={[
                theme.typography.h3,
                { color: theme.colors.text, marginBottom: theme.spacing.md },
              ]}
            >
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <BlurView
                  intensity={theme.isDark ? 15 : 20}
                  tint={theme.isDark ? 'dark' : 'light'}
                  style={[
                    styles.settingItem,
                    {
                      borderRadius: theme.radius.md,
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                      padding: theme.spacing.lg,
                      marginBottom: itemIndex < section.items.length - 1 ? theme.spacing.sm : 0,
                    },
                  ]}
                >
                  <View style={styles.settingContent}>
                    <View style={styles.settingLeft}>
                      <View
                        style={[
                          styles.settingIcon,
                          {
                            backgroundColor: `${theme.colors.orange}20`,
                            borderRadius: theme.radius.sm,
                          },
                        ]}
                      >
                        <Text style={styles.iconText}>{item.icon}</Text>
                      </View>
                      <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '500' }]}>
                        {item.label}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20, color: theme.colors.textSecondary }}>›</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderRadius: theme.radius.md, overflow: 'hidden', marginBottom: theme.spacing.xl }]}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#FF3B30', '#C91A1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.logoutGradient, { padding: theme.spacing.lg }]}
          >
            <Text style={[theme.typography.h3, { color: '#FFF', textAlign: 'center', fontWeight: '600' }]}>
              Logout
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg }]}>
          Vibes Matched v1.0.0
        </Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab="account"
        onNavigate={(screen) => navigation.navigate(screen)}
      />
    </View>
  );
}

// Wrapper with ThemeProvider
export default function AccountScreen(props: any) {
  return (
    <ThemeProvider>
      <AccountScreenContent {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Extra padding for bottom nav
  },
  profileCard: {
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  settingItem: {
    overflow: 'hidden',
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  logoutButton: {
    // Styles applied inline
  },
  logoutGradient: {
    // Styles applied inline
  },
});
