import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CustomizeScreen = ({ navigation, route }) => {
  const [detoxModes, setDetoxModes] = useState([]);

  // Receive new or edited mode
  useEffect(() => {
    if (route.params?.savedMode) {
      const mode = route.params.savedMode;

      setDetoxModes(prev => {
        const exists = prev.find(m => m.id === mode.id);
        if (exists) {
          return prev.map(m => (m.id === mode.id ? mode : m));
        }
        return [...prev, mode];
      });

      // Add backend logic to save mode changes to Async or whatever
    }
  }, [route.params?.savedMode]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Customize</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detox Modes</Text>

        <TouchableOpacity onPress={() => navigation.navigate('EditMode')} style={styles.addButton}>
          <Text style={styles.addText}>+ Add new mode</Text>
        </TouchableOpacity>

        {detoxModes.map((mode) => (
          <TouchableOpacity key={mode.id} style={styles.itemRow} onPress={() => navigation.navigate('EditMode', { mode })}>
            <View>
              <Text style={styles.itemName}>{mode.name}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="clock" size={16} color="#555555" />
                <Text style={styles.itemTime}>
                  {mode.startTime} → {mode.endTime}
                </Text>
              </View>
            </View>

            <Icon name="edit" size={22} color="#222E50" />
          </TouchableOpacity>
        ))}
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
  screenTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginTop: 50,
  },
  section: {
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
    minHeight: 200,
    borderRadius: 30,
    padding: 16,
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20
  },
  addText: {
    color: '#426B69',
    fontSize: 18,
    fontFamily: 'Verdana'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#DDDDDD',
  },
  itemName: {
    fontSize: 18,
    fontFamily: 'Verdana',
    color: '#222E50',
  },
  itemTime: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
});

export default CustomizeScreen;