// Screen 27: settings.
//   الحساب      edit profile (Phase 2, flags.writes) · change password (sheet 29) · biometric login
//   الإشعارات   4 toggles — Phase 2 (flags.notifications), saved server-side in M6
//   عن التطبيق  open the portal · version
//   logout (sheet 30)
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ExternalLink, Fingerprint, KeyRound, LogOut, Pencil } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { useMe } from '@/api/hooks';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { ListGroup, ListRow } from '@/components/ListRow';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { SheetRef } from '@/components/Sheet';
import { Toggle } from '@/components/Toggle';
import { Ltr, Txt } from '@/components/Txt';
import { flags } from '@/config/flags';
import { PORTAL_URL } from '@/config/env';
import { ChangePasswordSheet } from '@/features/account/ChangePasswordSheet';
import { LogoutSheet } from '@/features/auth/LogoutSheet';
import { ar } from '@/i18n/ar';
import {
  authenticate,
  biometricAvailable,
  biometricEnabled,
  setBiometricEnabled,
} from '@/lib/biometric';
import { useScreenInsets } from '@/lib/insets';
import { color, space } from '@/theme/tokens';

const t = ar.settings;

export default function Settings() {
  const insets = useScreenInsets();
  const me = useMe().data;
  const logout = useRef<SheetRef>(null);
  const changePassword = useRef<SheetRef>(null);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  // Phase 2: local only until GET/PATCH /me/notification-settings exists (M6).
  const [notify, setNotify] = useState({
    newTasks: true,
    reviewResult: true,
    deadlineReminder: true,
    leagueUpdates: false,
  });

  useEffect(() => {
    void (async () => {
      setBioAvailable(await biometricAvailable());
      setBioOn(await biometricEnabled());
    })();
  }, []);

  async function toggleBiometric(next: boolean) {
    // Turning it on asks once, so a member can't lock themselves out by mistake.
    if (next && !(await authenticate())) return;
    await setBiometricEnabled(next);
    setBioOn(next);
  }

  const version = Constants.expoConfig?.version ?? '';

  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header title={ar.tabs.settings} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <ListGroup label={t.account}>
          {flags.writes ? (
            <ListRow
              icon={Pencil}
              title={t.editProfile}
              onPress={() => router.push('/account/edit-profile')}
            />
          ) : null}
          <ListRow
            icon={KeyRound}
            title={t.changePassword}
            subtitle={t.changePasswordSub}
            onPress={() => changePassword.current?.present()}
          />
          {bioAvailable ? (
            <ListRow
              icon={Fingerprint}
              title={t.biometric}
              trailing={
                <Toggle
                  value={bioOn}
                  onValueChange={toggleBiometric}
                  accessibilityLabel={t.biometric}
                />
              }
            />
          ) : null}
        </ListGroup>

        {flags.notifications ? (
          <ListGroup label={t.notifications}>
            {(
              [
                ['newTasks', t.notifyNewTasks],
                ['reviewResult', t.notifyReview],
                ['deadlineReminder', t.notifyDeadline],
                ['leagueUpdates', t.notifyLeague],
              ] as const
            ).map(([key, label]) => (
              <ListRow
                key={key}
                title={label}
                trailing={
                  <Toggle
                    value={notify[key]}
                    onValueChange={(v) => setNotify((n) => ({ ...n, [key]: v }))}
                    accessibilityLabel={label}
                  />
                }
              />
            ))}
          </ListGroup>
        ) : null}

        <ListGroup label={t.about}>
          <ListRow
            title={t.openPortal}
            onPress={() => Linking.openURL(PORTAL_URL)}
            trailing={<ExternalLink size={16} color={color.inkSoft} strokeWidth={2} />}
          />
          <ListRow
            title={t.version}
            trailing={
              <Txt size={13.5} weight="regular" color={color.inkSoft}>
                <Ltr>{version}</Ltr>
              </Txt>
            }
          />
        </ListGroup>

        <Button
          label={t.logout}
          variant="dangerSoft"
          icon={LogOut}
          onPress={() => logout.current?.present()}
          style={styles.logout}
        />
      </ScrollView>
      <ChangePasswordSheet ref={changePassword} email={me?.email ?? ''} />
      <LogoutSheet ref={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter, paddingTop: 12, gap: 16 },
  logout: { marginTop: 0 },
});
