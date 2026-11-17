import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Txt } from '@/components/Txt';
import { color, hue, radius, tint } from '@/theme/tokens';

/** Red inline error banner (screen 02): icon + message, announced to screen readers. */
export function AlertBanner({ message, style }: { message: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.banner, style]}
    >
      <CircleAlert size={18} color={color.danger} strokeWidth={2} style={styles.icon} />
      <Txt size={13.5} leading={1.65} weight="regular" color={hue.red.s200} style={styles.text}>
        {message}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: tint(hue.red.base, 0.1),
    borderWidth: 1,
    borderColor: tint(hue.red.base, 0.35),
  },
  icon: { marginTop: 3 },
  text: { flex: 1 },
});
