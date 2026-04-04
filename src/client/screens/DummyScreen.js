import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from 'react-native';
import {
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
  Entypo
} from '@expo/vector-icons';
import {
  updateUserStatsOnAppOpen,
  isAppBlockingEnabled,
  isTimerDetoxEnabled
} from '../helper/userStorage';

const DummyScreen = () => {
  // ----------------------
  // State
  // ----------------------
  const [countdown, setCountdown] = useState(0);  // Countdown for delay
  const [currentApp, setCurrentApp] = useState(null); // App currently delaying

  // ----------------------
  // Apps list
  // ----------------------
  const apps = [
    { name: "instagram", label: "Instagram", icon: <FontAwesome name="instagram" size={30} color="#fff" />, color: "#E1306C" },
    { name: "tiktok", label: "TikTok", icon: <FontAwesome5 name="tiktok" size={26} color="#fff" />, color: "#000" },
    { name: "twitter", label: "X", icon: <FontAwesome name="twitter" size={30} color="#fff" />, color: "#1DA1F2" },
    { name: "spotify", label: "Spotify", icon: <FontAwesome name="spotify" size={30} color="#fff" />, color: "#1DB954" },
    { name: "snapchat", label: "Snapchat", icon: <FontAwesome name="snapchat-ghost" size={28} color="#fff" />, color: "#FFFC00" },
    { name: "youtube", label: "YouTube", icon: <FontAwesome name="youtube-play" size={28} color="#fff" />, color: "#FF0000" },
    { name: "gmail", label: "Gmail", icon: <MaterialIcons name="email" size={28} color="#fff" />, color: "#D44638" },
    { name: "maps", label: "Maps", icon: <Ionicons name="map" size={28} color="#fff" />, color: "#4CAF50" },
    { name: "camera", label: "Camera", icon: <Ionicons name="camera" size={28} color="#fff" />, color: "#555" },
    { name: "photos", label: "Photos", icon: <Ionicons name="images" size={28} color="#fff" />, color: "#9C27B0" },
    { name: "netflix", label: "Netflix", icon: <Entypo name="video" size={28} color="#fff" />, color: "#E50914" },
    { name: "weather", label: "Weather", icon: <Ionicons name="partly-sunny" size={28} color="#fff" />, color: "#2196F3" },
    { name: "calendar", label: "Calendar", icon: <Ionicons name="calendar" size={28} color="#fff" />, color: "#FF5722" },
    { name: "settings", label: "Settings", icon: <Ionicons name="settings" size={28} color="#fff" />, color: "#607D8B" },
    { name: "messages", label: "Messages", icon: <Ionicons name="chatbubble" size={28} color="#fff" />, color: "#34C759" },
  ];

  // ----------------------
  // Handle App Press
  // ----------------------
  const handleAppPress = async (appName) => {
    const trackedApps = ["instagram", "tiktok", "twitter"];
    const isTimer = await isTimerDetoxEnabled();

    if (trackedApps.includes(appName)) {
      const isBlocked = await isAppBlockingEnabled({ name: appName });

      if (isBlocked) {
        if (isTimer) {
          // Start the 10-second countdown
          if (countdown > 0) return; // prevent multiple timers
          setCurrentApp(appName);
          setCountdown(10); // start countdown
          return;
        }

        Alert.alert(`${appName} is blocked`);
        return;
      }

      await updateUserStatsOnAppOpen({ name: appName });
    } else {
      Alert.alert(`${appName} opened`);
    }
  };

  // ----------------------
  // Countdown decrement
  // ----------------------
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // ----------------------
  // Trigger app open when countdown hits 0
  // ----------------------
  useEffect(() => {
    if (countdown === 0 && currentApp) {
      updateUserStatsOnAppOpen({ name: currentApp });
      Alert.alert(`${currentApp} opened after delay`);
      setCurrentApp(null); // reset
    }
  }, [countdown]);

  // ----------------------
  // Render
  // ----------------------
  return (
    <View style={styles.container}>
      {countdown > 0 && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Opening {currentApp} in {countdown}s...
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        {apps.map((app) => (
          <TouchableOpacity
            key={app.name}
            style={styles.appWrapper}
            onPress={() => handleAppPress(app.name)}
          >
            <View style={[styles.iconContainer, { backgroundColor: app.color }]}>
              {app.icon}
            </View>
            <Text style={styles.label}>{app.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default DummyScreen;

// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingTop: 80,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  appWrapper: {
    alignItems: 'center',
    width: 85,
    marginBottom: 40,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  timerContainer: {
    backgroundColor: '#FFCC00',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});