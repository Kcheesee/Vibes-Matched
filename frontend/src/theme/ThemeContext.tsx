/**
 * Theme Context - Provides theme tokens with dark/light mode support
 * Respects system appearance settings
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { tokens } from './tokens';

type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  colors: typeof themeColors.dark;
  spacing: typeof tokens.spacing;
  radius: typeof tokens.radius;
  typography: typeof tokens.typography;
  elevation: typeof tokens.elevation;
  timing: typeof tokens.timing;
  touchTarget: typeof tokens.touchTarget;
  isDark: boolean;
  colorScheme: ColorScheme;
}

// Theme-specific color mappings
const themeColors = {
  dark: {
    // Brand colors (consistent across themes)
    orange: tokens.colors.orange,
    copper: tokens.colors.copper,

    // Background colors
    background: tokens.colors.charcoal,
    backgroundSecondary: tokens.colors.ink,
    surface: tokens.colors.glassDark,

    // Text colors
    text: tokens.colors.cream,
    textSecondary: 'rgba(248, 243, 233, 0.7)',
    textTertiary: 'rgba(248, 243, 233, 0.5)',

    // Glassmorphism
    glass: tokens.colors.glassDark,
    glassMedium: tokens.colors.glassMedium,

    // Borders
    border: 'rgba(255, 255, 255, 0.1)',
    borderFocus: tokens.colors.orange,

    // Zone colors
    zoneWarm: tokens.colors.zoneWarm,
    zoneMatch: tokens.colors.zoneMatch,
    zonePush: tokens.colors.zonePush,
    zoneSprint: tokens.colors.zoneSprint,

    // Semantic
    success: tokens.colors.success,
    error: tokens.colors.error,
    warning: tokens.colors.warning,
    info: tokens.colors.info,
  },

  light: {
    // Brand colors (consistent across themes)
    orange: tokens.colors.orange,
    copper: tokens.colors.copper,

    // Background colors
    background: tokens.colors.cream,
    backgroundSecondary: tokens.colors.white,
    surface: tokens.colors.glassLight,

    // Text colors
    text: tokens.colors.charcoal,
    textSecondary: 'rgba(11, 11, 12, 0.7)',
    textTertiary: 'rgba(11, 11, 12, 0.5)',

    // Glassmorphism
    glass: tokens.colors.glassLight,
    glassMedium: 'rgba(11, 11, 12, 0.05)',

    // Borders
    border: 'rgba(11, 11, 12, 0.1)',
    borderFocus: tokens.colors.orange,

    // Zone colors
    zoneWarm: tokens.colors.zoneWarm,
    zoneMatch: tokens.colors.zoneMatch,
    zonePush: tokens.colors.zonePush,
    zoneSprint: tokens.colors.zoneSprint,

    // Semantic
    success: tokens.colors.success,
    error: tokens.colors.error,
    warning: tokens.colors.warning,
    info: tokens.colors.info,
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const colorScheme: ColorScheme = systemColorScheme || 'dark';
  const isDark = colorScheme === 'dark';

  const theme: ThemeContextValue = {
    colors: themeColors[colorScheme],
    spacing: tokens.spacing,
    radius: tokens.radius,
    typography: tokens.typography,
    elevation: tokens.elevation,
    timing: tokens.timing,
    touchTarget: tokens.touchTarget,
    isDark,
    colorScheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}

// Export for direct usage if needed
export { tokens };
