// Screen 15: no tasks yet — dashed inbox card + «كيف تكسب ساعاتك؟» explainer.
import { Inbox } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';
import { color, radius, tint } from '@/theme/tokens';

export function EmptyTasks() {
  const t = ar.tasks;
  return (
    <>
      <View style={styles.empty}>
        <View style={styles.icon}>
          <Inbox size={30} color={color.highlight} strokeWidth={1.7} />
        </View>
        <Txt size={18} weight="extrabold" align="center" accessibilityRole="header">
          {t.emptyTitle}
        </Txt>
        <Txt size={14} leading={1.75} weight="regular" color={color.inkSoft} align="center">
          {t.emptyBody}
        </Txt>
      </View>

      <View style={styles.how}>
        <Txt size={15} weight="bold" accessibilityRole="header">
          {t.howTitle}
        </Txt>
        {t.how.map((step, i) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.num}>
              <Txt size={13} weight="extrabold" color={color.highlight}>
                {i + 1}
              </Txt>
            </View>
            <View style={styles.stepText}>
              <Txt size={14} weight="bold">
                {step.title}
              </Txt>
              <Txt size={12.5} weight="regular" color={color.inkSoft}>
                {step.body}
              </Txt>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 34,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: tint(color.brand, 0.16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  how: {
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: tint(color.brand, 0.2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
});
