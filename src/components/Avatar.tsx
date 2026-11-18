import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { avatarRing, color, tint } from '@/theme/tokens';

type Gender = 'male' | 'female';

type Props = {
  gender: Gender;
  /** 26 · 28 · 34 · 36 · 40 in lists, 80–84 for profile heroes. */
  size?: number;
  photoUrl?: string | null;
  /** `gender` ring (default), `me` (highlight ring), or `none`. */
  ring?: 'gender' | 'me' | 'none';
  /** Profile hero: thick 3pt border. `me` adds the brand glow (Account screen). */
  hero?: boolean;
  /** Overlap style used in stacked avatars: 2pt border in the card colour. */
  stacked?: boolean;
};

export function Avatar({ gender, size = 36, photoUrl, ring = 'gender', hero, stacked }: Props) {
  const genderColor = avatarRing[gender];
  const ringColor = ring === 'me' ? (hero ? color.brand : color.highlight) : genderColor;
  const glyphColor = ring === 'me' ? (hero ? color.avatarGlyph : color.highlight) : genderColor;
  const glyph = Math.round(size * (hero ? 0.45 : 0.48));

  const inner = (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        hero && { borderWidth: 3, borderColor: ringColor },
        stacked && { borderWidth: 2, borderColor: color.surface },
      ]}
    >
      {photoUrl ? (
        <Image source={photoUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <User size={glyph} color={glyphColor} strokeWidth={hero ? 1.6 : 2} />
      )}
    </View>
  );

  if (hero && ring === 'me') {
    // 6pt brand halo around my own avatar
    return <View style={[styles.halo, { borderRadius: size / 2 + 6 }]}>{inner}</View>;
  }
  if (hero || stacked || ring === 'none') return inner;

  // 1.5pt ring drawn outside the circle (CSS box-shadow spread in the design)
  return (
    <View
      style={{
        width: size + 3,
        height: size + 3,
        borderRadius: (size + 3) / 2,
        borderWidth: 1.5,
        borderColor: ringColor,
        // outside the circle without taking layout space, like the design's box-shadow
        margin: -1.5,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: color.line,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  halo: {
    padding: 6,
    margin: -6, // the halo doesn't take layout space (box-shadow in the design)
    backgroundColor: tint(color.brand, 0.16),
    shadowColor: color.brand,
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
});
