// Dates as the designs write them: Gregorian months, Latin digits, Saudi tone.
// Hand-rolled (no Intl) so output is identical on Hermes, iOS, Android and web.
import { plural } from './format';

const MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];
const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY = 86_400_000;

const toDate = (d: string | Date) => (typeof d === 'string' ? new Date(d) : d);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** «19 نوفمبر» */
export const dayMonth = (d: string | Date) => {
  const x = toDate(d);
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
};

/** «الأربعاء» */
export const weekday = (d: string | Date) => WEEKDAYS[toDate(d).getDay()];

/** «الأربعاء 19 نوفمبر» */
export const weekdayDayMonth = (d: string | Date) => `${weekday(d)} ${dayMonth(d)}`;

/** «أكتوبر» (month only, achievements grid) */
export const monthName = (d: string | Date) => MONTHS[toDate(d).getMonth()];

function clock(hhmm: string): { h: number; m: number; pm: boolean } {
  const [h, m] = hhmm.split(':').map(Number);
  return { h: h % 12 === 0 ? 12 : h % 12, m: m || 0, pm: h >= 12 };
}
const hm = (c: { h: number; m: number }) =>
  c.m ? `${c.h}:${String(c.m).padStart(2, '0')}` : `${c.h}`;

/** «7 إلى 9 م», «11 ص إلى 1 م», «7:30 م». `from`/`to` are "HH:mm" (24h). */
export function timeRange(from: string | null, to: string | null): string | null {
  if (!from) return null;
  const a = clock(from);
  if (!to) return `${hm(a)} ${a.pm ? 'م' : 'ص'}`;
  const b = clock(to);
  if (a.pm === b.pm) return `${hm(a)} إلى ${hm(b)} ${b.pm ? 'م' : 'ص'}`;
  return `${hm(a)} ${a.pm ? 'م' : 'ص'} إلى ${hm(b)} ${b.pm ? 'م' : 'ص'}`;
}

/** Whole calendar days from today until `d` (0 = today, negative = past). */
export const daysUntil = (d: string | Date, now = new Date()) =>
  Math.round((startOfDay(toDate(d)) - startOfDay(now)) / DAY);

/**
 * Relative past time as in the designs: «الحين», «قبل دقيقة», «قبل ساعتين», «قبل 3 ساعات»,
 * «أمس», «قبل يومين», then the date («15 نوفمبر») after a week.
 */
export function ago(d: string | Date, now = new Date()): string {
  const x = toDate(d);
  const mins = Math.floor((now.getTime() - x.getTime()) / 60_000);
  if (mins < 1) return 'الحين';
  if (mins < 60) return `قبل ${plural(mins, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة')}`;
  const hours = Math.floor(mins / 60);
  const days = daysUntil(now, x); // calendar days between
  if (days === 0) return `قبل ${plural(hours, 'ساعة', 'ساعتين', 'ساعات', 'ساعة')}`;
  if (days === 1) return 'أمس';
  if (days < 7) return `قبل ${plural(days, 'يوم', 'يومين', 'أيام', 'يوماً')}`;
  return dayMonth(x);
}

/** Same as `ago`, but «اليوم» instead of hours/minutes (stepper sub-labels). */
export const dayAgo = (d: string | Date, now = new Date()) =>
  daysUntil(now, toDate(d)) === 0 ? 'اليوم' : daysUntil(now, toDate(d)) === 1 ? 'أمس' : dayMonth(d);
