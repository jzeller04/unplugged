import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import CustomizeScreen from '../screens/CustomizeScreen';
import DetoxScreen from '../screens/DetoxScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={styles}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Customize" component={CustomizeScreen} />
      <Tab.Screen name="Detox" component={DetoxScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
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