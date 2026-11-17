// Phase 2 features stay off until their endpoints exist (CLAUDE.md rule 8).
// Turn one on locally with e.g. EXPO_PUBLIC_FLAG_NOTIFICATIONS=1 to work on it against mocks.
const on = (v: string | undefined) => v === '1' || v === 'true';

export const flags = {
  /** Screens 05, 17 and the notification toggles in 27: POST /devices, GET /notifications… */
  notifications: on(process.env.EXPO_PUBLIC_FLAG_NOTIFICATIONS),
  /** Screens 08, 09, 11, 14, 28: join, leave, submit, edit profile. */
  writes: on(process.env.EXPO_PUBLIC_FLAG_WRITES),
} as const;
