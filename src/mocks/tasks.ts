// Task fixtures matching docs/API.md (incl. the M3 proposals). Sample data from the
// artboards; dates are relative to "now" so «باقي 3 أيام» etc. stay true.
import type {
  CommitteeRef,
  FileRef,
  PersonRef,
  Task,
  TaskHistoryResponse,
  TasksResponse,
  TaskSummary,
} from '@/api/types';

const tech: CommitteeRef = { id: 1, key: 'tech', name: 'التقنية' };
const media: CommitteeRef = { id: 2, key: 'media', name: 'الإعلامية' };
const events: CommitteeRef = { id: 3, key: 'events', name: 'الفعاليات' };
const hr: CommitteeRef = { id: 4, key: 'hr', name: 'الموارد البشرية' };

const faisal: PersonRef = {
  id: 10,
  name: 'فيصل الدوسري',
  gender: 'male',
  role: 'قائد اللجنة التقنية',
};
const haifa: PersonRef = {
  id: 11,
  name: 'هيفاء العمري',
  gender: 'female',
  role: 'قائدة الإعلامية',
};

/** Local date `days` from today at hh:mm, as ISO. */
function at(days: number, hh = 12, mm = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const base = {
  shared: false,
  returnNote: null,
  timeFrom: null,
  timeTo: null,
  location: null,
  submittedAt: null,
  people: [],
  contact: null,
  myJoinedAt: null,
  attachments: [],
  mySubmission: null,
  canClaim: false,
  canLeave: false,
  canSubmit: false,
  canEditSubmission: false,
} satisfies Partial<Task>;

const tasks: Record<number, Task> = {
  // 10 · working on it
  101: {
    ...base,
    id: 101,
    title: 'توثيق مسارات الواجهة البرمجية للتطبيق',
    description:
      'نحتاج توثيق أول مسارات /api/mobile/v1: الطلب والاستجابة لكل مسار مع مثال، ورموز الأخطاء. التسليم برابط لملف التوثيق على GitHub.',
    committees: [tech],
    hours: 4,
    deadline: at(3, 23, 59),
    myState: 'working',
    joinedCount: 2,
    capacity: 3,
    location: 'عن بُعد',
    creator: faisal,
    createdAt: at(-2, 10),
    myJoinedAt: at(-1, 18),
    contact: { name: 'فيصل', phone: '0500000000' },
    people: [
      { id: 1, name: 'عبدالله القحطاني', gender: 'male', me: true, state: 'working' },
      { id: 21, name: 'سلمان العتيبي', gender: 'male', me: false, state: 'working' },
    ],
    canLeave: true,
    canSubmit: true,
  },
  // 13 · returned
  102: {
    ...base,
    id: 102,
    title: 'مراجعة نموذج التسجيل على الجوال',
    description: 'جرّب نموذج التسجيل الجديد على أكثر من جهاز، واكتب الملاحظات مع لقطات الشاشة.',
    committees: [tech],
    hours: 2,
    deadline: at(2, 23, 59),
    myState: 'returned',
    returnNote: 'الشغل ممتاز، بس أضف لقطات للشاشات الصغيرة وارفعها من جديد عشان نعتمدها.',
    joinedCount: 1,
    capacity: 2,
    location: 'عن بُعد',
    creator: faisal,
    createdAt: at(-6, 9),
    myJoinedAt: at(-5, 20),
    submittedAt: at(-2, 21),
    people: [{ id: 1, name: 'عبدالله القحطاني', gender: 'male', me: true, state: 'returned' }],
    mySubmission: {
      note: 'اختبرت النموذج على آيفون وأندرويد، والملاحظات في الملف.',
      link: null,
      files: [{ name: 'registration-review.pdf', size: 840_000, url: 'https://example.com/r.pdf' }],
      submittedAt: at(-2, 21),
      returnedAt: minutesAgo(60),
      returnNote: 'الشغل ممتاز، بس أضف لقطات للشاشات الصغيرة وارفعها من جديد عشان نعتمدها.',
      approvedAt: null,
      history: [],
    },
    canSubmit: true,
  },
  // 12 · submitted, waiting for approval
  103: {
    ...base,
    id: 103,
    title: 'تصميم بطاقة FTC Talks',
    description: 'بطاقة للفعالية بمقاسين: منشور وقصة، بهوية النادي.',
    committees: [media],
    hours: 2,
    deadline: at(4, 23, 59),
    myState: 'submitted',
    joinedCount: 1,
    capacity: 1,
    location: 'عن بُعد',
    creator: haifa,
    createdAt: at(-4, 11),
    myJoinedAt: at(-3, 19),
    submittedAt: minutesAgo(1),
    people: [{ id: 1, name: 'عبدالله القحطاني', gender: 'male', me: true, state: 'submitted' }],
    mySubmission: {
      note: 'صممت البطاقة بالمقاسين، وأرفقت الملفات المفتوحة مع نسخة للطباعة.',
      link: 'figma.com/file/ftc-talks-card',
      files: [{ name: 'ftc-talks-card.pdf', size: 1_200_000, url: 'https://example.com/c.pdf' }],
      submittedAt: minutesAgo(1),
      returnedAt: null,
      returnNote: null,
      approvedAt: null,
      history: [],
    },
    canEditSubmission: true,
  },
  // 07 · available
  301: {
    ...base,
    id: 301,
    title: 'تغطية تقنية لفعالية FTC Talks',
    description:
      'تجهيز البث المباشر والعرض على شاشات المسرح، واختبار الميكروفونات، ودعم المتحدثين في ربط أجهزتهم قبل الجلسة بنصف ساعة.',
    committees: [tech, media],
    shared: true,
    hours: 3,
    deadline: at(2, 21),
    myState: null,
    joinedCount: 2,
    capacity: 4,
    timeFrom: '19:00',
    timeTo: '21:00',
    location: 'مسرح كلية علوم الحاسب',
    creator: haifa,
    createdAt: minutesAgo(180),
    people: [
      { id: 21, name: 'سلمان العتيبي', gender: 'male', me: false, state: 'working' },
      { id: 22, name: 'محمد الشهري', gender: 'male', me: false, state: 'working' },
    ],
    canClaim: true,
  },
  302: {
    ...base,
    id: 302,
    title: 'تحديث صفحة الخريجين في موقع النادي',
    description: 'إضافة الدفعة الجديدة وتحديث صور الخريجين وروابط حساباتهم.',
    committees: [tech],
    hours: 5,
    deadline: at(6, 23, 59),
    myState: null,
    joinedCount: 0,
    capacity: 2,
    location: 'عن بُعد',
    creator: faisal,
    createdAt: at(-1, 14),
    canClaim: true,
  },
  303: {
    ...base,
    id: 303,
    title: 'تصوير لقاء الأعضاء الجدد',
    description: 'تصوير اللقاء وتجهيز ألبوم للنشر خلال يومين.',
    committees: [media],
    hours: 2,
    deadline: at(9, 20),
    myState: null,
    joinedCount: 1,
    capacity: 3,
    timeFrom: '18:00',
    timeTo: '20:00',
    location: 'قاعة النشاط الطلابي',
    creator: haifa,
    createdAt: at(-1, 9),
    people: [{ id: 23, name: 'ريم الزهراني', gender: 'female', me: false, state: 'working' }],
    canClaim: true,
  },
};

function summary(t: Task): TaskSummary {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    committees: t.committees,
    shared: t.shared,
    hours: t.hours,
    deadline: t.deadline,
    myState: t.myState,
    returnNote: t.returnNote,
    joinedCount: t.joinedCount,
    capacity: t.capacity,
    timeFrom: t.timeFrom,
    timeTo: t.timeTo,
    location: t.location,
    creator: t.creator,
    submittedAt: t.submittedAt,
    people: t.people.map(({ id, gender }) => ({ id, gender })),
  };
}

