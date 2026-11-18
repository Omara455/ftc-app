// Mock backend used when API_BASE_URL is empty. Returns the same status codes and
// JSON shapes as the Laravel API (docs/API.md), with a small delay.
//
// Handy for testing states by hand:
//   password `ftc-portal`         → signs in
//   any other password            → 422 (wrong credentials); 5 failures in a minute → 429
//   email starting with `offline` → network error
//   device offline (NetInfo)      → every request fails with a network error
//   EXPO_PUBLIC_MOCK_SCENARIO=empty → no tasks at all (screen 15)
//   EXPO_PUBLIC_MOCK_SCENARIO=error → GET /tasks* answers 500 (error state)
//   EXPO_PUBLIC_MOCK_SCENARIO=deadlines → task 101 due today, task 102 overdue
//   EXPO_PUBLIC_MOCK_DELAY=ms     → response delay (default 450)
import { onlineManager } from '@tanstack/react-query';

import { meFixture, MOCK_PASSWORD } from '@/mocks/me';
import { emptyTasksFixture, historyFixture, taskFixture, tasksFixture } from '@/mocks/tasks';

import { ApiError } from './errors';

type MockResponse = { status: number; json: unknown };

const MOCK_TOKEN = 'mock-token';
const DELAY = Number(process.env.EXPO_PUBLIC_MOCK_DELAY ?? 450);
const SCENARIO = process.env.EXPO_PUBLIC_MOCK_SCENARIO ?? 'default';
const failedLogins: number[] = [];

const ok = (json: unknown = null, status = 200): MockResponse => ({ status, json });
const unauthenticated = (): MockResponse => ({
  status: 401,
  json: { message: 'Unauthenticated.' },
});
const notFound = (route: string): MockResponse => ({
  status: 404,
  json: { message: `Mock has no route for ${route}` },
});

// «آخر يوم» / «متأخرة» scenario: shift two deadlines without touching the fixtures.
function shiftedDeadline(id: number): string | null {
  if (SCENARIO !== 'deadlines') return null;
  const d = new Date();
  if (id === 101)
    d.setHours(23, 59, 0, 0); // due later today
  else if (id === 102)
    d.setDate(d.getDate() - 1); // yesterday
  else return null;
  return d.toISOString();
}
function withDeadline<T extends { id: number; deadline: string }>(t: T): T {
  const deadline = shiftedDeadline(t.id);
  return deadline ? { ...t, deadline } : t;
}
function withDeadlines<T extends { mine: { id: number; deadline: string }[] }>(r: T): T {
  return { ...r, mine: r.mine.map(withDeadline) };
}

export async function mockFetch(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Promise<MockResponse> {
  await new Promise((r) => setTimeout(r, DELAY));
  if (!onlineManager.isOnline()) throw new ApiError('network', 'Mock: device offline');

  const b = (body ?? {}) as Record<string, string>;
  const [pathname, query = ''] = path.split('?');
  const route = `${method} ${pathname}`;
  const params = new URLSearchParams(query);

  // Public routes
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
  }

  // Everything else needs the token
  if (token !== MOCK_TOKEN) return unauthenticated();
  if (SCENARIO === 'error' && pathname.startsWith('/tasks')) {
    return { status: 500, json: { message: 'Mock server error' } };
  }

  switch (route) {
    case 'POST /auth/logout':
      return ok(null, 204);
    case 'GET /me':
      return ok(
        SCENARIO === 'empty'
          ? { ...meFixture, termHours: 0, pendingHours: 0, tasksDone: 0 }
          : meFixture,
      );
    case 'GET /tasks':
      if (SCENARIO === 'empty') return ok(emptyTasksFixture());
      return ok(withDeadlines(tasksFixture()));
    case 'GET /tasks/history':
      return ok(historyFixture(params.get('scope') === 'all' ? 'all' : 'term'));
  }

  const taskMatch = /^GET \/tasks\/(\d+)$/.exec(route);
  if (taskMatch) {
    const found = taskFixture(Number(taskMatch[1]));
    const task = found ? withDeadline(found) : null;
    return task ? ok(task) : { status: 404, json: { message: 'Not found.' } };
  }

  return notFound(route);
}
