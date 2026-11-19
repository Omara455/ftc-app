// Screen 17: notifications (Phase 2, flags.notifications). Grouped «اليوم» / «هالأسبوع»
// (/ «أقدم»), unread items tinted with a glow dot. Tapping one marks it read and opens its
// screen (SCREENS.md map); «تحديد الكل كمقروء» marks everything read.
import { Redirect, router } from 'expo-router';
import {
  ArrowRight,
  Award,
  Bell,
  Check,
  Clock,
  RotateCcw,
  Shield,
  SquarePlus,
  type LucideIcon,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { useMarkRead, useNotifications } from '@/api/notifications';
import type { AppNotification, NotificationType } from '@/api/types';
import { IconButton } from '@/components/Button';
import { ErrorState } from '@/components/ErrorState';
import { useOfflineBanner } from '@/components/QueryState';
import { ScreenBackground } from '@/components/ScreenBackground';
import { Skeleton } from '@/components/Skeleton';
import { Txt } from '@/components/Txt';
import { flags } from '@/config/flags';
import { ar } from '@/i18n/ar';
import { isolateLatin } from '@/i18n/bidi';
import { ago, clockTime, daysUntil } from '@/i18n/dates';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { routeForPush } from '@/lib/push';
import { color, hue, league as leagues, radius, space, tint } from '@/theme/tokens';

const t = ar.notifications;

/** Icon and tile per type (artboard 17). `league` items use the reached league's colour. */
const LOOK: Record<NotificationType, { icon: LucideIcon; tone: string; alpha: number }> = {
  task_returned: { icon: RotateCcw, tone: hue.orange.base, alpha: 0.16 },
  task_new: { icon: SquarePlus, tone: color.highlight, alpha: 0.22 },
  deadline: { icon: Clock, tone: hue.amber.base, alpha: 0.14 },
  task_approved: { icon: Check, tone: hue.green.base, alpha: 0.14 },
  achievement: { icon: Award, tone: hue.teal.base, alpha: 0.14 },
  league: { icon: Shield, tone: leagues.silver.fg, alpha: 0.12 },
};

type Row =
  { kind: 'heading'; label: string; first: boolean } | { kind: 'item'; n: AppNotification };

function group(items: AppNotification[]): Row[] {
  const rows: Row[] = [];
  let current: string | null = null;
  for (const n of items) {
    const days = -daysUntil(n.createdAt);
    const label = days === 0 ? t.today : days < 7 ? t.thisWeek : t.older;
    if (label !== current) {
      rows.push({ kind: 'heading', label, first: current === null });
      current = label;
    }
    rows.push({ kind: 'item', n });
  }
  return rows;
}

export default function Notifications() {
  if (!flags.notifications) return <Redirect href="/tasks" />;
  return <NotificationsScreen />;
}

function NotificationsScreen() {
  const insets = useScreenInsets();
  const offline = useIsOffline();
  const query = useNotifications();
  const markRead = useMarkRead();
  const banner = useOfflineBanner(query);

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const rows = useMemo(() => group(items), [items]);
  const hasUnread = items.some((n) => !n.readAt);

  function open(n: AppNotification) {
    if (!n.readAt && !offline) markRead.mutate([n.id]);
    const href = routeForPush(n.type, n.taskId);
    if (href) router.push(href);
  }

  let body: React.ReactNode = null;
  if (!query.data) {
    body =
      query.isError && !offline ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <NotificationsSkeleton />
      );
  } else if (items.length === 0) {
    body = <Empty />;
  }

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <View style={[styles.header, { marginTop: insets.top + 7 }]}>
        <View style={styles.titleRow}>
          <IconButton
            icon={ArrowRight}
            iconColor={color.ink}
            accessibilityLabel={ar.common.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/tasks'))}
          />
          <Txt size={20} weight="extrabold" accessibilityRole="header">
            {t.title}
          </Txt>
        </View>
        {hasUnread && !offline ? (
          <Pressable
            onPress={() => markRead.mutate(undefined)}
            accessibilityRole="button"
            hitSlop={6}
            style={styles.markAll}
          >
            <Txt size={13} weight="semibold" color={color.accent}>
              {t.markAll}
            </Txt>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={body ? [] : rows}
        keyExtractor={(r) => (r.kind === 'item' ? `n${r.n.id}` : `h${r.label}`)}
        renderItem={({ item: r }) =>
          r.kind === 'heading' ? (
            <Txt
              size={13}
              weight="semibold"
              color={color.inkSoft}
              accessibilityRole="header"
              style={!r.first && styles.laterHeading}
            >
              {r.label}
            </Txt>
          ) : (
            <NotificationRow n={r.n} onPress={() => open(r.n)} />
          )
        }
        ListHeaderComponent={
          banner || body ? (
            <View style={styles.gap10}>
              {banner}
              {body}
            </View>
          ) : undefined
        }
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage && !offline)
            void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          offline ? undefined : (
            <RefreshControl
              refreshing={query.isRefetching && !query.isFetchingNextPage}
              onRefresh={() => void query.refetch()}
              tintColor={color.accent}
              colors={[color.brand]}
            />
          )
        }
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      />
    </View>
  );
}

