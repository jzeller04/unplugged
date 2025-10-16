import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
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

export default SettingsScreen;