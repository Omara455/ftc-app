// Community / leaderboard / achievements fixtures (docs/API.md + M4 proposals).
// Names and numbers are the sample data from the artboards.
import type {
  Achievement,
  AchievementsResponse,
  Committee,
  CommitteeDetail,
  CommitteeRef,
  CommunityResponse,
  Gender,
  League,
  LeaderboardResponse,
  MemberCard,
  MemberDetail,
  RankRow,
  RoleKind,
} from '@/api/types';

const ref = (id: number, key: string, name: string): CommitteeRef => ({ id, key, name });
export const committeesRef = {
  tech: ref(1, 'tech', 'التقنية'),
  media: ref(2, 'media', 'الإعلامية'),
  events: ref(3, 'events', 'الفعاليات'),
  hr: ref(4, 'hr', 'الموارد البشرية'),
  innovation: ref(5, 'innovation', 'الابتكار'),
  pr: ref(6, 'pr', 'العلاقات العامة'),
  projects: ref(7, 'projects', 'إدارة المشاريع'),
  finance: ref(8, 'finance', 'المالية'),
  board: ref(9, 'board', 'مجلس النادي'),
};
type Key = keyof typeof committeesRef;

let nextId = 100;
function member(
  name: string,
  gender: Gender,
  committee: Key,
  role: string,
  league: League,
  roleKind: RoleKind = 'member',
  id = nextId++,
): MemberCard {
  return {
    id,
    name,
    gender,
    committee: committeesRef[committee],
    role,
    league,
    photoUrl: null,
    roleKind,
  };
}

// The signed-in member (id 1 = meFixture)
const me = member('عبدالله القحطاني', 'male', 'tech', 'عضو', 'silver', 'member', 1);

const lama = member('لمى العتيبي', 'female', 'board', 'رئيسة النادي', 'diamond', 'president');
const turki = member('تركي العنزي', 'male', 'board', 'نائب الرئيسة', 'platinum', 'vice');
const faisal = member('فيصل الدوسري', 'male', 'tech', 'القائد', 'platinum', 'leader', 10);
const sara = member('سارة المطيري', 'female', 'tech', 'نائبة القائد', 'gold', 'deputy');

const techMembers: MemberCard[] = [
  member('محمد الشهري', 'male', 'tech', 'عضو', 'platinum'),
  member('ريم الزهراني', 'female', 'tech', 'عضو', 'gold'),
  me,
  member('عبدالعزيز القرني', 'male', 'tech', 'عضو', 'silver'),
  member('لينا الحربي', 'female', 'tech', 'عضو', 'bronze'),
];

const leaders: Partial<Record<Key, MemberCard>> = {
  tech: faisal,
  events: member('نورة الشهري', 'female', 'events', 'القائدة', 'gold', 'leader'),
  innovation: member('عبدالرحمن السبيعي', 'male', 'innovation', 'القائد', 'gold', 'leader'),
  media: member('هيفاء القحطاني', 'female', 'media', 'القائدة', 'platinum', 'leader', 11),
  pr: member('مشاعل العتيبي', 'female', 'pr', 'القائدة', 'silver', 'leader'),
  hr: member('سلمان الدوسري', 'male', 'hr', 'القائد', 'gold', 'leader'),
  projects: member('ماجد الغامدي', 'male', 'projects', 'القائد', 'silver', 'leader'),
  finance: member('دانة الحربي', 'female', 'finance', 'القائدة', 'silver', 'leader'),
};

function committee(
  key: Key,
  title: string,
  membersCount: number,
  extra: Partial<Committee> = {},
): Committee {
  return {
    ...committeesRef[key],
    title,
    membersCount,
    leader: leaders[key] ?? null,
    deputy: null,
    teams: [],
    isMine: false,
    mixed: false,
    ...extra,
  };
}

const committees: Committee[] = [
  committee('tech', 'اللجنة التقنية', 32, { isMine: true, deputy: sara }),
  committee('events', 'لجنة الفعاليات', 47, { mixed: true }),
  committee('innovation', 'لجنة الابتكار', 65),
  committee('media', 'اللجنة الإعلامية', 58, {
    teams: [
      { id: 1, name: 'التصميم', membersCount: 18 },
      { id: 2, name: 'التصوير والمونتاج', membersCount: 10 },
      { id: 3, name: 'كتابة المحتوى', membersCount: 27 },
      { id: 4, name: 'التسويق', membersCount: 1 },
    ],
  }),
  committee('pr', 'لجنة العلاقات العامة', 37),
  committee('hr', 'لجنة الموارد البشرية', 45, {
    teams: [
      { id: 5, name: 'شؤون الأعضاء', membersCount: 24 },
      { id: 6, name: 'التدريب', membersCount: 21 },
    ],
  }),
  committee('projects', 'لجنة إدارة المشاريع', 3),
  committee('finance', 'اللجنة المالية', 3),
];

export const communityFixture = (): CommunityResponse => ({
  counts: { members: 290, committees: 8, teams: 6 },
  leadership: [lama, turki],
  committees,
});

