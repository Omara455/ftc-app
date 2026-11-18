# FTC Mobile App — instructions for Claude Code

This repo is the native mobile app for **FTC (Future Technology Club, King Saud University)**.
It rebuilds the member portal (ftcksu.com/portal) as an Arabic-first, RTL mobile app.

Read these before writing code:

| File | What it is |
|---|---|
| **Design (Claude Design artifact)** | https://claude.ai/artifact/UNWakGr4dtHSoDHWFqCSSG — 30 artboards numbered 01–30 + Foundations, with dev notes on the canvas. **This is the visual source of truth.** Read it for exact sizes, colours, radii and copy. |
| **`docs/PROGRESS.md`** | **What's built (M0–M4), every approved decision, open items and what's next. Read it at the start of every session and update it at the end of every milestone.** |
| `docs/SCREENS.md` | Every screen: route, purpose, data, actions, where it links to. |
| `docs/API.md` | The `/api/mobile/v1` contract and response shapes. The backend lives in the **portal repo**, not here. |
| `docs/PLAN.md` | Build order and milestones. Follow it. |
| `src/theme/tokens.ts` | Design tokens as code. Copy into the app and never hard-code colours elsewhere. |
| `assets/` | Background SVGs and the FTC logo/mark. |

## Stack (decided — don't change without asking)
- React Native + **Expo** (latest SDK), **TypeScript** strict
- **Expo Router** (file-based routes, tabs + stacks + modal sheets)
- **TanStack Query** for server state and caching (offline = show cached data)
- **expo-secure-store** for the Sanctum token
- **lucide-react-native** for icons (the portal uses Lucide too) + `react-native-svg`
- **Cairo** font via `@expo-google-fonts/cairo` (400/500/600/700/800)
- `expo-notifications` (Phase 2), `expo-local-authentication` (biometric login toggle), `expo-image-picker` (profile photo, Phase 2)
- EAS Build / EAS Update
- No UI kit. Build small primitives in `src/components/` that match the designs.

## Non-negotiable rules
1. **RTL everywhere.** Call `I18nManager.forceRTL(true)` + `allowRTL(true)` at startup. Use `start`/`end` (not left/right) in styles. Back arrows point right (→). Chevrons on list rows point left (‹).
2. **Arabic copy is final.** Copy every string exactly from the design (Saudi colloquial tone: «هالترم», «شغّال عليها», «ما فيه مهام الحين»). Put strings in `src/i18n/ar.ts`, not inline.
3. **Numbers/Latin inside Arabic:** wrap things like `+3` in a direction-isolated span (`writingDirection: 'ltr'`) so the sign stays on the correct side.
4. **Colours only from `tokens.ts`.** `inkSoft #9A93B8` is the minimum for readable text; `inkMuted` is decorative only.
5. **Touch targets ≥ 44pt.** Screen gutter 20. Radii 10 / 14 / 20 / sheet 28 / pill.
6. **Privacy:** other members' hours appear *only* on the leaderboard top 10. Committee and member pages show league, never hours.
7. **Same account as the portal.** No sign-up in the app. "Don't have an account?" links to `ftcksu.com/apply`. Password reset uses the portal's existing email link.
8. **Phase 1 is read-only.** Join / leave / submit / edit profile / notifications are Phase 2. Until the endpoint exists, build the UI behind a feature flag (`src/config/flags.ts`) and use mock data from `src/mocks/`.
9. **Every data screen has 4 states:** loading (skeleton — see screen 18), empty (screen 15), error, offline (screen 19: cached data + banner, write buttons disabled with a lock icon).

## Project layout (target)
```
app/
  _layout.tsx                 fonts, RTL, QueryClient, auth gate
  (auth)/login.tsx  forgot.tsx  forgot-sent.tsx
  notifications-permission.tsx   screen 05: signed-in side of the auth gate, so it lives outside (auth)
  (tabs)/_layout.tsx          4 tabs, floating nav bar (see screens)
  (tabs)/tasks/index.tsx  [id].tsx  history.tsx
  (tabs)/community/index.tsx  search.tsx  committee/[id].tsx  member/[id].tsx
  (tabs)/leaderboard.tsx
  (tabs)/account/index.tsx  achievements.tsx  settings.tsx  edit-profile.tsx
  notifications.tsx
  (sheets)/join/[id].tsx  leave/[id].tsx  submit/[id].tsx  change-password.tsx
  (logout is a component sheet, src/features/auth/LogoutSheet.tsx, opened from Settings)
src/
  api/        client.ts (fetch + token + 401 handling), endpoints, types.ts
  components/ Card, Chip, StateChip, Avatar, LeagueBadge, TaskCard, Stepper, Sheet, Button, ListRow, Skeleton, OfflineBanner, TabBar
  theme/      tokens.ts
  i18n/       ar.ts
  mocks/      fixtures matching docs/API.md shapes
  config/     flags.ts, env.ts (API_BASE_URL)
```
Tab order in RTL from the right: **المهام · المجتمع · الصدارة · حسابي**.

## Working style
- Build in the order of `docs/PLAN.md`. Finish one milestone, run it, compare it side by side with the design artboards, then move on.
- Git: one branch per milestone (`m1-design-system`, `m2-auth-shell`, …) and a PR into `main` so CI runs before it's merged.
- **Design checks happen in two loops.** Spacing, colour, copy and icons have to match the artboards.
  1. **Fast loop (every screen, before you call it done): Expo web at 390×844, RTL.** Run `npm run shot -- compare <route> <Artboard>`, for example `npm run shot -- compare tasks Tasks`. It exports the web build, screenshots the route, renders the artboard from `design/artboards/` and saves both side by side in `.screenshots/`. Open the image and fix any difference. Other modes: `app <route…>`, `design <Artboard…>`, and the flags `--height=N` (tall capture, sliced into 844-pt pages), `--fill="label=value"` (type into a field), `--click="نص"` (tap by text, e.g. to open a sheet or submit), `--signed-in` (start with the mock token), `--offline` (cut the network after load), `--wait=ms`, `--no-build` and `--debug`. Mock states for screenshots: `EXPO_PUBLIC_MOCK_SCENARIO=empty|error|deadlines`, `EXPO_PUBLIC_MOCK_DELAY=600000` (skeleton), `EXPO_PUBLIC_FLAG_WRITES=1` (Phase 2 buttons). Write routes without the leading slash, because Git Bash rewrites `/dev/kit`. `design/artboards/` is a local, git-ignored copy of the canvas `project/*.dc.html` files. If it's missing or the design changed, read them again from the design artifact.
  - `npm run smoke` runs the auth and task flows end to end against the mock API (also in CI). Extend it when a milestone adds flows.
  - Typed routes: after adding a route, run `npx expo start` once (Ctrl+C when it says "Waiting on…") so `.expo/types` picks it up; `expo export` doesn't regenerate them.
  2. **Device check (end of every milestone): an Android development build** (EAS `development` profile or the Android Studio emulator), to test native RTL, fonts, SVGs, sheets and gestures, which web can't prove. The steps are in `docs/DEVICE.md`.
- `/dev/kit` renders every component. It's available in dev builds, and in web screenshot builds through `EXPO_PUBLIC_DEV_KIT=1`.
- Icons, splash and notification icon are generated from `assets/ftc-mark-white.svg` and `assets/ftc-logo-white.svg` by `node scripts/generate-icons.mjs`. Don't edit the PNGs by hand.
- Use mocks until the API is live. Switching to the real API should only mean changing `API_BASE_URL`.
- Don't invent features or copy that aren't in the designs. Ask instead.
