import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadingScreen = () => (
  <View style={styles.container}>
    <Text style={styles.logo}>unplugged</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    //add container style
  },
  logo: {
    //add logo style
  },
  //add any other necessary styles
});

export default LoadingScreen;
