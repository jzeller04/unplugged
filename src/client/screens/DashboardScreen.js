import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image } from "react-native";
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
      const user = await getUser("user");
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ justifyContent: "flex-start" }}
    >
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.streak}>
        {streakCount} / {streakGoal} day streak of detox!
      </Text>

      <View style={styles.reportContainer}>
        <Text style={styles.reportTitle}>Today's Usage Report</Text>
        {usageData.length === 0 ? (
          <Text style={styles.reportBody}>No usage data available for today.</Text>
        ) : (
          usageData.map((item) => (
            <View key={item.packageName} style={styles.usageRow}>
              {item.appIcon && (
                <Image
                  source={{ uri: `data:image/png;base64,${item.appIcon}` }}
                  style={styles.appIcon}
                />
              )}
              <Text style={styles.appName} numberOfLines={1}>
                {item.appName || item.packageName}
              </Text>
              <Text style={styles.usageTime}>
                {UsageDataService.formatTime(item.totalTimeInForeground)}
              </Text>
            </View>
          ))
        )}
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
    flex: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
    minHeight: 250,
    borderRadius: 30,
    padding: 16,
  },
  reportTitle: {
    color: "#222E50",
    fontFamily: "Times New Roman",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  appIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  appName: {
    color: "#222E50",
    fontFamily: "Verdana",
    fontSize: 16,
    flex: 1,
    marginRight: 16,
  },
  usageTime: {
    color: "#426B69",
    fontFamily: "Verdana",
    fontSize: 16,
    fontWeight: "bold",
  },
  reportBody: {
    color: "#222E50",
    fontFamily: "Verdana",
    fontSize: 16,
    flex: 1,
    justifyContent: "center",
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
