// Screen 29: change password = the portal's reset email, sent to my own address
// (same endpoint as screen 03, prefilled).
import { KeyRound, Mail } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authApi } from '@/api/endpoints';
import { authErrorMessage } from '@/auth/errorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Button } from '@/components/Button';
import { Sheet, SheetHero, type SheetRef } from '@/components/Sheet';
import { Ltr, Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color } from '@/theme/tokens';

export const ChangePasswordSheet = forwardRef<SheetRef, { email: string }>(
  function ChangePasswordSheet({ email }, ref) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const close = () => (typeof ref === 'object' ? ref?.current?.dismiss() : undefined);

    async function send() {
      setBusy(true);
      setError(null);
      try {
        await authApi.forgot(email);
        close();
      } catch (e) {
        setError(authErrorMessage(e));
      } finally {
        setBusy(false);
      }
    }

    const t = ar.settings;
    return (
      <Sheet ref={ref} accessibilityLabel={t.cpTitle} onDismiss={() => setError(null)}>
        <SheetHero icon={KeyRound} title={t.cpTitle} body={t.cpBody} />
        <View style={styles.email}>
          <Mail size={18} color={color.accent} strokeWidth={1.8} />
          <Txt size={14.5} weight="semibold" style={styles.emailText}>
            <Ltr>{email}</Ltr>
          </Txt>
        </View>
        {error ? <AlertBanner message={error} /> : null}
        <View style={styles.buttons}>
          <Button label={t.cpSend} onPress={send} loading={busy} />
          <Button label={ar.common.cancel} variant="ghost" onPress={close} disabled={busy} />
        </View>
      </Sheet>
    );
  },
);

const styles = StyleSheet.create({
  email: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.line,
  },
  emailText: { flex: 1 },
  buttons: { gap: 8 },
});
