import { Lock, WifiOff } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color, hue, radius, shadow, tint } from '@/theme/tokens';

type Props = {
  /** Already phrased, e.g. «10 دقائق». */
  lastUpdatedAgo?: string;
  onRetry?: () => void;
};

/** Screen 19: amber banner that floats at the top while offline. Cached data still shows below. */
export function OfflineBanner({ lastUpdatedAgo, onRetry }: Props) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.banner}>
      <View style={styles.icon}>
        <WifiOff size={17} color={hue.amber.base} strokeWidth={2} />
      </View>
      <View style={styles.text}>
        <Txt size={13.5} weight="bold" color={hue.amber.s200}>
          {ar.offline.title}
        </Txt>
        {lastUpdatedAgo ? (
          <Txt size={12} weight="regular" color={color.inkSecondary}>
            {ar.offline.lastUpdated(lastUpdatedAgo)}
          </Txt>
        ) : null}
      </View>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          hitSlop={4}
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
        >
          <Txt size={13} weight="bold" color={hue.amber.base}>
            {ar.offline.retry}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Dashed notice that replaces join / submit buttons while offline. */
export function LockedNotice({ text = ar.offline.writesLocked }: { text?: string }) {
  return (
    <View style={styles.locked}>
      <Lock size={18} color={color.inkSoft} strokeWidth={1.9} />
      <Txt size={13} leading={1.6} weight="regular" color={color.inkSecondary} style={styles.text}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingStart: 12,
    paddingEnd: 8,
    borderRadius: 16,
    backgroundColor: color.warnSurface,
    borderWidth: 1,
    borderColor: tint(hue.amber.base, 0.4),
    ...shadow.banner,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: tint(hue.amber.base, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  retry: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: tint(hue.amber.base, 0.16),
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
  },
});
