import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/cairo';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { I18nManager, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queryClient';
import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { color } from '@/theme/tokens';

// RTL everywhere. Native builds are also forced RTL by the expo-localization
// plugin (app.json), so layout is correct from the very first frame.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
// Web (used only for fast screenshot checks): RTL comes from the document direction.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
  document.body.style.backgroundColor = color.bg;
}

SplashScreen.preventAutoHideAsync();
SystemUI.setBackgroundColorAsync(color.bg);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });
  if (!fontsLoaded && fontError == null) return null;

  return (
    // `dir` is a react-native-web prop: it makes start/end resolve right-to-left on web.
    // Native ignores it (RTL there comes from I18nManager + the expo-localization plugin).
    <GestureHandlerRootView style={styles.root} {...({ dir: 'rtl' } as object)}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BottomSheetModalProvider>
              <StatusBar style="light" />
              <RootStack />
            </BottomSheetModalProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Auth gate: signed-out members only reach (auth); signed-in members only reach the app. */
function RootStack() {
  const { status, needsNotificationPrompt } = useAuth();

  // Keep the splash up until we know which side of the gate to show.
  useEffect(() => {
    if (status !== 'booting') SplashScreen.hideAsync();
  }, [status]);
  if (status === 'booting') return null;

  const signedIn = status === 'signedIn';
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg },
      }}
    >
      {/* index only redirects; it's the anchor protected routes fall back to */}
      <Stack.Screen name="index" />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Protected guard={needsNotificationPrompt}>
          <Stack.Screen name="notifications-permission" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Screen name="dev/kit" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
});
