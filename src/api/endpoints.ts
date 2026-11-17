// Typed calls per endpoint (docs/API.md). Screens use these, never `api` directly.
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { api } from './client';
import type { LoginResponse, Me } from './types';

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
