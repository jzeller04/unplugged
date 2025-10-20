import { registerRootComponent } from 'expo';
import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/client/navigation/RootNavigator.js';

const App = () => {
  return (
    <RootNavigator />
  );
};

// This tells Expo to register the app
registerRootComponent(App);
