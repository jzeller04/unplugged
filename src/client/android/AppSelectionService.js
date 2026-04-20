import { NativeModules } from 'react-native';

const { AppSelectionModule } = NativeModules;

const ensureAppSelectionModule = () => {
  if (!AppSelectionModule) {
    throw new Error('AppSelectionModule is unavailable. Rebuild the app.');
  }

  return AppSelectionModule;
};

const AppSelectionService = {
  getApps: async () => {
    return ensureAppSelectionModule().getApps();
  },
};

export default AppSelectionService;
