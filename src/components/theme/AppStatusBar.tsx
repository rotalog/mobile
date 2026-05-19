import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

export function AppStatusBar() {
  const { isDark, colors } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.surface} />;
}
