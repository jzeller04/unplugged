import { NativeModules } from "react-native";

const { UsageStatsModule } = NativeModules;

// Temporary usage stats mock mode for screenshots.
const usageStatsMockMode = false;

const usageStatsMockData = [
  {
    appName: "YouTube",
    packageName: "com.google.android.youtube",
    totalTimeInForeground: 2 * 60 * 60 * 1000 + 18 * 60 * 1000,
    openCount: 19,
    isSystemApp: false,
    appIcon: null,
  },
  {
    appName: "Instagram",
    packageName: "com.instagram.android",
    totalTimeInForeground: 1 * 60 * 60 * 1000 + 44 * 60 * 1000,
    openCount: 23,
    isSystemApp: false,
    appIcon: null,
  },
  {
    appName: "Chrome",
    packageName: "com.android.chrome",
    totalTimeInForeground: 1 * 60 * 60 * 1000 + 12 * 60 * 1000,
    openCount: 17,
    isSystemApp: false,
    appIcon: null,
  },
  {
    appName: "Spotify",
    packageName: "com.spotify.music",
    totalTimeInForeground: 58 * 60 * 1000,
    openCount: 11,
    isSystemApp: false,
    appIcon: null,
  },
  {
    appName: "Gmail",
    packageName: "com.google.android.gm",
    totalTimeInForeground: 41 * 60 * 1000,
    openCount: 14,
    isSystemApp: false,
    appIcon: null,
  },
  {
    appName: "Messages",
    packageName: "com.google.android.apps.messaging",
    totalTimeInForeground: 27 * 60 * 1000,
    openCount: 21,
    isSystemApp: false,
    appIcon: null,
  },
  {
    appName: "Canvas Student",
    packageName: "com.instructure.candroid",
    totalTimeInForeground: 22 * 60 * 1000,
    openCount: 6,
    isSystemApp: false,
    appIcon: null,
  },
];

const getNativeAggregateUsageData = async () => {
  if (!UsageStatsModule) {
    console.warn("UsageStatsModule is null. Rebuild app");
    return [];
  }

  const rawData = await UsageStatsModule.getAggregateUsageData();
  console.log(
    `[UsageDataService] Raw data from Android: ${rawData.length} apps found.`,
  );
  return rawData;
};

const attachRealIconsToMockData = async () => {
  try {
    const nativeData = await getNativeAggregateUsageData();
    const nativeDataByPackage = new Map(
      nativeData.map((app) => [app.packageName, app]),
    );

    return usageStatsMockData.map((mockApp) => {
      const realApp = nativeDataByPackage.get(mockApp.packageName);
      return {
        ...mockApp,
        appIcon: realApp?.appIcon ?? null,
      };
    });
  } catch (error) {
    console.warn(
      "[UsageDataService] Failed to attach real package icons to usageStatsMockData.",
      error,
    );
    return usageStatsMockData;
  }
};

const UsageDataService = {
  getTodayUsage: async () => {
    try {
      if (usageStatsMockMode) {
        const mockDataWithIcons = await attachRealIconsToMockData();
        console.log(
          `[UsageDataService] usageStatsMockMode enabled: ${mockDataWithIcons.length} apps returned.`,
        );
        return mockDataWithIcons;
      }

      return await getNativeAggregateUsageData();
    } catch (error) {
      console.error("Failed to fetch aggregate usage data:", error);
      throw error;
    }
  },

  getFilteredUsage: async () => {
    const allUsage = await UsageDataService.getTodayUsage();
    const filtered = allUsage.filter((app) => !app.isSystemApp);
    console.log(
      `[UsageDataService] After filtering system apps: ${filtered.length} apps remaining.`,
    );
    return filtered;
  },

  formatTime: (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let formattedTime = "";
    if (hours > 0) {
      formattedTime += `${hours}h `;
    }
    formattedTime += `${minutes}m`;
    return formattedTime.trim();
  },
};

export default UsageDataService;
