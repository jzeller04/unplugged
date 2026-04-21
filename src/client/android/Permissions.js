import { NativeModules, Platform } from 'react-native';

const { PermissionSettings } = NativeModules;

export const openUsageAccess = () => {
  if (Platform.OS === 'android') {
    PermissionSettings.openUsageAccessSettings();
  }
};

export const openAccessibility = () => {
  if (Platform.OS === 'android') {
    PermissionSettings.openAccessibilitySettings();
  }
};

export const openOverlay = () => {
  if (Platform.OS === 'android') {
    PermissionSettings.openOverlaySettings();
  }
};
