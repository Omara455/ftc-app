import { SquareCheck, Trophy, User, Users, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useScreenInsets } from '@/lib/insets';

import { BottomFade } from '@/components/BottomFade';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color, shadow } from '@/theme/tokens';

export type TabKey = 'tasks' | 'community' | 'leaderboard' | 'account';

// Order from the start (right in RTL): المهام · المجتمع · الصدارة · حسابي
const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'tasks', label: ar.nav.tasks, icon: SquareCheck },
  { key: 'community', label: ar.nav.community, icon: Users },
  { key: 'leaderboard', label: ar.nav.leaderboard, icon: Trophy },
  { key: 'account', label: ar.nav.account, icon: User },
];

type Props = {
  active: TabKey;
  onPress: (key: TabKey) => void;
  /** Absolute at the bottom of the screen with the fade (default). `false` renders just the bar. */
  floating?: boolean;
};

/** Floating bar: inset 16, 24 from the bottom, 66 tall, radius 22, glass fill. */
export function TabBar({ active, onPress, floating = true }: Props) {
  const insets = useScreenInsets();
  const bar = (
    <View accessibilityRole="tablist" accessibilityLabel={ar.nav.label} style={styles.bar}>
      {TABS.map(({ key, label, icon: Icon }) => {
        const selected = key === active;
        const fg = selected ? color.highlight : color.tabInactive;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onPress(key)}
            style={[styles.tab, selected && styles.selected]}
          >
            <Icon size={22} color={fg} strokeWidth={1.9} />
            <Txt variant="caption" weight={selected ? 'bold' : 'semibold'} color={fg}>
              {label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );

  if (!floating) return bar;
  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <BottomFade height={150} solidFrom={0.45} />
      <View style={[styles.position, { bottom: Math.max(24, insets.bottom) }]}>{bar}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', start: 0, end: 0, bottom: 0, height: 150 + 40 },
  position: { position: 'absolute', start: 16, end: 16 },
  bar: {
    height: 66,
    flexDirection: 'row',
    gap: 4,
    padding: 6,
    borderRadius: 22,
    backgroundColor: color.navGlass,
    borderWidth: 1,
    borderColor: color.line,
    ...shadow.nav,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 16,
  },
  selected: { backgroundColor: color.brandTint },
});
