// Building blocks of the task detail screen (07, 10, 12, 13). The screen picks which
// blocks to show from `myState` and the `can*` flags (PLAN: one screen, not one per state).
import {
  Calendar,
  Check,
  FileText,
  Hourglass,
  Link as LinkIcon,
  RotateCcw,
} from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import type { FileRef, Task } from '@/api/types';
import { Avatar } from '@/components/Avatar';
import { Chip, CommitteeChip, DeadlineChip, SharedChip, StateChip } from '@/components/Chip';
import { ProgressBar } from '@/components/ProgressBar';
import { Skeleton } from '@/components/Skeleton';
import type { Step } from '@/components/Stepper';
import { Ltr, Txt } from '@/components/Txt';
import { deadlineInfo } from '@/features/tasks/deadline';
import { ar } from '@/i18n/ar';
import { isolateLatin } from '@/i18n/bidi';
import { ago, dayAgo, dayMonth, timeRange, weekday, weekdayDayMonth } from '@/i18n/dates';
import { fileSize, firstName, hoursLabel, hoursUnit, listAnd, seatsLeftLabel } from '@/i18n/format';
import { color, hue, radius, taskState, tint } from '@/theme/tokens';

const t = ar.task;

// ── Chips · title · creator ─────────────────────────────────────────────────

