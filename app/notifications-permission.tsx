// Screen 05: shown once after the first login (Phase 2, behind flags.notifications).
// «فعّل الإشعارات» asks for the OS permission, then registers the Expo push token
// (POST /devices).
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import FtcMark from '@/assets/ftc-mark-white.svg';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { ScreenBackground } from '@/components/ScreenBackground';
import { registerForPush } from '@/lib/push';
import { Ltr, Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { useScreenInsets } from '@/lib/insets';
import { color, radius, shadow, tint } from '@/theme/tokens';

const t = ar.notificationsPrompt;

export default function NotificationsPermission() {
  const insets = useScreenInsets();
  const { markNotificationPrompted } = useAuth();
  const [busy, setBusy] = useState(false);

  async function finish(ask: boolean) {
    setBusy(true);
    try {
      if (ask) {
        const { granted } = await Notifications.requestPermissionsAsync();
        if (granted) await registerForPush();
      }
    } catch {
      // Denied or unsupported (web): carry on, the member can enable it in Settings.
    }
    await markNotificationPrompted();
    router.replace('/tasks');
  }

  return (
    <View style={styles.screen}>
      <ScreenBackground variant="login" />

      {/* Decorative sample notifications */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.samples, { top: insets.top + 73 }]}
      >
        <SampleNotification title={t.sample1Title} time={t.sample1Time} body={t.sample1Body} />
        <SampleNotification
          dim
          title={t.sample2Title}
          time={t.sample2Time}
          body={
            <>
              {t.sample2Body} <Ltr>{t.sample2Hours}</Ltr> {t.sample2HoursUnit}
            </>
          }
        />
      </View>

      <View style={[styles.center, { top: insets.top + 323 }]}>
        <View style={styles.icon}>
          <Bell size={32} color={color.glow} strokeWidth={1.8} />
        </View>
        <Txt
          size={26}
          leading={1.4}
          weight="extrabold"
          align="center"
          style={styles.title}
          accessibilityRole="header"
        >
          {t.title}
        </Txt>
        <Txt
          size={15}
          leading={1.8}
          weight="regular"
          color={color.inkSoft}
          align="center"
          style={styles.body}
        >
          {t.body}
        </Txt>
      </View>

      <View style={[styles.actions, { bottom: Math.max(40, insets.bottom + 6) }]}>
        <Button label={t.enable} onPress={() => finish(true)} loading={busy} />
        <Button label={t.later} variant="ghost" onPress={() => finish(false)} disabled={busy} />
      </View>
    </View>
  );
}

function SampleNotification({
  title,
  time,
  body,
  dim,
}: {
  title: string;
  time: string;
  body: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <View style={[styles.card, dim && styles.cardDim]}>
      <View style={styles.appIcon}>
        <FtcMark height={22} width={22 * (893 / 985)} />
      </View>
      <View style={styles.cardText}>
        <View style={styles.cardTop}>
          <Txt size={13} weight="bold">
            {title}
          </Txt>
          <Txt size={11} weight="regular" color={color.inkSoft}>
            {time}
          </Txt>
        </View>
        <Txt size={12.5} weight="regular" color={color.inkSecondary}>
          {body}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  samples: { position: 'absolute', start: 28, end: 28, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.card,
    backgroundColor: tint(color.raised, 0.92),
    borderWidth: 1,
    borderColor: color.lineStrong,
    ...shadow.banner,
  },
  cardDim: {
    marginHorizontal: 14,
    backgroundColor: tint(color.raised, 0.7),
    borderColor: color.line,
    opacity: 0.85,
    shadowOpacity: 0,
  },
  appIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  center: { position: 'absolute', start: 28, end: 28, alignItems: 'center' },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: tint(color.glow, 0.16),
    borderWidth: 1,
    borderColor: tint(color.glow, 0.35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 24 },
  body: { marginTop: 8 },
  actions: { position: 'absolute', start: 24, end: 24, gap: 10 },
});
