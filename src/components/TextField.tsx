import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Ltr, MAX_FONT_SCALE, Txt } from '@/components/Txt';
import { color, font, radius, tint } from '@/theme/tokens';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  /** Message under the field, or `true` for the red border only (screen 02's password). */
  error?: string | boolean;
  /** Icon at the start (right in RTL). Turns accent while focused. */
  icon?: LucideIcon;
  /** Element at the end (left in RTL), e.g. the password eye toggle. */
  trailing?: React.ReactNode;
  /** Emails, URLs and passwords are typed left-to-right. */
  ltr?: boolean;
  /** 54 on the auth screens, 50 elsewhere. */
  height?: number;
  /** Auth screens fill the field with `surface`; sheets use `bg`. */
  onSurface?: boolean;
  /** Preview only (/dev/kit): render the focused style without focus. */
  forceFocus?: boolean;
  /** Inside a bottom sheet: keeps the sheet above the keyboard. */
  inSheet?: boolean;
  /** Shows «38 / 160» under the field (needs maxLength). */
  counter?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof TextInput>>;
};

export function TextField({
  label,
  error,
  icon: Icon,
  trailing,
  ltr,
  height = 50,
  onSurface,
  forceFocus,
  inSheet,
  counter,
  ref,
  onFocus,
  onBlur,
  secureTextEntry,
  ...input
}: Props) {
  const [hasFocus, setFocused] = useState(false);
  const focused = hasFocus || !!forceFocus;
  const multiline = !!input.multiline;
  // gorhom's input keeps the sheet above the keyboard; it needs native TextInput APIs, so not on web.
  const Input = inSheet && Platform.OS !== 'web' ? BottomSheetTextInput : TextInput;
  const borderColor = error ? color.danger : focused ? color.brand : color.line;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Txt variant="meta" weight="semibold" leading={1.875} color={color.inkSecondary}>
          {label}
        </Txt>
      ) : null}
      <View>
        {focused && !error ? <View pointerEvents="none" style={styles.ring} /> : null}
        <View
          style={[
            styles.box,
            multiline && styles.boxMultiline,
            {
              height,
              borderColor,
              borderWidth: error || focused ? 1.5 : 1,
              backgroundColor: onSurface ? color.surface : color.bg,
            },
          ]}
        >
          {Icon ? (
            <Icon
              size={20}
              color={error ? color.danger : focused ? color.accent : color.inkSoft}
              strokeWidth={1.8}
            />
          ) : null}
          <Input
            ref={ref as never}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            {...input}
            secureTextEntry={secureTextEntry}
            accessibilityLabel={input.accessibilityLabel ?? label}
            placeholderTextColor={color.inkSoft}
            selectionColor={color.accent}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              ltr && styles.ltr,
              secureTextEntry && input.value ? styles.secure : null,
              Platform.OS === 'web' && webNoOutline,
            ]}
          />
          {trailing}
        </View>
      </View>
      {counter && input.maxLength ? (
        <Txt size={11.5} weight="regular" color={color.inkSoft} style={styles.counter}>
          <Ltr>{`${(input.value ?? '').length} / ${input.maxLength}`}</Ltr>
        </Txt>
      ) : null}
      {typeof error === 'string' && error ? (
        <Txt variant="meta" size={12.5} weight="regular" color={color.dangerText}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingStart: 16,
    paddingEnd: 5,
    borderRadius: radius.md,
  },
  // 4pt focus ring (CSS box-shadow spread in the design)
  ring: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    start: -4,
    end: -4,
    borderRadius: radius.md + 4,
    borderWidth: 4,
    borderColor: tint(color.brand, 0.22),
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingEnd: 11,
    color: color.ink,
    fontFamily: font.family.regular,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltr: { textAlign: 'left', writingDirection: 'ltr' },
  // Textarea (bio, submission note): 12/14 padding, 14.5 at 1.7, text from the top
  boxMultiline: { alignItems: 'flex-start', paddingStart: 14, paddingEnd: 14, paddingVertical: 12 },
  inputMultiline: {
    paddingEnd: 0,
    fontSize: 14.5,
    lineHeight: 14.5 * 1.7,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
  },
  counter: { alignSelf: 'flex-end' },
  secure: { letterSpacing: 2 },
});

// Web only: the field draws its own focus ring, so hide the browser's outline.
const webNoOutline = { outlineStyle: 'none' } as object;
