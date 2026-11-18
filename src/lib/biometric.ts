// «الدخول بالبصمة» (Settings, screen 27). The preference is stored on the device only.
// When it's on, opening the app with a saved session asks for Face ID / fingerprint
// first (see AuthProvider). Not available on web.
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { ar } from '@/i18n/ar';
import { keys, storage } from '@/lib/storage';

export async function biometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return (
      (await LocalAuthentication.hasHardwareAsync()) &&
      (await LocalAuthentication.isEnrolledAsync())
    );
  } catch {
    return false;
  }
}

export async function biometricEnabled(): Promise<boolean> {
  return (await storage.get(keys.biometric)) === '1';
}

export async function setBiometricEnabled(on: boolean): Promise<void> {
  if (on) await storage.set(keys.biometric, '1');
  else await storage.remove(keys.biometric);
}

/** Shows the system prompt. Resolves true only on a successful match. */
export async function authenticate(): Promise<boolean> {
  try {
    const r = await LocalAuthentication.authenticateAsync({
      promptMessage: ar.settings.biometric,
      cancelLabel: ar.common.cancel,
      disableDeviceFallback: false,
    });
    return r.success;
  } catch {
    return false;
  }
}
