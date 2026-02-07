import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';

//add navigation for modes later
const DetoxScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStylele={{ justifyContent: 'flex-start' }}>
      <Text style={styles.title}>Detox</Text>
      <Text style={styles.description}>View stats and start working</Text>

      <View style={styles.modesContainer}>
        <Text style={styles.sectionTitle}>Start Mode</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudyMode')}>
            <Text style={styles.buttonText}>Study Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Detox Mode</Text>
          </TouchableOpacity>
        </View>
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
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18,
  },
  modesContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 30,
    minHeight: 150,
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#426B69',
    flex: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flex: 1,
    backgroundColor: '#B5CA8D',
    minHeight:250,
    borderRadius: 30,
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  body: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
    flex: 1,
    justifyContent: 'center',
  },
});

export default DetoxScreen;