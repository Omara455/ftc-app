import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { color } from '@/theme/tokens';

type Props = {
  height: number;
  /** Fraction from the bottom that is fully solid (0.45 behind the tab bar, 0.55 behind CTAs). */
  solidFrom?: number;
};

/** `bg` → transparent gradient so content fades out under the tab bar / sticky CTA. */
export function BottomFade({ height, solidFrom = 0.45 }: Props) {
  return (
    <View pointerEvents="none" style={[styles.fade, { height }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="fade" x1="0" y1="1" x2="0" y2="0">
            <Stop offset={0} stopColor={color.bg} stopOpacity={1} />
            <Stop offset={solidFrom} stopColor={color.bg} stopOpacity={1} />
            <Stop offset={1} stopColor={color.bg} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#fade)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', start: 0, end: 0, bottom: 0 },
});
