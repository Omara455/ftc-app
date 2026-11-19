import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import type { LucideIcon } from 'lucide-react-native';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useScreenInsets } from '@/lib/insets';

import { Txt } from '@/components/Txt';
import { color, radius, shadow, tint } from '@/theme/tokens';

export type SheetRef = BottomSheetModal;

type Props = {
  children: React.ReactNode;
  accessibilityLabel: string;
  onDismiss?: () => void;
  /**
   * Tall sheets (submit, 11): the sheet's top sits this far below the safe-area top
   * (design: 148 on a 47pt inset → 101) and the content can use flex to push the CTA down.
   */
  topOffset?: number;
  /** Content gap (design: 16, submit uses 14). */
  gap?: number;
};

/**
 * Bottom sheet for join, leave, submit, change password and logout.
 * Radius 28 on top, grab handle, dimmed screen behind. Open with `ref.current?.present()`.
 * Needs `BottomSheetModalProvider` at the root (app/_layout.tsx).
 */
export const Sheet = forwardRef<SheetRef, Props>(function Sheet(
  { children, accessibilityLabel, onDismiss, topOffset, gap },
  ref,
) {
  const insets = useScreenInsets();
  const { height: windowHeight } = useWindowDimensions();
  const inner = useRef<BottomSheetModal>(null);
  useImperativeHandle(ref, () => inner.current as BottomSheetModal, []);

  // Android back closes the sheet instead of leaving the screen. A ref, not state: a
  // re-render while the sheet opens upsets gorhom's dynamic sizing (bottom padding cut off).
  const open = useRef(false);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!open.current) return false;
      inner.current?.dismiss();
      return true;
    });
    return () => sub.remove();
  }, []);

  const fixed = topOffset != null;
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
      ref={inner}
      onChange={(index) => {
        open.current = index >= 0;
      }}
      onDismiss={() => {
        open.current = false;
        onDismiss?.();
      }}
      // Only pass sizing props for fixed sheets: an explicit `snapPoints={undefined}` breaks
      // gorhom's dynamic sizing (the bottom padding gets cut off).
      {...(fixed
        ? { enableDynamicSizing: false, snapPoints: [windowHeight - insets.top - topOffset] }
        : {})}
      backdropComponent={backdrop}
      backgroundStyle={styles.background}
      handleStyle={styles.handleArea}
      handleIndicatorStyle={styles.handle}
      accessibilityLabel={accessibilityLabel}
      keyboardBlurBehavior="restore"
    >
      {fixed ? (
        // Tall sheet: scrolls when the keyboard or a long file list doesn't fit.
        <BottomSheetScrollView
          style={styles.fill}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            ...styles.content,
            ...styles.grow,
            ...(gap != null ? { gap } : null),
            paddingBottom: Math.max(34, insets.bottom),
          }}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        // One plain style object: gorhom reads paddingBottom from it to size the sheet.
        <BottomSheetView
          style={{
            ...styles.content,
            ...(gap != null ? { gap } : null),
            paddingBottom: Math.max(34, insets.bottom), // design: 34 incl. the home indicator
          }}
        >
          {children}
        </BottomSheetView>
      )}
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
  grow: { flexGrow: 1 },
  fill: { flex: 1 },
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
