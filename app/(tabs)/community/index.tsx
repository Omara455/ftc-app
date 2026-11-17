// Screen 20 header. Counts, search, leadership and committees arrive in M4.
import { Users } from 'lucide-react-native';

import { TabHeader } from '@/components/TabHeader';
import { TabScreen } from '@/components/TabScreen';
import { ar } from '@/i18n/ar';

export default function Community() {
  return <TabScreen header={<TabHeader icon={Users} title={ar.tabs.community} />} />;
}
