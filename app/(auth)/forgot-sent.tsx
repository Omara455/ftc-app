// Screen 04: reset link sent. Resend is available after a 45-second cooldown.
import { router, useLocalSearchParams } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { authApi } from '@/api/endpoints';
import { authErrorMessage } from '@/auth/errorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Button } from '@/components/Button';
import { ScreenBackground } from '@/components/ScreenBackground';
import { Ltr, Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { useScreenInsets } from '@/lib/insets';
import { color, hue, tint } from '@/theme/tokens';

const COOLDOWN = 45;

export default function ForgotSent() {
  const insets = useScreenInsets();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [left, setLeft] = useState(COOLDOWN);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function resend() {
    if (left > 0 || sending) return;
    setSending(true);
    setError(null);
    try {
      await authApi.forgot(email);
      setLeft(COOLDOWN);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenBackground variant="login" />
      <View style={[styles.center, { paddingTop: insets.top + 153 }]}>
        <View style={styles.halo}>
          <View style={styles.icon}>
            <MailCheck size={40} color={hue.green.base} strokeWidth={1.8} />
          </View>
        </View>
        <Txt
          size={26}
          leading={1.4}
          weight="extrabold"
          align="center"
          style={styles.title}
          accessibilityRole="header"
        >
          {ar.auth.sentTitle}
        </Txt>
        <Txt
          size={15}
          leading={1.8}
          weight="regular"
          color={color.inkSoft}
          align="center"
          style={styles.sentTo}
        >
          {ar.auth.sentTo}
        </Txt>
        <Txt size={15} weight="bold" align="center" style={styles.email}>
          <Ltr>{email}</Ltr>
        </Txt>
        <Txt
          size={13.5}
          leading={1.75}
          weight="regular"
          color={color.inkSoft}
          align="center"
          style={styles.note}
        >
          {ar.auth.sentNote}
        </Txt>
        {error ? <AlertBanner message={error} style={styles.banner} /> : null}
      </View>

      <View style={[styles.actions, { bottom: Math.max(40, insets.bottom + 6) }]}>
        <Button label={ar.auth.backToLogin} onPress={() => router.dismissTo('/login')} />
        <Pressable
          onPress={resend}
          disabled={left > 0 || sending}
          accessibilityRole="button"
          accessibilityState={{ disabled: left > 0 || sending }}
          style={styles.resend}
        >
          <Txt size={14.5} weight="semibold" color={color.accent}>
            {ar.auth.resend}
          </Txt>
          {left > 0 ? (
            <Txt size={14.5} weight="medium" color={color.inkSoft}>
              <Ltr>{ar.auth.resendIn(left)}</Ltr>
            </Txt>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  center: { alignItems: 'center', paddingHorizontal: 28 },
  // 10pt soft green ring around the icon circle
  halo: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 10, // 10pt soft ring outside the circle only
    borderColor: tint(hue.green.base, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: tint(hue.green.base, 0.12),
    borderWidth: 1.5,
    borderColor: tint(hue.green.base, 0.4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 20 },
  sentTo: { marginTop: 8 },
  email: { marginTop: 2 },
  note: { marginTop: 14 },
  banner: { marginTop: 16, alignSelf: 'stretch' },
  actions: { position: 'absolute', start: 24, end: 24, gap: 12 },
  resend: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
