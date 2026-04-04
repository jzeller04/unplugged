import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const EditModeScreen = ({ route, navigation }) => {
  const existing = route.params?.mode;
  const onSave = route.params?.onSave;

  const [name, setName] = useState(existing?.name || '');
  const [startTime, setStartTime] = useState(existing?.startTime || '09:00 AM');
  const [endTime, setEndTime] = useState(existing?.endTime || '03:00 PM');
  const [exitModalVisible, setExitModalVisible] = useState(false);

  const hasUnsavedChanges =
    name !== (existing?.name || '') ||
    startTime !== (existing?.startTime || '') ||
    endTime !== (existing?.endTime || '');

  const saveMode = () => {
    const newMode = {
      id: existing?.id || Date.now().toString(),
      name,
      startTime,
      endTime,
      apps: existing?.apps || []
    };

    if (onSave) {
      onSave(newMode);
    }

    navigation.goBack();
  };

  const handleExitPress = () => {
    if (!hasUnsavedChanges) {
      navigation.goBack();
      return;
    }
    setExitModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleExitPress} style={styles.exitButton}>
        <Icon name="x" size={25} color="#222E50" style={{ marginRight: 16 }} />
      </TouchableOpacity>

      <Text style={styles.title}>
        {existing ? 'Edit Mode' : 'Create Mode'}
      </Text>

      <Text style={styles.label}>Mode Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="New mode title"
      />

      <Text style={styles.label}>Start Time</Text>
      <TextInput
        style={styles.input}
        value={startTime}
        onChangeText={setStartTime}
        placeholder="10:00 AM"
      />

      <Text style={styles.label}>End Time</Text>
      <TextInput
        style={styles.input}
        value={endTime}
        onChangeText={setEndTime}
        placeholder="10:00 PM"
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveMode}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      <Modal visible={exitModalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Discard changes?</Text>
            <Text style={styles.modalSubtitle}>
              Your changes will not be saved.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setExitModalVisible(false)}
              >
                <Text style={styles.cancelText}>Keep editing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setExitModalVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.confirmText}>Exit</Text>
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
    padding: 24,
    backgroundColor: '#FFFFFF'
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'left',
    marginTop: 50,
  },
  label: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
  },
  input: {
    fontFamily: 'Verdana',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 18,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 24
  },
  exitText: {
    color: '#426B69',
    fontFamily: 'Verdana',
    fontSize: 16
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

export default EditModeScreen;