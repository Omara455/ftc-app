// One error type for everything the API client can fail with, so screens can
// switch on `kind` instead of HTTP details.
export type ApiErrorKind =
  | 'validation' // 422: `fields` has the messages per field
  | 'unauthorized' // 401: token invalid → global logout (or wrong credentials on login)
  | 'forbidden' // 403: a policy denied the action
  | 'conflict' // 409: e.g. task full / already joined
  | 'throttled' // 429
  | 'network' // no connection / DNS / timeout
  | 'server'; // 5xx or anything unexpected

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status: number | null = null,
    /** Laravel 422 `errors`: first message per field. */
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

/** Maps an HTTP status + Laravel JSON body to an ApiError. */
export function errorFromResponse(status: number, body: unknown): ApiError {
  const json = (body ?? {}) as { message?: string; errors?: Record<string, string[] | string> };
  const message = json.message ?? `HTTP ${status}`;
  if (status === 422) {
    const fields: Record<string, string> = {};
    for (const [field, msgs] of Object.entries(json.errors ?? {})) {
      const first = Array.isArray(msgs) ? msgs[0] : msgs;
      if (first) fields[field] = first;
    }
    return new ApiError('validation', message, status, fields);
  }
  if (status === 401) return new ApiError('unauthorized', message, status);
  if (status === 403) return new ApiError('forbidden', message, status);
  if (status === 409) return new ApiError('conflict', message, status);
  if (status === 429) return new ApiError('throttled', message, status);
  return new ApiError('server', message, status);
}
