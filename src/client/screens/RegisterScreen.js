import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { API_URL } from '@env'; // do this: npm install react-native-dotenv
// and in .env file: API_URL=http://192.168.1.100:3000 << your local ip
const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
  
    const getRegisterInfo = async () => {
      console.log("clicked!");
      try{
        
        
        const registerInfo = { // send ts all as an object, this is how it is handled on backend. If you'd like i (justin) can create an abstracted version of this to reuse.
          email: email,
          name: name,
          password: password
        }

        // make post req to send to backend
        console.log("about to fetch:", `${API_URL}/users/register`);
        setTimeout(() => console.log("⏳ still waiting on fetch..."), 5000);
        const response = await fetch(`${API_URL}/users/register`, { // the stuff in orange is the post request. this is the exact same thing as html for context
          method: "POST",
          headers:{"Content-Type": "application/json"},
          body: JSON.stringify(registerInfo),
        });
        const data = await response.json(); // check for response from server
        console.log("Server responded! ✅", data);

        // a lil sum sum
        if(data.success)
        {
          Alert.alert("Account created!");
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        }
        else
        {
          Alert.alert("Whoops, something went wrong!");
        }
      }
      catch
      {
          //Alert.alert("Whoops, something went wrong!", error.message);
          //console.warn("Fetch error", error);
      }
    }
    
    // const handleRegister = () => { // may be easier to check valid info here actually... can still do it in backend tho
    //     if (!email || !name || !password) {
    //     Alert.alert('Error', 'Please fill out all fields');
    //     return;
    //     }
    //    navigation.reset({
    //    index: 0,
    //    routes: [{ name: 'Dashboard' }],
    // });
    // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={getRegisterInfo}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

//temporary style sheet, replace later in separate file or with components
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 36,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F0F0F0',
    fontFamily: 'Verdana',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#426B69',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
  }
});

export default RegisterScreen;

