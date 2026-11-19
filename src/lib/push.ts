// Push notifications (M6, behind flags.notifications). Native only: web is used for
// screenshots and has no Expo push.
//   registerForPush()  permission granted → Expo push token → POST /devices (once per token)
//   unregisterPush()   logout → DELETE /devices/{token}
//   routeForPush()     tapped notification → screen (SCREENS.md, screen 17 map)
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import type { Href } from 'expo-router';
import { Platform } from 'react-native';

import { devicesApi } from '@/api/endpoints';
import type { NotificationType, PushData } from '@/api/types';
import { flags } from '@/config/flags';
import { keys, storage } from '@/lib/storage';
import { color } from '@/theme/tokens';

export const pushSupported = flags.notifications && Platform.OS !== 'web';

// Foreground: still show the banner, so a push isn't silently lost while the app is open.
if (pushSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** EAS project id (set by `eas init`); Expo push tokens need it. */
const projectId = (): string | undefined =>
  (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId ??
  Constants.easConfig?.projectId;

/**
 * Registers this device for pushes if the member allowed notifications.
 * Safe to call on every start: POSTs only when the token is new.
 */
export async function registerForPush(): Promise<void> {
  if (!pushSupported) return;
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'FTC',
        // eslint-disable-next-line import/namespace -- re-exported via `export *` from a .d.ts; tsc resolves it
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: color.brand,
      });
    }
    const id = projectId();
    if (!id) {
      console.warn('push: no EAS projectId in app config, skipping registration');
      return;
    }
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: id });
    // Dev builds: copy this into expo.dev/notifications to send a test push (docs/DEVICE.md).
    if (__DEV__) console.log('push token', token);
    if ((await storage.get(keys.pushToken)) === token) return;
    await devicesApi.register(token);
    await storage.set(keys.pushToken, token);
  } catch (e) {
    // No network, emulator without Google services, etc. Next start tries again.
    console.warn('push: registration failed', e);
  }
}

/** Logout: stop pushes to this device (best effort, before the token is revoked). */
export async function unregisterPush(): Promise<void> {
  const token = await storage.get(keys.pushToken);
  if (!token) return;
  try {
    await devicesApi.unregister(token);
  } catch {
    // Offline: the server drops the device when the Sanctum token is revoked anyway.
  }
  await storage.remove(keys.pushToken);
}

/** Screen a notification opens (SCREENS.md 17): returned → 13, new → 07, reminder → 10… */
export function routeForPush(type: NotificationType | undefined, taskId?: number): Href | null {
  switch (type) {
    case 'task_returned':
    case 'task_new':
    case 'deadline':
      return taskId ? `/tasks/${taskId}` : '/tasks';
    case 'task_approved':
      return '/tasks/history';
    case 'achievement':
      return '/account/achievements';
    case 'league':
      return '/leaderboard';
    default:
      return null;
  }
}

export const pushData = (n: Notifications.Notification): PushData =>
  (n.request.content.data ?? {}) as PushData;
