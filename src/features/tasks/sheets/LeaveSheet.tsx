// Screen 14: «تنسحب من المهمة؟». «نعم، انسحب» → POST /tasks/{id}/leave → back to Tasks.
// «لا، أكمل المهمة» closes the sheet.
import { LogOut } from 'lucide-react-native';
import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLeaveTask } from '@/api/mutations';
import { writeErrorMessage } from '@/api/writeErrorMessage';
import { AlertBanner } from '@/components/AlertBanner';
import { Button } from '@/components/Button';
import { Sheet, SheetHero, type SheetRef } from '@/components/Sheet';
import { ar } from '@/i18n/ar';
import { clearTaskFlash } from '@/lib/flash';
import { hue } from '@/theme/tokens';

const t = ar.sheets;

type Props = { taskId: number; onLeft: () => void };

export const LeaveSheet = forwardRef<SheetRef, Props>(function LeaveSheet({ taskId, onLeft }, ref) {
  const leave = useLeaveTask();
  const close = () => (typeof ref === 'object' ? ref?.current?.dismiss() : undefined);

  function confirm() {
    leave.mutate(taskId, {
      onSuccess: () => {
        clearTaskFlash(taskId);
        close();
        onLeft();
      },
    });
  }

  const error = leave.isError ? writeErrorMessage(leave.error) : null;
  return (
    <Sheet ref={ref} accessibilityLabel={t.leaveLabel} onDismiss={() => leave.reset()}>
      <SheetHero icon={LogOut} tone={hue.red.base} title={t.leaveTitle} body={t.leaveBody} />
      {error ? <AlertBanner message={error} /> : null}
      <View style={styles.buttons}>
        <Button
          label={t.leaveConfirm}
          variant="destructive"
          onPress={confirm}
          loading={leave.isPending}
        />
        <Button label={t.leaveCancel} variant="ghost" onPress={close} disabled={leave.isPending} />
      </View>
    </Sheet>
  );
});

const styles = StyleSheet.create({
  // design: 4pt more above the buttons than the sheet's 16 gap
  buttons: { gap: 8, marginTop: 4 },
});
