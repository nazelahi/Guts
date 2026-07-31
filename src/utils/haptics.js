/**
 * Cross-platform Haptics Feedback Helper for Snooker Guts
 */
import { Platform } from 'react-native';

export const triggerHaptic = (type = 'light') => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        if (type === 'light') window.navigator.vibrate(10);
        else if (type === 'medium') window.navigator.vibrate(25);
        else if (type === 'success') window.navigator.vibrate([15, 30, 15]);
      } catch (e) {
        // Safe fallback
      }
    }
  }
};
