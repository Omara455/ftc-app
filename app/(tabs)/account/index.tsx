// Screen 25 header. Profile card, achievements and activity arrive in M4.
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/Button';
import { TabScreen } from '@/components/TabScreen';
import { Txt } from '@/components/Txt';
import { ar } from '@/i18n/ar';

export default function Account() {
  return (
    <TabScreen
      header={
        <View style={styles.header}>
          <Txt variant="title" leading={1.4} accessibilityRole="header">
            {ar.tabs.account}
          </Txt>
          <IconButton
            icon={Settings}
            accessibilityLabel={ar.tabs.settings}
            onPress={() => router.push('/account/settings')}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
