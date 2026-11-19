# Mobile API: `ftcksu.com/api/mobile/v1`

**Where it lives:** in the existing portal repo (Laravel + Inertia + React). It's a new versioned route group in `routes/api.php` with its own controllers. It reuses the portal's existing models, policies and validation, so there's no new database and no syncing. Members sign in with their portal account.

> The app repo (this one) only *consumes* this API. Building the Laravel side is a separate task in the portal repo, and the portal team has to review it.

## Laravel implementation notes (portal repo)
- **Auth:** Laravel Sanctum personal access tokens. Run `composer require laravel/sanctum` if it isn't installed yet. Add `HasApiTokens` to `User`.
  - Login checks the same credentials as the portal and returns a token named after the device.
  - Logout revokes the current token.
- **Routes:** `Route::prefix('mobile/v1')->name('mobile.')->group(...)`. Login and forgot are public. Everything else uses `auth:sanctum`.
- **Controllers:** `App\Http\Controllers\Mobile\*`. Keep them thin and call the same services and actions the Inertia controllers use. This matters most for claim, leave and submit, so the portal's business rules (capacity, committee, deadlines) apply in exactly one place.
- **Responses:** `App\Http\Resources\Mobile\*` JSON resources. Use the camelCase keys shown below, which already match the portal's Inertia props.
- **Authorization:** reuse the existing policies (`$this->authorize('claim', $task)`). Return the permission flags (`canClaim`, `canLeave`, `canSubmit`, `canEditSubmission`) so the app never has to work out rules itself.
- **Rate limits:** `throttle:5,1` on login and forgot, `throttle:60,1` elsewhere.
- **Errors:** the standard Laravel JSON format. `422` has `{message, errors{field:[..]}}`. `401` means the token is invalid, so the app logs out. `403` means a policy denied the action. `429` means throttled.
- **Tests:** add a feature test for every endpoint before Phase 2 writes go live.

## Phase 1: read-only
| Method | Path | Screen | Returns |
|---|---|---|---|
| POST | `/auth/login` | 01, 02 | `{token, user: Me}`. Body: `{email, password, deviceName}` |
| POST | `/auth/logout` | 30 | `204` |
| POST | `/auth/forgot` | 03, 29 | `204`. Triggers the portal's existing reset email |
| GET | `/me` | 06, 25 | `Me` |
| GET | `/tasks` | 06, 15 | `{mine: TaskSummary[], available: TaskSummary[], stats: {termHours, pendingHours, tasksDone}}` |
| GET | `/tasks/history?scope=term\|all` | 16 | `{tasksDone, approvedHours, items: [{id, title, committee, approvedAt, hours}]}` |
| GET | `/tasks/{id}` | 07, 09–13 | `Task` |
| GET | `/community` | 20, 21 | `{counts:{members, committees, teams}, leadership: MemberCard[], committees: Committee[]}` |
| GET | `/members?q=` | 21 | `MemberCard[]` (optional; the app can filter on the client side instead) |
| GET | `/committees/{id}` | 22 | `Committee & {description, leaders: MemberCard[], members: MemberCard[]}` |
| GET | `/members/{id}` | 23 | `MemberCard & {bio, achievements: Achievement[] (latest 3)}` |
| GET | `/leaderboard` | 24 | `{semester, myHours, myLeague, nextLeague, hoursToNext, monthlyTop: RankRow[10], myPosition, myMonthHours, inRanking}` |
| GET | `/achievements` | 26 | `{unlocked, total, nearest: {id, progress, target}, items: Achievement[]}` |

