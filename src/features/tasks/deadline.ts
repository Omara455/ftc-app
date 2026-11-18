// Deadline label for tasks still in my hands (working, or returned to me to fix).
//   ≥ 1 day left → «باقي 3 أيام» (amber) · due today → «آخر يوم» (amber)
//   past due     → «متأخرة» (danger red)
// Approved / submitted tasks and available ones show no deadline label.
import type { TaskState } from '@/api/types';
import { ar } from '@/i18n/ar';
import { daysUntil } from '@/i18n/dates';
import { daysLeftLabel } from '@/i18n/format';

export type DeadlineInfo = { label: string; overdue: boolean };

export function deadlineInfo(
  deadline: string,
  state: TaskState | null,
  now = new Date(),
): DeadlineInfo | null {
  if (state !== 'working' && state !== 'returned') return null;
  const days = daysUntil(deadline, now);
  if (days >= 1) return { label: daysLeftLabel(days), overdue: false };
  // Same calendar day: overdue only once the deadline time itself has passed.
  if (days === 0 && new Date(deadline).getTime() >= now.getTime()) {
    return { label: ar.task.dueToday, overdue: false };
  }
  return { label: ar.task.overdue, overdue: true };
}
