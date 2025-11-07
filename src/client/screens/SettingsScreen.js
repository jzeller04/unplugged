import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { API_URL } from '@env'
import { getUser, deleteUser } from '../helper/userStorage.js';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  const handleDeleteAccount = async () => {
    try {
      console.log("happening");
        const userInfo = await getUser();
        
        const infoToSend = {
          email: userInfo.email,
          password: userInfo.password
        }

        if(password == infoToSend.password) // may want to change this into a backend req... considering - tdl justin
        {
          const response = await fetch(`${API_URL}/users/delete`, { // we need to find a way to store user info on ts
          method: "POST",
          headers:{"Content-Type": "application/json"},
          body: JSON.stringify(infoToSend)
          });
          const data = await response.json(); // check for response from server
          console.log("Server responded!", data);
    
          // a lil sum sum
          if(data.success)
          {
            Alert.alert('Account deleted');
            // clear local storage here prob
            await deleteUser();
            navigation.reset({
            index: 0,
            routes: [{ name: 'Authentication' }], // tf do i route it to ikiag
            });
          }
          else
          {
            Alert.alert("Invalid token");
            return; 
          }
        
        } 
    }
    catch(error)
    {
      console.error("Error");
      Alert.alert("Something went wrong!");
    }
          //console.log("about to fetch:", `${API_URL}/users/signin`);
    setModalVisible(false);
    setPassword('');
  };

  //add navigation and external links later when implemented
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.subtitle}>Notification Settings</Text>
      <View style={styles.section}>
        <View style={styles.row}>
            <Text style={styles.rowText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onPress={setNotificationsEnabled}
            />
          </View>
      </View>

      <Text style={styles.subtitle}>About</Text>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Terms of Service</Text>
        <Text style={styles.sectionText}>Privacy policy</Text>
      </View>

      <Text style={styles.subtitle}>Feedback & Support</Text>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Rate our app</Text>
        <Text style={styles.sectionText}>FAQs</Text>
      </View>

      <Text style={styles.subtitle}>Account management</Text>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Account information</Text>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Delete account</Text>
        </TouchableOpacity>
        <Modal visible={modalVisible} transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm password to delete account</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={handleDeleteAccount}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <View style={styles.section}>
        <Text style={styles.logoutText}>Log out</Text>
      </View>
    </ScrollView>
  );
};

//temporary style sheet, replace with separate file or components later
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF'
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'left'
  },
  subtitle: {

  },
  section: {

  },
  row: {

  },
  rowText: {

  },
  sectionText: {

  },
  logoutText: {

  },
  button: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    fontFamily: 'Verdana',
    color: '#426B69',
    fontSize: 16
  },
  input: {
    backgroundColor: '#F0F0F0',
    fontFamily: 'Verdana',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
    width: '80%'
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
    paddingHorizontal: 0,
    paddingBottom: 0,
    alignItems: 'center'
  },
  modalTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
    paddingVertical: 16,
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
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomRightRadius: 16
  },
  confirmText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana'
  }
});

export default SettingsScreen;