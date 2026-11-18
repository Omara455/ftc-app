// Screen 26: all 9 achievements — unlocked with their date, locked with progress.
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useAchievements } from '@/api/hooks';
import type { AchievementsResponse } from '@/api/types';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { ListSkeleton, QueryState, useOfflineBanner } from '@/components/QueryState';
import { ScreenBackground } from '@/components/ScreenBackground';
import { Txt } from '@/components/Txt';
import { AchievementTile } from '@/features/account/AchievementTile';
import { ar } from '@/i18n/ar';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, radius, space } from '@/theme/tokens';

export default function Achievements() {
  const query = useAchievements();
  const offline = useIsOffline();
  const banner = useOfflineBanner(query);
  const insets = useScreenInsets();
  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header title={ar.account.achievements} onBack={() => router.back()} />
      <ScrollView
        refreshControl={
          offline ? undefined : (
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
              tintColor={color.accent}
              colors={[color.brand]}
            />
          )
        }
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {banner}
        <QueryState query={query} skeleton={<ListSkeleton rows={3} />}>
          {(d) => <Body d={d} />}
        </QueryState>
      </ScrollView>
    </View>
  );
}

function Body({ d }: { d: AchievementsResponse }) {
  const nearest = d.nearest ? d.items.find((x) => x.id === d.nearest?.id) : undefined;
  const rows: (typeof d.items)[] = [];
  for (let i = 0; i < d.items.length; i += 3) rows.push(d.items.slice(i, i + 3));
  return (
    <>
      <View style={styles.summary}>
        <View style={styles.between}>
          <Txt size={15} weight="bold">
            {ar.account.gotOf(d.unlocked, d.total)}
          </Txt>
          {nearest ? (
            <Txt size={12.5} weight="regular" color={color.inkSoft}>
              {ar.account.nearest(nearest.name)}
            </Txt>
          ) : null}
        </View>
        <ProgressBar value={d.total ? d.unlocked / d.total : 0} />
      </View>
      {rows.map((row, i) => (
        <View key={i} style={[styles.row, i > 0 && styles.tight]}>
          {row.map((x) => (
            <View key={x.id} style={styles.cell}>
              <AchievementTile item={x} variant="grid" />
            </View>
          ))}
          {/* keep the last row's tiles the same width */}
          {Array.from({ length: 3 - row.length }, (_, k) => (
            <View key={`pad-${k}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter, paddingTop: 14, gap: 14 },
  summary: {
    gap: 10,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  row: { flexDirection: 'row', gap: 10 },
  tight: { marginTop: -4 }, // 10 between grid rows, 14 under the summary
  cell: { flex: 1 },
});