// Order of the fixtures; which list a task lands in follows its (mutable) state.
const ORDER = [101, 102, 103, 301, 302, 303];

export const tasksFixture = (): TasksResponse => ({
  mine: ORDER.filter((id) => tasks[id].myState && tasks[id].myState !== 'approved').map((id) =>
    summary(tasks[id]),
  ),
  available: ORDER.filter((id) => tasks[id].myState === null && tasks[id].canClaim).map((id) =>
    summary(tasks[id]),
  ),
  stats: {
    termHours: 14,
    pendingHours: ORDER.filter((id) => tasks[id].myState === 'submitted').reduce(
      (sum, id) => sum + tasks[id].hours,
      0,
    ),
    tasksDone: 6,
  },
});

// ── Writes (M5): the mock keeps state in memory until the app reloads ────────

const ME = { id: 1, name: 'عبدالله القحطاني', gender: 'male' as const };

/** An event task (has a time slot) can only be submitted once the event is over. */
const eventOver = (t: Task) => t.timeFrom == null || Date.now() >= new Date(t.deadline).getTime();

export type MockWriteResult = { status: number; json: unknown };

export function claimTask(id: number): MockWriteResult {
  const t = tasks[id];
  if (!t) return { status: 404, json: { message: 'Not found.' } };
  if (t.myState !== null || (t.capacity != null && t.joinedCount >= t.capacity))
    return { status: 409, json: { message: 'Task is full or already joined.' } };
  tasks[id] = {
    ...t,
    myState: 'working',
    myJoinedAt: new Date().toISOString(),
    joinedCount: t.joinedCount + 1,
    people: [{ ...ME, me: true, state: 'working' }, ...t.people],
    canClaim: false,
    canLeave: true,
    canSubmit: eventOver(t),
  };
  return { status: 200, json: tasks[id] };
}

