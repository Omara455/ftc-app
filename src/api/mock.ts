// Mock backend used when API_BASE_URL is empty. Returns the same status codes and
// JSON shapes as the Laravel API (docs/API.md), with a small delay.
//
// Handy for testing states by hand:
//   password `ftc-portal`        → signs in
//   any other password           → 422 (wrong credentials); 5 failures in a minute → 429
//   email starting with `offline` → network error
import { meFixture, MOCK_PASSWORD } from '@/mocks/me';

import { ApiError } from './errors';

type MockResponse = { status: number; json: unknown };

const MOCK_TOKEN = 'mock-token';
const DELAY = 450;
const failedLogins: number[] = [];

const ok = (json: unknown = null, status = 200): MockResponse => ({ status, json });
const unauthenticated = (): MockResponse => ({
  status: 401,
  json: { message: 'Unauthenticated.' },
});

export async function mockFetch(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Promise<MockResponse> {
  await new Promise((r) => setTimeout(r, DELAY));
  const b = (body ?? {}) as Record<string, string>;
  const route = `${method} ${path.split('?')[0]}`;

  switch (route) {
    case 'POST /auth/login': {
      if (b.email?.startsWith('offline')) throw new ApiError('network', 'Mock network error');
      const now = Date.now();
      while (failedLogins.length && now - failedLogins[0] > 60_000) failedLogins.shift();
      if (failedLogins.length >= 5) return { status: 429, json: { message: 'Too Many Attempts.' } };
      if (b.password !== MOCK_PASSWORD) {
        failedLogins.push(now);
        return {
          status: 422,
          json: {
            message: 'These credentials do not match our records.',
            errors: { email: ['These credentials do not match our records.'] },
          },
        };
      }
      return ok({ token: MOCK_TOKEN, user: { ...meFixture, email: b.email || meFixture.email } });
    }
    case 'POST /auth/forgot':
      if (b.email?.startsWith('offline')) throw new ApiError('network', 'Mock network error');
      return ok(null, 204);
    case 'POST /auth/logout':
      return token === MOCK_TOKEN ? ok(null, 204) : unauthenticated();
    case 'GET /me':
      return token === MOCK_TOKEN ? ok(meFixture) : unauthenticated();
    default:
      return { status: 404, json: { message: `Mock has no route for ${route}` } };
  }
}
