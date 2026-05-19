import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette, darkColors, lightColors } from '../theme';

const STORAGE_KEY = 'theme:isDark';

interface ThemeContextData {
  isDark: boolean;
  colors: ColorPalette;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (value !== null) setIsDark(value === '1');
    });
  }, []);

  const persist = useCallback((dark: boolean) => {
    setIsDark(dark);
    AsyncStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
  }, []);

  const setDarkMode = useCallback((dark: boolean) => persist(dark), [persist]);
  const toggleDarkMode = useCallback(() => persist(!isDark), [isDark, persist]);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, setDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
