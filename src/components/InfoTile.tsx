import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { color, tint } from '@/theme/tokens';

type Props = {
  icon: LucideIcon;
  /** Icon colour; its tile is the same colour at 14–18%. */
  tone?: string;
  label: string;
  value: string;
  /** Makes the tile tappable, e.g. the contact cell opens `tel:`. */
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Cell of the 2×2 task info grid: tinted icon tile · small label · bold value. */
export function InfoTile({
  icon: Icon,
  tone = color.highlight,
  label,
  value,
  onPress,
  accessibilityLabel,
}: Props) {
  const tileBg = tone === color.highlight ? tint(color.brand, 0.18) : tint(tone, 0.14);
  const body = (
    <>
      <View style={[styles.icon, { backgroundColor: tileBg }]}>
        <Icon size={17} color={tone} strokeWidth={1.9} />
      </View>
      <View style={styles.text}>
        <Txt size={11.5} weight="medium" color={color.inkSoft}>
          {label}
        </Txt>
        <Txt size={14} weight="bold" numberOfLines={1}>
          {value}
        </Txt>
      </View>
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={styles.tile}>{body}</View>;
}

/** 2-column grid with 10pt gaps. */
export function InfoGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  pressed: { backgroundColor: color.raised },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
