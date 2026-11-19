import { isApiError } from '@/api/errors';
import { ar } from '@/i18n/ar';

/**
 * Banner text for a failed write (join, leave, submit, edit profile).
 * 422 returns null: those messages belong under their fields (`error.fields`).
 */
export function writeErrorMessage(e: unknown): string | null {
  if (!isApiError(e)) return ar.common.serverError;
  switch (e.kind) {
    case 'validation':
      return Object.keys(e.fields).length ? null : ar.common.serverError;
    case 'conflict':
      return ar.sheets.taskFull;
    case 'forbidden':
      return ar.sheets.notAllowed;
    case 'throttled':
      return ar.auth.throttled;
    case 'network':
      return ar.offline.title;
    default:
      return ar.common.serverError;
  }
}

/** Laravel 422 field message, e.g. `fieldError(e, 'note')`. */
export const fieldError = (e: unknown, field: string): string | undefined =>
  isApiError(e) && e.kind === 'validation' ? e.fields[field] : undefined;
