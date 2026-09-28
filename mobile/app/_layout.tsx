import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import { ThemeProvider } from '@/src/providers/ThemeProvider';
import { AppProvider } from '@/src/providers/AppProvider';
import { StoreProvider } from '@/src/lib/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/lib/queryClient';

const faviconUrl = Asset.fromModule(
  require('../assets/images/favicon.png'),
).uri;

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/png';
    icon.href = faviconUrl;
    document.head.appendChild(icon);

    return () => icon.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <RootLayoutNav />
            </AppProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0b1020' },
        }}
      >
        <Stack.Screen name="(app)" />
      </Stack>
    </KeyboardAvoidingView>
  );
}
