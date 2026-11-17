# Screens

There are 30 screens plus Foundations. Each one is an artboard in the design (https://claude.ai/artifact/UNWakGr4dtHSoDHWFqCSSG), titled with the same number, file `Name.dc.html`.
The links between `.dc.html` files are the navigation map. If an `<a href>` in artboard A points to B.dc.html, then tapping that element in A opens B.
**P1** means the screen works with Phase 1 (read-only) endpoints. **P2** means it needs a write endpoint, so build it behind a flag with mocks.

## Global shell
- The background is `assets/bg-app.svg`, full-bleed behind every tab screen. Login screens use `bg-login.svg`.
- **Tab bar:** a floating bar at inset 16, 24pt from the bottom, 66pt tall, radius 22, fill `navGlass`, 1px `line` border and `shadow.nav`.
  - The active tab gets a `brandTint` pill, the `highlight` colour and weight 700. Inactive tabs use `tabInactive`.
  - A 150pt gradient from `bg` to transparent sits behind the bar so content fades out under it.
  - Icons, from right to left: `SquareCheck` المهام · `Users` المجتمع · `Trophy` الصدارة · `User` حسابي.
- **Stack header:** 44×44 icon buttons with radius 14, `surface` fill and a `line` border. The title is 16/700 and centred. Back is an `ArrowRight` icon on the right.
- **Bottom sheets:** radius 28 on the top corners, a grab handle, and a dimmed screen behind. Used for join, leave, submit, change password and logout.

## 1. Sign-in: `(auth)`
| # | Screen | Route | Notes |
|---|---|---|---|
| 01 | Login | `/login` | Logo, «أهلاً فيك», email and password fields (eye toggle). «نسيت كلمة المرور؟» goes to 03. «تسجيل الدخول» calls `POST /auth/login`, then 05 on first login, otherwise Tasks. The footer links to `ftcksu.com/apply`. **P1** |
| 02 | Login error | same route, error state | A red banner above the fields; the password field gets a `danger` border. Show it on a 422 or 401 response. Throttling (429) uses the same banner with a "try again in a minute" message. **P1** |
| 03 | Forgot password | `/forgot` | Email field, «أرسل الرابط». Calls the portal's existing reset (`POST /auth/forgot`, which sends the Laravel reset email). **P1** |
| 04 | Link sent | `/forgot-sent` | Shows the masked email and the 60-minute expiry. «رجوع لتسجيل الدخول». «إعادة الإرسال» has a 0:45 cooldown timer. |
| 05 | Notification permission | `/notifications-permission` | Explains the value with sample notifications. «فعّل الإشعارات» asks for OS permission, then `POST /devices` (P2). «لاحقاً» skips. Show it only once. |

## 2. Task lifecycle: `(tabs)/tasks`
| # | Screen | Route | Notes |
|---|---|---|---|
| 06 | Tasks (home) | `/tasks` | Headline «قد ما **تعطي** للنادي **يعطيك**» with the committee subtitle. The bell opens 17. A stats card shows hours this term, pending and tasks done; tapping it opens 16. «مهامي» lists my tasks with state chips, and a returned task shows the leader's note inline. «متاحة للجنتك» lists available tasks with «انضم للمهمة». **P1** for reading |
| 07 | Available task | `/tasks/[id]` | Detail in its not-joined state: chips (shared, committees, hours), title, creator, a 2×2 info grid (date, hours, time, place), description, and the joined count over capacity. The sticky CTA «انضم للمهمة» opens 08. **P1** |
| 08 | Join confirm | sheet `/join/[id]` | Summary of the task and a note that you can leave from the task page. «تأكيد الانضمام» calls `POST /tasks/{id}/claim` and goes to 09. **P2** |
| 09 | Joined | `/tasks/[id]` | A green success toast, then the working state of the detail screen. |
| 10 | Working on it | `/tasks/[id]` | Chips plus «باقي 3 أيام». The info grid has a contact cell that opens a `tel:` link. A «مسار المهمة» stepper runs انضممت → التسليم → المراجعة → الاعتماد. «انسحاب» opens 14 and «سلّم المهمة» opens 11. **P1** for reading |
| 11 | Submit | sheet `/submit/[id]` | «وش أنجزت؟» with a 500-character limit, «رابط العمل» (optional), attachments with an add/remove list, and «إرسال للاعتماد». Calls `POST /tasks/{id}/submit` (multipart) and goes to 12. **P2** |
| 12 | Submitted | `/tasks/[id]` | A banner showing who reviews it. The stepper is at step 3 in `submitted` amber. «تسليمك» shows the note, link and files. «تعديل التسليم» is allowed while the state is still `submitted`. |
| 13 | Returned | `/tasks/[id]` | An orange card with the leader's `returnNote` and a «تسليمك السابق» history. The CTA «عدّل وأعد التسليم» opens 11 with the fields prefilled. |
| 14 | Leave confirm | sheet `/leave/[id]` | Destructive confirm «نعم، انسحب» calls `POST /tasks/{id}/leave`. «لا، أكمل المهمة» closes the sheet. **P2** |

## 3. Other task states
| # | Screen | Route | Notes |
|---|---|---|---|
| 15 | Empty | `/tasks` with no tasks | Zeroed stats, an inbox illustration and a three-step explainer of how hours are earned. |
| 16 | Completed history | `/tasks/history` | A segmented control (هالترم / كل الترمات), two stat tiles, and a list of approved tasks with `+N` hours in green. **P1** |
| 17 | Notifications | `/notifications` | Grouped into اليوم and هالأسبوع. Unread items get a `brandTintSoft` card and a `glow` dot. «تحديد الكل كمقروء». Each type deep-links: returned → 13, new task → 07, reminder → 10, approved → 16, achievement → 26, league → 24. **P2** |
| 18 | Loading | any tab | A skeleton that copies the real layout. Use one shimmer `Skeleton` primitive. |
| 19 | Offline | any tab | A banner «ما فيه اتصال بالإنترنت» with the last-updated time and «حاول مجدداً». Cached data still shows. Join and submit are replaced by a locked notice. Detect offline with `@react-native-community/netinfo`. |

## 4. Community: `(tabs)/community`
| # | Screen | Route | Notes |
|---|---|---|---|
| 20 | Community | `/community` | Header with member, committee and team counts. The search field opens 21. «قيادة النادي» shows two leader cards, which open 23. «اللجان والفرق» lists committees: my committee is highlighted, and expanding a row shows its teams as chips. Rows open 22. **P1** |
| 21 | Search | `/community/search` | Autofocused search, «إلغاء», a results count, and member rows showing committee and role. Search on the client side against the cached `/community` members list, or call `GET /members?q=`. |
| 22 | Committee | `/community/committee/[id]` | Hero card with the description, leaders, then a members list sorted by league. **Hours are never shown here.** |
| 23 | Member profile | `/community/member/[id]` | Avatar with gender ring, name, chips (committee, role, league), bio, and recent achievements. Has a privacy footnote. **No hours.** |

## 5. Leaderboard and account
| # | Screen | Route | Notes |
|---|---|---|---|
| 24 | Leaderboard | `/leaderboard` | «لوحة الصدارة» shows approved hours only. A league card shows my current league, five league steps, and a progress bar to the next league («باقي لك 16 ساعة للذهبي»). «أفضل 10 لشهر نوفمبر» has a top-3 podium (crown on 1st) and ranks 4–10. «ترتيبك هالشهر» is pinned at the bottom. **P1** |
| 25 | Account | `/account` | The gear opens 27. Shows the avatar, name, chips, and three stats. «الإنجازات» is a horizontal strip, and «عرض الكل» opens 26. «آخر النشاطات» follows. **P1** |
| 26 | Achievements | `/account/achievements` | Progress «حصلت على 4 من 9» and the nearest next achievement. A 3-column grid of all 9 achievements: unlocked ones show their date, and locked ones are dimmed with a lock and progress (`6 / 25`). **P1** |
| 27 | Settings | `/account/settings` | Sections الحساب, الإشعارات and عن التطبيق. The الحساب rows are edit profile → 28, change password → 29, and the biometric login toggle (stored locally). The الإشعارات section has 4 toggles (new tasks, approval or return, deadline reminder, league and leaderboard), which are P2 and saved server-side. The عن التطبيق section has «فتح البوابة على الويب» and the version. «تسجيل الخروج» opens 30. The screen scrolls. |
| 28 | Edit profile | `/account/edit-profile` | «حفظ» and «إلغاء» in the header. «تغيير الصورة» uses the image picker. The bio field has a 160-character limit. Name, university ID and committee are read-only, with a note that HR controls them. `PATCH /me`. **P2** |
| 29 | Change password | sheet | Sends a reset link to the account email. This is the same as 03, prefilled. |
| 30 | Logout | sheet | Explains that notifications stop on this device. «تسجيل الخروج» calls `POST /auth/logout`, clears SecureStore and the query cache, and goes to 01. |

## Shared components to build first
`Button` (primary, secondary, destructive, ghost; lock variant when offline) · `Card` · `Chip` · `StateChip` (dot + label using `taskState`) · `LeagueBadge` · `Avatar` (gender ring) · `TaskCard` (mine or available) · `InfoTile` · `Stepper` (4 steps; done, current, future, returned) · `ListRow` (icon tile, title, subtitle, chevron) · `Sheet` · `Toggle` · `Segmented` · `Skeleton` · `OfflineBanner` · `TabBar` · `Header`.
