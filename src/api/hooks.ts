import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { achievementsApi, communityApi, leaderboardApi, meApi, tasksApi } from './endpoints';
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

/** Screen 20. */
export const useCommunity = () =>
  useQuery({ queryKey: queryKeys.community, queryFn: communityApi.get });

/** Screen 22. */
export const useCommittee = (id: number) =>
  useQuery({
    queryKey: queryKeys.committee(id),
    queryFn: () => communityApi.committee(id),
    enabled: Number.isFinite(id),
  });

/** Screen 23. */
export const useMember = (id: number) =>
  useQuery({
    queryKey: queryKeys.member(id),
    queryFn: () => communityApi.member(id),
    enabled: Number.isFinite(id),
  });

/** Screen 21: server search, previous results stay while the next query loads. */
export const useMemberSearch = (q: string) =>
  useQuery({
    queryKey: queryKeys.search(q),
    queryFn: ({ signal }) => communityApi.search(q, signal),
    enabled: q.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

/** Screen 24. */
export const useLeaderboard = () =>
  useQuery({ queryKey: queryKeys.leaderboard, queryFn: leaderboardApi.get });

/** Screen 26. */
export const useAchievements = () =>
  useQuery({ queryKey: queryKeys.achievements, queryFn: achievementsApi.get });
