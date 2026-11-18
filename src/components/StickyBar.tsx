import { StyleSheet, View } from 'react-native';

import { BottomFade } from '@/components/BottomFade';
import { useScreenInsets } from '@/lib/insets';
import { color } from '@/theme/tokens';

/** Height of the bar without the inset, for the scroll view's bottom padding. */
export const STICKY_BAR_HEIGHT = 12 + 54;

/**
 * Bottom CTA bar on detail screens (07, 10, 12, 13): glass fill, top border,
 * 12/20/34 padding, with a fade behind so content scrolls out under it.
 */
export function StickyBar({ children, row }: { children: React.ReactNode; row?: boolean }) {
  const insets = useScreenInsets();
  return (
    <>
      <BottomFade height={160} solidFrom={0.55} />
      <View style={[styles.bar, row && styles.row, { paddingBottom: Math.max(34, insets.bottom) }]}>
        {children}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: color.line,
    backgroundColor: color.barGlass,
  },
  row: { flexDirection: 'row', gap: 10 },
});
