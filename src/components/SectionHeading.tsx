import { StyleSheet, View } from 'react-native';

import { CountBadge } from '@/components/Chip';
import { Txt } from '@/components/Txt';

/** «مهامي ②» — 17/700 heading with an optional count bubble. */
export function SectionHeading({
  title,
  count,
  accent,
}: {
  title: string;
  count?: number;
  /** Purple bubble (available tasks) instead of the neutral one. */
  accent?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Txt variant="heading" accessibilityRole="header">
        {title}
      </Txt>
      {count != null ? <CountBadge count={count} accent={accent} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
});
