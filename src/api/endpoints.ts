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
  LoginResponse,
  Me,
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

export const meApi = {
  get: () => api.get<Me>('/me'),
};

export const tasksApi = {
  list: () => api.get<TasksResponse>('/tasks'),
  get: (id: number) => api.get<Task>(`/tasks/${id}`),
  history: (scope: HistoryScope) => api.get<TaskHistoryResponse>(`/tasks/history?scope=${scope}`),
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

export const achievementsApi = {
  get: () => api.get<AchievementsResponse>('/achievements'),
};
