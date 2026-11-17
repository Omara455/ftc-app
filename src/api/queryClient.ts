import { QueryClient } from '@tanstack/react-query';

import { isApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Don't retry what won't change by retrying (bad token, policy, validation).
      retry: (count, error) =>
        count < 2 &&
        !(isApiError(error) && ['unauthorized', 'forbidden', 'validation'].includes(error.kind)),
    },
  },
});

export const queryKeys = {
  me: ['me'] as const,
};
