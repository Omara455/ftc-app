// Error state for data screens (CLAUDE.md rule 9). There is no error artboard yet,
// so this reuses designed pieces: the dashed notice card, the approved server-error
// copy and the offline banner's «حاول مجددًا».
import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color, radius } from '@/theme/tokens';

export function ErrorState({
  onRetry,
  message = ar.common.serverError,
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <View accessibilityRole="alert" style={styles.card}>
      <CircleAlert size={22} color={color.inkSoft} strokeWidth={1.9} />
      <Txt size={14} leading={1.75} weight="regular" color={color.inkSecondary} align="center">
        {message}
      </Txt>
      {onRetry ? (
        <Button
          label={ar.offline.retry}
          variant="secondary"
          size="sm"
          onPress={onRetry}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
  },
  retry: { alignSelf: 'center', marginTop: 4 },
});
