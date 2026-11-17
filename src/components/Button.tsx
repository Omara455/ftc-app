import { Lock, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Txt } from '@/components/Txt';
import { color, hue, radius, shadow, tint } from '@/theme/tokens';

export type ButtonVariant =
  'primary' | 'secondary' | 'destructive' | 'ghost' | 'link' | 'dangerLink';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** `lg` = 54pt full-width CTA, `sm` = 40pt inline button («انضم للمهمة»). */
  size?: 'lg' | 'sm';
  /** Icon shown before the label (on the right in RTL). */
  icon?: LucideIcon;
  /** Icon shown after the label (e.g. the login arrow). */
  trailingIcon?: LucideIcon;
  /** Offline lock: disabled, with a lock icon. */
  locked?: boolean;
  disabled?: boolean;
  /** Secondary on a page (surface fill) instead of inside a sheet (bg fill). */
  onSurface?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const looks = {
  primary: { bg: color.brand, fg: color.onBrand, border: undefined, size: 16, weight: 'bold' },
  secondary: {
    bg: color.bg,
    fg: color.inkSecondary,
    border: color.line,
    size: 15,
    weight: 'semibold',
  },
  destructive: {
    bg: tint(hue.red.base, 0.14),
    fg: color.dangerText,
    border: tint(hue.red.base, 0.6),
    size: 16,
    weight: 'bold',
  },
  ghost: {
    bg: 'transparent',
    fg: color.inkSecondary,
    border: undefined,
    size: 15,
    weight: 'semibold',
  },
  link: { bg: 'transparent', fg: color.accent, border: undefined, size: 14, weight: 'semibold' },
  dangerLink: {
    bg: 'transparent',
    fg: color.danger,
    border: undefined,
    size: 14,
    weight: 'semibold',
  },
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  trailingIcon: Trailing,
  locked,
  disabled,
  onSurface,
  accessibilityLabel,
  style,
}: Props) {
  const look = looks[variant];
  const inline = variant === 'link' || variant === 'dangerLink';
  const isDisabled = disabled || locked;
  const sm = size === 'sm';
  const fg = locked ? color.inkSoft : look.fg;
  const LeadIcon = locked ? Lock : Icon;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      hitSlop={inline || sm ? 4 : undefined}
      style={({ pressed }) => [
        styles.base,
        inline ? styles.inline : sm ? styles.sm : variant === 'ghost' ? styles.ghost : styles.lg,
        { backgroundColor: look.bg },
        variant === 'secondary' && onSurface && { backgroundColor: color.surface },
        look.border != null && {
          borderColor: look.border,
          borderWidth: variant === 'destructive' ? 1.5 : 1,
        },
        variant === 'primary' && !sm && !isDisabled && shadow.brandButton,
        locked && styles.locked,
        disabled && !locked && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {LeadIcon ? <LeadIcon size={18} color={fg} strokeWidth={2} /> : null}
      <Txt variant="body" size={sm ? 14 : look.size} weight={sm ? 'bold' : look.weight} color={fg}>
        {label}
      </Txt>
      {Trailing ? <Trailing size={18} color={fg} strokeWidth={2} /> : null}
    </Pressable>
  );
}

/** 44×44 square icon button used in headers (back, bell, settings). */
export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  badge,
  iconColor = color.inkSecondary,
}: {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: () => void;
  /** Unread dot in the top corner. */
  badge?: boolean;
  iconColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.icon, pressed && styles.pressed]}
    >
      <Icon size={20} color={iconColor} strokeWidth={1.8} />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lg: { height: 54, borderRadius: radius.md },
  ghost: { height: 48, borderRadius: radius.md },
  sm: { height: 40, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  inline: { minHeight: 40, alignSelf: 'flex-start' },
  locked: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    // 8pt glow dot + 2pt ring in the button colour (design: top 10, left 11)
    top: 8,
    end: 9,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: color.glow,
    borderWidth: 2,
    borderColor: color.surface,
  },
});
