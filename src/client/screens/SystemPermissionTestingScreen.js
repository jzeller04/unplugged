// DO NOT PUSH THIS BRANCH/PAGE TO MAIN

import React, { useState } from 'react';
import { 
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const SystemPermissionTestingScreen = () => {
    //example button behavior, change as needed
    const [lastPressed, setLastPressed] = useState(null);

    const handleButtonPress = (buttonNumber) => {
        setLastPressed(buttonNumber);
        console.log(`Button ${buttonNumber} pressed`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>System Permission Testing</Text>

            <TouchableOpacity style={styles.button} onPress={() => handleButtonPress(1)}>
                <Text style={styles.buttonText}>1</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handleButtonPress(2)}>
                <Text style={styles.buttonText}>2</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handleButtonPress(3)}>
                <Text style={styles.buttonText}>3</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handleButtonPress(4)}>
                <Text style={styles.buttonText}>4</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    marginBottom: 36,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
  fontFamily: 'Verdana',
  color: '#426B69',
  fontSize: 16,
  }
});

export default SystemPermissionTestingScreen;