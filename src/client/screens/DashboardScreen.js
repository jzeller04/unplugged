import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStreaksAndUpdate, getUser } from "../helper/userStorage.js";
import UsageDataService from "../android/UsageDataService";

const DashboardScreen = () => {
  const [streakCount, setStreakCount] = useState(0);
  const [streakGoal, setStreakGoal] = useState(0);
  const [usageData, setUsageData] = useState([]);

  const fetchUsageData = async () => {
    try {
      const data = await UsageDataService.getFilteredUsage();
      const sortedData = data
        .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground)
        .slice(0, 7);
      setUsageData(sortedData);
    } catch (error) {
      Alert.alert("Error fetching usage data", error.message);
    }
  };

  const loadUser = async () => {
    try {
      const user = await getUser('user');
      console.log(user);
      calculateStreaksAndUpdate();
      setStreakCount(user.streakCount);
      if (user.streakGoal == "week") {
        setStreakGoal(7);
      } else if (user.streakGoal == "month") {
        setStreakGoal(30);
      }
    } catch (error) {
      Alert.alert("Something went wrong...");
    }
  };

  useEffect(() => {
    loadUser();
    fetchUsageData();
  }, []);

  const totalScreenTime = usageData.reduce(
    (sum, item) => sum + item.totalTimeInForeground,
    0,
  );
  const totalOpens = usageData.reduce(
    (sum, item) => sum + (item.openCount || 0),
    0,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ justifyContent: "flex-start" }}
    >
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.streak}>{streakCount} day streak!</Text>

      <View style={styles.reportContainer}>
        <Text style={styles.reportTitle}>Today's Usage Report</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {UsageDataService.formatTime(totalScreenTime)}
            </Text>
            <Text style={styles.summaryLabel}>screen time</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalOpens}</Text>
            <Text style={styles.summaryLabel}>opens</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{usageData.length}</Text>
            <Text style={styles.summaryLabel}>apps used</Text>
          </View>
        </View>
        <ScrollView
          style={styles.usageList}
          contentContainerStyle={styles.usageListContent}
          showsVerticalScrollIndicator={false}
        >
          {usageData.length === 0 ? (
            <Text style={styles.reportBody}>No usage data available for today.</Text>
          ) : (
            usageData.map((item) => (
              <View key={item.packageName} style={styles.usageRow}>
                <View style={styles.iconContainer}>
                  {item.appIcon ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${item.appIcon}` }}
                      style={styles.appIcon}
                    />
                  ) : (
                    <View style={styles.appIconFallback}>
                      <Text style={styles.appIconFallbackText}>
                        {(item.appName || item.packageName || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName} numberOfLines={1}>
                    {item.appName || item.packageName}
                  </Text>
                  <Text style={styles.appMeta} numberOfLines={1}>
                    {(item.openCount || 0)} opens today
                  </Text>
                </View>
                <Text style={styles.usageTime}>
                  {UsageDataService.formatTime(item.totalTimeInForeground)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.challengesContainer}>
        <Text style={styles.challengesTitle}>Weekly Challenges</Text>
        <Text style={styles.challengesBody}>
          This is where you will see weekly challenges information!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    color: "#222E50",
    fontFamily: "Times New Roman",
    fontSize: 48,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "left",
    marginTop: 50,
  },
  streak: {
    color: "#222E50",
    fontFamily: "Verdana",
    fontSize: 18,
    marginBottom: 18,
  },
  reportContainer: {
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
    height: 400,
    borderRadius: 30,
    padding: 18,
  },
  reportTitle: {
    color: "#222E50",
    fontFamily: "Times New Roman",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  usageList: {
    flex: 1,
  },
  usageListContent: {
    paddingBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  summaryValue: {
    color: "#426B69",
    fontFamily: "Verdana",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  summaryLabel: {
    color: "#6F7894",
    fontFamily: "Verdana",
    fontSize: 11,
    textTransform: "uppercase",
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  appIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  appIconFallback: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#B5CA8D",
    justifyContent: "center",
    alignItems: "center",
  },
  appIconFallbackText: {
    color: "#222E50",
    fontFamily: "Verdana",
    fontSize: 14,
    fontWeight: "700",
  },
  appInfo: {
    flex: 1,
    justifyContent: "center",
    marginRight: 12,
  },
  appName: {
    color: "#222E50",
    fontFamily: "Verdana",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  appMeta: {
    color: "#6F7894",
    fontFamily: "Verdana",
    fontSize: 12,
  },
  usageTime: {
    color: "#426B69",
    fontFamily: "Verdana",
    fontSize: 18,
    fontWeight: "700",
    minWidth: 62,
    textAlign: "right",
  },
  reportBody: {
    color: "#222E50",
    fontFamily: "Verdana",
    fontSize: 16,
    marginTop: 8,
  },
  challengesContainer: {
    flex: 1,
    backgroundColor: "#B5CA8D",
    minHeight: 250,
    borderRadius: 30,
    padding: 16,
  },
  challengesTitle: {
    color: "#222E50",
    fontFamily: "Times New Roman",
    fontSize: 24,
    fontWeight: "600",
    flex: 1,
  },
  challengesBody: {
    color: "#222E50",
    fontFamily: "Verdana",
    fontSize: 16,
    flex: 1,
    justifyContent: "center",
  },
});

export default DashboardScreen;
