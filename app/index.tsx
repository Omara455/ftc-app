// M0 placeholder: proves fonts, RTL, tokens and SVG imports work.
// Replaced by the auth gate in M2.
import { StyleSheet, Text, View } from 'react-native';

import BgLogin from '@/assets/bg-login.svg';
import Logo from '@/assets/ftc-logo-white.svg';
import { ar } from '@/i18n/ar';
import { color, font, space } from '@/theme/tokens';

export default function Index() {
  return (
    <View style={styles.screen}>
      <BgLogin style={StyleSheet.absoluteFill} width="100%" height="100%" />
      <Logo width={214} height={214 * (985 / 3548)} accessibilityLabel={ar.brand.name} />
      <Text style={styles.title}>{ar.auth.welcome}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    backgroundColor: color.bg,
  },
  title: {
    fontFamily: font.family.extrabold,
    fontSize: 30,
    lineHeight: 40,
    color: color.ink,
  },
});
