import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { LucideIcon } from 'lucide-react-native';
import { forwardRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useScreenInsets } from '@/lib/insets';

import { Txt } from '@/components/Txt';
import { color, radius, shadow, tint } from '@/theme/tokens';

export type SheetRef = BottomSheetModal;

type Props = {
  children: React.ReactNode;
  accessibilityLabel: string;
  onDismiss?: () => void;
};

/**
 * Bottom sheet for join, leave, submit, change password and logout.
 * Radius 28 on top, grab handle, dimmed screen behind. Open with `ref.current?.present()`.
 * Needs `BottomSheetModalProvider` at the root (app/_layout.tsx).
 */
export const Sheet = forwardRef<SheetRef, Props>(function Sheet(
  { children, accessibilityLabel, onDismiss },
  ref,
) {
  const insets = useScreenInsets();
  const backdrop = useCallback(
    (p: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...p}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={1}
        style={[p.style, { backgroundColor: color.scrim }]}
      />
    ),
    [],
  );
  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onDismiss}
      backdropComponent={backdrop}
      backgroundStyle={styles.background}
      handleStyle={styles.handleArea}
      handleIndicatorStyle={styles.handle}
      accessibilityLabel={accessibilityLabel}
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView
        style={[
          styles.content,
          { paddingBottom: Math.max(34, insets.bottom) /* design: 34 incl. the home indicator */ },
        ]}
      >
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

/**
 * The same sheet surface, rendered inline (no modal). Used by the /dev/kit page and
 * screenshot tests to show a sheet without opening it.
 */
export function SheetSurface({ children }: { children: React.ReactNode }) {
  return (
    <View style={[styles.background, styles.surface]}>
      <View style={styles.handleArea}>
        <View style={styles.handle} />
      </View>
      <View style={[styles.content, { paddingBottom: 34 }]}>{children}</View>
    </View>
  );
}

/** Top of most sheets: 56pt icon tile, 20/800 title, 14/1.8 explanation. */
export function SheetHero({
  icon: Icon,
  tone = color.highlight,
  title,
  body,
}: {
  icon: LucideIcon;
  /** Icon colour. Brand tile by default, red tile for destructive sheets. */
  tone?: string;
  title: string;
  body?: string;
}) {
  const tileBg = tone === color.highlight ? color.brandTint : tint(tone, 0.14);
  return (
    <View style={styles.hero}>
      <View style={[styles.heroIcon, { backgroundColor: tileBg }]}>
        <Icon size={26} color={tone} strokeWidth={1.9} />
      </View>
      <Txt size={20} leading={1.45} weight="extrabold" align="center" style={styles.heroTitle}>
        {title}
      </Txt>
      {body ? (
        <Txt size={14} leading={1.8} weight="regular" color={color.inkSoft} align="center">
          {body}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: 1,
    borderColor: color.lineStrong,
    ...shadow.sheet,
  },
  surface: { overflow: 'hidden' },
  handleArea: { paddingTop: 10, paddingBottom: 0, alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: color.lineStrong },
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  hero: { alignItems: 'center', gap: 6, marginTop: 6 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { marginTop: 8 },
});
