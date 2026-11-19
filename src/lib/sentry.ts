// Crash reporting (M7). Sentry free tier, native builds only, and only when talking to the
// real API: mock mode (dev, screenshots, smoke, preview builds) never reports.
// Privacy (docs/RELEASE.md): no user identity, no request bodies, no query strings.
import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';
import type { ComponentType } from 'react';
import { Platform } from 'react-native';

import { MOCK_MODE } from '@/config/env';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export const sentryEnabled = !!DSN && !MOCK_MODE && Platform.OS !== 'web';

/** `https://ftcksu.com/api/mobile/v1/members?q=سارة` → `…/members` (search terms are personal). */
const stripQuery = (url: unknown) => (typeof url === 'string' ? url.split('?')[0] : url);

if (sentryEnabled) {
  Sentry.init({
    dsn: DSN,
    // EAS Update channel: development / preview / production
    environment: Updates.channel || 'development',
    sendDefaultPii: false,
    tracesSampleRate: 0, // crashes only: stays inside the free tier
    beforeBreadcrumb(crumb) {
      if (crumb.category === 'fetch' || crumb.category === 'xhr') {
        crumb.data = { ...crumb.data, url: stripQuery(crumb.data?.url) };
      }
      // Console output can contain tokens or names; keep warnings and errors only.
      if (crumb.category === 'console' && crumb.level !== 'error' && crumb.level !== 'warning') {
        return null;
      }
      return crumb;
    },
    beforeSend(event) {
      delete event.user;
      if (event.request) {
        event.request.url = stripQuery(event.request.url) as string | undefined;
        delete event.request.data;
        delete event.request.headers; // Authorization: Bearer …
        delete event.request.cookies;
      }
      return event;
    },
  });
}

/** Wraps the root component so render crashes are reported (no-op when disabled). */
export function withSentry(Root: ComponentType): ComponentType {
  return sentryEnabled
    ? (Sentry.wrap(Root as ComponentType<Record<string, unknown>>) as ComponentType)
    : Root;
}
