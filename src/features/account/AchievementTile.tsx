// Achievement tiles: Account strip (25), Achievements grid (26), member profile (23).
import {
  CircleCheck,
  Clock,
  Layers,
  ListChecks,
  Lock,
  Sparkle,
  Trophy,
  UserCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import type { Achievement } from '@/api/types';
import { Ltr, Txt } from '@/components/Txt';
import { dayMonth } from '@/i18n/dates';
import { color, hue, radius, tint } from '@/theme/tokens';

// Icon + colour per achievement, from the artboards. `tasks-25` is only ever shown
// locked in the design, so its unlocked icon (ListChecks) is my pick.
const LOOK: Record<Achievement['id'], { icon: LucideIcon; fg: string; bg: string }> = {
  'journey-start': { icon: Sparkle, fg: color.highlight, bg: tint(color.accent, 0.18) },
  'first-task': { icon: CircleCheck, fg: hue.green.base, bg: tint(hue.green.base, 0.15) },
  'tasks-5': { icon: Layers, fg: hue.amber.base, bg: tint(hue.amber.base, 0.14) },
  'tasks-25': { icon: ListChecks, fg: hue.amber.base, bg: tint(hue.amber.base, 0.14) },
  'hours-10': { icon: Clock, fg: hue.teal.base, bg: tint(hue.teal.base, 0.14) },
  'hours-50': { icon: Clock, fg: hue.teal.base, bg: tint(hue.teal.base, 0.14) },
  'hours-100': { icon: Clock, fg: hue.teal.base, bg: tint(hue.teal.base, 0.14) },
  'week-top1': { icon: Trophy, fg: hue.amber.base, bg: tint(hue.amber.base, 0.14) },
  leadership: { icon: UserCheck, fg: color.highlight, bg: tint(color.accent, 0.18) },
};

type Variant = 'strip' | 'grid' | 'profile';

/** Locked tiles: dashed, lock icon, progress («6 / 25») or the description as a hint. */
export function AchievementTile({ item, variant }: { item: Achievement; variant: Variant }) {
  const unlocked = item.unlockedAt != null;
  const look = LOOK[item.id];
  const Icon = unlocked ? look.icon : Lock;
  const grid = variant === 'grid';
  const iconBox = grid ? 46 : 44;

  const sub = !grid ? null : unlocked ? (
    dayMonth(item.unlockedAt as string)
  ) : item.target ? (
    <Ltr>{`${item.progress ?? 0} / ${item.target}`}</Ltr>
  ) : (
    item.description
  );

  return (
    <View
      accessibilityLabel={item.name}
      style={[
        styles.tile,
        grid ? styles.gridTile : styles.smallTile,
        variant === 'strip' && styles.strip,
        unlocked ? styles.unlocked : styles.locked,
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            width: iconBox,
            height: iconBox,
            backgroundColor: unlocked ? look.bg : tint(color.inkSoft, 0.08),
          },
        ]}
      >
        <Icon
          size={unlocked ? 22 : 20}
          color={unlocked ? look.fg : color.inkMuted}
          strokeWidth={1.8}
        />
      </View>
      <Txt
        size={grid ? 12.5 : 12}
        leading={grid ? undefined : 1.4}
        weight={!unlocked && !grid ? 'semibold' : 'bold'}
        color={unlocked ? color.ink : grid ? color.inkSecondary : color.inkSoft}
        align="center"
      >
        {item.name}
      </Txt>
      {sub != null ? (
        <Txt size={11} weight="regular" color={color.inkSoft} align="center">
          {sub}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', borderRadius: radius.card },
  smallTile: { gap: 8, paddingVertical: 12, paddingHorizontal: 6 },
  gridTile: { gap: 6, paddingTop: 14, paddingBottom: 12, paddingHorizontal: 6 },
  strip: { width: 92 },
  unlocked: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  locked: { borderWidth: 1, borderStyle: 'dashed', borderColor: color.lineStrong },
  icon: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
