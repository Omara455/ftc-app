// Screen 06 (Tasks) with its states: 15 empty, 18 loading, 19 offline, + error.
import { router } from 'expo-router';
import { Bell, Code } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useMe, useTasks } from '@/api/hooks';
import type { TaskSummary } from '@/api/types';
import { IconButton } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { LockedNotice, OfflineBanner } from '@/components/OfflineBanner';
import { SectionHeading } from '@/components/SectionHeading';
import { TabScreen } from '@/components/TabScreen';
import { AvailableTaskCard, MyTaskCard } from '@/components/TaskCard';
import { Txt } from '@/components/Txt';
import { flags } from '@/config/flags';
import { EmptyTasks } from '@/features/tasks/EmptyTasks';
import { StatsCard } from '@/features/tasks/StatsCard';
import { SubtitleSkeleton, TasksSkeleton } from '@/features/tasks/TasksSkeleton';
import { ar } from '@/i18n/ar';
import { ago, daysUntil, timeRange, weekdayDayMonth } from '@/i18n/dates';
import { daysLeftLabel, firstName, hoursLabel } from '@/i18n/format';
import { useIsOffline } from '@/lib/network';
import { color } from '@/theme/tokens';

const openTask = (id: number) => router.push(`/tasks/${id}`);

export default function Tasks() {
  const me = useMe();
  const tasks = useTasks();
  const offline = useIsOffline();
  const data = tasks.data;

  const refresh = () => {
    void me.refetch();
    void tasks.refetch();
  };

  let body: React.ReactNode;
  if (data) {
    const empty = data.mine.length === 0 && data.available.length === 0;
    body = (
      <View style={[styles.body, offline && styles.cached]}>
        <StatsCard
          stats={data.stats}
          onDonePress={empty || offline ? undefined : () => router.push('/tasks/history')}
        />
        {empty ? (
          <EmptyTasks />
        ) : (
          <>
            {data.mine.length > 0 ? (
              <>
                <SectionHeading
                  title={ar.tasks.mine}
                  count={offline ? undefined : data.mine.length}
                />
                {data.mine.map((t) => (
                  <MyTaskCard
                    key={t.id}
                    title={t.title}
                    state={t.myState ?? 'working'}
                    hours={hoursLabel(t.hours)}
                    footer={myFooter(t)}
                    compact={offline}
                    onPress={() => openTask(t.id)}
                  />
                ))}
              </>
            ) : null}
            {offline && flags.writes ? <LockedNotice /> : null}
            {data.available.length > 0 ? (
              <>
                <SectionHeading title={ar.tasks.available} count={data.available.length} accent />
                {data.available.map((t) => (
                  <AvailableTaskCard
                    key={t.id}
                    title={t.title}
                    hours={hoursLabel(t.hours)}
                    description={t.description}
                    shared={
                      t.shared
                        ? { committees: t.committees.map((c) => c.name).join(' · ') }
                        : undefined
                    }
                    committee={t.shared ? undefined : t.committees[0]}
                    when={whenLabel(t)}
                    where={t.location ?? undefined}
                    people={t.people}
                    joined={t.joinedCount}
                    capacity={t.capacity}
                    onPress={() => openTask(t.id)}
                    // Joining is Phase 2 (flags.writes); the button opens the join sheet in M5.
                    onJoin={flags.writes ? () => openTask(t.id) : undefined}
                    joinLocked={offline}
                  />
                ))}
              </>
            ) : null}
          </>
        )}
      </View>
    );
  } else if (tasks.isError && !offline) {
    body = <ErrorState onRetry={refresh} />;
  } else {
    // First load, or offline with nothing cached yet.
    body = <TasksSkeleton />;
  }

  return (
    <TabScreen
      mark={!offline && !!data}
      refreshing={tasks.isRefetching && !tasks.isLoading}
      onRefresh={offline ? undefined : refresh}
      banner={
        offline ? (
          <OfflineBanner
            lastUpdatedAgo={tasks.dataUpdatedAt ? ago(new Date(tasks.dataUpdatedAt)) : undefined}
            onRetry={refresh}
          />
        ) : undefined
      }
      header={
        <View style={styles.header}>
          <View style={styles.titles}>
            <Txt variant="title" accessibilityRole="header">
              {ar.tabs.tasksHeadlineA}
              <Txt variant="title" color={color.highlight}>
                {ar.tabs.tasksHeadlineGive}
              </Txt>
              {ar.tabs.tasksHeadlineB}
              <Txt variant="title" color={color.glow}>
                {ar.tabs.tasksHeadlineGets}
              </Txt>
            </Txt>
            {offline ? null : me.data ? (
              <View style={styles.sub}>
                <Code size={14} color={color.accent} strokeWidth={2} />
                <Txt variant="meta" color={color.accent}>
                  {ar.tasks.committeeTasks(me.data.committee.name)}
                </Txt>
              </View>
            ) : (
              <SubtitleSkeleton />
            )}
          </View>
          {/* Notifications (screen 17) are Phase 2 */}
          {flags.notifications && !offline ? (
            <IconButton icon={Bell} accessibilityLabel={ar.tabs.notifications} />
          ) : null}
        </View>
      }
    >
      {body}
    </TabScreen>
  );
}

function myFooter(t: TaskSummary) {
  switch (t.myState) {
    case 'returned':
      return t.returnNote
        ? {
            kind: 'note' as const,
            text: ar.tasks.noteFrom(firstName(t.creator.name), t.returnNote),
          }
        : undefined;
    case 'submitted':
      return t.submittedAt
        ? { kind: 'meta' as const, text: ar.tasks.submittedAgo(ago(t.submittedAt)) }
        : undefined;
    case 'working': {
      const days = daysUntil(t.deadline);
      return days >= 1 ? { kind: 'deadline' as const, label: daysLeftLabel(days) } : undefined;
    }
    default:
      return undefined;
  }
}

/** «الأربعاء 19 نوفمبر · 7 إلى 9 م» */
function whenLabel(t: TaskSummary): string {
  const time = timeRange(t.timeFrom, t.timeTo);
  return time ? `${weekdayDayMonth(t.deadline)} · ${time}` : weekdayDayMonth(t.deadline);
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titles: { flex: 1, gap: 2 },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  body: { gap: 14 },
  // Screen 19: cached content is dimmed while offline
  cached: { opacity: 0.72 },
});
