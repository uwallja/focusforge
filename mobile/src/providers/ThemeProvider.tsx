// ThemeProvider.tsx
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { lightTheme, darkTheme } from '@/src/theme';
import { useStore } from '@/src/lib/store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { state } = useStore();
  const darkMode = state.settings.darkMode;

  // Apply the app's dark-mode toggle (on top of the system preference)
  useEffect(() => {
    if (setColorScheme) {
      setColorScheme(darkMode ? 'dark' : 'light');
    }
  }, [darkMode, setColorScheme]);

  const effectiveScheme = darkMode ? 'dark' : 'light';
  const themeVars = effectiveScheme === 'dark' ? darkTheme : lightTheme;

  // On web, RN Modal portals to document.body — outside any wrapper View —
  // so CSS variables set on a wrapper don't reach modal content. Apply them
  // to documentElement so they're globally available.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const root = document.documentElement;
    // themeVars may be a plain object of CSS vars or wrapped as { __cssVars: {...} }
    // by the browser-metro nativewind shim. Unwrap if needed.
    const vars: Record<string, string> =
      (themeVars as any).__cssVars ?? themeVars;
    const prev: Record<string, string> = {};
    for (const [key, value] of Object.entries(vars)) {
      prev[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, String(value));
    }
    root.classList.remove('light', 'dark');
    if (effectiveScheme) root.classList.add(effectiveScheme);
    return () => {
      for (const key of Object.keys(vars)) {
        if (prev[key]) root.style.setProperty(key, prev[key]);
        else root.style.removeProperty(key);
      }
    };
  }, [themeVars, effectiveScheme]);

  return (
    <View style={themeVars} className={`${effectiveScheme} flex-1 bg-background`}>
      {children}
    </View>
  );
}

export const useTheme = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  return {
    isDark: colorScheme === 'dark',
    colorScheme,
    setColorScheme,
  };
};
