// Screen 30: logout confirmation sheet.
import { LogOut } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { Sheet, SheetHero, type SheetRef } from '@/components/Sheet';
import { ar } from '@/i18n/ar';
import { color } from '@/theme/tokens';

export const LogoutSheet = forwardRef<SheetRef>(function LogoutSheet(_, ref) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const close = () => (typeof ref === 'object' ? ref?.current?.dismiss() : undefined);

  async function confirm() {
    setBusy(true);
    // POST /auth/logout, clear SecureStore + query cache. The auth gate then shows login.
    await signOut();
    close();
  }

  return (
    <Sheet ref={ref} accessibilityLabel={ar.logout.sheetLabel}>
      <SheetHero icon={LogOut} tone={color.danger} title={ar.logout.title} body={ar.logout.body} />
      <View style={styles.buttons}>
        <Button label={ar.logout.confirm} variant="destructive" onPress={confirm} loading={busy} />
        <Button label={ar.common.cancel} variant="ghost" onPress={close} disabled={busy} />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  buttons: { gap: 8, marginTop: 4 },
});
