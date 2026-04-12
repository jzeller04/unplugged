import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Modal } from 'react-native';
import { FontAwesome, FontAwesome5, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import { updateUserStatsOnAppOpen, isAppBlockingEnabled, isTimerDetoxEnabled } from '../helper/userStorage';

const DummyScreen = () => {
  // ----------------------
  // State
  // ----------------------
  const [countdown, setCountdown] = useState(0);  // Countdown for delay
  const [currentApp, setCurrentApp] = useState(null); // App currently delaying
  const [blockedModalVisible, setBlockedModalVisible] = useState(false);  // Modal visibility for blocked apps
  const [blockedAppName, setBlockedAppName] = useState(null); // Name of the blocked app to show in modal

  // ----------------------
  // Apps list
  // ----------------------
  const apps = [
    { name: "Instagram", label: "Instagram", icon: <FontAwesome name="instagram" size={30} color="#fff" />, color: "#E1306C" },
    { name: "TikTok", label: "TikTok", icon: <FontAwesome5 name="tiktok" size={26} color="#fff" />, color: "#000" },
    { name: "Twitter", label: "X", icon: <FontAwesome name="twitter" size={30} color="#fff" />, color: "#1DA1F2" },
    { name: "Spotify", label: "Spotify", icon: <FontAwesome name="spotify" size={30} color="#fff" />, color: "#1DB954" },
    { name: "Snapchat", label: "Snapchat", icon: <FontAwesome name="snapchat-ghost" size={28} color="#fff" />, color: "#FFFC00" },
    { name: "YouTube", label: "YouTube", icon: <FontAwesome name="youtube-play" size={28} color="#fff" />, color: "#FF0000" },
    { name: "Gmail", label: "Gmail", icon: <MaterialIcons name="email" size={28} color="#fff" />, color: "#D44638" },
    { name: "Maps", label: "Maps", icon: <Ionicons name="map" size={28} color="#fff" />, color: "#4CAF50" },
    { name: "Camera", label: "Camera", icon: <Ionicons name="camera" size={28} color="#fff" />, color: "#555" },
    { name: "Photos", label: "Photos", icon: <Ionicons name="images" size={28} color="#fff" />, color: "#9C27B0" },
    { name: "Netflix", label: "Netflix", icon: <Entypo name="video" size={28} color="#fff" />, color: "#E50914" },
    { name: "Weather", label: "Weather", icon: <Ionicons name="partly-sunny" size={28} color="#fff" />, color: "#2196F3" },
    { name: "Calendar", label: "Calendar", icon: <Ionicons name="calendar" size={28} color="#fff" />, color: "#FF5722" },
    { name: "Settings", label: "Settings", icon: <Ionicons name="settings" size={28} color="#fff" />, color: "#607D8B" },
    { name: "Messages", label: "Messages", icon: <Ionicons name="chatbubble" size={28} color="#fff" />, color: "#34C759" },
  ];

  // ----------------------
  // Handle App Press
  // ----------------------
  const handleAppPress = async (appName) => {
    const trackedApps = ["Instagram", "TikTok", "Twitter"];
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

        setBlockedAppName(appName);
        setBlockedModalVisible(true);
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

      <Modal visible={blockedModalVisible} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{blockedAppName} is blocked</Text>
          <Text style={styles.modalSubtitle}>
            This app is currently blocked from being opened by unplugged.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setBlockedModalVisible(false)}
            >
              <Text style={styles.confirmText}>Return to Phone</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingTop: 80,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  appWrapper: {
    width: 100,
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 0,
    alignItems: 'center'
  },
  modalTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderTopWidth: 1,
    borderColor: '#DDDDDD'
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#426B69',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16
  },
  confirmText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana',
    fontSize: 16
  }
});

export default DummyScreen;