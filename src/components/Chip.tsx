import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import {
  color,
  hue,
  league as leagues,
  radius,
  taskState,
  tint,
  type League,
  type TaskState,
} from '@/theme/tokens';

type ChipProps = {
  label: string;
  /** Text colour. */
  fg: string;
  /** Background. Defaults to `fg` at 14%. */
  bg?: string;
  /** Optional leading dot colour. */
  dot?: string;
  dotSize?: number;
  bold?: boolean;
  size?: number;
};

/** Pill label: padding 2/10, 12/600 by default. */
export function Chip({ label, fg, bg, dot, dotSize = 6, bold, size = 12 }: ChipProps) {
  return (
    <View
      style={[styles.chip, { backgroundColor: bg ?? tint(fg, 0.14) }, dot ? styles.withDot : null]}
    >
      {dot ? (
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: dot,
          }}
        />
      ) : null}
      <Txt variant="chip" size={size} weight={bold ? 'bold' : 'semibold'} color={fg}>
        {label}
      </Txt>
    </View>
  );
}

// Presets used across the screens ----------------------------------------------

/** Committee name chip, e.g. «التقنية». */
export const CommitteeChip = ({ label }: { label: string }) => (
  <Chip label={label} fg={color.highlight} bg={tint(color.brand, 0.18)} />
);

/** Hours chip on available tasks, e.g. «3 ساعات». */
export const HoursChip = ({ label }: { label: string }) => (
  <Chip label={label} fg={color.highlight} bg={tint(color.accent, 0.14)} bold size={12.5} />
);

/** «مشتركة» — task shared between committees. */
export const SharedChip = ({ label }: { label: string }) => (
  <Chip label={label} fg={hue.blue.s300} bg={tint(hue.blue.base, 0.14)} />
);

/** Deadline chip, e.g. «باقي 3 أيام». */
export const DeadlineChip = ({ label }: { label: string }) => (
  <Chip label={label} fg={hue.amber.base} bg={tint(hue.amber.base, 0.12)} />
);

/** Role chip, e.g. «عضو». */
export const RoleChip = ({ label }: { label: string }) => (
  <Chip label={label} fg={color.inkSecondary} bg={tint(color.inkSoft, 0.14)} />
);

/** Solid «لجنتك» badge. */
export const MineChip = ({ label }: { label: string }) => (
  <Chip label={label} fg={color.onBrand} bg={color.brand} bold />
);

/** A member's state in a task: dot + label in the state's colour. */
export function StateChip({ state }: { state: TaskState }) {
  const s = taskState[state];
  return <Chip label={s.label} fg={s.text} bg={tint(s.fg, 0.14)} dot={s.fg} />;
}

/**
 * League. `pill` on profiles (tinted pill, 7pt dot, bold league colour);
 * `inline` in member lists (8pt dot, secondary label, no pill).
 */
export function LeagueBadge({
  league,
  variant = 'pill',
}: {
  league: League;
  variant?: 'pill' | 'inline';
}) {
  const l = leagues[league];
  if (variant === 'inline') {
    return (
      <View style={styles.inline}>
        <View style={[styles.inlineDot, { backgroundColor: l.fg }]} />
        <Txt variant="chip" size={12.5} color={color.inkSecondary}>
          {l.label}
        </Txt>
      </View>
    );
  }
  return <Chip label={l.label} fg={l.fg} bg={tint(l.fg, 0.12)} dot={l.fg} dotSize={7} bold />;
}

/** Small count bubble next to section headings («مهامي 2»). */
export function CountBadge({ count, accent }: { count: number; accent?: boolean }) {
  return (
    <View
      style={[styles.count, { backgroundColor: accent ? tint(color.brand, 0.28) : color.line }]}
    >
      <Txt variant="chip" weight="bold" color={accent ? color.avatarGlyph : color.inkSecondary}>
        {count}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  withDot: { gap: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inlineDot: { width: 8, height: 8, borderRadius: 4 },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
