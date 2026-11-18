// Stats card on screens 06 / 15 / 19: hours this term · pending · tasks done (→ 16).
import { Pressable, StyleSheet, View } from 'react-native';

import type { TasksResponse } from '@/api/types';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color, hue, radius } from '@/theme/tokens';

type Props = {
  stats: TasksResponse['stats'];
  /** Opens history (screen 16). Omitted on the empty and offline variants. */
  onDonePress?: () => void;
};

export function StatsCard({ stats, onDonePress }: Props) {
  const t = ar.tasks;
  return (
    <View accessibilityLabel={t.summaryLabel} style={styles.card}>
      <Stat value={stats.termHours} label={t.termHours} />
      <Stat
        value={stats.pendingHours}
        label={t.pending}
        // amber only when something is actually waiting (screen 15 shows a white 0)
        valueColor={stats.pendingHours > 0 ? hue.amber.base : color.ink}
        divided
      />
      {onDonePress ? (
        <Pressable
          onPress={onDonePress}
          accessibilityRole="link"
          accessibilityLabel={`${stats.tasksDone} ${t.done}`}
          style={({ pressed }) => [styles.stat, pressed && styles.pressed]}
        >
          <Txt variant="stat" leading={1.4} align="center">
            {stats.tasksDone}
          </Txt>
          <Txt size={12} weight="medium" color={color.accent} align="center">
            {t.doneLink}
          </Txt>
        </Pressable>
      ) : (
        <Stat value={stats.tasksDone} label={t.done} />
      )}
    </View>
  );
}

function Stat({
  value,
  label,
  valueColor = color.ink,
  divided,
}: {
  value: number;
  label: string;
  valueColor?: string;
  divided?: boolean;
}) {
  return (
    <View style={[styles.stat, divided && styles.divided]}>
      <Txt variant="stat" leading={1.4} color={valueColor} align="center">
        {value}
      </Txt>
      <Txt size={12} weight="medium" color={color.inkSoft} align="center">
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  stat: { flex: 1, alignItems: 'center' },
  divided: { borderStartWidth: 1, borderEndWidth: 1, borderColor: color.line },
  pressed: { opacity: 0.8 },
});