const descriptions: Partial<Record<Key, string>> = {
  tech: 'تطوير موقع النادي وبوابة الأعضاء وتطبيق الجوال، والدعم التقني للفعاليات والهاكاثونات.',
  media: 'تصميم هوية الفعاليات وتغطيتها بالصور والفيديو، وكتابة محتوى حسابات النادي.',
};

export function committeeFixture(id: number): CommitteeDetail | null {
  const c = committees.find((x) => x.id === id);
  if (!c) return null;
  const key = c.key as Key;
  const members =
    key === 'tech'
      ? techMembers
      : [
          member('بدر العمري', 'male', key, 'عضو', 'gold'),
          member('هيا الدوسري', 'female', key, 'عضو', 'silver'),
          member('سلطان الشمري', 'male', key, 'عضو', 'bronze'),
        ];
  return {
    ...c,
    description: descriptions[key] ?? 'لجنة من لجان النادي.',
    leaders: [c.leader, c.deputy].filter((m): m is MemberCard => m != null),
    members,
  };
}

// Everyone searchable (GET /members?q=)
export const allMembers: MemberCard[] = [
  lama,
  turki,
  faisal,
  sara,
  ...techMembers,
  ...(Object.values(leaders) as MemberCard[]).filter((m) => m !== faisal),
  member('سالم الحربي', 'male', 'events', 'عضو', 'silver'),
  member('سامي العتيبي', 'male', 'innovation', 'عضو', 'bronze'),
  member('ساره الغامدي', 'female', 'media', 'فريق التصميم', 'gold'),
  member('خالد الشمري', 'male', 'events', 'عضو', 'diamond'),
  member('نورة السالم', 'female', 'media', 'عضو', 'gold'),
];

const ach = (
  id: Achievement['id'],
  name: string,
  description: string,
  unlockedAt: string | null,
  progress?: number,
  target?: number,
): Achievement => ({ id, name, description, unlockedAt, progress, target });

const day = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

/** The signed-in member's 9 achievements (screen 26). */
export const myAchievements: Achievement[] = [
  ach('journey-start', 'بداية الرحلة', 'انضممت للنادي', day(45)),
  ach('first-task', 'أول مهمة', 'اعتُمدت أول مهمة لك', day(34)),
  ach('hours-10', 'عشر ساعات', '10 ساعات معتمدة', day(4)),
  ach('tasks-5', 'خمس مهام', '5 مهام معتمدة', day(14)),
  ach('tasks-25', 'ماراثون المهام', '25 مهمة معتمدة', null, 6, 25),
  ach('hours-50', 'خمسون ساعة', '50 ساعة معتمدة', null, 14, 50),
  ach('hours-100', 'مئة ساعة', '100 ساعة معتمدة', null, 14, 100),
  ach('week-top1', 'نجم الأسبوع', 'تصدّر أسبوعًا', null),
  ach('leadership', 'قيادة', 'دور قيادي', null),
];

export const achievementsFixture = (): AchievementsResponse => ({
  unlocked: myAchievements.filter((a) => a.unlockedAt).length,
  total: myAchievements.length,
  nearest: { id: 'hours-50', progress: 14, target: 50 },
  items: myAchievements,
});

export function memberFixture(id: number): MemberDetail | null {
  const m = allMembers.find((x) => x.id === id);
  if (!m) return null;
  const isSara = m === sara;
  return {
    ...m,
    bio: isSara ? 'مطوّرة واجهات، أحب أبني أشياء يستخدمها الناس.' : null,
    achievements: isSara
      ? [
          ach('leadership', 'قيادة', 'دور قيادي', day(60)),
          ach('week-top1', 'نجمة الأسبوع', 'تصدّرت أسبوعًا', day(20)),
          ach('hours-50', 'خمسون ساعة', '50 ساعة معتمدة', day(9)),
        ]
      : [ach('journey-start', 'بداية الرحلة', 'انضم للنادي', day(30))],
    achievementsUnlocked: isSara ? 7 : 1,
    achievementsTotal: 9,
  };
}

const row = (position: number, name: string, gender: Gender, key: Key, hours: number): RankRow => ({
  position,
  id: 200 + position,
  name,
  gender,
  committee: committeesRef[key],
  hours,
});

export const leaderboardFixture = (): LeaderboardResponse => ({
  semester: 'الفصل الأول 1448',
  myHours: 14,
  myLeague: 'silver',
  nextLeague: 'gold',
  hoursToNext: 16,
  monthlyTop: [
    row(1, 'خالد الشمري', 'male', 'events', 22),
    row(2, 'ريم الزهراني', 'female', 'tech', 19),
    row(3, 'نورة السالم', 'female', 'media', 17),
    row(4, 'سلمان القرني', 'male', 'events', 15),
    row(5, 'هيا الدوسري', 'female', 'media', 14),
    row(6, 'بدر العمري', 'male', 'hr', 13),
    row(7, 'لينا الحربي', 'female', 'tech', 12),
    row(8, 'سلطان الشمري', 'male', 'innovation', 11),
    row(9, 'مشاعل العتيبي', 'female', 'pr', 11),
    row(10, 'ماجد الغامدي', 'male', 'projects', 10),
  ],
  myPosition: 18,
  myMonthHours: 6,
  inRanking: false,
});
