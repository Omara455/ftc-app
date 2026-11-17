import type { Me } from '@/api/types';

// The signed-in member in the design (screens 01, 06, 25). Sample data only.
export const meFixture: Me = {
  id: 1,
  universityId: '443100000',
  name: 'عبدالله القحطاني',
  gender: 'male',
  email: 'abdullah@student.ksu.edu.sa',
  committee: { id: 1, key: 'tech', name: 'التقنية' },
  role: 'عضو',
  bio: null,
  photoUrl: null,
  league: 'silver',
  termHours: 14,
  pendingHours: 2,
  tasksDone: 6,
  achievements: [],
  recentActivity: [],
};

/** Mock credentials: any email + this password signs in (it's the value shown on screen 01). */
export const MOCK_PASSWORD = 'ftc-portal';
