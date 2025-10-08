import { registerRootComponent } from 'expo';
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import RegisterScreen from './src/client/screens/RegisterScreen';

function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <RegisterScreen />
    </SafeAreaView>
  );
}

// This tells Expo to register the app
registerRootComponent(App);
