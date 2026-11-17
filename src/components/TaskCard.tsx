import { Calendar, ChevronLeft, Clock, MapPin, MessageSquare } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CommitteeChip, HoursChip, SharedChip, StateChip } from '@/components/Chip';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color, hue, radius, tint, type TaskState } from '@/theme/tokens';

// ── «مهامي» card ───────────────────────────────────────────────────────────────

type MyTaskFooter =
  | { kind: 'deadline'; label: string } // «باقي 3 أيام» in amber
  | { kind: 'note'; text: string } // leader's return note, e.g. «فيصل: أضف لقطات…»
  | { kind: 'meta'; text: string }; // «سلّمتها قبل ساعتين»

type MyTaskCardProps = {
  title: string;
  state: TaskState;
  hours: string;
  footer?: MyTaskFooter;
  onPress?: () => void;
};

export function MyTaskCard({ title, state, hours, footer, onPress }: MyTaskCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.mine,
        state === 'returned' && { borderColor: tint(hue.orange.base, 0.35) },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.mineBody}>
        <View style={styles.between}>
          <StateChip state={state} />
          <Txt size={12.5} weight="bold" color={color.highlight}>
            {hours}
          </Txt>
        </View>
        <Txt variant="cardTitle">{title}</Txt>
        {footer?.kind === 'deadline' ? (
          <View style={styles.inlineRow}>
            <Clock size={14} color={hue.amber.base} strokeWidth={2} />
            <Txt size={12.5} weight="semibold" color={hue.amber.base}>
              {footer.label}
            </Txt>
          </View>
        ) : footer?.kind === 'note' ? (
          <View style={styles.note}>
            <MessageSquare
              size={14}
              color={hue.orange.base}
              strokeWidth={2}
              style={styles.noteIcon}
            />
            <Txt
              size={13}
              leading={1.6}
              weight="regular"
              color={hue.orange.s200}
              style={styles.flex}
            >
              {footer.text}
            </Txt>
          </View>
        ) : footer?.kind === 'meta' ? (
          <Txt size={12.5} weight="medium" color={color.inkSoft}>
            {footer.text}
          </Txt>
        ) : null}
      </View>
      <ChevronLeft size={18} color={color.inkMuted} strokeWidth={2} />
    </Pressable>
  );
}

// ── «متاحة للجنتك» card ───────────────────────────────────────────────────────

type AvailableTaskCardProps = {
  title: string;
  hours: string;
  description?: string;
  /** Shared task: «مشتركة» chip + committee names («التقنية · الإعلامية»). */
  shared?: { committees: string };
  /** Single-committee task: committee chip. */
  committee?: string;
  when?: string;
  where?: string;
  people?: { gender: 'male' | 'female' }[];
  joined?: number;
  capacity?: number | null;
  onPress?: () => void;
  onJoin?: () => void;
  /** Offline: join is disabled with a lock. */
  joinLocked?: boolean;
};

export function AvailableTaskCard({
  title,
  hours,
  description,
  shared,
  committee,
  when,
  where,
  people,
  joined,
  capacity,
  onPress,
  onJoin,
  joinLocked,
}: AvailableTaskCardProps) {
  const showFooter = onJoin != null || joined != null;
  return (
    <View style={styles.available}>
      <View style={styles.between}>
        {shared ? (
          <View style={styles.inlineRow}>
            <SharedChip label={ar.task.shared} />
            <Txt size={12} weight="medium" color={color.inkSoft}>
              {shared.committees}
            </Txt>
          </View>
        ) : committee ? (
          <CommitteeChip label={committee} />
        ) : (
          <View />
        )}
        <HoursChip label={hours} />
      </View>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="link"
        style={styles.titleBlock}
      >
        <Txt size={16} weight="bold" leading={1.5}>
          {title}
        </Txt>
        {description ? (
          <Txt size={13.5} leading={1.65} weight="regular" color={color.inkSoft}>
            {description}
          </Txt>
        ) : null}
      </Pressable>

      {when || where ? (
        <View style={styles.meta}>
          {when ? <MetaLine icon="calendar" text={when} /> : null}
          {where ? <MetaLine icon="pin" text={where} /> : null}
        </View>
      ) : null}

      {showFooter ? (
        <View style={styles.footer}>
          <View style={styles.inlineRow}>
            {people && people.length > 0 ? (
              <View style={styles.stack}>
                {people.slice(0, 3).map((p, i) => (
                  <View key={i} style={i > 0 ? styles.stackOverlap : undefined}>
                    <Avatar gender={p.gender} size={26} stacked />
                  </View>
                ))}
              </View>
            ) : null}
            {joined != null && capacity != null ? (
              <Txt size={12.5} weight="medium" color={color.inkSoft}>
                {ar.common.joinedOf(joined, capacity)}
              </Txt>
            ) : null}
          </View>
          {onJoin ? (
            <Button label={ar.task.join} size="sm" onPress={onJoin} locked={joinLocked} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function MetaLine({ icon, text }: { icon: 'calendar' | 'pin'; text: string }) {
  const Icon = icon === 'calendar' ? Calendar : MapPin;
  return (
    <View style={styles.metaLine}>
      <Icon size={15} color={color.inkSoft} strokeWidth={1.8} />
      <Txt variant="meta" color={color.inkSecondary}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  mine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  mineBody: { flex: 1, minWidth: 0, gap: 6 },
  pressed: { opacity: 0.85 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: tint(hue.orange.base, 0.08),
  },
  noteIcon: { marginTop: 4 },
  flex: { flex: 1 },
  available: {
    gap: 10,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  titleBlock: { gap: 2 },
  meta: { gap: 4 },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  stack: { flexDirection: 'row', marginEnd: 2 },
  stackOverlap: { marginStart: -8 },
});