function NotificationRow({ n, onPress }: { n: AppNotification; onPress: () => void }) {
  const look = LOOK[n.type];
  const tone = n.type === 'league' && n.league ? leagues[n.league].fg : look.tone;
  const Icon = look.icon;
  const unread = !n.readAt;
  // The morning deadline reminder shows its time («9:00 ص»), everything else how long ago.
  const when =
    n.type === 'deadline' && daysUntil(n.createdAt) === 0
      ? clockTime(n.createdAt)
      : ago(n.createdAt);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${unread ? `${ar.common.unread}، ` : ''}${n.title}، ${n.body}، ${when}`}
      style={({ pressed }) => [styles.row, unread && styles.unread, pressed && styles.pressed]}
    >
      <View style={[styles.tile, { backgroundColor: tint(tone, look.alpha) }]}>
        <Icon size={19} color={tone} strokeWidth={1.9} />
      </View>
      <View style={styles.text}>
        <View style={styles.top}>
          <Txt size={14} weight="bold" style={styles.flex}>
            {n.title}
          </Txt>
          <Txt size={11.5} weight="regular" color={color.inkSoft}>
            {when}
          </Txt>
        </View>
        <Txt size={13} leading={1.6} weight="regular" color={color.inkSecondary}>
          {isolateLatin(n.body)}
        </Txt>
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

function Empty() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Bell size={30} color={color.highlight} strokeWidth={1.7} />
      </View>
      <Txt size={18} weight="extrabold" align="center" accessibilityRole="header">
        {t.emptyTitle}
      </Txt>
      <Txt size={14} leading={1.75} weight="regular" color={color.inkSoft} align="center">
        {t.emptyBody}
      </Txt>
    </View>
  );
}

function NotificationsSkeleton() {
  return (
    <View style={styles.gap10} accessibilityState={{ busy: true }}>
      <Skeleton width={50} height={13} />
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={40} height={40} r={12} />
          <View style={[styles.text, styles.gap8]}>
            <Skeleton width="55%" height={14} tone="strong" />
            <Skeleton width="80%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  header: {
    height: 52,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markAll: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  content: { paddingHorizontal: space.gutter, paddingTop: 16, gap: 10 },
  gap8: { gap: 8 },
  gap10: { gap: 10 },
  laterHeading: { marginTop: 6 },
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  unread: {
    backgroundColor: tint(color.brand, 0.12),
    borderColor: tint(color.accent, 0.3),
  },
  pressed: { opacity: 0.85 },
  tile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0, gap: 2 },
  top: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: color.glow },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
    marginTop: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: tint(color.brand, 0.18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
});
