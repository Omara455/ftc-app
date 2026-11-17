# Build plan

Work through these milestones in order. Each one ends with a running app and a side-by-side check against the design artboards.

## M0: Scaffold (½ day)
- `npx create-expo-app@latest ftc-app -t default` (TypeScript), then delete the template screens.
- Install `expo-router`, `@tanstack/react-query`, `expo-secure-store`, `lucide-react-native`, `react-native-svg`, `@expo-google-fonts/cairo`, `expo-font`, `@react-native-community/netinfo`, `react-native-reanimated`, `react-native-gesture-handler`, `@gorhom/bottom-sheet`, `expo-local-authentication`.
- Force RTL, load the Cairo fonts, set a dark status bar and the `bg` root colour.
- Copy in `src/theme/tokens.ts` and `assets/`. Use `react-native-svg-transformer` so the SVG backgrounds can be imported.
- ESLint, Prettier, and `tsc --noEmit` in CI.

## M1: Design system (1–2 days)
- Build every component listed at the end of `SCREENS.md`.
- Add a hidden `/dev/kit` route that renders all of them. Compare it with the Foundations artboard.

## M2: Auth and shell (1 day), screens 01–05 and 30
- `src/api/client.ts`: base URL from env, attaches the Bearer token, logs out globally on a 401, and parses Laravel 422 errors into field messages.
- Auth context: read the token from SecureStore at boot and redirect to `(auth)` or `(tabs)`.
- Tab bar exactly as designed. The logout sheet.
- Mock mode: when `API_BASE_URL` is empty, serve fixtures from `src/mocks/`.

## M3: Tasks (read) (2 days), screens 06, 07, 10, 12, 13, 15, 16, 18, 19
- Use one `TaskDetail` screen that switches its layout on `myState` and the `can*` flags. Don't build separate screens per state.
- Every screen gets loading skeleton, empty, error and offline states. Persist the query cache (`@tanstack/query-async-storage-persister`) so offline mode shows the last data.

## M4: Community, Leaderboard, Account (read) (2 days), screens 20–27
- Leaderboard: league card, podium, pinned «ترتيبك».
- Achievements grid with locked progress.
- Settings: the biometric toggle works locally. The notification toggles stay behind a flag until the API is ready.

## ✅ Phase 1 release: internal TestFlight / APK through EAS, against `/api/mobile/v1` on staging.

## M5: Writes (Phase 2) (2–3 days), screens 08, 09, 11, 14, 28, 29
- Join, leave and submit (multipart with attachments) using optimistic updates, then invalidate `['tasks']` and `['me']`.
- Edit profile: image picker and bio.
- Disable every write while offline (the lock variant of `Button`).

## M6: Notifications (Phase 2) (1–2 days), screens 05, 17, 27
- Ask for permission, register the Expo push token with `POST /devices`, and handle deep links from a tapped notification to the right screen.
- Notifications list with mark-as-read. Settings toggles synced to the server.

## Definition of done (every screen)
- [ ] Matches its artboard at 390×844 (spacing, colour, copy, icons)
- [ ] RTL is correct, and `+N` and Latin text are isolated
- [ ] Loading, empty, error and offline states
- [ ] VoiceOver labels on icon-only buttons (the source files have `aria-label`, so reuse them)
- [ ] Works in mock mode and against the real API
