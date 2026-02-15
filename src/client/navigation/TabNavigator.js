import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import CustomizeScreen from '../screens/CustomizeScreen';
import DetoxScreen from '../screens/DetoxScreen';
import StudyModeScreen from '../screens/StudyModeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DummyScreen from '../screens/DummyScreen';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={styles}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ header: () => null, tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" color={color} size={size} /> ),
        }}
      />
      <Tab.Screen
        name="Customize"
        component={CustomizeScreen}
        options={{ header: () => null, tabBarIcon: ({ color, size }) => (
          <Ionicons name="pencil" color={color} size={size} /> ),
        }}
      />
      <Tab.Screen
        name="Detox"
        component={DetoxScreen}
        options={{ header: () => null, tabBarIcon: ({ color, size }) => (
          <Ionicons name="time" color={color} size={size} /> ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ header: () => null, tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings" color={color} size={size} /> ),
        }}
      />
      <Tab.Screen
        name="Dummmy Phone"
        component={DummyScreen}
        options={{ header: () => null, tabBarIcon: ({ color, size }) => (
          <Ionicons name="" color={color} size={size} /> ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = ({
tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 85,
    paddingBottom: 10,
  },
  tabBarActiveTintColor: '#426B69',
  tabBarInactiveTintColor: '#B5CA8D',
  tabBarLabelStyle: {
    fontSize: 12,
    fontFamily: 'Verdana',
    marginBottom: 10,
  }
});

export default TabNavigator;