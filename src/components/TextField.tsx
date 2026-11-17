import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Txt } from '@/components/Txt';
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
  ref,
  onFocus,
  onBlur,
  secureTextEntry,
  ...input
}: Props) {
  const [hasFocus, setFocused] = useState(false);
  const focused = hasFocus || !!forceFocus;
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
          <TextInput
            ref={ref}
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
              ltr && styles.ltr,
              secureTextEntry && input.value ? styles.secure : null,
              Platform.OS === 'web' && webNoOutline,
            ]}
          />
          {trailing}
        </View>
      </View>
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
  secure: { letterSpacing: 2 },
});

// Web only: the field draws its own focus ring, so hide the browser's outline.
const webNoOutline = { outlineStyle: 'none' } as object;