## Phase 2: writes
| Method | Path | Screen | Notes |
|---|---|---|---|
| POST | `/tasks/{id}/claim` | 08 | Returns `Task`. `409` if the task is full or the member already joined |
| POST | `/tasks/{id}/leave` | 14 | Returns `204` |
| POST | `/tasks/{id}/submit` | 11, 13 | multipart: `note` (≤500), `link?`, `files[]?` (≤10 MB each), `keepFiles[]?` (M5 proposal). Returns `Task` |
| GET | `/notifications?cursor=` | 17 | `{items: Notification[], nextCursor}` |
| POST | `/notifications/read` | 17 | `{ids?: number[]}`. Marks everything read if `ids` is empty |
| POST | `/devices` | 05 | `{expoPushToken, platform}`. Delete on logout |
| DELETE | `/devices/{expoPushToken}` | 30 | M6 proposal: called on logout, before `/auth/logout`. `204` |
| GET/PATCH | `/me/notification-settings` | 27 | `{newTasks, reviewResult, deadlineReminder, leagueUpdates}` (booleans) |
| PATCH | `/me` | 28 | multipart: `bio` (≤160), `photo?`. **Only these two fields.** Returns `Me`. Sent as `POST /me` with `_method=PATCH` (PHP doesn't parse multipart bodies on PATCH) |

Push notifications are sent by the portal through the Expo Push API whenever these events happen: task created for a committee, submission returned, submission approved, deadline in 3 days, achievement unlocked, league changed.

## Shapes (TypeScript)
```ts
type Gender = 'male' | 'female';
type TaskState = 'working' | 'submitted' | 'returned' | 'approved';
type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface Me {
  id: number; universityId: string; name: string; gender: Gender;
  email: string; committee: CommitteeRef; role: string; bio: string | null; photoUrl: string | null;
  league: League; termHours: number; pendingHours: number; tasksDone: number;
  achievements: Achievement[];
  recentActivity: Activity[];        // M4 proposal: typed entries (was { type: string; text; at })
}
interface CommitteeRef { id: number; key: string; name: string }
interface PersonRef { id: number; name: string; gender: Gender; role: string }
interface TaskSummary {
  id: number; title: string; description: string; committees: CommitteeRef[]; shared: boolean;
  hours: number; deadline: string; myState: TaskState | null; returnNote?: string | null;
  joinedCount: number; capacity: number | null;
  // M3 proposal (moved up from Task so cards can show them):
  location: string | null; timeFrom: string | null; timeTo: string | null; // "HH:mm" 24h
  creator: PersonRef;               // M3 proposal: + gender (avatar ring, «أنشأها/أنشأتها»)
  submittedAt: string | null;       // M3 proposal: «سلّمتها قبل ساعتين»
  people: { id: number; gender: Gender }[]; // M3 proposal: avatar stack on cards
}
interface Task extends TaskSummary {
  contact: { name: string; phone: string } | null;
  createdAt: string;                // M3 proposal: «… · قبل يومين»
  myJoinedAt: string | null;        // M3 proposal: stepper step 1 date
  attachments: FileRef[];
  people: { id: number; name: string; gender: Gender; me: boolean; state: TaskState }[];
  mySubmission: { note: string; link: string | null; files: FileRef[]; submittedAt: string;
                  returnedAt: string | null; returnNote: string | null; approvedAt: string | null;
                  history: { note: string; submittedAt: string }[] } | null;
  canClaim: boolean; canLeave: boolean; canSubmit: boolean; canEditSubmission: boolean;
}
interface FileRef { name: string; size: number; url: string }
interface MemberCard { id: number; name: string; gender: Gender; committee: CommitteeRef; role: string; league: League; photoUrl: string | null;
  roleKind: 'president'|'vice'|'leader'|'deputy'|'member' }   // M4 proposal: role colour + crown/star
interface Committee extends CommitteeRef { membersCount: number; leader: MemberCard | null; deputy: MemberCard | null; teams: { id: number; name: string; membersCount: number }[]; isMine: boolean;
  title: string;   // M4 proposal: «اللجنة التقنية» / «لجنة الفعاليات» (name stays «التقنية»)
  mixed: boolean } // M4 proposal: «طالبات وطلاب» badge
type Activity =    // M4 proposal
  | { type: 'task_approved'; text: string; at: string; hours: number }
  | { type: 'task_joined'; text: string; at: string }
  | { type: 'league_up'; text: string; at: string; league: League };
interface RankRow { position: number; id: number; name: string; gender: Gender; committee: CommitteeRef; hours: number }
interface Achievement { id: 'journey-start'|'first-task'|'tasks-5'|'tasks-25'|'hours-10'|'hours-50'|'hours-100'|'week-top1'|'leadership'; name: string; description: string; unlockedAt: string | null; progress?: number; target?: number }
interface Notification { id: number; type: 'task_returned'|'task_new'|'deadline'|'task_approved'|'achievement'|'league'; title: string; body: string; taskId?: number;
  league?: League;                   // M6 proposal: colour of a `league` item
  readAt: string | null; createdAt: string }
```

**Privacy:** `RankRow.hours` exists only on `/leaderboard`. `MemberCard` never includes hours.

**M6 proposals (notifications):**
- **`DELETE /devices/{expoPushToken}`** on logout. Also drop a device's push tokens when its Sanctum token is revoked, because a logout made offline can't send the DELETE.
- **Push payload `data`:** `{notificationId, type, taskId?}` on every push, so tapping it opens the right screen and marks that notification read.
- **`Notification.league?`** on `league` items (the league reached), so the icon uses that league's colour.
- `GET /notifications` returns newest first; `nextCursor` is opaque to the app.

**M5 proposals (writes):**
- **`keepFiles[]` on submit:** editing a submission (12) or resubmitting (13) opens the form with the files already uploaded. The app sends the `url`s of the ones the member kept as `keepFiles[]`; any others are deleted. New files go in `files[]` as before. (`FileRef` has no id, so the URL is the key. An `id` would be fine too.)
- **Event tasks:** a task with `timeFrom` is an event, and its `deadline` is the event's end. Before that, the app expects `canSubmit: false` and shows «التسليم بعد الفعالية» (screen 09). Please confirm this matches the portal's rule.
- **`POST /me` + `_method=PATCH`** for the multipart profile update (see the table), returning the updated `Me`.
- `claim` returns `409` for "full" and "already joined" alike; the app shows «ما بقى مكان في هالمهمة.» for both.

**M4 proposals:** `MemberCard.roleKind`, `Committee.title` and `.mixed`, typed `Me.recentActivity` (`Activity`), and on `GET /members/{id}` the counts `achievementsUnlocked` / `achievementsTotal` («7 من 9»). `GET /members?q=` is now used (server search with Arabic letter folding: أ/إ/آ→ا, ة→ه, ى→ي).

**M3 proposals (need the portal team's OK):** the task screens show data the original contract didn't carry. `TaskSummary` gains `location`, `timeFrom`, `timeTo`, `creator` (with `gender`), `submittedAt` and `people` (id + gender only); `Task` gains `createdAt` and `myJoinedAt`. The app's mocks already return them.
