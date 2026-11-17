import { StyleSheet, View } from 'react-native';

import BgApp from '@/assets/bg-app.svg';
import BgLogin from '@/assets/bg-login.svg';
import FtcMark from '@/assets/ftc-mark-white.svg';
import { useScreenInsets } from '@/lib/insets';
import { color } from '@/theme/tokens';

const MARK_H = 210;

/**
 * Full-bleed background art: `app` behind tab screens, `login` behind the auth flow.
 * `mark` adds the 5% FTC mark watermark at the top corner (Tasks screens 06/15/18).
 */
export function ScreenBackground({
  variant = 'app',
  mark,
}: {
  variant?: 'app' | 'login';
  mark?: boolean;
}) {
  const insets = useScreenInsets();
  const Art = variant === 'login' ? BgLogin : BgApp;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.bg]}>
      <Art width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      {mark ? (
        // design: left −62, top 30 on a 47pt status bar → `end` in RTL. Wrapped in a View
        // because react-native-svg doesn't resolve start/end on web.
        <View style={[styles.mark, { top: insets.top - 17 }]}>
          <FtcMark height={MARK_H} width={MARK_H * (893 / 985)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: color.bg },
  mark: { position: 'absolute', end: -62, opacity: 0.05 },
});
