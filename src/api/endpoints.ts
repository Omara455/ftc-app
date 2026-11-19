// Typed calls per endpoint (docs/API.md). Screens use these, never `api` directly.
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { api } from './client';
import type {
  AchievementsResponse,
  CommitteeDetail,
  CommunityResponse,
  HistoryScope,
  LeaderboardResponse,
  MemberCard,
  MemberDetail,
  LocalFile,
  LoginResponse,
  Me,
  NotificationSettings,
  NotificationsPage,
  ProfileInput,
  SubmitInput,
  Task,
  TaskHistoryResponse,
  TasksResponse,
} from './types';

/** Token name on the server, so members can tell their devices apart in the portal. */
const deviceName = () => Constants.deviceName ?? `FTC app (${Platform.OS})`;

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>(
      '/auth/login',
      { email, password, deviceName: deviceName() },
      { auth: false },
    ),
  logout: () => api.post<void>('/auth/logout'),
  /** Triggers the portal's existing reset email. Always 204. */
  forgot: (email: string) => api.post<void>('/auth/forgot', { email }, { auth: false }),
};

/** Appends a picked file: a File/Blob on web, `{uri, name, type}` on native (RN's FormData). */
function appendFile(form: FormData, field: string, f: LocalFile) {
  if (Platform.OS === 'web' && f.file) form.append(field, f.file, f.name);
  else form.append(field, { uri: f.uri, name: f.name, type: f.mimeType } as unknown as Blob);
}

export const meApi = {
  get: () => api.get<Me>('/me'),
  /**
   * PATCH /me (bio, photo). PHP doesn't parse multipart bodies on PATCH, so this is a POST
   * with Laravel's `_method=PATCH` override.
   */
  update: (input: ProfileInput) => {
    const form = new FormData();
    form.append('_method', 'PATCH');
    form.append('bio', input.bio);
    if (input.photo) appendFile(form, 'photo', input.photo);
    return api.post<Me>('/me', form, { mockBody: input });
  },
};

export const tasksApi = {
  list: () => api.get<TasksResponse>('/tasks'),
  get: (id: number) => api.get<Task>(`/tasks/${id}`),
  history: (scope: HistoryScope) => api.get<TaskHistoryResponse>(`/tasks/history?scope=${scope}`),
  /** 409 when the task is full or I already joined. */
  claim: (id: number) => api.post<Task>(`/tasks/${id}/claim`),
  leave: (id: number) => api.post<void>(`/tasks/${id}/leave`),
  submit: (id: number, input: SubmitInput) => {
    const form = new FormData();
    form.append('note', input.note);
    if (input.link) form.append('link', input.link);
    input.files.forEach((f) => appendFile(form, 'files[]', f));
    input.keepFiles.forEach((url) => form.append('keepFiles[]', url));
    return api.post<Task>(`/tasks/${id}/submit`, form, { mockBody: input });
  },
};

export const communityApi = {
  get: () => api.get<CommunityResponse>('/community'),
  committee: (id: number) => api.get<CommitteeDetail>(`/committees/${id}`),
  member: (id: number) => api.get<MemberDetail>(`/members/${id}`),
  search: (q: string, signal?: AbortSignal) =>
    api.get<MemberCard[]>(`/members?q=${encodeURIComponent(q)}`, { signal }),
};

export const leaderboardApi = {
  get: () => api.get<LeaderboardResponse>('/leaderboard'),
};

export const notificationsApi = {
  list: (cursor: string | null) =>
    api.get<NotificationsPage>(
      cursor ? `/notifications?cursor=${encodeURIComponent(cursor)}` : '/notifications',
    ),
  /** Empty `ids` marks everything read. */
  markRead: (ids?: number[]) => api.post<void>('/notifications/read', ids ? { ids } : {}),
  settings: () => api.get<NotificationSettings>('/me/notification-settings'),
  updateSettings: (patch: Partial<NotificationSettings>) =>
    api.patch<NotificationSettings>('/me/notification-settings', patch),
};

export const devicesApi = {
  register: (expoPushToken: string) =>
    api.post<void>('/devices', { expoPushToken, platform: Platform.OS }),
  /** M6 proposal: DELETE /devices/{expoPushToken} on logout. */
  unregister: (expoPushToken: string) =>
    api.del<void>(`/devices/${encodeURIComponent(expoPushToken)}`),
};

export const achievementsApi = {
  get: () => api.get<AchievementsResponse>('/achievements'),
};
