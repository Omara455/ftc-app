// Screen 24 header. League card, podium and ranks arrive in M4.
import { Trophy } from 'lucide-react-native';

import { TabHeader } from '@/components/TabHeader';
import { TabScreen } from '@/components/TabScreen';
import { ar } from '@/i18n/ar';
import { league } from '@/theme/tokens';

export default function Leaderboard() {
  return (
    <TabScreen
      header={
        <TabHeader
          icon={Trophy}
          tone={league.bronze.fg}
          title={ar.tabs.leaderboard}
          subtitle={ar.tabs.leaderboardSub}
        />
      }
    />
  );
}
