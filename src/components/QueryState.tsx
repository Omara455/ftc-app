// The four states every data screen needs (CLAUDE.md rule 9), in one place:
// data → render it · error (online) → ErrorState · otherwise (loading, or offline
// with nothing cached) → the screen's skeleton. Offline with cached data shows the
// data plus the banner from `useOfflineBanner`.
import type { UseQueryResult } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ErrorState } from '@/components/ErrorState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Skeleton } from '@/components/Skeleton';
import { ago } from '@/i18n/dates';
import { useIsOffline } from '@/lib/network';

export function QueryState<T>({
  query,
  skeleton = <ListSkeleton />,
  children,
}: {
  query: UseQueryResult<T>;
  skeleton?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  const offline = useIsOffline();
  if (query.data !== undefined) return <>{children(query.data)}</>;
  if (query.isError && !offline) return <ErrorState onRetry={() => void query.refetch()} />;
  return <>{skeleton}</>;
}

/** Offline banner for a screen (screen 19), or undefined when online. */
export function useOfflineBanner(
  ...queries: UseQueryResult<unknown>[]
): React.ReactNode | undefined {
  const offline = useIsOffline();
  if (!offline) return undefined;
  const updated = Math.max(0, ...queries.map((q) => q.dataUpdatedAt));
  return (
    <OfflineBanner
      lastUpdatedAgo={updated ? ago(new Date(updated)) : undefined}
      onRetry={() => queries.forEach((q) => void q.refetch())}
    />
  );
}

/** Generic skeleton: a heading bar and a card of rows (avatar/icon + two lines). */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.wrap} accessibilityState={{ busy: true }}>
      <Skeleton width={110} height={16} tone="strong" />
      <Card padding={0}>
        {Array.from({ length: rows }, (_, i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={36} height={36} r={18} />
            <View style={styles.lines}>
              <Skeleton width="60%" height={14} tone="strong" />
              <Skeleton width="35%" height={10} />
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

/** Skeleton for a hero/profile card. */
export function HeroSkeleton() {
  return (
    <View style={styles.hero} accessibilityState={{ busy: true }}>
      <Skeleton width={80} height={80} r={40} />
      <Skeleton width={150} height={18} tone="strong" />
      <Skeleton width={190} height={20} r={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  lines: { flex: 1, gap: 8 },
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 22,
  },
});
