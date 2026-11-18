import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ScreenBackground } from '@/components/ScreenBackground';
import { useScreenInsets } from '@/lib/insets';
import { color, space } from '@/theme/tokens';

/** Height the floating tab bar covers at the bottom (bar + offset + fade room). */
export const TAB_BAR_SPACE = 66 + 24 + 40;

/**
 * Layout for a tab's root screen: background art, header 13pt under the status bar
 * (design: top 60), 20pt gutters, and room at the bottom for the floating tab bar.
 * With `banner` (offline, screen 19) the banner sits at the top (design: top 54, 16 above the header) and
 * pushes the header down (design: top 140).
 */
export function TabScreen({
  header,
  banner,
  children,
  gap = 14,
  refreshing,
  onRefresh,
  mark,
  extraBottom = 0,
  headerSpacing = 18,
}: {
  header: React.ReactNode;
  banner?: React.ReactNode;
  children?: React.ReactNode;
  gap?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** FTC mark watermark (Tasks tab). */
  mark?: boolean;
  /** Extra bottom space for content pinned above the tab bar (leaderboard rank). */
  extraBottom?: number;
  /** Space under the header; the artboards use 18 (Tasks), 9 (Community), 13 (Leaderboard). */
  headerSpacing?: number;
}) {
  const insets = useScreenInsets();
  return (
    <View style={styles.screen}>
      <ScreenBackground mark={mark} />
      <ScrollView
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={color.accent}
              colors={[color.brand]}
              progressViewOffset={insets.top}
            />
          ) : undefined
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (banner ? 7 : 13),
            paddingBottom: TAB_BAR_SPACE + insets.bottom + extraBottom,
            gap,
          },
        ]}
      >
        {banner ? (
          <View style={[styles.banner, { marginHorizontal: -4, marginBottom: 16 - gap }]}>
            {banner}
          </View>
        ) : null}
        <View style={{ marginBottom: headerSpacing - gap }}>{header}</View>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.gutter },
  banner: {},
});
