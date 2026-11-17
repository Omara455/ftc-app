import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color, radius, tint } from '@/theme/tokens';

type Props = {
  children: React.ReactNode;
  /** 20 for sections, 18 (`card`) for list cards, 22 for profile heroes. */
  r?: number;
  padding?: number;
  gap?: number;
  /** Highlighted card (my committee): brand tint fill + brand border. */
  selected?: boolean;
  /** Dashed outline, no fill (locked achievements, offline notice). */
  dashed?: boolean;
  borderColor?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  r = radius.lg,
  padding,
  gap,
  selected,
  dashed,
  borderColor,
  onPress,
  accessibilityLabel,
  style,
}: Props) {
  const s: StyleProp<ViewStyle> = [
    styles.base,
    { borderRadius: r, padding, gap },
    selected && styles.selected,
    dashed && styles.dashed,
    borderColor != null && { borderColor },
    style,
  ];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [s, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={s}>{children}</View>;
}

/** Thin divider between rows inside a Card. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  selected: {
    backgroundColor: tint(color.brand, 0.13),
    borderWidth: 1.5,
    borderColor: color.brand,
  },
  dashed: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
  },
  pressed: { opacity: 0.85 },
  divider: { height: 1, backgroundColor: color.line },
});
