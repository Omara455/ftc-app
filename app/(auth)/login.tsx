// Screens 01 (login) and 02 (login error).
import { Link } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';

import Logo from '@/assets/ftc-logo-white.svg';
import { useAuth } from '@/auth/AuthProvider';
import { authErrorMessage } from '@/auth/errorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Button } from '@/components/Button';
import { ScreenBackground } from '@/components/ScreenBackground';
import { TextField } from '@/components/TextField';
import { Ltr, Txt } from '@/components/Txt';
import { APPLY_URL } from '@/config/env';
import { ar } from '@/i18n/ar';
import { useScreenInsets } from '@/lib/insets';
import { color } from '@/theme/tokens';

const LOGO_W = 214;
const LOGO_H = LOGO_W * (985 / 3548);

export default function Login() {
  const { signIn } = useAuth();
  const insets = useScreenInsets();
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email.trim() || !password) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      // The auth gate redirects to the app once signed in.
    } catch (e) {
      setError(authErrorMessage(e));
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenBackground variant="login" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 57, paddingBottom: Math.max(40, insets.bottom + 6) },
          ]}
        >
          <View style={styles.logo}>
            <Logo width={LOGO_W} height={LOGO_H} accessibilityLabel={ar.brand.name} />
          </View>

          <View style={styles.heading}>
            <Txt variant="display" accessibilityRole="header">
              {ar.auth.welcome}
            </Txt>
            <Txt size={15} leading={1.7} weight="regular" color={color.inkSoft}>
              {ar.auth.subtitle}
            </Txt>
          </View>

          {error ? <AlertBanner message={error} style={styles.banner} /> : null}

          <View style={[styles.form, { marginTop: error ? 18 : 28 }]}>
            <TextField
              label={ar.auth.email}
              icon={Mail}
              ltr
              onSurface
              height={54}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextField
              ref={passwordRef}
              label={ar.auth.password}
              icon={Lock}
              ltr
              onSurface
              height={54}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              error={error === ar.auth.wrongCredentials}
              trailing={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? ar.auth.hidePassword : ar.auth.showPassword}
                  style={styles.eye}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={color.inkSoft} strokeWidth={1.8} />
                  ) : (
                    <Eye size={20} color={color.inkSoft} strokeWidth={1.8} />
                  )}
                </Pressable>
              }
            />
            <Link href={{ pathname: '/forgot', params: { email } }} asChild>
              <Pressable accessibilityRole="link" hitSlop={8} style={styles.forgot}>
                <Txt
                  size={13.5}
                  leading={1.875}
                  weight={error ? 'bold' : 'semibold'}
                  color={error ? color.highlight : color.accent}
                >
                  {ar.auth.forgotLink}
                </Txt>
              </Pressable>
            </Link>
          </View>

          <Button
            label={ar.auth.signIn}
            trailingIcon={ArrowLeft}
            onPress={submit}
            loading={busy}
            style={{ marginTop: error ? 18 : 22 }}
          />

          <View style={styles.flex} />

          <View style={styles.footer}>
            <Txt size={13} leading={1.8} weight="regular" color={color.inkSoft} align="center">
              {ar.auth.noAccount}
            </Txt>
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(APPLY_URL)}
              hitSlop={8}
            >
              <Txt size={13} leading={1.8} weight="semibold" color={color.accent} align="center">
                <Ltr>{ar.auth.applyLink}</Ltr>
              </Txt>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  logo: { alignItems: 'center' },
  heading: { gap: 6, marginTop: 56 },
  banner: { marginTop: 22 },
  form: { gap: 16 },
  forgot: { alignSelf: 'flex-end', paddingVertical: 4 },
  eye: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footer: { alignItems: 'center', marginTop: 24 },
});
