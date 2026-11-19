# Release guide

How the FTC app gets from this repo to members' phones: builds, versions, over-the-air fixes, crash reporting, store listings, privacy, and the switch from mocks to the real API.

> **Drafts for the club to review:** the store text (§4) and the privacy policy (§6) were written by the dev team. Read them, fix anything that isn't true for the club, and have someone responsible for the club's data sign off before publishing.

---

## 1. Builds, channels and versions

| Profile | Who it's for | API | Phase 2 flags | Output | EAS Update channel |
|---|---|---|---|---|---|
| `development` | developers (dev client, `/dev/kit`) | mocks (unless `.env.local` sets a URL) | from `.env.local` | APK | `development` |
| `preview` | internal testers | **mocks for now** → staging once it exists (§8) | writes + notifications on | APK / ad-hoc iOS | `preview` |
| `production` | the stores | `https://ftcksu.com/api/mobile/v1` | off until the portal ships them | AAB / App Store build | `production` |

**Versions**
- `version` in `app.json` (e.g. `1.0.0`) is what members see. Bump it **for every store release**.
  - patch (`1.0.1`): fixes only
  - minor (`1.1.0`): new features
- The build number (`versionCode` / `buildNumber`) is managed by EAS (`appVersionSource: remote`, `autoIncrement` on production). Don't set it by hand.
- `runtimeVersion` follows `version` (`policy: appVersion`). An over-the-air update only reaches builds with the same `version`.

**Over-the-air fixes (EAS Update)**
- **JS-only fix** (copy, layout, logic): `eas update --channel production --message "…"`. Phones pick it up on their next launch, with no store review.
- **Native change** (new native package, `app.json` plugins or permissions, Expo SDK upgrade): bump `version`, build, submit. An OTA update must never need native code the store build doesn't have.
- **Test first:** run the same update on `--channel preview`, check it on a preview build, then publish to `production`.
- **Roll back:** `eas update:republish` the previous update group (Expo dashboard → Updates).

## 2. One-time setup (club accounts)

1. **Expo / EAS:**
   - `eas init` writes `extra.eas.projectId` (also needed for push).
   - `eas update:configure` writes `updates.url` into `app.json`.
   - Commit both.
2. **App identifiers:** `com.ftcksu.app` for Android (`android.package`) and iOS (`ios.bundleIdentifier`). **⚠️ Confirm with the club. They can't change after the first release.**
3. **Google Play Console:** a club developer account (one-time fee). Create the app and fill in the Data safety form (§6.3).
4. **Apple Developer Program:** a club account (yearly fee). `eas credentials` handles certificates. Create the app in App Store Connect with the bundle id.
5. **Push:** Firebase/FCM for Android, and `eas credentials` for Apple push keys. Steps in `docs/DEVICE.md` → «Push notifications».
6. **Sentry (crash reports, free tier):**
   - Create an org and a React Native project.
   - Set `EXPO_PUBLIC_SENTRY_DSN` as an EAS environment variable for `preview` and `production`.
   - For readable stack traces, set `SENTRY_AUTH_TOKEN` (a secret), `SENTRY_ORG` and `SENTRY_PROJECT` in EAS. The `@sentry/react-native` plugin then uploads source maps on each build.
   - Reports are off in mock mode and on web. No user identity, request bodies, query strings or auth headers are sent (`src/lib/sentry.ts`).
7. **Privacy policy URL:** publish §6 at e.g. `https://ftcksu.com/privacy`, **only after the PDPL review** (§6). Both stores require a public URL.

## 3. Release checklist (every store release)

**Before building**
- [ ] `main` is green in CI (lint, typecheck, prettier, smoke).
- [ ] `version` bumped in `app.json`. PROGRESS.md and the changelog notes updated.
- [ ] Flags are what this release should have. Phase 2 stays off until its endpoints are live (§8).
- [ ] The production API URL answers (`GET /me` with a test account).
- [ ] Copy changes approved by the club.
- [ ] The published privacy policy has been reviewed by the club or the university against the PDPL (§6), and matches what this release does.

**Build and test**
- [ ] `eas build --profile preview --platform all`. Install it on at least one Android phone and one iPhone.
- [ ] On device: login, Tasks, a task detail, Community, Leaderboard, Account, Settings, logout. Native RTL, Cairo fonts, sheets and gestures. Offline banner (airplane mode).
- [ ] Phone font size at its largest: nothing clipped or overlapping (text stops growing at 1.3×).
- [ ] TalkBack (Android) and VoiceOver (iOS): every button reads a label, and tab order follows the layout right to left.
- [ ] Push (if notifications are on): receive, tap → right screen, sign out → no more pushes.
- [ ] Sentry receives a test crash from the preview build (then remove the test).

