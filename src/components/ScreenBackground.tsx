import { StyleSheet, View } from 'react-native';

import BgApp from '@/assets/bg-app.svg';
import BgLogin from '@/assets/bg-login.svg';
import { color } from '@/theme/tokens';

/** Full-bleed background art: `app` behind tab screens, `login` behind the auth flow. */
export function ScreenBackground({ variant = 'app' }: { variant?: 'app' | 'login' }) {
  const Art = variant === 'login' ? BgLogin : BgApp;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.bg]}>
      <Art width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: color.bg },
});
