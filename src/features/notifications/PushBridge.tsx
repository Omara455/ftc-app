// Mounted while signed in (app/_layout.tsx). Native + flags.notifications only.
//   start       → registerForPush() (POST /devices when the token is new)
//   push lands  → refresh the notifications list (the bell's unread dot)
//   push tapped → mark it read and open its screen, also when it cold-started the app
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect, useRef } from 'react';

import { notificationsApi } from '@/api/endpoints';
import { queryKeys } from '@/api/queryClient';
import { pushData, pushSupported, registerForPush, routeForPush } from '@/lib/push';

export function PushBridge() {
  return pushSupported ? <Bridge /> : null;
}

function Bridge() {
  const qc = useQueryClient();
  const navReady = !!useRootNavigationState()?.key;
  const last = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    void registerForPush();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
    });
    return () => sub.remove();
  }, [qc]);

  // `useLastNotificationResponse` covers both a tap while running and the tap that
  // launched the app; handle each response once, after the navigator is ready.
  useEffect(() => {
    if (!navReady || !last) return;
    const id = last.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    const data = pushData(last.notification);
    if (data.notificationId) {
      void notificationsApi
        .markRead([data.notificationId])
        .catch(() => undefined)
        .finally(() => void qc.invalidateQueries({ queryKey: queryKeys.notifications }));
    }
    const href = routeForPush(data.type, data.taskId);
    if (href) router.push(href);
  }, [navReady, last, qc]);

  return null;
}
