import { registerRootComponent } from 'expo';
import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/client/navigation/RootNavigator.js';
import * as Font from 'expo-font';

const App = () => {
  useEffect(() => {
    Font.loadAsync({
      'Verdana': require('./src/client/assets/fonts/Verdana.ttf'),
      'Times New Roman': require('./src/client/assets/fonts/TIMESBD.ttf'),
    });
  }, []);
  return (
    <RootNavigator />
  );
};

// This tells Expo to register the app
registerRootComponent(App);
