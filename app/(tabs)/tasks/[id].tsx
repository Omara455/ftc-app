// Task detail — one screen for every state (PLAN M3):
//   myState null → 07 available · working → 10 · submitted → 12 · returned → 13 · approved
//   working + event task right after joining → 09 (toast, event stepper, submit after the event)
// Write actions (join 08, submit 11, leave 14, edit) are Phase 2: shown only with flags.writes,
// and locked while offline.
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
import { useRef } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useTask } from '@/api/hooks';
import type { Task } from '@/api/types';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { Header } from '@/components/Header';
import { InfoGrid, InfoTile } from '@/components/InfoTile';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { SheetRef } from '@/components/Sheet';
import { StickyBar, STICKY_BAR_HEIGHT } from '@/components/StickyBar';
import { Stepper } from '@/components/Stepper';
import { flags } from '@/config/flags';
import {
  buildSteps,
  DescriptionCard,
  DetailSkeleton,
  EventLine,
  eventOver,
  isEventTask,
  JoinedSection,
  JoinedToast,
  JoinedWithMeSection,
  PeopleSection,
  ReturnNoteCard,
  SubmissionCard,
  SubmittedBanner,
  TaskHeading,
} from '@/features/tasks/detail/parts';
import { JoinSheet } from '@/features/tasks/sheets/JoinSheet';
import { LeaveSheet } from '@/features/tasks/sheets/LeaveSheet';
import { SubmitSheet } from '@/features/tasks/sheets/SubmitSheet';
import { ar } from '@/i18n/ar';
import { ago, dayMonth, timeRange, weekday } from '@/i18n/dates';
import { firstName, hoursLabel } from '@/i18n/format';
import { useScreenInsets } from '@/lib/insets';
import { useTaskFlash } from '@/lib/flash';
import { useIsOffline } from '@/lib/network';
import { color, hue, space } from '@/theme/tokens';

const t = ar.task;

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useTask(Number(id));
  const offline = useIsOffline();
  const insets = useScreenInsets();
  const task = query.data;
  const joined = useTaskFlash(Number(id)) === 'joined';
  const joinSheet = useRef<SheetRef>(null);
  const submitSheet = useRef<SheetRef>(null);
  const leaveSheet = useRef<SheetRef>(null);
  const cta = task ? (
    <Cta
      task={task}
      offline={offline}
      onJoin={() => joinSheet.current?.present()}
      onSubmit={() => submitSheet.current?.present()}
      onLeave={() => leaveSheet.current?.present()}
    />
  ) : null;

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
          <Body task={task} joined={joined} />
        ) : query.isError && !offline ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <DetailSkeleton />
        )}
      </ScrollView>
      {cta}
      {flags.writes && task ? (
        <>
          <JoinSheet ref={joinSheet} task={task} />
          <SubmitSheet ref={submitSheet} task={task} />
          <LeaveSheet
            ref={leaveSheet}
            taskId={task.id}
            onLeft={() => (router.canGoBack() ? router.back() : router.replace('/tasks'))}
          />
        </>
      ) : null}
    </View>
  );
}

function Body({ task, joined }: { task: Task; joined: boolean }) {
  const steps = buildSteps(task);
  const stepper = steps ? <Stepper title={t.path} {...steps} /> : null;
  const toast = joined && task.myState === 'working' ? <JoinedToast /> : null;

  // 09: an event task I've joined, before the event
  if (task.myState === 'working' && isEventTask(task) && !eventOver(task)) {
    return (
      <>
        {toast}
        <View style={styles.gap8}>
          <TaskHeading task={task} showCreator={false} event />
          <EventLine task={task} />
        </View>
        {stepper}
        <JoinedWithMeSection task={task} />
        <DescriptionCard text={task.description} />
      </>
    );
  }

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
          {toast}
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

type CtaProps = {
  task: Task;
  offline: boolean;
  onJoin: () => void;
  onSubmit: () => void;
  onLeave: () => void;
};

/** Sticky actions per state (Phase 2). Returns null when there's nothing to do. */
function Cta({ task, offline, onJoin, onSubmit, onLeave }: CtaProps) {
  if (!flags.writes) return null;
  switch (task.myState) {
    case null:
      return task.canClaim ? (
        <StickyBar>
          <Button label={t.join} icon={Plus} locked={offline} onPress={onJoin} />
        </StickyBar>
      ) : null;
    case 'working': {
      // 09: an event task can't be submitted before the event
      const waiting = !task.canSubmit && isEventTask(task) && !eventOver(task);
      const first = task.canSubmit ? (
        <Button
          label={t.submit}
          icon={Upload}
          locked={offline}
          onPress={onSubmit}
          style={styles.flex}
        />
      ) : waiting ? (
        <Button label={t.submitAfterEvent} variant="waiting" style={styles.flex} />
      ) : null;
      return first || task.canLeave ? (
        <StickyBar row>
          {first}
          {task.canLeave ? (
            <Button
              label={t.leave}
              variant="secondary"
              onSurface
              locked={offline}
              onPress={onLeave}
              style={first ? styles.leave : styles.flex}
            />
          ) : null}
        </StickyBar>
      ) : null;
    }
    case 'submitted':
      return task.canEditSubmission ? (
        <StickyBar>
          <Button
            label={t.editSubmission}
            variant="secondary"
            onSurface
            icon={Pencil}
            locked={offline}
            onPress={onSubmit}
          />
        </StickyBar>
      ) : null;
    case 'returned':
      return task.canSubmit ? (
        <StickyBar>
          <Button label={t.resubmit} icon={Upload} locked={offline} onPress={onSubmit} />
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
  gap8: { gap: 8 },
  leave: { width: 104 },
});
