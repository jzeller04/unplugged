import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

const DashboardScreen = () => {
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(false);
  const [isBypassEnabled, setIsBypassEnabled] = useState(false);

  const toggleBlocking = () => setIsBlockingEnabled(prev => !prev);
  const toggleBypass = () => setIsBypassEnabled(prev => !prev);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

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
