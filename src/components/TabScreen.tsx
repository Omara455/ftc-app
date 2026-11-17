import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenBackground } from '@/components/ScreenBackground';
import { useScreenInsets } from '@/lib/insets';
import { color, space } from '@/theme/tokens';

/** Height the floating tab bar covers at the bottom (bar + offset + fade room). */
export const TAB_BAR_SPACE = 66 + 24 + 40;

/**
 * Layout for a tab's root screen: background art, header 13pt under the status bar
 * (design: top 60), 20pt gutters, and room at the bottom for the floating tab bar.
 */
export function TabScreen({
  header,
  children,
  gap = 14,
}: {
  header: React.ReactNode;
  children?: React.ReactNode;
  gap?: number;
}) {
  const insets = useScreenInsets();
  return (
    <View style={styles.screen}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 13, paddingBottom: TAB_BAR_SPACE + insets.bottom, gap },
        ]}
      >
        {header}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter },
});
