import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomizeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize</Text>
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
  }
});

export default CustomizeScreen;
