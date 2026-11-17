import { useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { color } from '@/theme/tokens';

type Props = {
  width: DimensionValue;
  height: number;
  r?: number;
  /** `strong` (line colour) for titles and numbers, `soft` (raised) for meta lines and chips. */
  tone?: 'strong' | 'soft';
  style?: StyleProp<ViewStyle>;
};

/** One shimmer block. Compose these to copy the real layout (screen 18). */
export function Skeleton({ width, height, r = 6, tone = 'soft', style }: Props) {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(
      withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [o]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: r,
          backgroundColor: tone === 'strong' ? color.line : color.raised,
        },
        pulse,
        style,
      ]}
    />
  );
}
