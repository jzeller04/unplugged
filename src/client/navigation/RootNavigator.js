import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';
import TabNavigation from './TabNavigator';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Authentication" component={StackNavigator} />
        <Stack.Screen name="MainApp" component={TabNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;