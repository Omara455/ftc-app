import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { color, radius, tint } from '@/theme/tokens';

type Props<K extends string> = {
  options: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  accessibilityLabel: string;
};

/** Two-or-more option switch («هالترم / كل الترمات»). */
export function Segmented<K extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<K>) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.wrap}>
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.key)}
            style={[styles.tab, selected && styles.selected]}
          >
            <Txt
              size={14}
              weight={selected ? 'bold' : 'semibold'}
              color={selected ? color.ink : color.inkSoft}
            >
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: tint(color.brand, 0.24) },
});
