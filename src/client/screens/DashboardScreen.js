import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { calculateStreaksAndUpdate, getUser } from '../helper/userStorage.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
  const [streakCount, setStreakCount] = useState(0);
  const [streakGoal, setStreakGoal] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState([]);


  const loadUser = async () => {
    try {
      const user = await getUser('user');
      console.log(user);
      calculateStreaksAndUpdate();
      setStreakCount(user.streakCount);
      if(user.streakGoal == "week")
      {
        setStreakGoal(7);
      } else if(user.streakGoal == "month")
      {
        setStreakGoal(30);
      }
    } catch (error) {
        Alert.alert("Something went wrong...");
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

// useEffect(() => {
//   setWeeklyStats([
//     { date: "TEST-DAY", apps: { instagram: 2, tiktok: 1 } }
//   ]);
// }, []);

useEffect(() => {
  const loadStats = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      console.log("RAW USER:", raw);

      if (!raw) return;

      const user = JSON.parse(raw);
      console.log("PARSED USER:", user);

      const byDate = user.appOpenedByDate;
      console.log("BY DATE:", byDate);

      if (!byDate) return;

      const days = Object.entries(byDate).map(([date, apps]) => ({
        date,
        apps
      }));

      console.log("FINAL DAYS:", days);
      setWeeklyStats(days);
    } catch (e) {
      console.error("Load stats failed:", e);
    }
  };

  loadStats();
}, []);


console.log("WeeklyStats state:", weeklyStats);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ justifyContent: 'flex-start' }}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.streak}>{streakCount} day streak!</Text>

      <View style={styles.reportContainer}>
        <Text style={styles.reportTitle}>Weekly Report</Text>

        {weeklyStats.length === 0 ? (
          <Text style={styles.reportBody}>No app activity yet</Text>
        ) : (
          weeklyStats.map(day => (
            <View key={day.date} style={styles.reportBody}>
              <Text style={styles.reportBody}>{day.date}</Text>

              {Object.entries(day.apps).map(([app, count]) => (
                <Text key={app} style={styles.reportBody}>
                  • {app}: Opened {count} times
                </Text>
              ))}
            </View>
          ))
        )}
      </View>

      <View style={styles.challengesContainer}>
        <Text style={styles.challengesTitle}>Weekly Challenges</Text>
        <Text style={styles.challengesBody}>This is where you will see weekly challenges information!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'left',
    marginTop: 50,
  },
  streak: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18,
  },
  reportContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
    minHeight:250,
    borderRadius: 30,
    padding:16,
  },
  reportTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  reportBody: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
  },
  challengesContainer: {
    flex: 1,
    backgroundColor: '#B5CA8D',
    minHeight:250,
    borderRadius: 30,
    padding: 16,
  },
  challengesTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  challengesBody: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
  },
});

export default DashboardScreen;