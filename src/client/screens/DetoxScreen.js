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
  isAppBlockingEnabled
} from '../helper/userStorage';

const DetoxScreen = ({ navigation }) => {
  const availableApps = ["instagram", "tiktok", "twitter"];

  const [selectedApps, setSelectedApps] = useState([]);
  const [detoxActive, setDetoxActive] = useState(false);

  const toggleSelection = (app) => {
    if (detoxActive) return; // prevent changing while active

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

      Alert.alert(
        "Detox Started",
        `Blocking: ${selectedApps.join(", ")}`
      );
    } else {
      // STOP DETOX

      for (const app of selectedApps) {
        const isBlocked = await isAppBlockingEnabled({ name: app });

        if (isBlocked) {
          await toggleUserAppblocking({ name: app });
        }
      }

      setDetoxActive(false);

      Alert.alert(
        "Detox Ended",
        "Selected apps are now unblocked."
      );
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

        <TouchableOpacity
          style={[
            styles.button,
            detoxActive && styles.buttonActive
          ]}
          onPress={handleDetoxToggle}
        >
          <Text style={styles.buttonText}>
            {detoxActive
              ? "Stop Detox Mode"
              : "Start Detox Mode"}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 50,
  },
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18,
  },
  modesContainer: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 30,
    marginBottom: 10,
  },
  appItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  appItemSelected: {
    backgroundColor: '#426B69',
  },
  appText: {
    fontFamily: 'Verdana',
    fontSize: 16,
    color: '#222E50',
  },
  appTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonActive: {
    backgroundColor: '#B22222', // red when active
  },
  buttonText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statsContainer: {
    backgroundColor: '#B5CA8D',
    minHeight: 250,
    borderRadius: 30,
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  body: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
  },
});

export default DetoxScreen;