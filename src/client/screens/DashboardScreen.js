import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { calculateStreaksAndUpdate, getUser } from '../helper/userStorage.js';

const DashboardScreen = () => {
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(false);
  const [isBypassEnabled, setIsBypassEnabled] = useState(false);

  const toggleBlocking = () => setIsBlockingEnabled(prev => !prev);
  const toggleBypass = () => setIsBypassEnabled(prev => !prev);

  // add int variable for user streak then replace !placeholder! with {variable name} in line 18
  const [streakCount, setStreakCount] = useState(0);
  const [streakGoal, setStreakGoal] = useState(0);
  



  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getUser('user');
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

  
  


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.label}>{streakCount} / {streakGoal} day streak of detox!</Text>
      
      <View style={styles.toggleRow}>
        <Text style={styles.label}>App Blocking</Text>
        <Switch
          value={isBlockingEnabled}
          onValueChange={toggleBlocking}
          trackColor={{ false: '#ccc', true: '#426B69' }}
          thumbColor={isBlockingEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.label}>Emergency Bypass</Text>
        <Switch
          value={isBypassEnabled}
          onValueChange={toggleBypass}
          trackColor={{ false: '#ccc', true: '#426B69' }}
          thumbColor={isBypassEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

//temporary style sheet, replace with separate file or components later
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
    marginBottom: 32,
    textAlign: 'left',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
  },
});

export default DashboardScreen;
