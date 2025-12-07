import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StackNavigator from './StackNavigator';
import TabNavigation from './TabNavigator';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const MIN_LOADING_TIME = 4000; 
    const start = Date.now();

    //add any other API calls or checks of any sort

    const init = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      setInitialRoute(isLoggedIn === 'true' ? 'MainApp' : 'Authentication');

      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_TIME - elapsed;
      setTimeout(() => setLoading(false), remaining > 0 ? remaining : 0);
    };

    init();
  }, []);

  if (loading || !initialRoute) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Authentication" component={StackNavigator} />
        <Stack.Screen name="MainApp" component={TabNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;