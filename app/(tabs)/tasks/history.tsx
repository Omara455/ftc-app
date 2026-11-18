// Screen 16: approved tasks, this term or all terms.
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useTaskHistory } from '@/api/hooks';
import type { HistoryScope } from '@/api/types';
import { Divider } from '@/components/Card';
import { ErrorState } from '@/components/ErrorState';
import { Header } from '@/components/Header';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenBackground } from '@/components/ScreenBackground';
import { Segmented } from '@/components/Segmented';
import { Skeleton } from '@/components/Skeleton';
import { Ltr, Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { ago, dayMonth } from '@/i18n/dates';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, hue, radius, space, tint } from '@/theme/tokens';

const t = ar.tasks;

export default function History() {
  const [scope, setScope] = useState<HistoryScope>('term');
  const query = useTaskHistory(scope);
  const offline = useIsOffline();
  const insets = useScreenInsets();
  const data = query.data;

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header title={t.historyTitle} onBack={() => router.back()} />
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
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(34, insets.bottom) + 24 },
        ]}
      >
        {offline ? (
          <OfflineBanner
            lastUpdatedAgo={query.dataUpdatedAt ? ago(new Date(query.dataUpdatedAt)) : undefined}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        <Segmented
          accessibilityLabel={t.periodLabel}
          value={scope}
          onChange={setScope}
          options={[
            { key: 'term', label: t.thisTerm },
            { key: 'all', label: t.allTerms },
          ]}
        />

        {data ? (
          <>
            <View style={styles.tiles}>
              <StatTile value={data.tasksDone} label={t.done} />
              <StatTile
                value={data.approvedHours}
                label={t.approvedHours}
                valueColor={hue.green.base}
              />
            </View>
            {data.items.length > 0 ? (
              <View style={styles.list}>
                {data.items.map((item, i) => (
                  <Fragment key={item.id}>
                    {i > 0 ? <Divider /> : null}
                    <View style={styles.row}>
                      <View style={styles.check}>
                        <Check size={16} color={hue.green.base} strokeWidth={2.4} />
                      </View>
                      <View style={styles.flex}>
                        <Txt size={14} weight="bold">
                          {item.title}
                        </Txt>
                        <Txt size={12} weight="regular" color={color.inkSoft}>
                          {`${item.committee.name} · ${dayMonth(item.approvedAt)}`}
                        </Txt>
                      </View>
                      <Txt size={13.5} weight="extrabold" color={hue.green.base}>
                        <Ltr>{`+${item.hours}`}</Ltr>
                      </Txt>
                    </View>
                  </Fragment>
                ))}
              </View>
            ) : null}
          </>
        ) : query.isError && !offline ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <HistorySkeleton />
        )}
      </ScrollView>
    </View>
  );
}

function StatTile({
  value,
  label,
  valueColor = color.ink,
}: {
  value: number;
  label: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.tile}>
      <Txt size={24} leading={1.4} weight="extrabold" color={valueColor}>
        {value}
      </Txt>
      <Txt size={12.5} weight="regular" color={color.inkSoft}>
        {label}
      </Txt>
    </View>
  );
}

function HistorySkeleton() {
  return (
    <View style={styles.gap} accessibilityState={{ busy: true }}>
      <View style={styles.tiles}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.tile, styles.gap8]}>
            <Skeleton width={36} height={24} tone="strong" />
            <Skeleton width={70} height={10} />
          </View>
        ))}
      </View>
      <View style={styles.list}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={34} height={34} r={11} />
            <View style={[styles.flex, styles.gap8]}>
              <Skeleton width="70%" height={14} tone="strong" />
              <Skeleton width="40%" height={10} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter, paddingTop: 14, gap: 14 },
  flex: { flex: 1, minWidth: 0 },
  gap: { gap: 14 },
  gap8: { gap: 8 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  list: {
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: tint(hue.green.base, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
