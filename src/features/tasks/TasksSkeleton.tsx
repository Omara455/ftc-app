// Screen 18: skeleton that copies the Tasks layout (stats, «مهامي», two cards,
// «متاحة للجنتك», one card). `strong` blocks = titles/numbers, `soft` = meta/chips.
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { ar } from '@/i18n/ar';
import { color, radius } from '@/theme/tokens';

export function TasksSkeleton() {
  return (
    <View
      accessibilityLabel={ar.tasks.loadingLabel}
      accessibilityState={{ busy: true }}
      style={styles.wrap}
    >
      <View style={styles.stats}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.stat}>
            <Skeleton width={32} height={20} tone="strong" />
            <Skeleton width={64} height={10} r={5} />
          </View>
        ))}
      </View>

      <Skeleton width={80} height={16} tone="strong" style={styles.heading} />
      <Card r={radius.card} padding={16} gap={12}>
        <View style={styles.between}>
          <Skeleton width={84} height={20} r={10} />
          <Skeleton width={52} height={14} />
        </View>
        <Skeleton width="78%" height={16} tone="strong" />
        <Skeleton width="34%" height={12} />
      </Card>
      <Card r={radius.card} padding={16} gap={12}>
        <View style={styles.between}>
          <Skeleton width={84} height={20} r={10} />
          <Skeleton width={52} height={14} />
        </View>
        <Skeleton width="66%" height={16} tone="strong" />
        <Skeleton width="90%" height={34} r={10} />
      </Card>

      <Skeleton width={110} height={16} tone="strong" style={styles.heading} />
      <Card padding={16} gap={12}>
        <View style={styles.between}>
          <Skeleton width={120} height={20} r={10} />
          <Skeleton width={60} height={20} r={10} />
        </View>
        <Skeleton width="72%" height={16} tone="strong" />
        <Skeleton width="92%" height={12} />
        <Skeleton width="58%" height={12} />
      </Card>
    </View>
  );
}

/** Small bar standing in for the committee line under the headline while /me loads. */
export function SubtitleSkeleton() {
  return <Skeleton width={120} height={12} style={styles.subtitle} />;
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  stats: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 4,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  stat: { flex: 1, alignItems: 'center', gap: 8 },
  heading: { marginTop: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  subtitle: { marginTop: 6 },
});
