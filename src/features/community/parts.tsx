// Community building blocks (screens 20–23).
import {
  ChevronDown,
  ChevronLeft,
  Code,
  Crown,
  FolderKanban,
  Handshake,
  Lightbulb,
  Megaphone,
  PartyPopper,
  Search,
  Star,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Committee, MemberCard, RoleKind } from '@/api/types';
import { Avatar } from '@/components/Avatar';
import { Divider } from '@/components/Card';
import { LeagueBadge, MineChip } from '@/components/Chip';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { membersLabel, teamsLabel } from '@/i18n/format';
import { color, committee as committees, hue, radius, tint } from '@/theme/tokens';

const ICONS: Record<string, LucideIcon> = {
  Code,
  PartyPopper,
  Lightbulb,
  Handshake,
  Megaphone,
  Users,
  FolderKanban,
  Wallet,
};

/** Committee colour + icon from tokens (falls back to brand + Users). */
export function committeeLook(key: string): { fg: string; text: string; icon: LucideIcon } {
  const c = committees[key as keyof typeof committees];
  if (!c) return { fg: color.accent, text: color.highlight, icon: Users };
  return { fg: c.fg, text: c.text, icon: ICONS[c.icon] ?? Users };
}

/** Role colour: amber + crown for the club leadership and committee heads, blue + star for deputies. */
export function roleColor(kind: RoleKind): string {
  if (kind === 'deputy') return hue.blue.s300;
  if (kind === 'member') return color.inkSoft;
  return hue.amber.base;
}
export const roleIcon = (kind: RoleKind): LucideIcon => (kind === 'deputy' ? Star : Crown);

export function RoleIcon({ kind, size }: { kind: RoleKind; size: number }) {
  return kind === 'deputy' ? (
    <Star size={size} color={roleColor(kind)} strokeWidth={2} />
  ) : (
    <Crown size={size} color={roleColor(kind)} strokeWidth={2} />
  );
}

// ── Search box that opens screen 21 ─────────────────────────────────────────

export function SearchLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={ar.community.searchLabel}
      style={({ pressed }) => [styles.search, pressed && styles.pressed]}
    >
      <Search size={18} color={color.inkSoft} strokeWidth={2} />
      <Txt size={14.5} weight="regular" color={color.inkSoft}>
        {ar.community.searchPlaceholder}
      </Txt>
    </Pressable>
  );
}

// ── Leader card (club leadership on 20, committee leaders on 22) ────────────

export function LeaderCard({
  member,
  withIcon,
  onPress,
}: {
  member: MemberCard;
  /** Crown / star before the role (club leadership only). */
  withIcon?: boolean;
  onPress?: () => void;
}) {
  const tone = roleColor(member.roleKind);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => [styles.leader, pressed && styles.pressed]}
    >
      <Avatar gender={member.gender} size={40} photoUrl={member.photoUrl} />
      <View style={styles.flexMin}>
        <Txt size={14} weight="bold" numberOfLines={1}>
          {member.name}
        </Txt>
        <View style={styles.inline4}>
          {withIcon ? <RoleIcon kind={member.roleKind} size={12} /> : null}
          <Txt size={12} weight="semibold" color={tone} numberOfLines={1}>
            {member.role}
          </Txt>
        </View>
      </View>
    </Pressable>
  );
}

// ── «لجنتك» highlighted card on 20 ──────────────────────────────────────────

export function MyCommitteeCard({ c, onPress }: { c: Committee; onPress: () => void }) {
  const look = committeeLook(c.key);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => [styles.mine, pressed && styles.pressed]}
    >
      <View style={styles.row12}>
        <View style={[styles.mineIcon, { backgroundColor: tint(color.accent, 0.18) }]}>
          <look.icon size={22} color={color.highlight} strokeWidth={1.9} />
        </View>
        <View style={styles.flex}>
          <Txt size={16} weight="bold">
            {c.title}
          </Txt>
          <Txt size={12.5} weight="medium" color={color.inkSecondary}>
            {membersLabel(c.membersCount)}
          </Txt>
        </View>
        <MineChip label={ar.community.yours} />
      </View>
      {c.leader || c.deputy ? (
        <View style={styles.mineLeaders}>
          {[c.leader, c.deputy].map((m) =>
            m ? (
              <View key={m.id} style={styles.inline6}>
                <RoleIcon kind={m.roleKind} size={14} />
                <Txt size={13} weight="regular" color={color.inkSecondary}>
                  {m.name}
                </Txt>
              </View>
            ) : null,
          )}
        </View>
      ) : null}
    </Pressable>
  );
}

// ── Committee row on 20 (expands to show its teams) ─────────────────────────

