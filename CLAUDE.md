# FTC Mobile App — instructions for Claude Code

This repo is the native mobile app for **FTC (Future Technology Club, King Saud University)**.
It rebuilds the member portal (ftcksu.com/portal) as an Arabic-first, RTL mobile app.

Read these before writing code:

| File | What it is |
|---|---|
| **Design (Claude Design artifact)** | https://claude.ai/artifact/UNWakGr4dtHSoDHWFqCSSG — 30 artboards numbered 01–30 + Foundations, with dev notes on the canvas. **This is the visual source of truth.** Read it for exact sizes, colours, radii and copy. |
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
  (auth)/login.tsx  forgot.tsx  forgot-sent.tsx  notifications-permission.tsx
  (tabs)/_layout.tsx          4 tabs, floating nav bar (see screens)
  (tabs)/tasks/index.tsx  [id].tsx  history.tsx
  (tabs)/community/index.tsx  search.tsx  committee/[id].tsx  member/[id].tsx
  (tabs)/leaderboard.tsx
  (tabs)/account/index.tsx  achievements.tsx  settings.tsx  edit-profile.tsx
  notifications.tsx
  (sheets)/join/[id].tsx  leave/[id].tsx  submit/[id].tsx  change-password.tsx  logout.tsx
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
- Before you call a screen done, screenshot it in the iOS simulator at 390×844 and compare it with the matching artboard in the design. Spacing, colour, copy and icon have to match.
- Use mocks until the API is live. Switching to the real API should only mean changing `API_BASE_URL`.
- Don't invent features or copy that aren't in the designs. Ask instead.
