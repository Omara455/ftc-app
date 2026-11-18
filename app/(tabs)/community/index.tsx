// Screen 20: community — counts, search, club leadership, my committee, all committees.
import { router } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCommunity } from '@/api/hooks';
import { QueryState, useOfflineBanner } from '@/components/QueryState';
import { TabHeader } from '@/components/TabHeader';
import { TabScreen } from '@/components/TabScreen';
import { Txt } from '@/components/Txt';
import { CommitteeRow, LeaderCard, MyCommitteeCard, SearchLink } from '@/features/community/parts';
import { ar } from '@/i18n/ar';
import { committeesLabel, membersLabel, teamsLabel } from '@/i18n/format';
import { useIsOffline } from '@/lib/network';
import { color, radius } from '@/theme/tokens';

const openCommittee = (id: number) => router.push(`/community/committee/${id}`);
const openMember = (id: number) => router.push(`/community/member/${id}`);

export default function Community() {
  const query = useCommunity();
  const offline = useIsOffline();
  const banner = useOfflineBanner(query);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const counts = query.data?.counts;

  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <TabScreen
      headerSpacing={9}
      banner={banner}
      refreshing={query.isRefetching}
      onRefresh={offline ? undefined : () => void query.refetch()}
      header={
        <TabHeader
          icon={Users}
          title={ar.tabs.community}
          subtitle={
            counts
              ? [
                  membersLabel(counts.members),
                  committeesLabel(counts.committees),
                  teamsLabel(counts.teams),
                ].join(' · ')
              : undefined
          }
        />
      }
    >
      <SearchLink onPress={() => router.push('/community/search')} />
      <QueryState query={query}>
        {(data) => {
          const mine = data.committees.find((c) => c.isMine);
          const others = data.committees.filter((c) => !c.isMine);
          return (
            <View style={styles.body}>
              {data.leadership.length > 0 ? (
                <>
                  <SectionLabel text={ar.community.leadership} />
                  <View style={styles.leaders}>
                    {data.leadership.map((m) => (
                      <LeaderCard key={m.id} member={m} withIcon onPress={() => openMember(m.id)} />
                    ))}
                  </View>
                </>
              ) : null}
              {mine ? <MyCommitteeCard c={mine} onPress={() => openCommittee(mine.id)} /> : null}
              <SectionLabel text={ar.community.committees} top />
              <View style={styles.list}>
                {others.map((c, i) => (
                  <CommitteeRow
                    key={c.id}
                    c={c}
                    first={i === 0}
                    expanded={open.has(c.id)}
                    onToggle={() => toggle(c.id)}
                    onPress={() => openCommittee(c.id)}
                  />
                ))}
              </View>
            </View>
          );
        }}
      </QueryState>
    </TabScreen>
  );
}

function SectionLabel({ text, top }: { text: string; top?: boolean }) {
  return (
    <Txt variant="meta" weight="semibold" color={color.inkSoft} style={top && styles.labelTop}>
      {text}
    </Txt>
  );
}

const styles = StyleSheet.create({
  body: { gap: 12 },
  leaders: { flexDirection: 'row', gap: 10 },
  labelTop: { marginTop: 4 },
  list: {
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
  },
});
