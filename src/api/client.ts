// fetch wrapper for /api/mobile/v1: base URL, Bearer token, JSON, Laravel errors,
// global logout on 401. In mock mode requests go to src/api/mock.ts instead.
import { API_BASE_URL, MOCK_MODE } from '@/config/env';

import { ApiError, errorFromResponse } from './errors';
import { mockFetch } from './mock';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type Options = {
  body?: unknown;
  /** Login / forgot don't send a token, and a 401 there means "wrong credentials", not "log out". */
  auth?: boolean;
  signal?: AbortSignal;
};

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called by the auth provider whenever the token changes. */
export function setToken(next: string | null) {
  token = next;
}

/** Registers the global logout used when an authenticated request gets a 401. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export async function request<T>(method: Method, path: string, opts: Options = {}): Promise<T> {
  const { body, auth = true, signal } = opts;

  let status: number;
  let json: unknown = null;

  if (MOCK_MODE) {
    ({ status, json } = await mockFetch(method, path, body, auth ? token : null));
  } else {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined && !(body instanceof FormData))
      headers['Content-Type'] = 'application/json';
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body:
          body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
        signal,
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      throw new ApiError('network', (e as Error).message);
    }
    status = res.status;
    if (status !== 204) json = await res.json().catch(() => null);
  }

  if (status >= 200 && status < 300) return json as T;

  const error = errorFromResponse(status, json);
  if (error.kind === 'unauthorized' && auth) onUnauthorized?.();
  throw error;
}

export const api = {
  get: <T>(path: string, opts?: Omit<Options, 'body'>) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: Omit<Options, 'body'>) =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<Options, 'body'>) =>
    request<T>('PATCH', path, { ...opts, body }),
};
