import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { color, radius } from '@/theme/tokens';

type Props = {
  value: boolean;
  onValueChange?: (next: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

const TRAVEL = 46 - 22 - 6; // track − knob − padding

/** 46×28 switch. On: brand track, white knob at the end. Off: lineStrong, light knob at the start. */
export function Toggle({ value, onValueChange, accessibilityLabel, disabled }: Props) {
  const x = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    x.value = withTiming(value ? 1 : 0, { duration: 160 });
  }, [value, x]);

  // translateX is physical; in RTL "end" is to the left, so move negative.
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: -x.value * TRAVEL }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      hitSlop={8}
      style={[
        styles.track,
        { backgroundColor: value ? color.brand : color.lineStrong },
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        style={[styles.knob, { backgroundColor: value ? color.onBrand : color.inkSecondary }, knob]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 28,
    padding: 3,
    borderRadius: radius.pill,
    flexDirection: 'row',
    direction: 'ltr', // fixed physical layout so the knob animation is predictable
    justifyContent: 'flex-end', // off = right edge (start in RTL)
  },
  knob: { width: 22, height: 22, borderRadius: 11 },
  disabled: { opacity: 0.5 },
});
