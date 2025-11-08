import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { getUser } from '../helper/userStorage.js';

const DashboardScreen = () => {
  const [streakCount, setStreakCount] = useState(0);

  const loadUser = async () => {
    try {
      const user = await getUser('user');
      console.log(user);
      console.log(streakCount);
      return user.streakCount;
    } catch (error) {
        Alert.alert("Something went wrong...");
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.streak}>{streakCount} day streak of detox!</Text>

      <View style={styles.reportContainer}>
        <Text style={styles.reportTitle}>Weekly Report</Text>
        <Text style={styles.reportBody}>This is where you will see weekly report information!</Text>
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
    justifyContent: 'flex-start',
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