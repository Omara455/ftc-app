// Screen 25: my profile card, achievements strip, recent activity.
import { router } from 'expo-router';
import { Award, Check, Settings, UserPlus } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useMe } from '@/api/hooks';
import type { Activity, Me } from '@/api/types';
import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/Button';
import { Divider } from '@/components/Card';
import { CommitteeChip, LeagueBadge, RoleChip } from '@/components/Chip';
import { HeroSkeleton, QueryState, useOfflineBanner } from '@/components/QueryState';
import { TabScreen } from '@/components/TabScreen';
import { Ltr, Txt } from '@/components/Txt';
import { AchievementTile } from '@/features/account/AchievementTile';
import { ar } from '@/i18n/ar';
import { ago } from '@/i18n/dates';
import { hoursUnit } from '@/i18n/format';
import { useIsOffline } from '@/lib/network';
import { color, hue, league as leagues, radius, tint } from '@/theme/tokens';

export default function Account() {
  const query = useMe();
  const offline = useIsOffline();
  const banner = useOfflineBanner(query);
  return (
    <TabScreen
      banner={banner}
      refreshing={query.isRefetching}
      onRefresh={offline ? undefined : () => void query.refetch()}
      header={
        <View style={styles.header}>
          <Txt variant="title" leading={1.4} accessibilityRole="header">
            {ar.tabs.account}
          </Txt>
          <IconButton
            icon={Settings}
            accessibilityLabel={ar.tabs.settings}
            onPress={() => router.push('/account/settings')}
          />
        </View>
      }
    >
      <QueryState query={query} skeleton={<HeroSkeleton />}>
        {(me) => <Body me={me} />}
      </QueryState>
    </TabScreen>
  );
}

function Body({ me }: { me: Me }) {
  const a = ar.account;
  const unlocked = me.achievements.filter((x) => x.unlockedAt);
  const strip = [...unlocked, ...me.achievements.filter((x) => !x.unlockedAt)];
  return (
    <>
      <View style={styles.hero}>
        <Avatar gender={me.gender} size={80} photoUrl={me.photoUrl} ring="me" hero />
        <View style={styles.heroText}>
          <Txt size={20} leading={1.4} weight="extrabold" align="center">
            {me.name}
          </Txt>
          <View style={styles.chips}>
            <CommitteeChip label={me.committee.name} committeeKey={me.committee.key} />
            <RoleChip label={me.role} />
            <LeagueBadge league={me.league} />
          </View>
        </View>
        <View style={styles.stats}>
          <Stat value={me.tasksDone} label={a.tasksDone} />
          <Stat value={me.termHours} label={a.approvedHours} divided />
          <Stat
            value={me.pendingHours}
            label={a.pending}
            valueColor={me.pendingHours > 0 ? hue.amber.base : color.ink}
          />
        </View>
      </View>

      {me.achievements.length > 0 ? (
        <>
          <View style={styles.sectionHead}>
            <View style={styles.baseline}>
              <Txt variant="heading" accessibilityRole="header">
                {a.achievements}
              </Txt>
              <Txt size={12.5} weight="semibold" color={color.inkSoft}>
                {a.ofTotal(unlocked.length, me.achievements.length)}
              </Txt>
            </View>
            <Pressable
              onPress={() => router.push('/account/achievements')}
              accessibilityRole="link"
              hitSlop={10}
              style={styles.seeAll}
            >
              <Txt size={13} weight="semibold" color={color.accent}>
                {a.seeAll}
              </Txt>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.strip}
            contentContainerStyle={styles.stripContent}
          >
            {strip.map((x) => (
              <AchievementTile key={x.id} item={x} variant="strip" />
            ))}
          </ScrollView>
        </>
      ) : null}

      {me.recentActivity.length > 0 ? (
        <>
          <Txt variant="heading" accessibilityRole="header" style={styles.activityHead}>
            {a.activity}
          </Txt>
          <View style={styles.list}>
            {me.recentActivity.map((x, i) => (
              <Fragment key={`${x.type}-${x.at}`}>
                {i > 0 ? <Divider /> : null}
                <ActivityRow item={x} />
              </Fragment>
            ))}
          </View>
        </>
      ) : null}
    </>
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
      <Txt size={20} leading={1.4} weight="extrabold" color={valueColor} align="center">
        {value}
      </Txt>
      <Txt size={12} weight="regular" color={color.inkSoft} align="center">
        {label}
      </Txt>
    </View>
  );
}

function ActivityRow({ item }: { item: Activity }) {
  const look =
    item.type === 'task_approved'
      ? { icon: Check, fg: hue.green.base, bg: tint(hue.green.base, 0.14), stroke: 2.2 }
      : item.type === 'task_joined'
        ? { icon: UserPlus, fg: color.highlight, bg: tint(color.brand, 0.2), stroke: 2 }
        : {
            icon: Award,
            fg: leagues[item.league].fg,
            bg: tint(leagues[item.league].fg, 0.12),
            stroke: 2,
          };
  return (
    <View style={styles.activity}>
      <View style={[styles.activityIcon, { backgroundColor: look.bg }]}>
        <look.icon size={17} color={look.fg} strokeWidth={look.stroke} />
      </View>
      <View style={styles.flex}>
        <Txt size={13.5} weight="semibold" numberOfLines={2}>
          {item.text}
        </Txt>
        <Txt size={12} weight="regular" color={color.inkSoft}>
          {ago(item.at)}
          {item.type === 'task_approved' ? (
            <>
              {' · '}
              <Txt size={12} weight="bold" color={hue.green.base}>
                <Ltr>{`+${item.hours}`}</Ltr> {hoursUnit(item.hours)}
              </Txt>
            </>
          ) : null}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  heroText: { alignItems: 'center', gap: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  stats: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
  stat: { flex: 1, alignItems: 'center' },
  divided: { borderStartWidth: 1, borderEndWidth: 1, borderColor: color.line },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  baseline: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  seeAll: { paddingVertical: 6 },
  // bleeds off the end edge (left in RTL), as in the artboard
  strip: { marginEnd: -20 },
  stripContent: { gap: 10, paddingEnd: 20 },
  activityHead: { marginTop: 4 },
  list: {
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
