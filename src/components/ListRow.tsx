import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { Children, Fragment, isValidElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Divider } from '@/components/Card';
import { Txt } from '@/components/Txt';
import { color, radius, tint } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  /** Icon tile at the start (32pt, radius 10, tinted). */
  icon?: LucideIcon;
  iconColor?: string;
  /** Replaces the default chevron: a Toggle, a value, an external-link icon… */
  trailing?: React.ReactNode;
  /** Shows the ‹ chevron (default when the row is pressable and has no trailing). */
  chevron?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Settings-style row: icon tile · title / subtitle · chevron. Min height 52. */
export function ListRow({
  title,
  subtitle,
  icon: Icon,
  iconColor = color.highlight,
  trailing,
  chevron,
  onPress,
  accessibilityLabel,
}: Props) {
  const showChevron = chevron ?? (onPress != null && trailing == null);
  const body = (
    <>
      {Icon ? (
        <View
          style={[
            styles.tile,
            { backgroundColor: tint(iconColor === color.highlight ? color.brand : iconColor, 0.2) },
          ]}
        >
          <Icon size={16} color={iconColor} strokeWidth={1.9} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Txt size={14.5} weight="semibold">
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="meta" size={12} weight="regular" color={color.inkSoft}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {trailing}
      {showChevron ? <ChevronLeft size={18} color={color.inkMuted} strokeWidth={2} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={styles.row}>{body}</View>;
}

/** A Card of rows with 1pt dividers between them, plus an optional section label above. */
export function ListGroup({ label, children }: { label?: string; children: React.ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={styles.groupWrap}>
      {label ? (
        <Txt
          variant="meta"
          size={12.5}
          weight="semibold"
          color={color.inkSoft}
          style={styles.label}
        >
          {label}
        </Txt>
      ) : null}
      <View style={styles.group}>
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {i > 0 ? <Divider /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // The artboard rows are min-height 52 + 6/6 padding outside box-sizing → 64 rendered.
    minHeight: 64,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pressed: { backgroundColor: color.raised },
  tile: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  groupWrap: { gap: 8 },
  label: { paddingHorizontal: 4 },
  group: {
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    overflow: 'hidden',
  },
});