export function leaveTask(id: number): MockWriteResult {
  const t = tasks[id];
  if (!t) return { status: 404, json: { message: 'Not found.' } };
  if (!t.canLeave) return { status: 403, json: { message: 'This action is unauthorized.' } };
  tasks[id] = {
    ...t,
    myState: null,
    myJoinedAt: null,
    joinedCount: Math.max(0, t.joinedCount - 1),
    people: t.people.filter((p) => !p.me),
    mySubmission: null,
    submittedAt: null,
    canClaim: true,
    canLeave: false,
    canSubmit: false,
    canEditSubmission: false,
  };
  return { status: 204, json: null };
}

export function submitTask(
  id: number,
  input: { note: string; link: string | null; files: FileRef[]; keepFiles: string[] },
): MockWriteResult {
  const t = tasks[id];
  if (!t) return { status: 404, json: { message: 'Not found.' } };
  if (!t.canSubmit && !t.canEditSubmission)
    return { status: 403, json: { message: 'This action is unauthorized.' } };
  const note = input.note.trim();
  if (!note || note.length > 500) {
    return {
      status: 422,
      json: { message: 'Invalid.', errors: { note: ['اكتب وش أنجزت (500 حرف بالكثير).'] } },
    };
  }
  const now = new Date().toISOString();
  const prev = t.mySubmission;
  const kept = (prev?.files ?? []).filter((f) => input.keepFiles.includes(f.url));
  tasks[id] = {
    ...t,
    myState: 'submitted',
    submittedAt: now,
    returnNote: null,
    people: t.people.map((p) => (p.me ? { ...p, state: 'submitted' } : p)),
    mySubmission: {
      note,
      link: input.link,
      files: [...kept, ...input.files],
      submittedAt: now,
      returnedAt: null,
      returnNote: null,
      approvedAt: null,
      history:
        prev && t.myState === 'returned'
          ? [{ note: prev.note, submittedAt: prev.submittedAt }, ...prev.history]
          : (prev?.history ?? []),
    },
    canLeave: false,
    canSubmit: false,
    canEditSubmission: true,
  };
  return { status: 200, json: tasks[id] };
}

/** Screen 15: a member with nothing yet this term. */
export const emptyTasksFixture = (): TasksResponse => ({
  mine: [],
  available: [],
  stats: { termHours: 0, pendingHours: 0, tasksDone: 0 },
});

export const taskFixture = (id: number): Task | null => tasks[id] ?? null;

const termItems: TaskHistoryResponse['items'] = [
  {
    id: 201,
    title: 'تصميم بطاقة فعالية FTC Talks',
    committee: media,
    approvedAt: at(-1),
    hours: 3,
  },
  { id: 202, title: 'تجهيز معمل الهاكاثون', committee: tech, approvedAt: at(-7), hours: 4 },
  { id: 203, title: 'مراجعة محتوى صفحة الفعاليات', committee: tech, approvedAt: at(-14), hours: 2 },
  { id: 204, title: 'إعداد استبيان رضا الأعضاء', committee: hr, approvedAt: at(-20), hours: 2 },
  {
    id: 205,
    title: 'دعم التسجيل في Startup Fair',
    committee: events,
    approvedAt: at(-27),
    hours: 2,
  },
  {
    id: 206,
    title: 'ترتيب ملفات اللجنة على Drive',
    committee: tech,
    approvedAt: at(-34),
    hours: 1,
  },
];
const olderItems: TaskHistoryResponse['items'] = [
  { id: 207, title: 'تنظيم ورشة Git للمبتدئين', committee: tech, approvedAt: at(-120), hours: 5 },
  { id: 208, title: 'تغطية يوم المهنة', committee: media, approvedAt: at(-140), hours: 3 },
];

export function historyFixture(scope: 'term' | 'all'): TaskHistoryResponse {
  const items = scope === 'all' ? [...termItems, ...olderItems] : termItems;
  return {
    tasksDone: items.length,
    approvedHours: items.reduce((sum, i) => sum + i.hours, 0),
    items,
  };
}