export function TaskHeading({
  task,
  showCreator,
  event,
}: {
  task: Task;
  showCreator: boolean;
  /** 09: joined event — shared, state and hours chips; the date line below replaces the rest. */
  event?: boolean;
}) {
  const deadline = event ? null : deadlineInfo(task.deadline, task.myState);
  return (
    <View style={styles.heading}>
      <View style={styles.chips}>
        {task.shared ? <SharedChip label={t.shared} /> : null}
        {event
          ? null
          : task.committees.map((c) => (
              <CommitteeChip key={c.id} label={c.name} committeeKey={c.key} />
            ))}
        {task.myState ? <StateChip state={task.myState} /> : null}
        {deadline ? <DeadlineChip label={deadline.label} overdue={deadline.overdue} /> : null}
        {event ? (
          <Chip
            label={hoursLabel(task.hours)}
            fg={color.highlight}
            bg={tint(color.accent, 0.14)}
            size={12.5}
            bold
          />
        ) : null}
      </View>
      <Txt size={23} leading={1.45} weight="extrabold" accessibilityRole="header">
        {task.title}
      </Txt>
      {showCreator ? (
        <View style={styles.creator}>
          <Avatar gender={task.creator.gender} size={28} />
          <Txt variant="meta" color={color.inkSoft} style={styles.flex}>
            {t.createdBy(task.creator.gender)}{' '}
            <Txt variant="meta" weight="bold" color={color.inkSecondary}>
              {firstName(task.creator.name)}
            </Txt>
            {` · ${task.creator.role} · ${ago(task.createdAt)}`}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

// ── 12: «وصل تسليمك لفيصل» ──────────────────────────────────────────────────

export function SubmittedBanner({
  reviewer,
  gender,
}: {
  reviewer: string;
  gender: 'male' | 'female';
}) {
  return (
    <View accessibilityRole="summary" style={styles.submitted}>
      <View style={styles.submittedIcon}>
        <Hourglass size={15} color={color.bg} strokeWidth={2.6} />
      </View>
      <View style={styles.flex}>
        <Txt size={14} weight="bold" color={hue.amber.s200}>
          {t.reachedReviewer(reviewer)}
        </Txt>
        <Txt size={12.5} weight="regular" color={hue.amber.s300}>
          {t.notifyOnReview(gender)}
        </Txt>
      </View>
    </View>
  );
}

// ── 13: leader's return note ────────────────────────────────────────────────

export function ReturnNoteCard({ task }: { task: Task }) {
  const sub = task.mySubmission;
  const note = sub?.returnNote ?? task.returnNote;
  if (!note) return null;
  return (
    <View style={styles.returned}>
      <View style={styles.returnedTop}>
        <Avatar gender={task.creator.gender} size={34} />
        <View style={styles.flex}>
          <Txt size={14} weight="bold" color={hue.orange.s200}>
            {t.noteBy(firstName(task.creator.name))}
          </Txt>
          <Txt size={12} weight="regular" color={hue.orange.s300}>
            {sub?.returnedAt ? `${task.creator.role} · ${ago(sub.returnedAt)}` : task.creator.role}
          </Txt>
        </View>
        <RotateCcw size={20} color={hue.orange.base} strokeWidth={1.9} />
      </View>
      <Txt size={14.5} leading={1.85} weight="regular" color={hue.orange.s100}>
        {isolateLatin(note)}
      </Txt>
    </View>
  );
}

// ── «تسليمك» (12) / «تسليمك السابق» (13) ─────────────────────────────────────

export function SubmissionCard({ task, previous }: { task: Task; previous?: boolean }) {
  const sub = task.mySubmission;
  if (!sub) return null;
  if (previous) {
    return (
      <View style={[styles.card, styles.previous]}>
        <View style={styles.between}>
          <Txt size={14} weight="bold" accessibilityRole="header">
            {t.previousSubmission}
          </Txt>
          <Txt size={12} weight="regular" color={color.inkSoft}>
            {dayMonth(sub.submittedAt)}
          </Txt>
        </View>
        <Txt size={13.5} leading={1.75} weight="regular" color={color.inkSecondary}>
          {isolateLatin(sub.note)}
        </Txt>
      </View>
    );
  }
  return (
    <View style={[styles.card, styles.gap10]}>
      <View style={styles.between}>
        <Txt size={15} weight="bold" accessibilityRole="header">
          {t.yourSubmission}
        </Txt>
        <Txt size={12} weight="regular" color={color.inkSoft}>
          {ago(sub.submittedAt)}
        </Txt>
      </View>
      <Txt size={14} leading={1.8} weight="regular" color={color.inkSecondary}>
        {isolateLatin(sub.note)}
      </Txt>
      {sub.link || sub.files.length ? (
        <View style={styles.gap8}>
          {sub.link ? <LinkRow link={sub.link} /> : null}
          {sub.files.map((f) => (
            <FileRow key={f.url} file={f} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const withScheme = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

function LinkRow({ link }: { link: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => Linking.openURL(withScheme(link))}
      style={styles.attachment}
    >
      <LinkIcon size={15} color={color.accent} strokeWidth={1.9} />
      <Txt
        size={13}
        weight="regular"
        color={color.avatarGlyph}
        numberOfLines={1}
        style={styles.flexShrink}
      >
        <Ltr>{link}</Ltr>
      </Txt>
    </Pressable>
  );
}

function FileRow({ file }: { file: FileRef }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => Linking.openURL(file.url)}
      style={styles.attachment}
    >
      <FileText size={15} color={color.accent} strokeWidth={1.9} />
      <Txt
        size={13}
        weight="regular"
        color={color.avatarGlyph}
        numberOfLines={1}
        style={styles.flexShrink}
      >
        <Ltr>{file.name}</Ltr>
      </Txt>
      <Txt size={12} weight="regular" color={color.inkSoft} style={styles.pushEnd}>
        {fileSize(file.size)}
      </Txt>
    </Pressable>
  );
}

// ── Description ─────────────────────────────────────────────────────────────

export function DescriptionCard({ text }: { text: string }) {
  return (
    <View style={[styles.card, styles.gap6]}>
      <Txt size={15} weight="bold" accessibilityRole="header">
        {t.description}
      </Txt>
      <Txt size={14} leading={1.85} weight="regular" color={color.inkSecondary}>
        {isolateLatin(text)}
      </Txt>
    </View>
  );
}

// ── 07: «المنضمّين» with seats left and a progress bar ───────────────────────

export function JoinedSection({ task }: { task: Task }) {
  const names = task.people.slice(0, 3).map((p) => firstName(p.name));
  const namesText = listAnd(names);
  const seatsLeft = task.capacity != null ? Math.max(0, task.capacity - task.joinedCount) : null;
  return (
    <View style={[styles.card, styles.gap10]}>
      <View style={styles.between}>
        <Txt size={15} weight="bold" accessibilityRole="header">
          {t.people}
        </Txt>
        {seatsLeft ? (
          <Txt size={13} weight="semibold" color={hue.amber.base}>
            {seatsLeftLabel(seatsLeft)}
          </Txt>
        ) : null}
      </View>
      {task.capacity ? <ProgressBar value={task.joinedCount / task.capacity} /> : null}
      {task.people.length > 0 ? (
        <View style={styles.inline}>
          <View style={styles.stack}>
            {task.people.slice(0, 3).map((p, i) => (
              <View key={p.id} style={i > 0 ? styles.overlap : undefined}>
                <Avatar gender={p.gender} size={28} stacked />
              </View>
            ))}
          </View>
          <Txt size={13} weight="regular" color={color.inkSecondary}>
            {names.length === task.people.length
              ? t.namesOf(namesText ?? '', task.joinedCount, task.capacity)
              : ar.common.joinedOf(task.joinedCount, task.capacity ?? task.joinedCount)}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

// ── 09: «المنضمّين  3 من 4» after joining an event («أنت، سلمان، ومحمد») ─────

export function JoinedWithMeSection({ task }: { task: Task }) {
  const people = [...task.people].sort((a, b) => Number(b.me) - Number(a.me));
  const names = people.map((p) => (p.me ? t.you : firstName(p.name)));
  return (
    <View style={[styles.card, styles.gap10]}>
      <View style={styles.between}>
        <Txt size={15} weight="bold" accessibilityRole="header">
          {t.people}
        </Txt>
        {task.capacity ? (
          <Txt size={13} weight="semibold" color={color.inkSoft}>
            {ar.account.ofTotal(task.joinedCount, task.capacity)}
          </Txt>
        ) : null}
      </View>
      {task.capacity ? <ProgressBar value={task.joinedCount / task.capacity} /> : null}
      <Txt size={13} weight="regular" color={color.inkSecondary}>
        {names.length <= 3
          ? listAnd(names)
          : ar.common.joinedOf(task.joinedCount, task.capacity ?? task.joinedCount)}
      </Txt>
    </View>
  );
}

// ── 09: green «انضممت للمهمة، بالتوفيق!» toast ──────────────────────────────

export function JoinedToast() {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.toast}>
      <View style={styles.toastIcon}>
        <Check size={15} color={color.bg} strokeWidth={3} />
      </View>
      <View style={styles.flex}>
        <Txt size={14} weight="bold" color={hue.green.s200}>
          {t.joinedToast}
        </Txt>
        <Txt size={12.5} weight="regular" color={hue.green.s300}>
          {t.joinedToastSub}
        </Txt>
      </View>
    </View>
  );
}

// ── 09: «الأربعاء 19 نوفمبر · 7 إلى 9 م · مسرح الكلية» ──────────────────────

export function EventLine({ task }: { task: Task }) {
  const parts = [
    weekdayDayMonth(task.deadline),
    timeRange(task.timeFrom, task.timeTo),
    task.location,
  ].filter(Boolean);
  return (
    <View style={styles.inline}>
      <Calendar size={15} color={color.inkSoft} strokeWidth={1.8} />
      <Txt size={13.5} weight="regular" color={color.inkSecondary} style={styles.flexShrink}>
        {parts.join(' · ')}
      </Txt>
    </View>
  );
}

/** An event task has a time slot; its deadline is the event date. */
export const isEventTask = (task: Task) => task.timeFrom != null;
/** The event is over (its deadline is the event's end), so the work can be submitted. */
export const eventOver = (task: Task, now = new Date()) =>
  now.getTime() >= new Date(task.deadline).getTime();

// ── 10: «المنضمّين · 2» list (states, never hours) ──────────────────────────

export function PeopleSection({ task }: { task: Task }) {
  return (
    <View style={styles.gap10}>
      <Txt size={15} weight="bold" accessibilityRole="header">
        {t.peopleCount(task.people.length)}
      </Txt>
      {task.people.map((p) => (
        <View key={p.id} style={styles.person}>
          <Avatar gender={p.gender} size={34} />
          <Txt size={14} weight="bold" style={styles.flex}>
            {p.me ? t.you : p.name}
          </Txt>
          <StateLabel state={p.state} />
        </View>
      ))}
    </View>
  );
}

/** Plain state pill without the dot (people list on screen 10). */
function StateLabel({ state }: { state: Task['people'][number]['state'] }) {
  return (
    <View style={styles.statePill}>
      <Txt variant="chip" color={color.inkSecondary}>
        {taskState[state].label}
      </Txt>
    </View>
  );
}

// ── «مسار المهمة» steps per state ────────────────────────────────────────────

const plusHours = (n: number) => (
  <>
    <Ltr>{`+${n}`}</Ltr> {hoursUnit(n)}
  </>
);

export function buildSteps(task: Task): { steps: Step[]; currentTone: string } | null {
  const sub = task.mySubmission;
  const joined: Step = {
    label: t.stepJoined,
    // «الحين» right after joining (09), the date after that (10)
    sub: task.myJoinedAt
      ? Date.now() - new Date(task.myJoinedAt).getTime() < 60 * 60_000
        ? t.now
        : dayMonth(task.myJoinedAt)
      : '',
    status: 'done',
  };
  const approve = (status: Step['status'], when?: string): Step => ({
    label: t.stepApprove,
    sub: when ? dayMonth(when) : plusHours(task.hours),
    status,
  });
  switch (task.myState) {
    case 'working':
      // 09: an event task waits for the event before it can be submitted
      if (isEventTask(task)) {
        const over = eventOver(task);
        return {
          currentTone: color.highlight,
          steps: [
            joined,
            {
              label: t.stepEvent,
              sub: over ? dayMonth(task.deadline) : weekday(task.deadline),
              status: over ? 'done' : 'current',
            },
            {
              label: t.stepSubmit,
              sub: over ? t.yourTurn : t.afterIt,
              status: over ? 'current' : 'future',
            },
            approve('future'),
          ],
        };
      }
      return {
        currentTone: color.highlight,
        steps: [
          joined,
          { label: t.stepSubmit, sub: t.yourTurn, status: 'current' },
          { label: t.stepReview, sub: t.fromLeader, status: 'future' },
          approve('future'),
        ],
      };
    case 'submitted':
      return {
        currentTone: hue.amber.base,
        steps: [
          joined,
          { label: t.stepSubmitted, sub: sub ? ago(sub.submittedAt) : '', status: 'done' },
          {
            label: t.stepReview,
            sub: t.withReviewer(firstName(task.creator.name)),
            status: 'current',
          },
          approve('future'),
        ],
      };
    case 'returned':
      return {
        currentTone: color.highlight,
        steps: [
          joined,
          { label: t.stepSubmitted, sub: sub ? dayMonth(sub.submittedAt) : '', status: 'done' },
          {
            label: t.stepReturned,
            sub: sub?.returnedAt ? dayAgo(sub.returnedAt) : '',
            status: 'returned',
          },
          approve('future'),
        ],
      };
    case 'approved':
      // Not in the design: all four steps done, approval date on the last one.
      return {
        currentTone: color.highlight,
        steps: [
          joined,
          { label: t.stepSubmitted, sub: sub ? dayMonth(sub.submittedAt) : '', status: 'done' },
          { label: t.stepReview, sub: firstName(task.creator.name), status: 'done' },
          approve('done', sub?.approvedAt ?? undefined),
        ],
      };
    default:
      return null;
  }
}

// ── Loading skeleton (no artboard: mirrors the detail layout like screen 18) ─

export function DetailSkeleton() {
  return (
    <View style={styles.gap16} accessibilityState={{ busy: true }}>
      <View style={styles.gap8}>
        <View style={styles.chips}>
          <Skeleton width={64} height={22} r={11} />
          <Skeleton width={84} height={22} r={11} />
        </View>
        <Skeleton width="85%" height={24} tone="strong" />
        <Skeleton width="60%" height={14} />
      </View>
      <View style={styles.gridSkeleton}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.tileSkeleton}>
            <Skeleton width={34} height={34} r={10} />
            <View style={styles.gap6}>
              <Skeleton width={50} height={10} />
              <Skeleton width={70} height={14} tone="strong" />
            </View>
          </View>
        ))}
      </View>
      <View style={[styles.card, styles.gap10]}>
        <Skeleton width={60} height={14} tone="strong" />
        <Skeleton width="95%" height={12} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  pushEnd: { marginStart: 'auto' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gap6: { gap: 6 },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  gap16: { gap: 16 },
  heading: { gap: 8 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: tint(hue.green.base, 0.1),
    borderWidth: 1,
    borderColor: tint(hue.green.base, 0.35),
  },
  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: hue.green.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  creator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  previous: { gap: 8, paddingVertical: 14, borderRadius: radius.card },
  submitted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: tint(hue.amber.base, 0.1),
    borderWidth: 1,
    borderColor: tint(hue.amber.base, 0.35),
  },
  submittedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: hue.amber.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returned: {
    gap: 10,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: tint(hue.orange.base, 0.08),
    borderWidth: 1,
    borderColor: tint(hue.orange.base, 0.4),
  },
  returnedTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: color.bg,
  },
  stack: { flexDirection: 'row' },
  overlap: { marginStart: -8 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statePill: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: tint(color.inkSoft, 0.14),
  },
  gridSkeleton: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tileSkeleton: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
});
