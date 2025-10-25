/**
 * Design Tokens - Vibes Matched Visual System
 * Burnt orange + kinetic motion theme
 */

export const tokens = {
  colors: {
    // Primary brand colors
    orange: '#CC5500',
    copper: '#D87227',
    charcoal: '#0B0B0C',
    cream: '#F8F3E9',
    ink: '#121212',
    white: '#FFFFFF',

    // Intensity zone colors
    zoneWarm: '#60a5fa',    // blue - warm-up zone
    zoneMatch: '#22c55e',   // green - match zone (target)
    zonePush: '#f59e0b',    // amber - push zone
    zoneSprint: '#ef4444',  // red - sprint zone

    // Glassmorphism overlays
    glassLight: 'rgba(248, 243, 233, 0.1)',   // cream @ 10%
    glassDark: 'rgba(255, 255, 255, 0.05)',    // white @ 5%
    glassMedium: 'rgba(255, 255, 255, 0.1)',   // white @ 10%

    // Semantic colors
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
  },

  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
  },

  typography: {
    h1: { size: 24, weight: 'bold' as const, lineHeight: 32 },
    h2: { size: 20, weight: '600' as const, lineHeight: 28 },
    h3: { size: 18, weight: '600' as const, lineHeight: 24 },
    body: { size: 14, weight: 'normal' as const, lineHeight: 20 },
    caption: { size: 12, weight: 'normal' as const, lineHeight: 16 },
    label: { size: 10, weight: '600' as const, lineHeight: 14, letterSpacing: 1.5 },
  },

  // Elevation system for depth (iOS & Android compatible)
  elevation: {
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2, // Android
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },

  // Animation timings for consistency
  timing: {
    fast: 150,
    base: 250,
    slow: 400,
    pageTransition: 180,
  },

  // Touch target sizes (accessibility)
  touchTarget: {
    min: 44,  // minimum 44x44 for accessibility
    sm: 48,
    md: 56,
    lg: 64,
  },
} as const;

// Type exports for TypeScript autocomplete
export type Token = typeof tokens;
export type ColorKey = keyof typeof tokens.colors;
export type SpacingKey = keyof typeof tokens.spacing;
export type RadiusKey = keyof typeof tokens.radius;
export type TypographyKey = keyof typeof tokens.typography;
