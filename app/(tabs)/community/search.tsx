// Screen 21: member search (GET /members?q=), autofocused, with the match highlighted.
import { router } from 'expo-router';
import { Search as SearchIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useMemberSearch } from '@/api/hooks';
import type { MemberCard } from '@/api/types';
import { ErrorState } from '@/components/ErrorState';
import { ListSkeleton, useOfflineBanner } from '@/components/QueryState';
import { ScreenBackground } from '@/components/ScreenBackground';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { MemberRow } from '@/features/community/parts';
import { ar } from '@/i18n/ar';
import { membersLabel } from '@/i18n/format';
import { matchIndex } from '@/lib/arabic';
import { useScreenInsets } from '@/lib/insets';
import { useIsOffline } from '@/lib/network';
import { color, radius, space } from '@/theme/tokens';

function useDebounced(value: string, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Search() {
  const insets = useScreenInsets();
  const [text, setText] = useState('');
  const q = useDebounced(text.trim());
  const query = useMemberSearch(q);
  const offline = useIsOffline();
  const banner = useOfflineBanner(query);
  const results = q ? query.data : undefined;

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <View style={[styles.bar, { marginTop: insets.top + 11 }]}>
        <View style={styles.flex}>
          <TextField
            accessibilityLabel={ar.community.searchLabel}
            icon={SearchIcon}
            onSurface
            height={48}
            value={text}
            onChangeText={setText}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            placeholder={ar.community.searchPlaceholder}
          />
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.cancel}
        >
          <Txt size={14.5} weight="semibold" color={color.accent}>
            {ar.common.cancel}
          </Txt>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {banner}
        {!q ? null : results ? (
          <>
            <Txt variant="meta" weight="semibold" color={color.inkSoft}>
              {results.length ? membersLabel(results.length) : ar.community.noResults}
            </Txt>
            {results.length ? (
              <View style={styles.list}>
                {results.map((m, i) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    first={i === 0}
                    trailing="chevron"
                    sub={`${m.committee.name} · ${m.role}`}
                    name={<HighlightedName member={m} q={q} />}
                    onPress={() => router.push(`/community/member/${m.id}`)}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : query.isError && !offline ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <ListSkeleton rows={3} />
        )}
      </ScrollView>
    </View>
  );
}

/** «سا» in «سارة المطيري» drawn in the highlight colour. */
function HighlightedName({ member, q }: { member: MemberCard; q: string }) {
  const i = matchIndex(member.name, q);
  if (i < 0) {
    return (
      <Txt size={15} weight="bold" numberOfLines={1}>
        {member.name}
      </Txt>
    );
  }
  const end = i + q.length;
  return (
    <Txt size={15} weight="bold" numberOfLines={1}>
      {member.name.slice(0, i)}
      <Txt size={15} weight="bold" color={color.highlight}>
        {member.name.slice(i, end)}
      </Txt>
      {member.name.slice(end)}
    </Txt>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: space.gutter,
  },
  cancel: { paddingVertical: 10, paddingHorizontal: 2, minHeight: 44, justifyContent: 'center' },
  content: { paddingHorizontal: space.gutter, paddingTop: 22, gap: 10 },
  list: {
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
  },
});
