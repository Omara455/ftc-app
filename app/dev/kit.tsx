// Hidden design-system page (/dev/kit): every component in one scroll, to compare
// with the Foundations artboard. Dev builds only.
import { Redirect, useRouter } from 'expo-router';
import {
  Bell,
  Calendar,
  Clock,
  Eye,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Pencil,
  UserPlus,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Button, IconButton } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  CommitteeChip,
  CountBadge,
  DeadlineChip,
  HoursChip,
  LeagueBadge,
  MineChip,
  RoleChip,
  SharedChip,
  StateChip,
} from '@/components/Chip';
import { Header } from '@/components/Header';
import { InfoGrid, InfoTile } from '@/components/InfoTile';
import { ListGroup, ListRow } from '@/components/ListRow';
import { LockedNotice, OfflineBanner } from '@/components/OfflineBanner';
import { ScreenBackground } from '@/components/ScreenBackground';
import { Segmented } from '@/components/Segmented';
import { Sheet, SheetHero, SheetSurface, type SheetRef } from '@/components/Sheet';
import { Skeleton } from '@/components/Skeleton';
import { Stepper } from '@/components/Stepper';
import { TabBar, type TabKey } from '@/components/TabBar';
import { AvailableTaskCard, MyTaskCard } from '@/components/TaskCard';
import { TextField } from '@/components/TextField';
import { Toggle } from '@/components/Toggle';
import { Ltr, Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { daysLeftLabel, hoursLabel } from '@/i18n/format';
import { kit } from '@/mocks/kit';
import {
  color,
  hue,
  league,
  taskState,
  type,
  type League,
  type TaskState,
  type TypeVariant,
} from '@/theme/tokens';

export default function Kit() {
  if (!__DEV__ && process.env.EXPO_PUBLIC_DEV_KIT !== '1') return <Redirect href="/" />;
  return <KitPage />;
}

function KitPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const sheet = useRef<SheetRef>(null);
  const [bio, setBio] = useState(true);
  const [leagueOn, setLeagueOn] = useState(false);
  const [period, setPeriod] = useState<'term' | 'all'>('term');
  const [tab, setTab] = useState<TabKey>('tasks');
  const s = kit.stepper;

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: 140 },
        ]}
      >
        {/* ── Colours ─────────────────────────────── */}
        <Section title={kit.sections.colors}>
          <Swatches
            items={[
              ['bg', color.bg],
              ['surface', color.surface],
              ['raised', color.raised],
              ['line', color.line],
              ['ink', color.ink],
              ['inkSecondary', color.inkSecondary],
              ['inkSoft', color.inkSoft],
              ['inkMuted', color.inkMuted],
            ]}
          />
        </Section>
        <Section title={kit.sections.brand}>
          <Swatches
            items={[
              ['brand', color.brand],
              ['accent', color.accent],
              ['highlight', color.highlight],
              ['glow', color.glow],
            ]}
          />
        </Section>
        <Section title={kit.sections.states}>
          <Swatches
            items={(Object.keys(taskState) as TaskState[]).map((k) => [
              taskState[k].label,
              taskState[k].fg,
            ])}
          />
        </Section>
        <Section title={kit.sections.leagues}>
          <Swatches
            items={(Object.keys(league) as League[]).map((k) => [league[k].label, league[k].fg])}
          />
        </Section>

        {/* ── Type ────────────────────────────────── */}
        <Section title={kit.sections.type}>
          {(
            ['display', 'title', 'heading', 'cardTitle', 'body', 'meta', 'caption'] as TypeVariant[]
          ).map((v) => (
            <View key={v} style={styles.typeRow}>
              <Txt size={11} color={color.inkSoft}>
                <Ltr>{`${v} · ${type[v].fontSize}`}</Ltr>
              </Txt>
              <Txt
                variant={v}
                color={v === 'body' ? color.inkSecondary : v === 'meta' ? color.inkSoft : color.ink}
              >
                {kit.type[v as keyof typeof kit.type]}
              </Txt>
            </View>
          ))}
        </Section>

        {/* ── Buttons ─────────────────────────────── */}
        <Section title={kit.sections.buttons}>
          <Button label={kit.buttons.primary} />
          <Button label={kit.buttons.secondary} variant="secondary" />
          <View style={styles.row}>
            <Button label={ar.task.join} size="sm" />
            <Button label={kit.buttons.link} variant="link" />
            <Button label={kit.buttons.logout} variant="dangerLink" />
          </View>
          <Button label={kit.buttons.leave} variant="destructive" />
          <Button label={kit.buttons.keep} variant="ghost" />
          <View style={styles.row}>
            <Button label={kit.buttons.submit} icon={UserPlus} style={styles.flex} />
            <Button label={ar.task.join} size="sm" locked />
          </View>
          <View style={styles.row}>
            <IconButton icon={Bell} accessibilityLabel={kit.bell} badge />
            <IconButton icon={Pencil} accessibilityLabel={kit.rows.editProfile} />
          </View>
        </Section>

        {/* ── Chips ───────────────────────────────── */}
        <Section title={kit.sections.chips}>
          <View style={styles.wrap}>
            <CommitteeChip label={kit.chips.committee} />
            <HoursChip label={kit.chips.hours} />
            <SharedChip label={ar.task.shared} />
            <DeadlineChip label={kit.chips.deadline} />
            <MineChip label={ar.task.yourCommittee} />
            <RoleChip label={kit.chips.role} />
          </View>
          <View style={styles.wrap}>
            {(Object.keys(taskState) as TaskState[]).map((k) => (
              <StateChip key={k} state={k} />
            ))}
          </View>
          <View style={styles.wrap}>
            {(Object.keys(league) as League[]).map((k) => (
              <LeagueBadge key={k} league={k} />
            ))}
          </View>
          <View style={styles.wrap}>
            <LeagueBadge league="platinum" variant="inline" />
            <LeagueBadge league="gold" variant="inline" />
            <CountBadge count={2} />
            <CountBadge count={3} accent />
          </View>
        </Section>

        {/* ── Fields ──────────────────────────────── */}
        <Section title={kit.sections.fields}>
          <TextField label={kit.fields.normal} placeholder={kit.fields.normalPlaceholder} />
          <TextField
            label={kit.fields.focused}
            value={kit.fields.focusedValue}
            ltr
            forceFocus
            icon={Mail}
          />
          <TextField
            label={kit.fields.error}
            value={kit.fields.errorValue}
            ltr
            secureTextEntry
            icon={Lock}
            error={kit.fields.errorMessage}
            trailing={<IconButtonPlain />}
          />
        </Section>

        {/* ── Task cards ──────────────────────────── */}
        <Section title={kit.sections.cards}>
          {kit.myTasks.map((t) => (
            <MyTaskCard
              key={t.title}
              title={t.title}
              state={t.state}
              hours={hoursLabel(t.hours)}
              footer={
                'deadlineDays' in t
                  ? { kind: 'deadline', label: daysLeftLabel(t.deadlineDays) }
                  : 'note' in t
                    ? { kind: 'note', text: t.note }
                    : { kind: 'meta', text: t.meta }
              }
              onPress={() => {}}
            />
          ))}
          <AvailableTaskCard
            title={kit.available.title}
            description={kit.available.description}
            shared={{ committees: kit.available.committees }}
            hours={hoursLabel(kit.available.hours)}
            when={kit.available.when}
            where={kit.available.where}
            people={[{ gender: 'male' }, { gender: 'male' }]}
            joined={kit.available.joined}
            capacity={kit.available.capacity}
            onPress={() => {}}
            onJoin={() => sheet.current?.present()}
          />
          <AvailableTaskCard
            title={kit.available2.title}
            committee={kit.available2.committee}
            hours={hoursLabel(kit.available2.hours)}
          />
        </Section>

        {/* ── Info grid ───────────────────────────── */}
        <Section title={kit.sections.info}>
          <InfoGrid>
            <InfoTile icon={Clock} label={kit.info.hours} value={hoursLabel(4)} />
            <InfoTile
              icon={Calendar}
              tone={hue.amber.base}
              label={kit.info.deadline}
              value={kit.info.deadlineValue}
            />
            <InfoTile icon={MapPin} label={kit.info.place} value={kit.info.placeValue} />
            <InfoTile
              icon={Phone}
              tone={hue.green.base}
              label={kit.info.contact}
              value={kit.info.contactValue}
              onPress={() => {}}
            />
          </InfoGrid>
        </Section>

        {/* ── Stepper ─────────────────────────────── */}
        <Section title={kit.sections.stepper}>
          <Stepper
            title={ar.task.path}
            steps={[
              { label: s.joined, sub: s.date1, status: 'done' },
              { label: s.submit, sub: s.yourTurn, status: 'current' },
              { label: s.review, sub: s.fromLeader, status: 'future' },
              {
                label: s.approve,
                sub: (
                  <>
                    <Ltr>+4</Ltr> ساعات
                  </>
                ),
                status: 'future',
              },
            ]}
          />
          <Stepper
            title={ar.task.path}
            currentTone={hue.amber.base}
            steps={[
              { label: s.joined, sub: s.date1, status: 'done' },
              { label: s.submitted, sub: s.now, status: 'done' },
              { label: s.review, sub: s.atLeader, status: 'current' },
              {
                label: s.approve,
                sub: (
                  <>
                    <Ltr>+4</Ltr> ساعات
                  </>
                ),
                status: 'future',
              },
            ]}
          />
          <Stepper
            title={ar.task.path}
            steps={[
              { label: s.joined, sub: s.date1, status: 'done' },
              { label: s.submitted, sub: s.date1, status: 'done' },
              { label: s.returned, sub: s.today, status: 'returned' },
              {
                label: s.approve,
                sub: (
                  <>
                    <Ltr>+2</Ltr> ساعتين
                  </>
                ),
                status: 'future',
              },
            ]}
          />
        </Section>

        {/* ── Rows, toggles, segmented ────────────── */}
        <Section title={kit.sections.rows}>
          <Segmented
            accessibilityLabel={kit.segmented.label}
            value={period}
            onChange={setPeriod}
            options={[
              { key: 'term', label: kit.segmented.term },
              { key: 'all', label: kit.segmented.all },
            ]}
          />
          <ListGroup label={kit.rows.account}>
            <ListRow icon={Pencil} title={kit.rows.editProfile} onPress={() => {}} />
            <ListRow
              icon={KeyRound}
              title={kit.rows.changePassword}
              subtitle={kit.rows.changePasswordSub}
              onPress={() => {}}
            />
            <ListRow
              icon={Lock}
              title={kit.rows.biometric}
              trailing={
                <Toggle
                  value={bio}
                  onValueChange={setBio}
                  accessibilityLabel={kit.rows.biometric}
                />
              }
            />
          </ListGroup>
          <ListGroup label={kit.rows.notifications}>
            <ListRow
              title={kit.rows.leagueUpdates}
              trailing={
                <Toggle
                  value={leagueOn}
                  onValueChange={setLeagueOn}
                  accessibilityLabel={kit.rows.leagueUpdates}
                />
              }
            />
            <ListRow
              title={kit.rows.version}
              trailing={
                <Txt size={13.5} weight="regular" color={color.inkSoft}>
                  <Ltr>1.0.0</Ltr>
                </Txt>
              }
            />
          </ListGroup>
          <Button label={kit.buttons.logout} variant="destructive" icon={LogOut} />
        </Section>

        {/* ── Avatars ─────────────────────────────── */}
        <Section title={kit.sections.avatars}>
          <View style={[styles.row, styles.center]}>
            <Avatar gender="male" size={26} />
            <Avatar gender="female" size={28} />
            <Avatar gender="male" size={36} ring="none" />
            <Avatar gender="female" size={40} />
            <Avatar gender="male" size={36} ring="me" />
          </View>
          <View style={[styles.row, styles.center]}>
            <Avatar gender="male" size={80} ring="me" hero />
            <Avatar gender="female" size={84} hero />
          </View>
        </Section>

        {/* ── Skeleton ────────────────────────────── */}
        <Section title={kit.sections.skeleton}>
          <Card r={18} padding={16} gap={12}>
            <View style={styles.between}>
              <Skeleton width={84} height={20} r={10} />
              <Skeleton width={52} height={14} />
            </View>
            <Skeleton width="78%" height={16} tone="strong" />
            <Skeleton width="34%" height={12} />
          </Card>
        </Section>

        {/* ── Offline ─────────────────────────────── */}
        <Section title={kit.sections.offline}>
          <OfflineBanner lastUpdatedAgo="10 دقائق" onRetry={() => {}} />
          <LockedNotice />
        </Section>

        {/* ── Sheet ───────────────────────────────── */}
        <Section title={kit.sections.sheet}>
          <SheetSurface>
            <SheetHero icon={UserPlus} title={kit.sheet.title} body={kit.sheet.body} />
            <View style={styles.sheetButtons}>
              <Button label={kit.sheet.confirm} />
              <Button label={ar.common.cancel} variant="ghost" />
            </View>
          </SheetSurface>
          <Button
            label={kit.sheet.open}
            variant="secondary"
            onPress={() => sheet.current?.present()}
          />
        </Section>

        {/* ── Header + tab bar ────────────────────── */}
        <Section title={kit.sections.nav}>
          <Header title={kit.header} onBack={() => router.back()} safeTop={false} />
          <TabBar active={tab} onPress={setTab} floating={false} />
        </Section>
      </ScrollView>

      <Sheet ref={sheet} accessibilityLabel={kit.sheet.title}>
        <SheetHero icon={UserPlus} title={kit.sheet.title} body={kit.sheet.body} />
        <View style={styles.sheetButtons}>
          <Button label={kit.sheet.confirm} onPress={() => sheet.current?.dismiss()} />
          <Button
            label={ar.common.cancel}
            variant="ghost"
            onPress={() => sheet.current?.dismiss()}
          />
        </View>
      </Sheet>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="meta" weight="semibold" color={color.inkSoft}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

function Swatches({ items }: { items: (readonly [string, string])[] }) {
  return (
    <View style={styles.wrap}>
      {items.map(([name, hex]) => (
        <View key={name} style={styles.swatch}>
          <View style={[styles.chipColor, { backgroundColor: hex }]} />
          <Txt size={11.5} weight="semibold" color={color.inkSecondary}>
            {name}
          </Txt>
          <Txt size={10.5} weight="regular" color={color.inkSoft}>
            <Ltr>{hex}</Ltr>
          </Txt>
        </View>
      ))}
    </View>
  );
}

/** Eye toggle used in password fields. */
function IconButtonPlain() {
  return (
    <View style={styles.eye}>
      <Eye size={20} color={color.inkSoft} strokeWidth={1.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: 20, gap: 28 },
  section: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  center: { justifyContent: 'center', gap: 16 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flex: { flex: 1 },
  typeRow: { gap: 2, paddingTop: 8, borderTopWidth: 1, borderTopColor: color.line },
  swatch: { width: 76, gap: 4 },
  chipColor: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.lineStrong,
  },
  sheetButtons: { gap: 8 },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
