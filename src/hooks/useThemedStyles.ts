import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ColorPalette } from '../theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThemedStyles(factory: (c: ColorPalette) => Record<string, object>): any {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}
