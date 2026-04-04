import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CustomizeScreen = ({ navigation }) => {
  const [detoxModes, setDetoxModes] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [modeToDelete, setModeToDelete] = useState(null);

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

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('EditMode', {
                    mode,
                    onSave: handleSave
                  })
                }
              >
                <Icon name="edit" size={22} color="#222E50" style={{ marginRight: 16 }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setModeToDelete(mode.id);
                  setDeleteModalVisible(true);
                }}
              >
                <Icon name="trash-2" size={22} color="#222E50" />
              </TouchableOpacity>
            </View>
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

      <Modal visible={deleteModalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete this mode?</Text>
            <Text style={styles.modalSubtitle}>This action cannot be undone.</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setDetoxModes(prev => prev.filter(m => m.id !== modeToDelete));
                  setDeleteModalVisible(false);
                  setModeToDelete(null);
                }}
              >
                <Text style={styles.confirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center'
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderTopWidth: 1,
    borderColor: '#DDDDDD'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 16
  },
  cancelText: {
    color: '#222E50',
    fontFamily: 'Verdana'
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#426B69',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 16
  },
  confirmText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana'
  }
});

export default CustomizeScreen;