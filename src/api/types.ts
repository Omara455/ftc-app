// Response shapes of /api/mobile/v1 — copied from docs/API.md. Keep them in sync.
export type Gender = 'male' | 'female';
export type TaskState = 'working' | 'submitted' | 'returned' | 'approved';
export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface CommitteeRef {
  id: number;
  key: string;
  name: string;
}

export interface Achievement {
  id:
    | 'journey-start'
    | 'first-task'
    | 'tasks-5'
    | 'tasks-25'
    | 'hours-10'
    | 'hours-50'
    | 'hours-100'
    | 'week-top1'
    | 'leadership';
  name: string;
  description: string;
  unlockedAt: string | null;
  progress?: number;
  target?: number;
}

export interface Me {
  id: number;
  universityId: string;
  name: string;
  gender: Gender;
  email: string;
  committee: CommitteeRef;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  league: League;
  termHours: number;
  pendingHours: number;
  tasksDone: number;
  achievements: Achievement[];
  /** M4 proposal: typed entries (see `Activity`). */
  recentActivity: Activity[];
}

export interface LoginResponse {
  token: string;
  user: Me;
}

// ── Tasks ────────────────────────────────────────────────────────────────────
// Fields marked "M3 proposal" are not in the original contract: the designs show
// them, so they were added to docs/API.md for the portal team to confirm.

export interface PersonRef {
  id: number;
  name: string;
  gender: Gender;
  role: string;
}

export interface TaskSummary {
  id: number;
  title: string;
  description: string;
  committees: CommitteeRef[];
  shared: boolean;
  hours: number;
  /** ISO date-time. Also the event date shown on cards and in the info grid. */
  deadline: string;
  myState: TaskState | null;
  returnNote?: string | null;
  joinedCount: number;
  capacity: number | null;
  /** M3 proposal: card «الأربعاء 19 نوفمبر · 7 إلى 9 م» and «مسرح كلية علوم الحاسب». */
  timeFrom: string | null; // "HH:mm", 24h
  timeTo: string | null;
  location: string | null;
  /** M3 proposal: return-note author on «مهامي» cards («فيصل: …»). */
  creator: PersonRef;
  /** M3 proposal: «سلّمتها قبل ساعتين» on «مهامي» cards. */
  submittedAt: string | null;
  /** M3 proposal: avatar stack on available cards (no hours, privacy rule 6). */
  people: { id: number; gender: Gender }[];
}

export interface FileRef {
  name: string;
  size: number;
  url: string;
}

export interface Task extends TaskSummary {
  contact: { name: string; phone: string } | null;
  /** M3 proposal: «أنشأها فيصل · … · قبل يومين». */
  createdAt: string;
  /** M3 proposal: first step of «مسار المهمة» («انضممت · 18 نوفمبر»). */
  myJoinedAt: string | null;
  attachments: FileRef[];
  people: { id: number; name: string; gender: Gender; me: boolean; state: TaskState }[];
  mySubmission: {
    note: string;
    link: string | null;
    files: FileRef[];
    submittedAt: string;
    returnedAt: string | null;
    returnNote: string | null;
    approvedAt: string | null;
    history: { note: string; submittedAt: string }[];
  } | null;
  canClaim: boolean;
  canLeave: boolean;
  canSubmit: boolean;
  canEditSubmission: boolean;
}

export interface TasksResponse {
  mine: TaskSummary[];
  available: TaskSummary[];
  stats: { termHours: number; pendingHours: number; tasksDone: number };
}

export type HistoryScope = 'term' | 'all';

export interface TaskHistoryResponse {
  tasksDone: number;
  approvedHours: number;
  items: {
    id: number;
    title: string;
    committee: CommitteeRef;
    approvedAt: string;
    hours: number;
  }[];
}

// ── Community, members, leaderboard, achievements (M4) ───────────────────────
// "M4 proposal" fields aren't in the original contract; the designs need them.

/** M4 proposal: tells the app how to colour a role (amber leads, blue deputies). */
export type RoleKind = 'president' | 'vice' | 'leader' | 'deputy' | 'member';

export interface MemberCard {
  id: number;
  name: string;
  gender: Gender;
  committee: CommitteeRef;
  role: string;
  league: League;
  photoUrl: string | null;
  /** M4 proposal */
  roleKind: RoleKind;
}

export interface Committee extends CommitteeRef {
  /** M4 proposal: display name («اللجنة التقنية», «لجنة الفعاليات»); `name` stays short («التقنية»). */
  title: string;
  membersCount: number;
  leader: MemberCard | null;
  deputy: MemberCard | null;
  teams: { id: number; name: string; membersCount: number }[];
  isMine: boolean;
  /** M4 proposal: «طالبات وطلاب» badge on mixed committees. */
  mixed: boolean;
}

export interface CommunityResponse {
  counts: { members: number; committees: number; teams: number };
  leadership: MemberCard[];
  committees: Committee[];
}

export interface CommitteeDetail extends Committee {
  description: string;
  leaders: MemberCard[];
  /** Sorted by league (highest first). Never hours (privacy rule 6). */
  members: MemberCard[];
}

export interface MemberDetail extends MemberCard {
  bio: string | null;
  /** Latest 3. */
  achievements: Achievement[];
  /** M4 proposal: «7 من 9» next to «آخر إنجازاتها». */
  achievementsUnlocked: number;
  achievementsTotal: number;
}

export interface RankRow {
  position: number;
  id: number;
  name: string;
  gender: Gender;
  committee: CommitteeRef;
  hours: number;
}

export interface LeaderboardResponse {
  semester: string;
  myHours: number;
  myLeague: League;
  nextLeague: League | null;
  hoursToNext: number | null;
  monthlyTop: RankRow[];
  myPosition: number | null;
  myMonthHours: number;
  inRanking: boolean;
}

export interface AchievementsResponse {
  unlocked: number;
  total: number;
  nearest: { id: Achievement['id']; progress: number; target: number } | null;
  items: Achievement[];
}

// ── Writes (Phase 2, M5) ─────────────────────────────────────────────────────

/** A file picked on the device, not uploaded yet. `file` is the browser File on web. */
export interface LocalFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  file?: Blob;
}

/** POST /tasks/{id}/submit (multipart). */
export interface SubmitInput {
  note: string;
  link: string | null;
  /** New files, sent as `files[]`. */
  files: LocalFile[];
  /** M5 proposal: URLs of already-submitted files to keep when editing (`keepFiles[]`). */
  keepFiles: string[];
}

/** PATCH /me (multipart): only these two fields. */
export interface ProfileInput {
  bio: string;
  photo: LocalFile | null;
}

/** M4 proposal: typed activity entries for «آخر النشاطات» (icon + «+3 ساعات»). */
export type Activity =
  | { type: 'task_approved'; text: string; at: string; hours: number }
  | { type: 'task_joined'; text: string; at: string }
  | { type: 'league_up'; text: string; at: string; league: League };
