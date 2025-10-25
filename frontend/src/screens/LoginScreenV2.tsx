/**
 * LoginScreenV2 - User authentication with V2 design
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemeProvider, useTheme } from '../theme';
import { Waveform } from '../components';
import { useAuth } from '../context/AuthContext';

function LoginScreenContent({ navigation }: any) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
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
        <View style={styles.content}>
          {/* Logo/Title Section */}
          <View style={styles.header}>
            <Text style={[styles.logoIcon, { marginBottom: theme.spacing.md }]}>
              🎵
            </Text>
            <Text style={[theme.typography.h1, { color: theme.colors.text, fontSize: 32, marginBottom: theme.spacing.xs }]}>
              Vibes Matched
            </Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xxl }]}>
              Music that moves with you
            </Text>
          </View>

          {/* Login Form Card */}
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
              Welcome Back
            </Text>

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
            <View style={{ marginBottom: theme.spacing.lg }}>
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

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { borderRadius: theme.radius.sm, overflow: 'hidden' }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[theme.colors.orange, theme.colors.copper]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.loginGradient, { padding: theme.spacing.lg }]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[theme.typography.h3, { color: '#FFF', textAlign: 'center', fontWeight: '600' }]}>
                    Log In
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              style={{ marginTop: theme.spacing.lg, alignItems: 'center' }}
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                Don't have an account?{' '}
                <Text style={{ color: theme.colors.orange, fontWeight: '600' }}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Wrapper with ThemeProvider
export default function LoginScreenV2(props: any) {
  return (
    <ThemeProvider>
      <LoginScreenContent {...props} />
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  loginButton: {
    // Styles applied inline
  },
  loginGradient: {
    // Styles applied inline
  },
});
