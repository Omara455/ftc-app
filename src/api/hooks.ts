import { useQuery } from '@tanstack/react-query';

import { meApi } from './endpoints';
import { queryKeys } from './queryClient';

/** The signed-in member (seeded by the login response, refreshed from GET /me). */
export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: meApi.get });
