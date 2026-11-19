# Progress and decisions

**Read this first in a new session**, after `CLAUDE.md`. It records what's built, every decision the project owner has approved, what's still open, and what comes next. Keep it up to date at the end of every milestone.

Last updated: 2026-11-18, after M4 was merged (PR #4).

---

## 1. Status

| Milestone | Screens | PR | State |
|---|---|---|---|
| M0 Scaffold | — | (direct to `main`) | ✅ merged |
| M1 Design system | Foundations, `/dev/kit` | #1 | ✅ merged |
| M2 Auth and shell | 01–05, 30 | #2 | ✅ merged |
| M3 Tasks (read) | 06, 07, 10, 12, 13, 15, 16, 18, 19 | #3 | ✅ merged |
| M4 Community, Leaderboard, Account | 20–27, **29** (pulled forward) | #4 | ✅ merged |
| **M5 Writes (Phase 2)** | 08, 09, 11, 14, 28 | — | **next** |
| M6 Notifications (Phase 2) | 05 (`POST /devices`), 17, 27 toggles | — | after M5 |

Phase 1 release (PLAN.md) means an internal TestFlight / APK through EAS against `/api/mobile/v1` on staging. The Phase 1 screens are all built. That release needs the portal team's API (see §4) and an on-device check.

**Not yet verified on a device.** Every check so far is on Expo web at 390×844 plus `npm run smoke`. The owner said they'd do the EAS / Android steps in `docs/DEVICE.md` and report back; nothing has been reported yet. Biometric login, native RTL, sheets and gestures can only be checked there.

### What exists
- **Stack:** Expo SDK 58 (RN 0.88, React 19.3), Expo Router with typed routes, TanStack Query (persisted to AsyncStorage), lucide-react-native, Cairo, @gorhom/bottom-sheet, react-native-reanimated 4. Every route's file is listed in `CLAUDE.md`'s layout; `edit-profile`, `notifications` and `(sheets)/*` don't exist yet.
- **API layer:** `src/api/` holds the client (Bearer token, global logout on 401, Laravel 422 → field errors, 429/409/403/network kinds), the endpoints, the types, the query keys and the hooks.
- **Mock mode:** an empty `EXPO_PUBLIC_API_BASE_URL` serves `src/api/mock.ts`, which uses the fixtures in `src/mocks/`.
  - Sign in with any email and the password `ftc-portal`. Any other password returns 422; 5 failures in a minute return 429.
  - An email starting with `offline` simulates a network error.
  - `EXPO_PUBLIC_MOCK_SCENARIO=empty|error|deadlines` switches scenarios, and `EXPO_PUBLIC_MOCK_DELAY` sets the response delay.
- **Auth:** `src/auth/AuthProvider.tsx`. The token is in SecureStore (localStorage on web). The gate uses `Stack.Protected`, and the biometric check runs at boot.
- **Flags:** `src/config/flags.ts`. `writes` and `notifications` are off by default; turn them on with `EXPO_PUBLIC_FLAG_WRITES=1` / `EXPO_PUBLIC_FLAG_NOTIFICATIONS=1`.
- **Tooling:**
  - `npm run shot` (web screenshot vs artboard)
  - `npm run smoke` (23-step Playwright E2E against mocks, also in CI)
  - `scripts/generate-icons.mjs`
  - `/dev/kit`
  - CI runs lint, typecheck, prettier and smoke.

---

## 2. Approved decisions

These are settled. Don't re-ask; follow them.

### Design source and conflicts
- **The screen artboard wins over Foundations.** Note every mismatch in the PR.
- **Accessibility wins over the design.** Placeholders use `inkSoft`, not `#8079A0`, and there's no extra token for it.
- **The owner's explicit language rules win over the artboard,** e.g. «باقي 13 يوماً» where the artboard says «13 يوم».
- **SCREENS.md is fixed to match the artboard when they disagree:** «حاول مجددًا», and the full email on screen 04 so the member can spot a typo.

### Tokens and type (`src/theme/tokens.ts`)
- **Type scale** comes from Foundations: display 30/800, title 22/800, heading 17/700, cardTitle 15.5/700, body 14.5/400 at 1.8, meta 13/500, caption 11.5/600.
- **Line heights.** Where an artboard leaves line-height unset, Cairo's default (~1.875) applies. The heading, header, meta, chip and caption tokens use it. `Txt` with a custom `size` and no `leading` also defaults to 1.875.
- **`radius.card` = 18** is kept, because the screen cards use it.
- **Added tokens:**
  - `hue.*` shades (Tailwind 100–300) for text on tinted backgrounds
  - `onBrand`, `avatarGlyph`, `scrim`, `barGlass`, `warnSurface`, `pinnedSurface`, `track`, `dangerText`
  - `taskState.*.text`
  - `committee.*.text` (+ tech `bg`)
  - shadows: `brandButton` / `sheet` / `banner`
- **Approved chip label** is `#86EFAC` (green-300).
- **Committee chips** use the committee colour: text in the lighter shade, background `tint(fg, .14)`; tech uses the brand tint. The projects (`#CBD5E1`) and finance (`#FDE047`) text shades were my pick, as no artboard shows them.

### Copy (all strings live in `src/i18n/ar.ts`)
- **Not in the design, approved:**
  - Too many attempts (429): «محاولات كثيرة. جرّب مرة ثانية بعد دقيقة.»
  - Server error (5xx): «صار خلل عندنا. جرّب مرة ثانية بعد شوي.»
  - Network error: reuses «ما فيه اتصال بالإنترنت»
  - Search with no results: «ما لقينا أحد بهالاسم.»
  - Deadline due today: «آخر يوم»; overdue: «متأخرة»
- **Offline writes notice (screen 19, updated design):** «الانضمام والتسليم يحتاجون اتصال. جرّبهم أول ما يرجع الإنترنت.» There is no offline submit queue; writes are simply locked while offline.
- **Committee name:** «إدارة المشاريع», as in the design, with the "verify against portal" comment. The owner will confirm the real projects and finance names with the club.

### Arabic number agreement: everywhere, overriding artboards
1 → singular, 2 → dual, 3–10 → plural, 11+ → singular (accusative where the grammar needs it). Helpers live in `src/i18n/format.ts`:
- ساعة · ساعتين · 3 ساعات · 11 ساعة
- يوم · يومين · 3 أيام · 11 يوماً (also «باقي …»)
- مقعد / مقعدين / مقاعد / مقعداً
- عضو / عضوان / أعضاء / عضواً
- لجنة / لجنتان / لجان / لجنة
- فريق / فريقان / فرق / فريقاً

Signed numbers go inside an LTR isolate: `<Ltr>+3</Ltr> ساعات`. Server-written text goes through `isolateLatin()`, so paths and URLs keep their order.

### Gender agreement: everywhere
Match the person referred to. Examples already built: «أنشأها / أنشأتها», «أول ما يراجعه / تراجعه», «آخر إنجازاته / إنجازاتها», «العضو المتميز / العضوة المتميزة». Achievement names come from the API (e.g. «نجمة الأسبوع»).

### Behaviour
- **Deadline chip** (`src/features/tasks/deadline.ts`): shown for tasks still in my hands, meaning working **and** returned.
  - ≥1 day left → «باقي N …» in amber
  - due today → «آخر يوم» in amber
  - past the deadline → «متأخرة» in danger red
  - Submitted, approved and available tasks show no deadline chip.
- **Locked buttons (offline):** dashed outline, lock icon, `inkSoft` label (`Button locked`). Full-width CTAs are replaced by the dashed `LockedNotice` from screen 19.
- **Phase 2 UI** (join, submit, leave, edit submission, edit profile row, notification toggles, the bell, screen 05) appears only behind its flag. With the flags off, detail screens have no sticky bar.
- **Task detail** is one screen that switches on `myState`. An approved task shows all 4 stepper steps done, plus the submission (not designed).
- **More than 3 people joined:** «N من M منضمين» instead of names.
- **Committee rows:** tapping the row opens the committee; the chevron expands the team chips.
- **«ماراثون المهام» (tasks-25) unlocked icon:** `ListChecks`, amber.
- **Tab bar:** shown on tab roots and on the committee page (22), hidden on every other pushed screen. It sits 24pt from the bottom (`tabBarBottom`).
- **Privacy rule 6:** hours appear only on the leaderboard. Smoke checks that committee and member pages never show an hour count.
- **Change password (29):** built in M4, ahead of PLAN, because it uses Phase 1 `POST /auth/forgot`. It sends to my own email and closes the sheet.
- **Biometric login** (merged in M4, not separately reviewed):
  - Turning it on asks once.
  - While it's on, opening the app with a saved session prompts; failing or cancelling revokes the token and shows the password login.
  - Stored on the device only; the row is hidden when there's no hardware, and on web.
- **Mock data** shows 3 «مهامي» items (incl. a submitted one), against the artboard's 2. That's fine.

### Layout
- `notifications-permission.tsx` lives at the `app/` root, on the signed-in side of the gate.
- Logout is a component sheet (`src/features/auth/LogoutSheet.tsx`).
- `CLAUDE.md` is updated to match.

### Release
- **Android package:** `com.ftcksu.app` for now. ⚠️ Confirm it with the club before the first store release (also noted in `docs/DEVICE.md`).
- **App icon, adaptive icon and notification icon** come from `assets/ftc-mark-white.svg` on `#0C0A18`; the splash is `ftc-logo-white.svg`.

### Workflow (also in CLAUDE.md)
- One branch per milestone, then a PR into `main`; the owner merges. **Check with `gh pr view N --json state` that a PR is really merged before branching from `main`.**
- Before calling a screen done, compare it on web with `npm run shot -- compare <route> <Artboard>` and extend `npm run smoke` for new flows.
- Every PR lists: design mismatches, API proposals, copy needing sign-off, and choices not in the design.

---

## 3. API proposals (for the portal team)

All of these are in `docs/API.md` and already returned by the mocks. The owner is passing them to the portal team.
- **M3:**
  - `TaskSummary` gains `location`, `timeFrom`, `timeTo`, `creator` (+ `gender`), `submittedAt` and `people` (id + gender).
  - `Task` gains `createdAt` and `myJoinedAt`.
- **M4:**
  - `MemberCard.roleKind`
  - `Committee.title` and `Committee.mixed`
  - typed `Me.recentActivity` (`Activity`)
  - `achievementsUnlocked` / `achievementsTotal` on `GET /members/{id}`
  - `GET /members?q=` is used for search.

When the real API lands, switching should only mean setting `EXPO_PUBLIC_API_BASE_URL`. Check the shapes against `src/api/types.ts`.

---

## 4. Open items

- [ ] **Device check on Android**, by the owner (`docs/DEVICE.md`). Nothing reported yet.
- [ ] **Committee names** for projects and finance: to be confirmed with the club.
- [ ] **Android package name:** confirm `com.ftcksu.app` before release.
- [ ] **Portal team:** review and implement the M3/M4 API proposals and the Phase 2 endpoints.

**Possible later features** (not planned, don't build without asking):
- Offline submission queue: save a submission made offline and send it when the connection returns. Would need new screen-19 copy.

---

## 5. Next: M5, writes (Phase 2)

From `docs/PLAN.md`: screens **08** join confirm, **09** joined (toast + working state), **11** submit, **14** leave confirm, **28** edit profile. Screen 29 is already done.
- **Calls:** `POST /tasks/{id}/claim`, `/leave` and `/submit` (multipart: `note` ≤500, `link?`, `files[]?`); `PATCH /me` (`bio` ≤160, `photo?`, **only these two**).
- **Data flow:** use optimistic updates, then invalidate `['tasks']` and `['me']`. A 409 on claim means the task is full or already joined.
- **Offline:** disable every write offline with the locked `Button`. `LockedNotice` already exists. No offline queue (decided).
- **Routes:** the sheets go in `app/(sheets)/join/[id].tsx`, `leave/[id].tsx` and `submit/[id].tsx` (CLAUDE.md layout). The existing sticky CTAs in `app/(tabs)/tasks/[id].tsx` (`Cta`) and the join button on `AvailableTaskCard` are already behind `flags.writes`; wire them to these sheets.
- **Edit profile (28):** «حفظ» / «إلغاء» in the header, `expo-image-picker` (not installed yet; use `npx expo install`), bio limited to 160 characters. Name, university ID and committee are read-only, with the HR note.
- **Steps:** read the artboards first (`JoinConfirm`, `TaskJoined`, `SubmitTask`, `LeaveConfirm`, `EditProfile`), add the mock routes, then extend smoke.

Then **M6**:
- Register the Expo push token (`POST /devices`).
- Deep links from notifications, using the type → screen map in SCREENS.md.
- Notifications list (17) with mark-as-read.
- Settings toggles synced via `/me/notification-settings`.

---

## 6. Gotchas (learned the hard way)

- **Typed routes** only regenerate when the dev server runs. After adding a route: `CI=1 timeout 90 npx expo start --port 8095`, then `npm run typecheck`. CI doesn't have `.expo/types`, so it's unaffected.
- **Git Bash path rewriting:** it rewrites `/dev/kit`-style arguments, so pass routes to `shot.mjs` without the leading slash.
- **Shell escaping:** inline `node -e` with regex backslashes or Arabic text gets mangled by the shell. Use the Edit tool or a script file instead. `python` is a Windows Store stub that hangs, so don't call it.
- **Line endings:** `.gitattributes` forces LF. Files edited before that may still show CRLF warnings, which is harmless.
- **Web is only for screenshots:**
  - `useScreenInsets()` fakes the iPhone's 47/34 insets so web matches the artboards.
  - RTL on web needs the root `dir="rtl"` prop.
  - Inputs need `outlineStyle: 'none'` on web.
  - NetInfo on web only reacts to window `online`/`offline` through our listener in `src/lib/network.ts`.
- **Design artboards:** `design/artboards/` is git-ignored. If it's missing, re-read `project/*.dc.html` from the design artifact (URL in CLAUDE.md) and copy the files in. The blob → asset map is in `scripts/shot.mjs`.
- **Box-shadow vs layout:** artboards draw rings, halos and focus rings as CSS box-shadows, which take no layout space. Use negative margins (`Avatar` ring and halo) or negative absolute insets (`TextField` focus ring) so sizes match.
- **Smoke tests:** `scripts/smoke.mjs`, 23 steps. The hours-privacy regex is `/\d+\s*ساع|\+\d/`, so achievement names like «خمسون ساعة» are allowed.
