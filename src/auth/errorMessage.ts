import { isApiError } from '@/api/errors';
import { ar } from '@/i18n/ar';

/** Banner text for a failed sign-in / reset request. */
export function authErrorMessage(e: unknown): string {
  if (!isApiError(e)) return ar.common.serverError;
  switch (e.kind) {
    case 'validation':
    case 'unauthorized':
      return ar.auth.wrongCredentials;
    case 'throttled':
      return ar.auth.throttled;
    case 'network':
      return ar.offline.title;
    default:
      return ar.common.serverError;
  }
}
