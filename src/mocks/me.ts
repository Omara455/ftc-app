import type { Me } from '@/api/types';

import { myAchievements } from './community';

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const DAY = 86_400_000;

// The signed-in member in the design (screens 01, 06, 25). Sample data only.
export const meFixture: Me = {
  id: 1,
  universityId: '443100000',
  name: 'عبدالله القحطاني',
  gender: 'male',
  email: 'abdullah@student.ksu.edu.sa',
  committee: { id: 1, key: 'tech', name: 'التقنية' },
  role: 'عضو',
  bio: 'أطوّر تطبيقات الجوال، وأحب الهاكاثونات.',
  photoUrl: null,
  league: 'silver',
  termHours: 14,
  pendingHours: 2,
  tasksDone: 6,
  achievements: myAchievements,
  recentActivity: [
    { type: 'task_approved', text: 'اعتُمدت مهمة تصميم بطاقة FTC Talks', at: ago(DAY), hours: 3 },
    { type: 'task_joined', text: 'انضممت لمهمة توثيق مسارات الواجهة', at: ago(2 * DAY) },
    { type: 'league_up', text: 'وصلت للمستوى الفضي', at: ago(7 * DAY), league: 'silver' },
  ],
};

/** Mock credentials: any email + this password signs in (it's the value shown on screen 01). */
export const MOCK_PASSWORD = 'ftc-portal';
