import { Platform } from 'react-native';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

// The artboards are drawn on a 390×844 phone with a 47pt status bar and a 34pt home
// indicator. The web build (screenshot checks only) has no insets, so we simulate
// those values there to keep screenshots comparable with the design.
const WEB_INSETS: EdgeInsets = { top: 47, bottom: 34, left: 0, right: 0 };

export function useScreenInsets(): EdgeInsets {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'web' ? WEB_INSETS : insets;
}
