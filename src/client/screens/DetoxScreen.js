import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DetoxScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detox</Text>
      <Text style={styles.description}>View stats and start working</Text>

      <View style={styles.modesContainer}>
        <Text style={styles.sectionTitle}>Start Mode</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Focus Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Detox Mode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Detox Stats</Text>
        <Text style={styles.body}>This is where you will see detox stats information!</Text>
      </View>
    </ScrollView>
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
  description: {

  },
  modesContainer: {

  },
  button: {

  },
  buttonText: {

  },
  statsContainer: {

  },
  sectionTitle: {

  },
  body: {

  },
});

export default DetoxScreen;