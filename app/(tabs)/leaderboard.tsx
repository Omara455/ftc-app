// Screen 24: league card, monthly top 10 (podium + ranks 4–10), pinned «ترتيبك هالشهر».
// Approved hours of other members appear ONLY here (privacy rule 6).
import { Award, Check, Clock, Crown, Shield } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useLeaderboard, useMe } from '@/api/hooks';
import type { LeaderboardResponse, RankRow } from '@/api/types';
import { Avatar } from '@/components/Avatar';
import { BottomFade } from '@/components/BottomFade';
import { Divider } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { ListSkeleton, QueryState, useOfflineBanner } from '@/components/QueryState';
import { tabBarBottom } from '@/components/TabBar';
import { TabHeader } from '@/components/TabHeader';
import { TabScreen } from '@/components/TabScreen';
import { Ltr, Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { daysLeftInMonth, monthName } from '@/i18n/dates';
import { daysLeftLabel, hoursLabel } from '@/i18n/format';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, hue, league as leagues, radius, shadow, tint, type League } from '@/theme/tokens';

const ORDER: League[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
const PINNED_SPACE = 64 + 12;

export default function Leaderboard() {
  const query = useLeaderboard();
  const meId = useMe().data?.id;
  const offline = useIsOffline();
  const banner = useOfflineBanner(query);
  const insets = useScreenInsets();
  const data = query.data;
  const pinned = data && data.myPosition != null && !data.inRanking;

  return (
    <View style={styles.screen}>
      <TabScreen
        banner={banner}
        gap={12}
        headerSpacing={13}
        extraBottom={pinned ? PINNED_SPACE : 0}
        refreshing={query.isRefetching}
        onRefresh={offline ? undefined : () => void query.refetch()}
        header={
          <TabHeader
            icon={Shield}
            tone={leagues.bronze.fg}
            title={ar.tabs.leaderboard}
            subtitle={ar.tabs.leaderboardSub}
          />
        }
      >
        <QueryState query={query} skeleton={<ListSkeleton rows={6} />}>
          {(d) => (
            <>
              <LeagueCard d={d} />
              <TopTen d={d} meId={meId} />
            </>
          )}
        </QueryState>
      </TabScreen>
      {pinned && data ? (
        <>
          <BottomFade height={210} solidFrom={0.6} />
          <View style={[styles.pinned, { bottom: tabBarBottom(insets.bottom) + 66 + 12 }]}>
            <MyRank d={data} />
          </View>
        </>
      ) : null}
    </View>
  );
}

// ── «مستواك هالترم» ─────────────────────────────────────────────────────────

function LeagueCard({ d }: { d: LeaderboardResponse }) {
  const current = leagues[d.myLeague];
  const idx = ORDER.indexOf(d.myLeague);
  const next = d.nextLeague ? leagues[d.nextLeague] : null;
  return (
    <View accessibilityLabel={ar.leaderboard.leagueLabel} style={[styles.card, styles.gap14]}>
      <View style={styles.between}>
        <View>
          <Txt size={12.5} weight="medium" color={color.inkSoft}>
            {ar.leaderboard.yourLeague}
          </Txt>
          <Txt size={21} leading={1.45} weight="extrabold" color={current.fg}>
            {ar.leaderboard.leagueTitle(current.label)}
          </Txt>
        </View>
        <View
          style={[
            styles.award,
            { backgroundColor: tint(current.fg, 0.12), borderColor: tint(current.fg, 0.45) },
          ]}
        >
          <Award size={24} color={current.fg} strokeWidth={1.8} />
        </View>
      </View>

      <View style={styles.steps}>
        {ORDER.map((key, i) => {
          const l = leagues[key];
          const state = i < idx ? 'done' : i === idx ? 'current' : 'future';
          return (
            <View key={key} style={styles.step}>
              {state === 'done' ? (
                <View style={[styles.stepDot, { backgroundColor: l.fg }]}>
                  <Check size={14} color={color.surface} strokeWidth={3} />
                </View>
              ) : state === 'current' ? (
                <View style={[styles.stepRing, { borderColor: tint(l.fg, 0.12) }]}>
                  <View
                    style={[
                      styles.stepDot,
                      { backgroundColor: tint(l.fg, 0.16), borderWidth: 2, borderColor: l.fg },
                    ]}
                  />
                </View>
              ) : (
                <View
                  style={[styles.stepDot, { borderWidth: 1.5, borderColor: tint(l.fg, 0.4) }]}
                />
              )}
              <Txt
                size={11}
                weight={state === 'current' ? 'bold' : 'semibold'}
                color={state === 'done' ? l.fg : state === 'current' ? color.ink : color.inkSoft}
              >
                {l.label}
              </Txt>
            </View>
          );
        })}
      </View>

      {next && d.hoursToNext != null ? (
        <View style={styles.gap8}>
          <View style={styles.between}>
            <Txt size={13} weight="semibold">
              {ar.leaderboard.toNext(hoursLabel(d.hoursToNext), next.label)}
            </Txt>
            <Txt size={12.5} weight="semibold" color={color.inkSoft}>
              <Ltr>{`${d.myHours} / ${next.min}`}</Ltr>
            </Txt>
          </View>
          <ProgressBar value={d.myHours / next.min} fill={current.fg} />
        </View>
      ) : null}
    </View>
  );
}

// ── «أفضل 10 لشهر نوفمبر» ───────────────────────────────────────────────────

function TopTen({ d, meId }: { d: LeaderboardResponse; meId?: number }) {
  const [first, second, third] = d.monthlyTop;
  const rest = d.monthlyTop.slice(3);
  return (
    <View accessibilityLabel={ar.leaderboard.topLabel} style={[styles.card, styles.topCard]}>
      <View style={styles.between}>
        <Txt size={16} weight="bold" accessibilityRole="header">
          {ar.leaderboard.topTitle(monthName(new Date()))}
        </Txt>
        <View style={styles.monthChip}>
          <Clock size={13} color={color.inkSecondary} strokeWidth={2} />
          <Txt variant="chip" color={color.inkSecondary}>
            {daysLeftLabel(daysLeftInMonth())}
          </Txt>
        </View>
      </View>

      {first && second && third ? (
        <View style={styles.podium}>
          <Podium row={second} place={2} />
          <Podium row={first} place={1} />
          <Podium row={third} place={3} />
        </View>
      ) : null}

      <View>
        {rest.map((r) => (
          <View key={r.id}>
            <Divider />
            <View style={[styles.rankRow, r.id === meId && styles.meRow]}>
              <Txt size={14} weight="bold" color={color.inkSoft} align="center" style={styles.pos}>
                {r.position}
              </Txt>
              <Avatar gender={r.gender} size={34} ring={r.id === meId ? 'me' : 'none'} />
              <View style={styles.flex}>
                <Txt size={14} weight="bold" numberOfLines={1}>
                  {r.id === meId ? ar.task.you : r.name}
                </Txt>
                <Txt size={12} weight="regular" color={color.inkSoft}>
                  {r.committee.name}
                </Txt>
              </View>
              <Txt size={13} weight="bold" color={color.inkSecondary}>
                {hoursLabel(r.hours)}
              </Txt>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const PODIUM = {
  1: { fg: hue.amber.base, height: 80, avatar: 58 },
  2: { fg: leagues.silver.fg, height: 58, avatar: 46 },
  3: { fg: leagues.bronze.fg, height: 44, avatar: 46 },
} as const;

function Podium({ row, place }: { row: RankRow; place: 1 | 2 | 3 }) {
  const p = PODIUM[place];
  const top = place === 1;
  return (
    <View style={styles.podiumCol}>
      {top ? (
        <Crown size={22} color={hue.amber.base} fill={hue.amber.base} strokeWidth={1.5} />
      ) : null}
      <View
        style={[
          styles.podiumRing,
          { borderColor: p.fg, borderWidth: top ? 2.5 : 2, borderRadius: (p.avatar + 6) / 2 },
          top && styles.glow,
        ]}
      >
        <Avatar gender={row.gender} size={p.avatar} ring="none" />
      </View>
      <View style={styles.center}>
        <Txt
          size={top ? 13.5 : 13}
          weight={top ? 'extrabold' : 'bold'}
          align="center"
          numberOfLines={1}
        >
          {row.name}
        </Txt>
        <Txt size={11.5} weight="regular" color={color.inkSoft}>
          {hoursLabel(row.hours)}
        </Txt>
      </View>
      <View
        style={[
          styles.base,
          {
            height: p.height,
            borderTopColor: p.fg,
            backgroundColor: tint(p.fg, top ? 0.13 : 0.12),
          },
        ]}
      >
        <Txt size={top ? 22 : 20} leading={1.2} weight="extrabold" color={p.fg}>
          {place}
        </Txt>
        {top ? (
          <Txt size={10.5} weight="bold" color={hue.amber.s300}>
            {ar.leaderboard.topMember(row.gender)}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

// ── Pinned «ترتيبك هالشهر» ──────────────────────────────────────────────────

function MyRank({ d }: { d: LeaderboardResponse }) {
  const tenth = d.monthlyTop[d.monthlyTop.length - 1];
  const gap = tenth ? Math.max(1, tenth.hours - d.myMonthHours + 1) : null;
  const sub = gap
    ? `${hoursLabel(d.myMonthHours)} · ${ar.leaderboard.toTopTen(hoursLabel(gap))}`
    : hoursLabel(d.myMonthHours);
  return (
    <View style={styles.myRank}>
      <Txt size={16} weight="extrabold" color={color.highlight} align="center" style={styles.myPos}>
        {d.myPosition}
      </Txt>
      <MeAvatar />
      <View style={styles.flex}>
        <Txt size={14} weight="bold">
          {ar.leaderboard.yourRank}
        </Txt>
        <Txt size={12} weight="regular" color={color.inkSecondary}>
          {sub}
        </Txt>
      </View>
    </View>
  );
}

function MeAvatar() {
  const me = useMe().data;
  return <Avatar gender={me?.gender ?? 'male'} size={34} ring="me" photoUrl={me?.photoUrl} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1, minWidth: 0 },
  center: { alignItems: 'center', maxWidth: '100%' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gap8: { gap: 8 },
  gap14: { gap: 14 },
  card: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  award: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: { flexDirection: 'row', gap: 4 },
  step: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 4pt soft ring around the current league (CSS box-shadow spread)
  stepRing: { margin: -4, padding: 0, borderWidth: 4, borderRadius: 18 },
  topCard: { gap: 14, paddingBottom: 6 },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: color.raised,
  },
  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  podiumCol: { flex: 1, alignItems: 'center', gap: 6 },
  podiumRing: { padding: 1 },
  glow: {
    shadowColor: hue.amber.base,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  base: {
    alignSelf: 'stretch',
    borderTopStartRadius: 12,
    borderTopEndRadius: 12,
    borderTopWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  meRow: { backgroundColor: tint(color.brand, 0.1), borderRadius: radius.sm },
  pos: { width: 20 },
  pinned: { position: 'absolute', start: 20, end: 20 },
  myRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.card,
    backgroundColor: color.pinnedSurface,
    borderWidth: 1.5,
    borderColor: color.brand,
    ...shadow.banner,
  },
  myPos: { width: 24 },
});
