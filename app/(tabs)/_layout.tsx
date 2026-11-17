import { Tabs } from 'expo-router';

import { TabBar, type TabKey } from '@/components/TabBar';
import { color } from '@/theme/tokens';

// Order from the start (right in RTL): المهام · المجتمع · الصدارة · حسابي
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}
      tabBar={({ state, emitter, navigateToTab }) => (
        <TabBar
          active={state.routes[state.index].name as TabKey}
          onPress={(key) => {
            const route = state.routes.find((r) => r.name === key);
            if (!route) return;
            // `tabPress` lets a nested stack pop to its root when its tab is tapped again.
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            const focused = state.routes[state.index].key === route.key;
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          }}
        />
      )}
    >
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
