// Runtime configuration. Expo inlines EXPO_PUBLIC_* variables at build time;
// set them in `.env.local` (git-ignored) or the EAS build profile.

/** e.g. https://staging.ftcksu.com/api/mobile/v1 — empty means mock mode. */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

/** Mock mode serves fixtures from src/mocks/ instead of calling the API. */
export const MOCK_MODE = API_BASE_URL === '';

export const PORTAL_URL = 'https://ftcksu.com/portal';
export const APPLY_URL = 'https://ftcksu.com/apply';
