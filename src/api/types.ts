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
