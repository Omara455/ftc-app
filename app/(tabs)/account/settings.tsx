// Screen 27 (partial): only the logout action for M2. The account, notification and
// about sections arrive in M4.
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { ScreenBackground } from '@/components/ScreenBackground';
import type { SheetRef } from '@/components/Sheet';
import { LogoutSheet } from '@/features/auth/LogoutSheet';
import { ar } from '@/i18n/ar';
import { useScreenInsets } from '@/lib/insets';
import { color, space } from '@/theme/tokens';

export default function Settings() {
  const insets = useScreenInsets();
  const logout = useRef<SheetRef>(null);
  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <Header title={ar.tabs.settings} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 140 }]}>
        <Button
          label={ar.logout.confirm}
          variant="dangerSoft"
          icon={LogOut}
          onPress={() => logout.current?.present()}
        />
      </ScrollView>
      <LogoutSheet ref={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter, paddingTop: 12, gap: 8 },
});
