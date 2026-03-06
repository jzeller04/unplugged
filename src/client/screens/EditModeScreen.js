import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

const EditModeScreen = ({ route, navigation }) => {
  const existing = route.params?.mode;
  const onSave = route.params?.onSave;

  const [name, setName] = useState(existing?.name || '');
  const [startTime, setStartTime] = useState(existing?.startTime || '09:00 AM');
  const [endTime, setEndTime] = useState(existing?.endTime || '03:00 PM');

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

  return (
    <View style={styles.container}>
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
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 20,
        color: '#222E50' 
    },
    label: {
        fontSize: 18,
        marginTop: 20,
        color: '#222E50' 
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 10,
        marginTop: 8,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#426B69',
        padding: 16,
        borderRadius: 20,
        marginTop: 40,
        alignItems: 'center',
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 18, 
        fontWeight: '600'
    },
});

export default EditModeScreen;