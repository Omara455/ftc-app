// Screen 06 header. The stats card and task lists arrive in M3.
import { Bell, Code } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useMe } from '@/api/hooks';
import { IconButton } from '@/components/Button';
import { TabScreen } from '@/components/TabScreen';
import { Txt } from '@/components/Txt';
import { flags } from '@/config/flags';
import { ar } from '@/i18n/ar';
import { color } from '@/theme/tokens';

export default function Tasks() {
  const me = useMe().data;
  const t = ar.tabs;
  return (
    <TabScreen
      header={
        <View style={styles.header}>
          <View style={styles.titles}>
            <Txt variant="title" accessibilityRole="header">
              {t.tasksHeadlineA}
              <Txt variant="title" color={color.highlight}>
                {t.tasksHeadlineGive}
              </Txt>
              {t.tasksHeadlineB}
              <Txt variant="title" color={color.glow}>
                {t.tasksHeadlineGets}
              </Txt>
            </Txt>
            {me ? (
              <View style={styles.sub}>
                <Code size={14} color={color.accent} strokeWidth={2} />
                <Txt variant="meta" color={color.accent}>
                  {ar.tasks.committeeTasks(me.committee.name)}
                </Txt>
              </View>
            ) : null}
          </View>
          {/* Notifications (screen 17) are Phase 2 */}
          {flags.notifications ? (
            <IconButton icon={Bell} accessibilityLabel={t.notifications} />
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titles: { flex: 1, gap: 2 },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
