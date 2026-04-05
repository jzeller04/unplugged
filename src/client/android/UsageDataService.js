import { NativeModules } from "react-native";

const { UsageStatsModule } = NativeModules;

const UsageDataService = {
  getTodayUsage: async () => {
    try {
      if (!UsageStatsModule) {
        console.warn("UsageStatsModule is null. Rebuild app");
        return []; // Return empty array so the dashboard doesn't crash
      }
      const rawData = await UsageStatsModule.getAggregateUsageData();
      console.log(
        `[UsageDataService] Raw data from Android: ${rawData.length} apps found.`,
      );
      return rawData;
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
