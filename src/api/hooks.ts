import { useQuery } from '@tanstack/react-query';

import { meApi, tasksApi } from './endpoints';
import { queryKeys } from './queryClient';
import type { HistoryScope } from './types';

/** The signed-in member (seeded by the login response, refreshed from GET /me). */
export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: meApi.get });

/** Screen 06: my tasks, available tasks and the stats card. */
export const useTasks = () => useQuery({ queryKey: queryKeys.tasks, queryFn: tasksApi.list });

/** Screens 07, 10, 12, 13: one task, any state. */
export const useTask = (id: number) =>
  useQuery({
    queryKey: queryKeys.task(id),
    queryFn: () => tasksApi.get(id),
    enabled: Number.isFinite(id),
  });

/** Screen 16: approved tasks this term / all terms. */
export const useTaskHistory = (scope: HistoryScope) =>
  useQuery({ queryKey: queryKeys.history(scope), queryFn: () => tasksApi.history(scope) });
