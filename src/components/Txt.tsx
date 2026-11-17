import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { color as palette, font, type, type FontWeight, type TypeVariant } from '@/theme/tokens';

export type TxtProps = TextProps & {
  variant?: TypeVariant;
  /** Overrides the variant's weight. Cairo needs one family per weight. */
  weight?: FontWeight;
  size?: number;
  /** Line height as a multiple of the font size (CSS style), e.g. 1.8. */
  leading?: number;
  color?: string;
  align?: TextStyle['textAlign'];
};

/** All app text. Picks the Cairo family for the weight and keeps RTL alignment. */
export function Txt({
  variant = 'body',
  weight,
  size,
  leading,
  color = palette.ink,
  align,
  style,
  ...rest
}: TxtProps) {
  const v = type[variant];
  const fontSize = size ?? v.fontSize;
  const lineHeight = leading
    ? Math.round(fontSize * leading)
    : size
      ? Math.round(size * (v.lineHeight / v.fontSize))
      : v.lineHeight;
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { fontFamily: font.family[weight ?? v.weight], fontSize, lineHeight, color },
        align && { textAlign: align },
        style,
      ]}
    />
  );
}

/**
 * Keeps Latin text, numbers and signs (+3, 6 / 25, emails) in LTR order
 * inside Arabic text. Nest it inside a Txt.
 */
export function Ltr({ children, style, ...rest }: TextProps) {
  return (
    <Text {...rest} style={[styles.ltr, style]}>
      {'⁦'}
      {children}
      {'⁩'}
    </Text>
  );
}

const styles = StyleSheet.create({
  // Base direction RTL so lines that start with Latin (e.g. «FTC Talks») still align right.
  base: { writingDirection: 'rtl' },
  ltr: { writingDirection: 'ltr' },
});
