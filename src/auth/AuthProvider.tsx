// Session state: reads the Sanctum token at boot, signs in/out, and logs out
// globally when any authenticated request gets a 401.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setToken, setUnauthorizedHandler } from '@/api/client';
import { authApi } from '@/api/endpoints';
import { persister, queryClient, queryKeys } from '@/api/queryClient';
import { flags } from '@/config/flags';
import { keys, storage } from '@/lib/storage';

type Status = 'booting' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: Status;
  /** Throws ApiError (validation / throttled / network…) for the login screen to show. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Revokes the token on the server (best effort), then clears everything local. */
  signOut: () => Promise<void>;
  /** True right after the first login, until screen 05 has been shown once. */
  needsNotificationPrompt: boolean;
  markNotificationPrompted: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('booting');
  const [prompted, setPrompted] = useState(true);

  const clearLocal = useCallback(async () => {
    setToken(null);
    await storage.remove(keys.token);
    queryClient.clear();
    await persister.removeClient(); // the offline cache must not outlive the session
    setStatus('signedOut');
  }, []);

  // Boot: restore the session. No network call here, so the app opens offline
  // with cached data; an expired token is caught by the first 401.
  useEffect(() => {
    (async () => {
      const [token, wasPrompted] = await Promise.all([
        storage.get(keys.token),
        storage.get(keys.notificationsPrompted),
      ]);
      setPrompted(wasPrompted === '1');
      if (token) {
        setToken(token);
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    })().catch(() => setStatus('signedOut'));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void clearLocal());
    return () => setUnauthorizedHandler(null);
  }, [clearLocal]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login(email.trim(), password);
    await storage.set(keys.token, token);
    setToken(token);
    queryClient.setQueryData(queryKeys.me, user);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Offline or token already invalid: still sign out locally.
    }
    await clearLocal();
  }, [clearLocal]);

  const markNotificationPrompted = useCallback(async () => {
    setPrompted(true);
    await storage.set(keys.notificationsPrompted, '1');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      signIn,
      signOut,
      needsNotificationPrompt: flags.notifications && status === 'signedIn' && !prompted,
      markNotificationPrompted,
    }),
    [status, signIn, signOut, prompted, markNotificationPrompted],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
