// Screen 08: «تنضم لهذي المهمة؟». Confirm → POST /tasks/{id}/claim → 09 (toast on the detail).
// Opened from the detail CTA (07) and from «انضم للمهمة» on available cards (06).
import { Calendar, Info, MapPin, UserPlus } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useClaimTask } from '@/api/mutations';
import type { TaskSummary } from '@/api/types';
import { writeErrorMessage } from '@/api/writeErrorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Sheet, SheetHero, type SheetRef } from '@/components/Sheet';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { isolateLatin } from '@/i18n/bidi';
import { timeRange, weekdayDayMonth } from '@/i18n/dates';
import { hoursLabel } from '@/i18n/format';
import { setTaskFlash } from '@/lib/flash';
import { color, tint } from '@/theme/tokens';

const t = ar.sheets;

type Props = {
  task: TaskSummary | null;
  /** After a successful join, e.g. open the task from the Tasks list. */
  onJoined?: (id: number) => void;
};

export const JoinSheet = forwardRef<SheetRef, Props>(function JoinSheet({ task, onJoined }, ref) {
  const claim = useClaimTask();
  const close = () => (typeof ref === 'object' ? ref?.current?.dismiss() : undefined);

  function confirm() {
    if (!task) return;
    claim.mutate(task.id, {
      onSuccess: () => {
        setTaskFlash(task.id, 'joined');
        close();
        onJoined?.(task.id);
      },
    });
  }

  const time = task ? timeRange(task.timeFrom, task.timeTo) : null;
  const error = claim.isError ? writeErrorMessage(claim.error) : null;

  return (
    <Sheet ref={ref} accessibilityLabel={t.joinLabel} onDismiss={() => claim.reset()}>
      <SheetHero icon={UserPlus} title={t.joinTitle} body={t.joinBody} />
      {task ? (
        <View style={styles.summary}>
          <View style={styles.titleRow}>
            <Txt size={15} weight="bold" style={styles.flex}>
              {isolateLatin(task.title)}
            </Txt>
            <Chip
              label={hoursLabel(task.hours)}
              fg={color.highlight}
              bg={tint(color.accent, 0.14)}
              size={12.5}
              bold
            />
          </View>
          <Line icon={Calendar}>
            {time ? `${weekdayDayMonth(task.deadline)} · ${time}` : weekdayDayMonth(task.deadline)}
          </Line>
          {task.location ? <Line icon={MapPin}>{task.location}</Line> : null}
        </View>
      ) : null}
      <View style={styles.note}>
        <Info size={16} color={color.inkSoft} strokeWidth={1.9} />
        <Txt size={13} weight="regular" color={color.inkSoft} style={styles.flex}>
          {t.joinLeaveLater}
        </Txt>
      </View>
      {error ? <AlertBanner message={error} /> : null}
      <View style={styles.buttons}>
        <Button label={t.joinConfirm} onPress={confirm} loading={claim.isPending} />
        <Button
          label={ar.common.cancel}
          variant="ghost"
          onPress={close}
          disabled={claim.isPending}
        />
      </View>
    </Sheet>
  );
});

function Line({ icon: Icon, children }: { icon: typeof Calendar; children: React.ReactNode }) {
  return (
    <View style={styles.line}>
      <Icon size={15} color={color.inkSoft} strokeWidth={1.8} />
      <Txt size={13} weight="regular" color={color.inkSecondary} style={styles.flex}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flexShrink: 1 },
  summary: {
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.line,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttons: { gap: 8 },
});
