import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    const restoreSession = async () => {
      const [[, savedToken], [, savedUser]] = await AsyncStorage.multiGet(['token', 'user']);
      let hasValidSession = false;

      try {
        if (savedToken && savedUser) {
          JSON.parse(savedUser);
          hasValidSession = true;
        }
      } catch {
        await AsyncStorage.multiRemove(['token', 'user']);
      }

      if (hasValidSession) {
        router.replace('/theatres');
      } else {
        router.replace('/login');
      }
    };

    restoreSession();
  }, [rootNavigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="theatres" options={{ title: 'Theatres' }} />
        <Stack.Screen name="shows" options={{ title: 'Shows' }} />
        <Stack.Screen name="showtimes" options={{ title: 'Showtimes' }} />
        <Stack.Screen name="booking" options={{ title: 'Booking' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
