import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

import type { HistoryScope } from './types';
import { isApiError } from './errors';

const WEEK = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Keep data long enough to be persisted and shown offline (screen 19).
      gcTime: WEEK,
      // Don't retry what won't change by retrying (bad token, policy, validation, not found).
      retry: (count, error) =>
        count < 2 &&
        !(
          isApiError(error) &&
          ['unauthorized', 'forbidden', 'validation', 'network'].includes(error.kind)
        ) &&
        !(isApiError(error) && error.status === 404),
    },
  },
});

/** Saves the query cache to AsyncStorage so the app opens with the last data offline. */
export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'ftc.queryCache',
  throttleTime: 1000,
});

export const persistOptions = {
  persister,
  maxAge: WEEK,
  // Bump when response shapes change, so an old cache isn't read with new code.
  buster: 'v1-m4',
};

export const queryKeys = {
  me: ['me'] as const,
  tasks: ['tasks'] as const,
  task: (id: number) => ['tasks', id] as const,
  history: (scope: HistoryScope) => ['tasks', 'history', scope] as const,
  community: ['community'] as const,
  committee: (id: number) => ['community', 'committee', id] as const,
  member: (id: number) => ['community', 'member', id] as const,
  search: (q: string) => ['community', 'search', q] as const,
  leaderboard: ['leaderboard'] as const,
  achievements: ['achievements'] as const,
  notifications: ['notifications', 'list'] as const,
  notificationSettings: ['notifications', 'settings'] as const,
};
