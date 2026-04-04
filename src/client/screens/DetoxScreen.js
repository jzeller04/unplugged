import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  toggleUserAppblocking,
  isAppBlockingEnabled,
  setTimerDetox as setTimerDetoxStorage,
  isTimerDetoxEnabled
} from '../helper/userStorage';

const DetoxScreen = ({ navigation }) => {
  const availableApps = ["instagram", "tiktok", "twitter"];

  const [selectedApps, setSelectedApps] = useState([]);
  const [detoxActive, setDetoxActive] = useState(false);
  const [timerDetox, setTimerDetox] = useState(false);

  const toggleSelection = (app) => {
    if (detoxActive || timerDetox) return; // prevent changing while active
    setSelectedApps((prev) =>
      prev.includes(app)
        ? prev.filter((a) => a !== app)
        : [...prev, app]
    );
  };

  const handleDetoxToggle = async () => {
    if (!detoxActive) {
      // START DETOX
      if (selectedApps.length === 0) {
        Alert.alert("No Apps Selected", "Please select at least one app.");
        return;
      }

      for (const app of selectedApps) {
        const isBlocked = await isAppBlockingEnabled({ name: app });
        if (!isBlocked) {
          await toggleUserAppblocking({ name: app });
        }
      }

      setDetoxActive(true);
      Alert.alert("Detox Started", `Blocking: ${selectedApps.join(", ")}`);
    } else {
      // STOP DETOX
      for (const app of selectedApps) {
        const isBlocked = await isAppBlockingEnabled({ name: app });
        if (isBlocked) {
          await toggleUserAppblocking({ name: app });
        }
      }

      setDetoxActive(false);
      Alert.alert("Detox Ended", "Selected apps are now unblocked.");
    }
  };

  const handleTimerToggle = async () => {
    if (!timerDetox) {
      // START TIMER DETOX
      if (selectedApps.length === 0) {
        Alert.alert("No Apps Selected", "Please select at least one app.");
        return;
      }

      setTimerDetoxStorage(true);
      setTimerDetox(true);
      setDetoxActive(false); // ensure normal detox is off
      Alert.alert("Timer Detox Started", `Timer Detox is active for: ${selectedApps.join(", ")}`);
    } else {
      // STOP TIMER DETOX
      setTimerDetoxStorage(false);
      setTimerDetox(false);
      Alert.alert("Timer Detox Stopped", "Timer Detox is now off.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ justifyContent: 'flex-start' }}
    >
      <Text style={styles.title}>Detox</Text>
      <Text style={styles.description}>
        Choose apps to block
      </Text>

      <View style={styles.modesContainer}>
        <Text style={styles.sectionTitle}>
          Select Apps
        </Text>

        {availableApps.map((app) => {
          const isSelected = selectedApps.includes(app);
          return (
            <TouchableOpacity
              key={app}
              style={[
                styles.appItem,
                isSelected && styles.appItemSelected
              ]}
              onPress={() => toggleSelection(app)}
            >
              <Text
                style={[
                  styles.appText,
                  isSelected && styles.appTextSelected
                ]}
              >
                {app.charAt(0).toUpperCase() + app.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          {/* Start / Stop Detox */}
          <TouchableOpacity
            style={[
              styles.button,
              detoxActive && styles.buttonActive,
              { flex: 1, marginRight: 5 }
            ]}
            onPress={handleDetoxToggle}
            disabled={timerDetox} // can't start normal detox if timer detox is active
          >
            <Text style={styles.buttonText}>
              {detoxActive ? "Stop Detox Mode" : "Start Detox Mode"}
            </Text>
          </TouchableOpacity>

          {/* Start / Stop Delay Timer */}
          <TouchableOpacity
            style={[
              styles.button,
              timerDetox && { backgroundColor: '#B22222' }, // red when active
              { flex: 1, marginLeft: 5, backgroundColor: '#426B69' }
            ]}
            onPress={handleTimerToggle}
            disabled={detoxActive} // can't start timer if normal detox is active
          >
            <Text style={styles.buttonText}>
              {timerDetox ? "Stop Timer Detox" : "Start Timer Detox"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>
          Detox Stats
        </Text>
        <Text style={styles.body}>
          This is where you will see detox stats information!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF'
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 50
  },
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18
  },
  modesContainer: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 30,
    marginBottom: 10
  },
  appItem: {
    backgroundColor: '#FFFFFF',
    padding: 16, borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center'
  },
  appItemSelected: {
    backgroundColor: '#426B69'
  },
  appText: {
    fontFamily: 'Verdana',
    fontSize: 16,
    color: '#222E50'
  },
  appTextSelected: {
    color: '#FFFFFF'
  },
  button: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  buttonActive: {
    backgroundColor: '#B22222'
  },
  buttonText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  statsContainer: {
    backgroundColor: '#B5CA8D',
    minHeight: 250,
    borderRadius: 30,
    padding: 16,
    marginTop: 10
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10
  },
  body: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16
  },
});

export default DetoxScreen;