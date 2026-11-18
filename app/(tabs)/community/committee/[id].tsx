// Screen 22: committee — hero, leaders, members sorted by league. Never hours.
// The tab bar stays visible here (as in the artboard).
import { router, useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useCommittee, useMe } from '@/api/hooks';
import type { CommitteeDetail } from '@/api/types';
import { Header } from '@/components/Header';
import { HeroSkeleton, ListSkeleton, QueryState, useOfflineBanner } from '@/components/QueryState';
import { ScreenBackground } from '@/components/ScreenBackground';
import { TAB_BAR_SPACE } from '@/components/TabScreen';
import { Txt } from '@/components/Txt';
import { committeeLook, LeaderCard, MemberRow } from '@/features/community/parts';
import { ar } from '@/i18n/ar';
import { isolateLatin } from '@/i18n/bidi';
import { membersLabel } from '@/i18n/format';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, radius, space, tint } from '@/theme/tokens';

export default function CommitteePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useCommittee(Number(id));
  const meId = useMe().data?.id;
  const offline = useIsOffline();
  const banner = useOfflineBanner(query);
  const insets = useScreenInsets();

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header title={ar.community.committeeTitle} onBack={() => router.back()} />
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
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_SPACE + insets.bottom }]}
      >
        {banner}
        <QueryState
          query={query}
          skeleton={
            <>
              <HeroSkeleton />
              <ListSkeleton />
            </>
          }
        >
          {(c) => <Body c={c} meId={meId} />}
        </QueryState>
      </ScrollView>
    </View>
  );
}

function Body({ c, meId }: { c: CommitteeDetail; meId?: number }) {
  const look = committeeLook(c.key);
  const tech = c.key === 'tech';
  return (
    <>
      <View style={[styles.hero, c.isMine ? styles.heroMine : styles.heroPlain]}>
        <View style={styles.heroTop}>
          <View
            style={[styles.heroIcon, { backgroundColor: tint(tech ? color.accent : look.fg, 0.2) }]}
          >
            <look.icon size={26} color={tech ? color.highlight : look.fg} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Txt size={21} leading={1.4} weight="extrabold" accessibilityRole="header">
              {c.title}
            </Txt>
            <Txt variant="meta" weight="regular" color={color.inkSecondary}>
              {c.isMine
                ? `${membersLabel(c.membersCount)} · ${ar.community.yours}`
                : membersLabel(c.membersCount)}
            </Txt>
          </View>
        </View>
        <Txt size={14} leading={1.8} weight="regular" color={color.inkSecondary}>
          {isolateLatin(c.description)}
        </Txt>
      </View>

      {c.leaders.length > 0 ? (
        <>
          <Txt variant="meta" weight="semibold" color={color.inkSoft}>
            {ar.community.leaders}
          </Txt>
          <View style={styles.leaders}>
            {c.leaders.map((m) => (
              <LeaderCard
                key={m.id}
                member={m}
                onPress={() => router.push(`/community/member/${m.id}`)}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.membersHead}>
        <Txt variant="meta" weight="semibold" color={color.inkSoft}>
          {ar.community.membersCount(Math.max(c.members.length, c.membersCount - c.leaders.length))}
        </Txt>
        <Txt size={12.5} weight="regular" color={color.inkSoft}>
          {ar.community.byLeague}
        </Txt>
      </View>
      <View style={styles.list}>
        {c.members.map((m, i) => (
          <MemberRow
            key={m.id}
            member={m}
            me={m.id === meId}
            first={i === 0}
            onPress={() =>
              m.id === meId ? router.navigate('/account') : router.push(`/community/member/${m.id}`)
            }
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: space.gutter, paddingTop: 14, gap: 14 },
  hero: { gap: 12, padding: 18, borderRadius: 22 },
  heroMine: {
    backgroundColor: tint(color.brand, 0.13),
    borderWidth: 1.5,
    borderColor: color.brand,
  },
  heroPlain: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaders: { flexDirection: 'row', gap: 10 },
  membersHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  list: {
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
  },
});
