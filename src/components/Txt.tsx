import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { color as palette, font, type, type FontWeight, type TypeVariant } from '@/theme/tokens';

/**
 * Cairo's default line height (CSS `normal`). The artboards leave line-height unset on
 * most text, so a custom `size` without `leading` uses this to match them.
 */
const CAIRO_NORMAL = 1.875;

/**
 * Larger system font sizes (accessibility): text scales up to this factor and no further,
 * so fixed-height controls (54pt buttons, chips, the tab bar) keep their layout.
 * Pass `maxFontSizeMultiplier` to a Txt to change it.
 */
export const MAX_FONT_SCALE = 1.3;

/**
 * Web screenshot builds only: `EXPO_PUBLIC_FONT_SCALE=1.3` simulates the phone's font-size
 * setting (native applies it itself), so large-text layouts can be checked with npm run shot.
 */
const WEB_FONT_SCALE =
  Platform.OS === 'web' ? Number(process.env.EXPO_PUBLIC_FONT_SCALE ?? 1) || 1 : 1;

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
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...rest
}: TxtProps) {
  const v = type[variant];
  const web = Math.min(WEB_FONT_SCALE, maxFontSizeMultiplier || WEB_FONT_SCALE);
  const base = size ?? v.fontSize;
  const fontSize = base * web;
  const lineHeight =
    (leading ? Math.round(base * leading) : size ? Math.round(size * CAIRO_NORMAL) : v.lineHeight) *
    web;
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
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
