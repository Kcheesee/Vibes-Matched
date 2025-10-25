/**
 * RegisterScreenV2 - User registration with V2 design
 * Features: Waveform background, theme system, burnt orange accents
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemeProvider, useTheme } from '../theme';
import { Waveform } from '../components';
import { useAuth } from '../context/AuthContext';

function RegisterScreenContent({ navigation }: any) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Waveform background */}
      <Waveform duration={6000} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.logoIcon, { marginBottom: theme.spacing.md }]}>
              🎵
            </Text>
            <Text style={[theme.typography.h1, { color: theme.colors.text, fontSize: 32, marginBottom: theme.spacing.xs }]}>
              Join Vibes Matched
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xxl }]}>
              Your workout, your music, your vibe
            </Text>
          </View>

          {/* Register Form Card */}
          <BlurView
            intensity={theme.isDark ? 20 : 25}
            tint={theme.isDark ? 'dark' : 'light'}
            style={[
              styles.formCard,
              {
                borderRadius: theme.radius.lg,
                borderColor: theme.colors.border,
                padding: theme.spacing.xl,
              },
            ]}
          >
            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.lg }]}>
              Create Account
            </Text>

            {/* Name Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
                NAME
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.glass,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.sm,
                    padding: theme.spacing.md,
                    color: theme.colors.text,
                    ...theme.typography.body,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
                EMAIL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.glass,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.sm,
                    padding: theme.spacing.md,
                    color: theme.colors.text,
                    ...theme.typography.body,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
                PASSWORD
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.glass,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.sm,
                    padding: theme.spacing.md,
                    color: theme.colors.text,
                    ...theme.typography.body,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
                CONFIRM PASSWORD
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.glass,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.sm,
                    padding: theme.spacing.md,
                    color: theme.colors.text,
                    ...theme.typography.body,
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { borderRadius: theme.radius.sm, overflow: 'hidden' }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={[theme.colors.orange, theme.colors.copper]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.registerGradient, { padding: theme.spacing.lg }]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[theme.typography.h3, { color: '#FFF', textAlign: 'center', fontWeight: '600' }]}>
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={{ marginTop: theme.spacing.lg, alignItems: 'center' }}
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                Already have an account?{' '}
                <Text style={{ color: theme.colors.orange, fontWeight: '600' }}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Wrapper with ThemeProvider
export default function RegisterScreenV2(props: any) {
  return (
    <ThemeProvider>
      <RegisterScreenContent {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 64,
  },
  formCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
  },
  registerButton: {
    // Styles applied inline
  },
  registerGradient: {
    // Styles applied inline
  },
});
