import { StyleSheet, View } from 'react-native';

import { color, radius } from '@/theme/tokens';

/** 8pt pill track that fills from the start (right in RTL). `value` is 0–1. */
export function ProgressBar({ value, fill = color.brand }: { value: number; fill?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.track,
    overflow: 'hidden',
  },
  fill: { position: 'absolute', top: 0, bottom: 0, start: 0, borderRadius: radius.pill },
});
