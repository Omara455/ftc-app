// Task detail — one screen for every state (PLAN M3):
//   myState null → 07 available · working → 10 · submitted → 12 · returned → 13 · approved
// Write actions (join, submit, leave, edit) are Phase 2: shown only with flags.writes,
// and locked while offline. Their sheets arrive in M5.
import { router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  Clock,
  Hourglass,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Upload,
} from 'lucide-react-native';
import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useTask } from '@/api/hooks';
import type { Task } from '@/api/types';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Header } from '@/components/Header';
import { InfoGrid, InfoTile } from '@/components/InfoTile';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenBackground } from '@/components/ScreenBackground';
import { StickyBar, STICKY_BAR_HEIGHT } from '@/components/StickyBar';
import { Stepper } from '@/components/Stepper';
import { flags } from '@/config/flags';
import {
  buildSteps,
  DescriptionCard,
  DetailSkeleton,
  JoinedSection,
  PeopleSection,
  ReturnNoteCard,
  SubmissionCard,
  SubmittedBanner,
  TaskHeading,
} from '@/features/tasks/detail/parts';
import { ar } from '@/i18n/ar';
import { ago, dayMonth, timeRange, weekday } from '@/i18n/dates';
import { firstName, hoursLabel } from '@/i18n/format';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, hue, space } from '@/theme/tokens';

const t = ar.task;

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useTask(Number(id));
  const offline = useIsOffline();
  const insets = useScreenInsets();
  const task = query.data;
  const cta = task ? <Cta task={task} offline={offline} /> : null;

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header title={t.title} onBack={() => router.back()} />
      <ScrollView
        refreshControl={
          offline ? undefined : (
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
              tintColor={color.accent}
              colors={[color.brand]}
            />
          )
        }
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (cta ? STICKY_BAR_HEIGHT : 0) + Math.max(34, insets.bottom) + 24 },
        ]}
      >
        {offline ? (
          <OfflineBanner
            lastUpdatedAgo={query.dataUpdatedAt ? ago(new Date(query.dataUpdatedAt)) : undefined}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {task ? (
          <Body task={task} />
        ) : query.isError && !offline ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <DetailSkeleton />
        )}
      </ScrollView>
      {cta}
    </View>
  );
}

function Body({ task }: { task: Task }) {
  const steps = buildSteps(task);
  const stepper = steps ? <Stepper title={t.path} {...steps} /> : null;

  switch (task.myState) {
    case null: // 07 available
      return (
        <>
          <TaskHeading task={task} showCreator />
          <InfoGrid>
            <InfoTile icon={Clock} label={t.hours} value={hoursLabel(task.hours)} />
            <InfoTile
              icon={Calendar}
              label={weekday(task.deadline)}
              value={dayMonth(task.deadline)}
            />
            {task.timeFrom ? (
              <InfoTile
                icon={Hourglass}
                label={t.time}
                value={timeRange(task.timeFrom, task.timeTo) ?? ''}
              />
            ) : null}
            {task.location ? (
              <InfoTile icon={MapPin} label={t.place} value={task.location} />
            ) : null}
          </InfoGrid>
          <DescriptionCard text={task.description} />
          <JoinedSection task={task} />
        </>
      );
    case 'working': // 10
      return (
        <>
          <TaskHeading task={task} showCreator />
          <InfoGrid>
            <InfoTile icon={Clock} label={t.hours} value={hoursLabel(task.hours)} />
            <InfoTile
              icon={Calendar}
              tone={hue.amber.base}
              label={t.deadline}
              value={dayMonth(task.deadline)}
            />
            {task.location ? (
              <InfoTile icon={MapPin} label={t.place} value={task.location} />
            ) : null}
            {task.contact ? (
              <InfoTile
                icon={Phone}
                tone={hue.green.base}
                label={t.contact}
                value={task.contact.name}
                onPress={() => Linking.openURL(`tel:${task.contact?.phone}`)}
              />
            ) : null}
          </InfoGrid>
          {stepper}
          <DescriptionCard text={task.description} />
          <PeopleSection task={task} />
        </>
      );
    case 'submitted': // 12
      return (
        <>
          <SubmittedBanner reviewer={firstName(task.creator.name)} gender={task.creator.gender} />
          <TaskHeading task={task} showCreator={false} />
          {stepper}
          <SubmissionCard task={task} />
        </>
      );
    case 'returned': // 13
      return (
        <>
          <TaskHeading task={task} showCreator={false} />
          <ReturnNoteCard task={task} />
          {stepper}
          <SubmissionCard task={task} previous />
        </>
      );
    case 'approved': // not in the design: path complete + what was submitted
      return (
        <>
          <TaskHeading task={task} showCreator={false} />
          {stepper}
          <SubmissionCard task={task} />
        </>
      );
  }
}

/** Sticky actions per state (Phase 2). Returns null when there's nothing to do. */
function Cta({ task, offline }: { task: Task; offline: boolean }) {
  if (!flags.writes) return null;
  // M5 wires these to the join / submit / leave sheets.
  switch (task.myState) {
    case null:
      return task.canClaim ? (
        <StickyBar>
          <Button label={t.join} icon={Plus} locked={offline} />
        </StickyBar>
      ) : null;
    case 'working':
      return task.canSubmit || task.canLeave ? (
        <StickyBar row>
          {task.canSubmit ? (
            <Button label={t.submit} icon={Upload} locked={offline} style={styles.flex} />
          ) : null}
          {task.canLeave ? (
            <Button
              label={t.leave}
              variant="secondary"
              onSurface
              locked={offline}
              style={task.canSubmit ? styles.leave : styles.flex}
            />
          ) : null}
        </StickyBar>
      ) : null;
    case 'submitted':
      return task.canEditSubmission ? (
        <StickyBar>
          <Button
            label={t.editSubmission}
            variant="secondary"
            onSurface
            icon={Pencil}
            locked={offline}
          />
        </StickyBar>
      ) : null;
    case 'returned':
      return task.canSubmit ? (
        <StickyBar>
          <Button label={t.resubmit} icon={Upload} locked={offline} />
        </StickyBar>
      ) : null;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter, paddingTop: 14, gap: 16 },
  flex: { flex: 1 },
  leave: { width: 104 },
});
