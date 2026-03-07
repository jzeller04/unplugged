import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CustomizeScreen = ({ navigation }) => {
  const [detoxModes, setDetoxModes] = useState([]);

  const handleSave = (savedMode) => {
    setDetoxModes(prev => {
      const exists = prev.find(m => m.id === savedMode.id);
      if (exists) {
        return prev.map(m => (m.id === savedMode.id ? savedMode : m));
      }
      return [...prev, savedMode];
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Customize</Text>

      <Text style={styles.description}>Set screen time and modes</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detox Modes</Text>

        {detoxModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={styles.itemRow}
            onPress={() =>
              navigation.navigate('EditMode', {
                mode,
                onSave: handleSave
              })
            }
          >
            <View>
              <Text style={styles.itemName}>{mode.name}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="clock" size={16} color="#555" />
                <Text style={styles.itemTime}>
                  {mode.startTime} → {mode.endTime}
                </Text>
              </View>
            </View>

            <Icon name="edit" size={22} color="#222E50" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('EditMode', {
              onSave: handleSave
            })
          }
        >
          <Text style={styles.addText}>Add new mode</Text>
        </TouchableOpacity>
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
    marginBottom: 12,
    textAlign: 'left',
  },
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18,
  },
  section: {
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
    borderRadius: 30,
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 20,
    width: 175,
    alignItems: 'center',
  },
  addText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderColor: '#DDDDDD',
  },
  itemName: {
    fontSize: 18,
    fontFamily: 'Verdana',
    color: '#222E50',
  },
  itemTime: {
    fontFamily: 'Verdana',
    fontSize: 12,
    color: '#555555',
    marginTop: 4,
    paddingHorizontal: 8,
  },
});

export default CustomizeScreen;