// Small key/value store for secrets and one-time flags.
// Native: expo-secure-store (Keychain / Keystore). Web (screenshot builds only): localStorage.
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const web = Platform.OS === 'web';

export const storage = {
  async get(key: string): Promise<string | null> {
    if (web) return globalThis.localStorage?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (web) return globalThis.localStorage?.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (web) return globalThis.localStorage?.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  },
};

export const keys = {
  token: 'ftc.token',
  /** Set once screen 05 (notification permission) has been shown. */
  notificationsPrompted: 'ftc.notificationsPrompted',
  /** «الدخول بالبصمة» toggle (screen 27). */
  biometric: 'ftc.biometric',
  /** Expo push token registered with POST /devices (removed again on logout). */
  pushToken: 'ftc.pushToken',
} as const;
