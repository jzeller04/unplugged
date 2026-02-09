import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { updateUserStatsOnAppOpen } from '../helper/userStorage';


const handleInstagramPress = async () => {
  await updateUserStatsOnAppOpen({ name: "instagram" });
};

const handleTikTokPress = async () => {
  await updateUserStatsOnAppOpen({ name: "tiktok" });
};

const handleTwitterPress = async () => {
  await updateUserStatsOnAppOpen({ name: "twitter" });
};
const DummyScreen = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.instagram]}
        onPress={handleInstagramPress}
      >
        <FontAwesome name="instagram" size={22} color="#fff" />
        <Text style={styles.text}>Instagram</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.tiktok]}
        onPress={handleTikTokPress}
      >
        <FontAwesome5 name="tiktok" size={20} color="#fff" />
        <Text style={styles.text}>TikTok</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.twitter]}
        onPress={handleTwitterPress}
      >
        <FontAwesome name="twitter" size={22} color="#fff" />
        <Text style={styles.text}>X / Twitter</Text>
      </TouchableOpacity>
    </View>
  );
};


export default DummyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 30,
    width: 220,
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
  instagram: {
    backgroundColor: '#E1306C',
  },
  tiktok: {
    backgroundColor: '#000000',
  },
  twitter: {
    backgroundColor: '#1DA1F2',
  },
});
