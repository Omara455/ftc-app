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
  recentActivity: { type: string; text: string; at: string }[];
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
