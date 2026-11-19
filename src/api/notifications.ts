// M6: notifications list (17), mark-as-read, notification settings (27).
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { flags } from '@/config/flags';

import { notificationsApi } from './endpoints';
import { queryKeys } from './queryClient';
import type { NotificationSettings, NotificationsPage } from './types';

type Pages = InfiniteData<NotificationsPage, string | null>;

/** Screen 17, newest first, paged by `nextCursor`. */
export const useNotifications = () =>
  useInfiniteQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ pageParam }) => notificationsApi.list(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: flags.notifications,
  });

/** Unread dot on the bell (screen 06): anything unread in the loaded pages. */
export function useHasUnread(): boolean {
  const { data } = useNotifications();
  return !!data?.pages.some((p) => p.items.some((n) => !n.readAt));
}

/** Marks some (or, without ids, all) notifications read; optimistic. */
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (ids?: number[]) => notificationsApi.markRead(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications });
      const prev = qc.getQueryData<Pages>(queryKeys.notifications);
      const now = new Date().toISOString();
      qc.setQueryData<Pages>(queryKeys.notifications, (d) =>
        d
          ? {
              ...d,
              pages: d.pages.map((p) => ({
                ...p,
                items: p.items.map((n) =>
                  !n.readAt && (!ids || ids.includes(n.id)) ? { ...n, readAt: now } : n,
                ),
              })),
            }
          : d,
      );
      return prev;
    },
    onError: (_e, _ids, prev) => qc.setQueryData(queryKeys.notifications, prev),
    onSettled: () => void qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

/** Screen 27 toggles, saved on the server. */
export const useNotificationSettings = () =>
  useQuery({
    queryKey: queryKeys.notificationSettings,
    queryFn: notificationsApi.settings,
    enabled: flags.notifications,
  });

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (patch: Partial<NotificationSettings>) => notificationsApi.updateSettings(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: queryKeys.notificationSettings });
      const prev = qc.getQueryData<NotificationSettings>(queryKeys.notificationSettings);
      if (prev) qc.setQueryData(queryKeys.notificationSettings, { ...prev, ...patch });
      return prev;
    },
    onError: (_e, _p, prev) => qc.setQueryData(queryKeys.notificationSettings, prev),
    onSuccess: (settings) => qc.setQueryData(queryKeys.notificationSettings, settings),
  });
}
