import { ArrowRight } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useScreenInsets } from '@/lib/insets';

import { IconButton } from '@/components/Button';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color } from '@/theme/tokens';

type Props = {
  title: string;
  onBack?: () => void;
  /** Element at the end (left in RTL), e.g. «حفظ». Keeps the title centred. */
  end?: React.ReactNode;
  /** Replaces the back button at the start, e.g. «إلغاء» on edit profile (28). */
  start?: React.ReactNode;
  /** Set false when the header sits inside a design frame that already has the inset. */
  safeTop?: boolean;
};

/** Stack header: back (→) at the start, centred 16/700 title, optional action at the end. */
export function Header({ title, onBack, end, start, safeTop = true }: Props) {
  const insets = useScreenInsets();
  return (
    <View style={[styles.header, safeTop && { marginTop: insets.top + 7 }]}>
      <View style={styles.side}>
        {start ??
          (onBack ? (
            <IconButton
              icon={ArrowRight}
              iconColor={color.ink}
              accessibilityLabel={ar.common.back}
              onPress={onBack}
            />
          ) : null)}
      </View>
      <Txt variant="header" accessibilityRole="header">
        {title}
      </Txt>
      <View style={[styles.side, styles.end]}>{end}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  end: { alignItems: 'flex-end' },
});
