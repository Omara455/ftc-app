// Screen 23: member profile — league, never hours (privacy rule 6).
import { router, useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useMember } from '@/api/hooks';
import type { MemberDetail } from '@/api/types';
import { Avatar } from '@/components/Avatar';
import { Chip, CommitteeChip, LeagueBadge, RoleChip } from '@/components/Chip';
import { Header } from '@/components/Header';
import { HeroSkeleton, QueryState, useOfflineBanner } from '@/components/QueryState';
import { ScreenBackground } from '@/components/ScreenBackground';
import { Txt } from '@/components/Txt';
import { AchievementTile } from '@/features/account/AchievementTile';
import { roleColor } from '@/features/community/parts';
import { ar } from '@/i18n/ar';
import { isolateLatin } from '@/i18n/bidi';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, space, tint } from '@/theme/tokens';

export default function MemberPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useMember(Number(id));
  const offline = useIsOffline();
  const banner = useOfflineBanner(query);
  const insets = useScreenInsets();

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header title={ar.community.memberTitle} onBack={() => router.back()} />
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
        <QueryState query={query} skeleton={<HeroSkeleton />}>
          {(m) => <Body m={m} />}
        </QueryState>
      </ScrollView>
    </View>
  );
}

function Body({ m }: { m: MemberDetail }) {
  const roleTone = roleColor(m.roleKind);
  return (
    <>
      <View style={styles.hero}>
        <Avatar gender={m.gender} size={84} photoUrl={m.photoUrl} hero />
        <Txt size={20} leading={1.4} weight="extrabold" align="center" accessibilityRole="header">
          {m.name}
        </Txt>
        <View style={styles.chips}>
          <CommitteeChip label={m.committee.name} committeeKey={m.committee.key} />
          {m.roleKind === 'member' ? (
            <RoleChip label={m.role} />
          ) : (
            <Chip label={m.role} fg={roleTone} bg={tint(roleTone, 0.14)} />
          )}
          <LeagueBadge league={m.league} />
        </View>
        {m.bio ? (
          <Txt
            size={14}
            leading={1.8}
            weight="regular"
            color={color.inkSecondary}
            align="center"
            style={styles.bio}
          >
            {isolateLatin(m.bio)}
          </Txt>
        ) : null}
      </View>

      {m.achievements.length > 0 ? (
        <>
          <View style={styles.headRow}>
            <Txt size={16} weight="bold" accessibilityRole="header">
              {ar.community.latestAchievements(m.gender)}
            </Txt>
            <Txt size={12.5} weight="semibold" color={color.inkSoft}>
              {ar.account.ofTotal(m.achievementsUnlocked, m.achievementsTotal)}
            </Txt>
          </View>
          <View style={styles.grid}>
            {m.achievements.slice(0, 3).map((a) => (
              <View key={a.id} style={styles.cell}>
                <AchievementTile item={a} variant="profile" />
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.privacy}>
        <Lock size={17} color={color.inkSoft} strokeWidth={1.9} style={styles.privacyIcon} />
        <Txt size={13} leading={1.7} weight="regular" color={color.inkSoft} style={styles.flex}>
          {ar.community.privacyNote}
        </Txt>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  content: { paddingHorizontal: space.gutter, paddingTop: 16, gap: 14 },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  bio: { marginTop: 4 },
  headRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  grid: { flexDirection: 'row', gap: 10 },
  cell: { flex: 1 },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
  },
  privacyIcon: { marginTop: 3 },
});
