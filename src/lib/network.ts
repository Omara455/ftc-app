// Online/offline state from NetInfo, shared with TanStack Query so queries pause
// offline and refetch on reconnect. Screens read it with `useIsOffline()`.
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

onlineManager.setEventListener((setOnline) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    // `isConnected` is null while unknown; only treat an explicit false as offline.
    setOnline(state.isConnected !== false);
  });
  if (Platform.OS !== 'web' || typeof window === 'undefined') return unsubscribe;

  // Web (screenshot/smoke builds): NetInfo only watches `navigator.connection` in
  // Chromium, which doesn't fire when the browser goes offline. Use the window events.
  const sync = () => setOnline(navigator.onLine);
  window.addEventListener('online', sync);
  window.addEventListener('offline', sync);
  return () => {
    unsubscribe();
    window.removeEventListener('online', sync);
    window.removeEventListener('offline', sync);
  };
});

export function useIsOffline(): boolean {
  return !useSyncExternalStore(
    (cb) => onlineManager.subscribe(cb),
    () => onlineManager.isOnline(),
    () => true,
  );
}
