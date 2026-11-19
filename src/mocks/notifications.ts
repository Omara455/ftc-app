// Notifications (screen 17) and notification settings (27), from the artboards.
// In-memory state like the task writes: mark-as-read and toggles last until reload.
import type { AppNotification, NotificationSettings, NotificationsPage } from '@/api/types';

const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
/** Today at hh:mm (the morning reminder), or an hour ago if that's still ahead. */
function todayAt(hh: number): string {
  const d = new Date();
  d.setHours(hh, 0, 0, 0);
  return (d.getTime() > Date.now() ? new Date(Date.now() - HOUR) : d).toISOString();
}

const seed = (): AppNotification[] => [
  {
    id: 6,
    type: 'task_returned',
    title: 'رجّع فيصل تسليمك',
    body: 'مراجعة نموذج التسجيل: أضف لقطات للشاشات الصغيرة',
    taskId: 102,
    readAt: null,
    createdAt: ago(HOUR),
  },
  {
    id: 5,
    type: 'task_new',
    title: 'نزلت مهمة جديدة للجنتك',
    body: 'تغطية تقنية لفعالية FTC Talks · 3 ساعات',
    taskId: 301,
    readAt: null,
    createdAt: ago(3 * HOUR),
  },
  {
    id: 4,
    type: 'deadline',
    title: 'تذكير: باقي 3 أيام',
    body: 'توثيق مسارات الواجهة البرمجية للتطبيق',
    taskId: 101,
    readAt: ago(2 * HOUR),
    createdAt: todayAt(9),
  },
  {
    id: 3,
    type: 'task_approved',
    title: 'اعتُمدت ساعاتك',
    body: 'تصميم بطاقة الفعالية · +3 ساعات',
    taskId: 201,
    readAt: ago(DAY),
    createdAt: ago(DAY),
  },
  {
    id: 2,
    type: 'achievement',
    title: 'إنجاز جديد: عشر ساعات',
    body: 'جمعت 10 ساعات تطوعية',
    readAt: ago(4 * DAY),
    createdAt: ago(4 * DAY),
  },
  {
    id: 1,
    type: 'league',
    title: 'وصلت للمستوى الفضي',
    body: 'باقي 16 ساعة للذهبي',
    league: 'silver',
    readAt: ago(4 * DAY),
    createdAt: ago(4 * DAY + HOUR),
  },
];

let items: AppNotification[] | null = null;
const all = () => (items ??= seed());

const PAGE = 20;

export function notificationsPage(cursor: string | null): NotificationsPage {
  const start = cursor ? Number(cursor) : 0;
  const page = all().slice(start, start + PAGE);
  const next = start + PAGE < all().length ? String(start + PAGE) : null;
  return { items: page, nextCursor: next };
}

export function markNotificationsRead(ids: number[] | undefined) {
  const now = new Date().toISOString();
  items = all().map((n) =>
    !n.readAt && (!ids || ids.length === 0 || ids.includes(n.id)) ? { ...n, readAt: now } : n,
  );
}

let settings: NotificationSettings = {
  newTasks: true,
  reviewResult: true,
  deadlineReminder: true,
  leagueUpdates: false,
};

export const notificationSettings = () => settings;

export function updateNotificationSettings(patch: Partial<NotificationSettings>) {
  settings = { ...settings, ...patch };
  return settings;
}
