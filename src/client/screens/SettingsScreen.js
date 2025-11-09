import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { API_URL } from '@env'
import { getUser, deleteUser } from '../helper/userStorage.js';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userPassword, setPassword] = useState('');

  const toggleBlocking = () => setNotificationsEnabled(prev => !prev);

  const handleDeleteAccount = async () => {
    try {    
      //console.log("happening");
        const userInfo = await getUser();
        //console.log(userInfo);
        const infoToSend = {
          email: userInfo.email,
          password: userPassword
        }

        if(userPassword.length !== 0) // may want to change this into a backend req... considering - tdl justin
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
            Alert.alert('Incorrect Password');
            return; 
          }
        
        } 
        else
          {
            Alert.alert("Please fill all fields");
            return; 
          }
      }
      catch(error)
      {
        console.error("Error", error);
        Alert.alert("Something went wrong!");
      }
      //console.log("about to fetch:", `${API_URL}/users/signin`);
    setModalVisible(false);
    setPassword('');
  };

  //add navigation and external links later when implemented
  return (
    <ScrollView style={styles.container} contentContainerStylele={{ justifyContent: 'flex-start' }}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.subtitle}>Notification Settings</Text>
      <View style={styles.section}>
        <View style={styles.row}>
            <Text style={styles.rowText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleBlocking}
              trackColor={{ false: '#ccc', true: '#426B69' }}
            />
          </View>
      </View>

      <Text style={styles.subtitle}>About</Text>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Terms of Service</Text>
        <View style={styles.divider}/>
        <Text style={styles.sectionText}>Privacy policy</Text>
      </View>

      <Text style={styles.subtitle}>Feedback & Support</Text>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Rate our app</Text>
        <View style={styles.divider}/>
        <Text style={styles.sectionText}>FAQs</Text>
      </View>

      <Text style={styles.subtitle}>Account management</Text>
      <View style={styles.section}>
        <Text style={styles.sectionText}>Account information</Text>
        <View style={styles.divider}/>
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

      <View style={styles.logoutButton}>
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
  subtitle: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 16,
  },
  section: {
    flex: 1,
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#F0F0F0',
    marginBottom: 25,
    borderRadius: 24,
    padding:16,
  },
  divider: {
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
  },
  sectionText: {
    flex: 1,
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#426B69',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana',
    fontSize: 16,
  },
  button: {
    
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
  },
});

export default SettingsScreen;