import { Tabs, useSegments } from 'expo-router';

import { TabBar, type TabKey } from '@/components/TabBar';
import { color } from '@/theme/tokens';

// The artboards show the tab bar only on tab roots, plus the committee page (22).
// Pushed screens (task detail, history, settings, member profile…) hide it.
const KEEP_TAB_BAR = ['committee'];

function useTabBarVisible(): boolean {
  const segments = useSegments() as string[]; // e.g. ['(tabs)', 'tasks', '[id]']
  const depth = segments.length - segments.indexOf('(tabs)') - 1;
  return depth <= 1 || KEEP_TAB_BAR.includes(segments[segments.indexOf('(tabs)') + 2] ?? '');
}

// Order from the start (right in RTL): المهام · المجتمع · الصدارة · حسابي
export default function TabsLayout() {
  const visible = useTabBarVisible();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}
      tabBar={({ state, emitter, navigateToTab }) =>
        visible ? (
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
        ) : null
      }
    >
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