**Ship**
- [ ] `eas build --profile production --platform all`
- [ ] `eas submit --platform android` (internal track, draft) → promote to production in Play Console after a last check.
- [ ] `eas submit --platform ios` → TestFlight → submit for review with the listing text (§4), screenshots (§5) and privacy answers (§6).
- [ ] Tag the commit `v1.x.y` and note the EAS build ids in the GitHub release.
- [ ] Watch Sentry and store reviews for the first days. Fix JS issues with an EAS Update (§1).

## 4. Store listing text (Arabic, draft)

Both stores: primary language **Arabic**. Category **Education**. Content rating: everyone, with no user-generated content shown publicly (submissions only go to the member's leaders).

### Google Play
- **App name** (≤30): `نادي تقنية المستقبل FTC`
- **Short description** (≤80): `مهامك وساعاتك التطوعية في نادي تقنية المستقبل، كلها في جوالك.`
- **Full description:**

```
تطبيق أعضاء نادي تقنية المستقبل (FTC) بجامعة الملك سعود. نفس حسابك في بوابة النادي، بس في جوالك.

• مهامك أول بأول
شوف المهام المتاحة للجنتك، انضم لها بضغطة، وتابع مسار كل مهمة من الانضمام إلى الاعتماد.

• سلّم شغلك من مكانك
اكتب وش أنجزت، وأرفق رابط أو صورة أو ملف، ويوصلك إشعار أول ما يراجعه قائد اللجنة.

• ساعاتك ومستواك
تابع ساعاتك المعتمدة هالترم، وارتقِ من البرونزي إلى الماسي، وشوف ترتيبك في لوحة الصدارة الشهرية.

• مجتمع النادي
تعرّف على قيادة النادي واللجان والفرق، وابحث عن أي عضو.

• إنجازاتك
اجمع الإنجازات مع كل مهمة وساعة تضيفها.

التطبيق للأعضاء فقط: تدخل بحساب بوابة النادي نفسه. ما عندك حساب؟ التسجيل في النادي من ftcksu.com/apply
```

### App Store
- **Name** (≤30): `FTC نادي تقنية المستقبل`
- **Subtitle** (≤30): `مهامك وساعاتك في النادي`
- **Promotional text** (≤170): `انضم لمهام لجنتك، سلّم شغلك، وتابع ساعاتك المعتمدة ومستواك في لوحة الصدارة. بنفس حساب البوابة.`
- **Description:** the Play full description above.
- **Keywords** (≤100, comma-separated): `نادي,تقنية,المستقبل,جامعة الملك سعود,تطوع,ساعات تطوعية,مهام,لجان,FTC,KSU`
- **Support URL:** `https://ftcksu.com`. **Privacy policy URL:** §2 step 7.
- **Sign-in required → demo account for Apple review:** create a real portal test account (not a member's) with a few tasks, and put its email and password in App Review Information. Apple rejects apps it can't log into.

## 5. Screenshots needed

Take them from a **preview build** (mock data, fictional names) on a real phone or simulator, in Arabic, with the status bar clean.

| Store | Required | Size |
|---|---|---|
| Google Play | 2–8 phone screenshots | portrait, 1080×1920 or larger (9:16) |
| Google Play | Feature graphic | 1024×500 (FTC logo on `#0C0A18` with the headline) |
| Google Play | App icon | 512×512 (from `assets/ftc-mark-white.svg`, `scripts/generate-icons.mjs`) |
| App Store | 3–10 iPhone screenshots | 6.9" (1320×2868) or 6.7" (1290×2796). iPad isn't needed (`supportsTablet: false`) |

Suggested set (same order in both stores):
1. Tasks home: «قد ما تعطي للنادي يعطيك» with the stats card and «مهامي»
2. Task detail with «مسار المهمة»
3. Join sheet «تنضم لهذي المهمة؟» or submit sheet «تسليم المهمة»
4. Leaderboard: league card and podium
5. Achievements grid
6. Community: «قيادة النادي» and committees
7. Notifications (if notifications ship in this release)

Optional: a short Arabic caption above each screenshot (e.g. «كل مهامك في مكان واحد»). Captions are marketing copy, so get them approved too.

## 6. Privacy policy (Arabic draft)

> Draft for the club to review and publish. Replace `[بريد النادي]` with the club's contact email.

> **⚠️ PDPL review required before publishing.** The club or the university must review this policy against Saudi Arabia's **Personal Data Protection Law (PDPL)** and its implementing regulations before it's published or submitted to either store. That includes the lawful basis for processing, the data subject rights and how to exercise them, retention periods, and transfers outside the Kingdom (Sentry and Expo's push service are hosted abroad). Don't publish this draft as-is.

```
سياسة الخصوصية لتطبيق نادي تقنية المستقبل (FTC)

آخر تحديث: [التاريخ]

تطبيق FTC مخصص لأعضاء نادي تقنية المستقبل بجامعة الملك سعود، ويعرض بياناتهم الموجودة أصلاً في بوابة النادي (ftcksu.com/portal). توضّح هذه السياسة البيانات التي يستخدمها التطبيق وسبب استخدامها.

١. البيانات التي نستخدمها
- بيانات حسابك في البوابة: الاسم، البريد الجامعي، الرقم الجامعي، الجنس (لعرض الصورة الرمزية وصياغة النصوص)، اللجنة والدور، النبذة والصورة الشخصية إن وُجدت.
- المهام والساعات: المهام التي انضممت لها، وتسليماتك (الملاحظة والروابط والملفات المرفقة)، وساعاتك المعتمدة، ومستواك، وإنجازاتك.
- رمز الإشعارات: عند تفعيل الإشعارات، يُرسل التطبيق رمز الإشعارات الخاص بجهازك ونوع النظام (أندرويد أو iOS) إلى البوابة لإرسال إشعارات النادي إليك. ويُحذف الرمز عند تسجيل الخروج.
- اسم الجهاز: يُرسل اسم جهازك عند تسجيل الدخول ليظهر لك في البوابة ضمن الأجهزة المسجّلة.
- تقارير الأعطال: عند حدوث عطل في التطبيق، يُرسَل تقرير تقني (طراز الجهاز، إصدار النظام والتطبيق، وتفاصيل الخطأ) إلى خدمة Sentry لإصلاحه. لا يتضمن التقرير اسمك ولا بريدك ولا محتوى طلباتك.

٢. ما لا نفعله
- لا نبيع بياناتك ولا نشاركها مع أي جهة لأغراض إعلانية، ولا يحتوي التطبيق على إعلانات أو أدوات تتبّع.
- لا يصل التطبيق إلى بصمتك أو وجهك: ميزة «الدخول بالبصمة» يتحقق منها نظام جوالك، والتطبيق يعرف النتيجة فقط.
- لا تظهر ساعات أي عضو لغيره إلا في قائمة أفضل 10 في لوحة الصدارة. صفحات اللجان والأعضاء تعرض المستوى فقط، وبيانات التواصل والساعات تظهر لصاحبها وقادته فقط.

٣. أين تُحفظ البيانات
- تُحفظ بياناتك في بوابة النادي، وهي نفس البيانات التي تراها في البوابة على الويب.
- يحتفظ التطبيق بنسخة مؤقتة على جهازك لعرضها دون اتصال، ويُحفظ رمز الدخول في التخزين الآمن للجهاز. وتُمسح كلها عند تسجيل الخروج.

٤. الصلاحيات
- الإشعارات: اختيارية، وتقدر توقفها من إعدادات التطبيق أو الجوال.
- الصور والملفات: فقط عندما تختار صورة لملفك أو مرفقاً لتسليمك.

٥. حقوقك
تعديل الاسم والرقم الجامعي واللجنة يتم عبر الموارد البشرية في البوابة، وتقدر تعدّل نبذتك وصورتك من التطبيق. لطلب حذف حسابك أو بياناتك، تواصل مع النادي على [بريد النادي].

٦. التواصل
لأي سؤال عن هذه السياسة: [بريد النادي]
```

### 6.1 Google Play: Data safety answers
| Data type | Collected | Shared | Purpose | Optional |
|---|---|---|---|---|
| Name, email, user IDs (university ID) | Yes | No | App functionality, account management | No |
| Photos (profile photo, attachments) | Yes | No | App functionality | Yes |
| Files and docs (submission attachments) | Yes | No | App functionality | Yes |
| Other user-generated content (submission notes, bio) | Yes | No | App functionality | Yes |
| Device or other IDs (push token) | Yes | No | App functionality (notifications) | Yes |
| Crash logs, diagnostics (Sentry) | Yes | No* | Analytics (app stability) | No |

\*Sentry is a service provider acting for the club, which Play doesn't count as "sharing". Data is encrypted in transit (HTTPS). Users can request deletion (§6 point ٥).

### 6.2 App Store: privacy "nutrition label"
- **Data linked to you:** Contact info (name, email), Identifiers (user ID), User content (photos, other user content), all for **App functionality**.
- **Data not linked to you:** Diagnostics (crash data), for **App functionality**. Device ID (push token), for **App functionality**.
- **Tracking:** none.

## 7. Accessibility (M7 baseline)

- Every button, link, switch and tab has a screen-reader label. `npm run smoke` checks 16 screens and fails on any unnamed control.
- Text follows the phone's font size up to **1.3×** (`MAX_FONT_SCALE` in `src/components/Txt.tsx`), so fixed-height controls don't clip. Check large-text layouts on web with `EXPO_PUBLIC_FONT_SCALE=1.3 npm run shot -- app <routes…>`.
- Still to check on devices: TalkBack/VoiceOver reading order in RTL, and that sheets trap focus.

## 8. Switching to the real API

Switching means one variable: set `EXPO_PUBLIC_API_BASE_URL`. First for `preview` (staging), and only after this checklist passes, for `production`. Use a real test account. Compare each response with `src/api/types.ts` (the source of truth in the app), and note every difference for the portal team.

**General (check once)**
- [ ] HTTPS only, and `Accept: application/json` gets JSON errors, never HTML redirects.
- [ ] Laravel error shapes:
  - `422` → `{message, errors{field:[…]}}`
  - `401` on an expired or revoked token → the app logs out
  - `403`, `409`, `429` as documented
- [ ] Dates are ISO 8601 **with a timezone offset**. Deadlines land on the right Riyadh day («آخر يوم» / «متأخرة» flip at midnight local time).
- [ ] Keys are camelCase. Arabic text arrives as UTF-8 (no escaped `\u` surprises in names).
- [ ] Rate limits: `throttle:5,1` on login/forgot, `60,1` elsewhere. Normal use (pull to refresh, opening tabs) never hits 429.
- [ ] Bump `buster` in `src/api/queryClient.ts` if any shape differs from the mocks, so old caches aren't read with new code.

**Phase 1 (read)**
- [ ] `POST /auth/login`: right credentials → `{token, user: Me}`. Wrong → 422 (banner «البريد أو كلمة المرور غير صحيحة»). 6 tries → 429. The token name shows the device name in the portal.
- [ ] `POST /auth/logout`: 204, and the token stops working (next call 401).
- [ ] `POST /auth/forgot`: 204 for any email (no account enumeration). The portal's reset email arrives. Throttled at 5/min.
- [ ] `GET /me`: every `Me` field, including `gender`, `committee {id,key,name}`, `role`, `league`, `termHours`, `pendingHours`, `tasksDone`, `achievements`, and typed `recentActivity` (M4).
- [ ] `GET /tasks`: `mine` / `available` / `stats`. Each `TaskSummary` has the M3 fields (`location`, `timeFrom`, `timeTo`, `creator` + gender, `submittedAt`, `people` id + gender). `available` only has my committee's open tasks.
- [ ] `GET /tasks/history?scope=term|all`: the totals match the portal.
- [ ] `GET /tasks/{id}` in each state (null, working, submitted, returned, approved):
  - `can*` flags match the portal's policies
  - `mySubmission` with `history`
  - `contact` only for joined members
  - `myJoinedAt`, `createdAt`
- [ ] `GET /community`: counts, `leadership` with `roleKind`, `committees` with `title`, `mixed`, `isMine`, `teams`.
- [ ] `GET /members?q=`: Arabic folding (أ/إ/آ→ا, ة→ه, ى→ي), partial matches, **no hours in the payload**.
- [ ] `GET /committees/{id}`: members sorted by league, **no hours**.
- [ ] `GET /members/{id}`: `bio`, latest 3 `achievements`, `achievementsUnlocked/Total`, **no hours, no contact data**.
- [ ] `GET /leaderboard`: top 10 of the month with hours, `myPosition` / `inRanking` when I'm outside the top 10, `hoursToNext` and `nextLeague` at the diamond edge (null).
- [ ] `GET /achievements`: all 9 ids, `progress` / `target` on locked ones, `nearest`.

**Phase 2 (turn a flag on only when all its rows pass)**
- [ ] Writes (`EXPO_PUBLIC_FLAG_WRITES`):
  - `POST /tasks/{id}/claim` → `Task` in `working`. Full or already joined → 409. Not my committee → 403.
  - `POST /tasks/{id}/leave` → 204, and the seat is freed in the portal.
  - `POST /tasks/{id}/submit` multipart from a phone:
    - note ≤500
    - `link`
    - `files[]` with a photo and a PDF, 10 MB limit → 422 above it
    - `keepFiles[]` when editing (M5)
    - The leader sees the submission in the portal. An event task has `canSubmit: false` until it's over.
  - `POST /me` with `_method=PATCH`: bio ≤160 and photo upload. Any other field is ignored. Returns `Me` with the new `photoUrl`.
- [ ] Notifications (`EXPO_PUBLIC_FLAG_NOTIFICATIONS`):
  - `POST /devices` stores the token, and `DELETE /devices/{token}` removes it (M6).
  - A test push from the portal for each type carries `data {notificationId, type, taskId?}` and opens the right screen.
  - `GET /notifications` is newest first. `nextCursor` pages, and the last page returns `nextCursor: null`.
  - `POST /notifications/read` with `{ids}` and with `{}` (all).
  - `GET/PATCH /me/notification-settings`: the portal respects each toggle (turn «تذكير قبل موعد المهمة» off → no reminder push).
