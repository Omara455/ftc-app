import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { color, tint } from '@/theme/tokens';

/** Tab title with a 46pt tinted icon tile (Community, Leaderboard). */
export function TabHeader({
  icon: Icon,
  tone = color.highlight,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  tone?: string;
  title: string;
  subtitle?: string;
}) {
  const tileBg = tone === color.highlight ? tint(color.brand, 0.2) : tint(tone, 0.16);
  return (
    <View style={styles.header}>
      <View style={[styles.tile, { backgroundColor: tileBg }]}>
        <Icon size={22} color={tone} strokeWidth={1.8} />
      </View>
      <View>
        <Txt variant="title" leading={1.4} accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="meta" color={color.inkSoft}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
