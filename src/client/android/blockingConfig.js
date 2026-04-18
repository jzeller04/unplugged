import { NativeModules } from 'react-native';

const { BlockingConfigModule } = NativeModules;

const ensureBlockingConfigModule = () => {
  if (!BlockingConfigModule) {
    throw new Error('BlockingConfigModule is unavailable. Rebuild the app.');
  }

  return BlockingConfigModule;
};

const blockingConfig = {
  setBlockedPackages: async (packages) => {
    return ensureBlockingConfigModule().setBlockedPackages(packages);
  },

  setBlockingEnabled: async (enabled) => {
    return ensureBlockingConfigModule().setBlockingEnabled(enabled);
  },

  getBlockingConfig: async () => {
    return ensureBlockingConfigModule().getBlockingConfig();
  },
};

export default blockingConfig;
