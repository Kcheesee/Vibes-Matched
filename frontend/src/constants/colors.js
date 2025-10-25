/**
 * Vibes Matched Color Scheme
 * Based on official brand guide
 * Combines energy, rhythm, and clarity
 */

export const Colors = {
  // Primary Brand Colors (from brand guide)
  primary: '#CC5500',        // Burnt Orange - Primary brand color, buttons, highlights
  secondary: '#D87227',      // Warm Copper - Accent and gradient transition color
  accent: '#D87227',         // Warm Copper (same as secondary for consistency)

  // Background Colors
  background: '#F8F3E9',     // Off-White/Cream - Light mode background
  backgroundDark: '#2E2E2E', // Deep Charcoal - Dark mode background
  cardBackground: '#D1C6B8', // Soft Taupe - Secondary surfaces, cards

  // Heart Rate Zone Colors (keeping energetic progression)
  zone1: '#95E1D3',          // Light Teal (warmup - 50-60%)
  zone2: '#38B2AC',          // Teal (fat burn - 60-70%)
  zone3: '#F6AD55',          // Orange (cardio - 70-80%)
  zone4: '#FC8181',          // Coral (anaerobic - 80-90%)
  zone5: '#CC5500',          // Burnt Orange (max effort - 90-100%)

  // Text Colors
  textPrimary: '#2E2E2E',    // Deep Charcoal for main text
  textSecondary: '#6B5D52',  // Darker taupe for secondary text
  textLight: '#8A7D70',      // Light taupe for tertiary text
  textOnPrimary: '#F8F3E9',  // Cream text on orange backgrounds
  textOnDark: '#F8F3E9',     // Cream text on dark backgrounds

  // UI Colors
  dark: '#2E2E2E',           // Deep Charcoal
  light: '#F8F3E9',          // Off-White/Cream

  // Status Colors
  success: '#48BB78',
  warning: '#ED8936',
  error: '#F56565',
  info: '#4299E1',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F3E9',           // Cream
    100: '#E8E0D5',          // Light taupe
    200: '#D1C6B8',          // Soft Taupe
    300: '#B8AA9A',
    400: '#9F8F7C',
    500: '#8A7D70',
    600: '#6B5D52',
    700: '#4D4139',
    800: '#2E2E2E',          // Deep Charcoal
    900: '#1A1A1A',
  },

  // Gradient Colors (for premium feel)
  gradientStart: '#CC5500',  // Burnt Orange
  gradientMid: '#D87227',    // Warm Copper
  gradientEnd: '#E6904D',    // Lighter copper

  // Brand Specific
  heartRate: '#CC5500',      // Burnt Orange for BPM displays
  music: '#D87227',          // Warm Copper for music elements
  waveform: '#F8F3E9',       // Cream for waveform graphics
};