export function CommitteeRow({
  c,
  expanded,
  onToggle,
  onPress,
  first,
}: {
  c: Committee;
  expanded: boolean;
  onToggle: () => void;
  onPress: () => void;
  first: boolean;
}) {
  const look = committeeLook(c.key);
  const hasTeams = c.teams.length > 0;
  const sub = [
    membersLabel(c.membersCount),
    c.leader?.name,
    hasTeams ? teamsLabel(c.teams.length) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <View style={expanded && { backgroundColor: tint(look.fg, 0.05) }}>
      {first ? null : <Divider />}
      <View style={styles.committeeRow}>
        <Pressable
          onPress={onPress}
          accessibilityRole="link"
          style={({ pressed }) => [styles.committeeMain, pressed && styles.pressed]}
        >
          <View style={[styles.committeeIcon, { backgroundColor: tint(look.fg, 0.15) }]}>
            <look.icon size={19} color={look.fg} strokeWidth={1.9} />
          </View>
          <View style={styles.flexMin}>
            <View style={styles.inline6}>
              <Txt size={15} weight="bold">
                {c.title}
              </Txt>
              {c.mixed ? (
                <View style={[styles.mixed, { backgroundColor: tint(look.fg, 0.14) }]}>
                  <Txt size={11} weight="semibold" color={look.text}>
                    {ar.community.mixed}
                  </Txt>
                </View>
              ) : null}
            </View>
            <Txt size={12.5} weight="regular" color={color.inkSoft} numberOfLines={1}>
              {sub}
            </Txt>
          </View>
        </Pressable>
        {hasTeams ? (
          <Pressable
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={ar.community.showTeams(teamsLabel(c.teams.length))}
            hitSlop={6}
            style={styles.chevron}
          >
            {expanded ? (
              <ChevronDown size={18} color={color.inkMuted} strokeWidth={2} />
            ) : (
              <ChevronLeft size={18} color={color.inkMuted} strokeWidth={2} />
            )}
          </Pressable>
        ) : (
          <View style={styles.chevron}>
            <ChevronLeft size={18} color={color.inkMuted} strokeWidth={2} />
          </View>
        )}
      </View>
      {expanded ? (
        <View style={styles.teams}>
          {c.teams.map((t) => (
            <View
              key={t.id}
              style={[
                styles.team,
                { backgroundColor: tint(look.fg, 0.1), borderColor: tint(look.fg, 0.25) },
              ]}
            >
              <Txt size={12} weight="semibold" color={look.text}>
                {`${t.name} · ${t.membersCount}`}
              </Txt>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// ── Member row (committee members on 22, search results on 21) ─────────────

export function MemberRow({
  member,
  me,
  first,
  onPress,
  sub,
  name,
  trailing = 'league',
}: {
  member: MemberCard;
  me?: boolean;
  first: boolean;
  onPress: () => void;
  /** Second line (search: «التقنية · نائبة القائد»). */
  sub?: string;
  /** Custom name node (search highlight). */
  name?: React.ReactNode;
  trailing?: 'league' | 'chevron';
}) {
  return (
    <>
      {first ? null : <Divider />}
      <Pressable
        onPress={onPress}
        accessibilityRole="link"
        style={({ pressed }) => [
          styles.memberRow,
          sub ? styles.memberRowTall : null,
          me && styles.meRow,
          pressed && styles.pressed,
        ]}
      >
        <Avatar
          gender={member.gender}
          size={sub ? 40 : 36}
          photoUrl={member.photoUrl}
          ring={me ? 'me' : sub ? 'gender' : 'none'}
        />
        <View style={styles.flexMin}>
          {name ?? (
            <Txt size={sub ? 15 : 14.5} weight="bold" numberOfLines={1}>
              {me ? ar.task.you : member.name}
            </Txt>
          )}
          {sub ? (
            <Txt size={12.5} weight="regular" color={color.inkSoft} numberOfLines={1}>
              {sub}
            </Txt>
          ) : null}
        </View>
        {trailing === 'league' ? (
          <LeagueBadge league={member.league} variant="inline" />
        ) : (
          <ChevronLeft size={18} color={color.inkMuted} strokeWidth={2} />
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexMin: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.85 },
  inline4: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inline6: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  row12: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  search: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  leader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  mine: {
    gap: 10,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: tint(color.brand, 0.13),
    borderWidth: 1.5,
    borderColor: color.brand,
  },
  mineIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mineLeaders: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: tint(color.accent, 0.2),
  },
  committeeRow: { flexDirection: 'row', alignItems: 'center' },
  committeeMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingStart: 14,
  },
  committeeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixed: { paddingHorizontal: 8, borderRadius: radius.pill },
  chevron: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 4,
  },
  teams: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingStart: 66,
    paddingEnd: 14,
    paddingBottom: 14,
  },
  team: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.sm, borderWidth: 1 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  memberRowTall: { paddingVertical: 12 },
  meRow: { backgroundColor: tint(color.brand, 0.1) },
});
