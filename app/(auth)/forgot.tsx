// Screen 03: request the portal's reset email.
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Info, KeyRound, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { authApi } from '@/api/endpoints';
import { authErrorMessage } from '@/auth/errorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Button, IconButton } from '@/components/Button';
import { ScreenBackground } from '@/components/ScreenBackground';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { useScreenInsets } from '@/lib/insets';
import { looksLikeEmail } from '@/lib/validate';
import { color, tint } from '@/theme/tokens';

export default function Forgot() {
  const insets = useScreenInsets();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = looksLikeEmail(email);

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      // Always 204, whether or not the email has an account (no account enumeration).
      await authApi.forgot(email.trim());
      router.push({ pathname: '/forgot-sent', params: { email: email.trim() } });
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenBackground variant="login" />
      <View style={[styles.header, { marginTop: insets.top + 7 }]}>
        <IconButton
          icon={ArrowRight}
          iconColor={color.ink}
          accessibilityLabel={ar.common.back}
          onPress={() => router.back()}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(40, insets.bottom + 6) },
          ]}
        >
          <View style={styles.icon}>
            <KeyRound size={28} color={color.highlight} strokeWidth={1.8} />
          </View>
          <Txt
            size={28}
            leading={1.4}
            weight="extrabold"
            style={styles.title}
            accessibilityRole="header"
          >
            {ar.auth.forgotTitle}
          </Txt>
          <Txt size={15} leading={1.75} weight="regular" color={color.inkSoft} style={styles.body}>
            {ar.auth.forgotBody}
          </Txt>

          {error ? <AlertBanner message={error} style={styles.banner} /> : null}

          <View style={styles.field}>
            <TextField
              label={ar.auth.email}
              icon={Mail}
              ltr
              onSurface
              height={54}
              value={email}
              onChangeText={setEmail}
              autoFocus
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="send"
              onSubmitEditing={submit}
            />
          </View>
          <Button
            label={ar.auth.sendLink}
            onPress={submit}
            loading={busy}
            disabled={!valid}
            style={styles.cta}
          />

          <View style={styles.flex} />

          <View style={styles.note}>
            <Info size={18} color={color.inkSoft} strokeWidth={1.9} style={styles.noteIcon} />
            <Txt size={13} leading={1.7} weight="regular" color={color.inkSoft} style={styles.flex}>
              {ar.auth.sameAccountNote}
            </Txt>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  header: { height: 52, marginHorizontal: 16, justifyContent: 'center', alignItems: 'flex-start' },
  // design: content starts at 140 (header ends at 106)
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 34 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: tint(color.brand, 0.2),
    borderWidth: 1,
    borderColor: color.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 24 },
  body: { marginTop: 6 },
  banner: { marginTop: 22 },
  field: { marginTop: 28 },
  cta: { marginTop: 22 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  noteIcon: { marginTop: 3 },
});
