import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { API_URL } from '@env'; // do this: npm install react-native-dotenv
// and in .env file: API_URL=http://192.168.1.100:3000 << your local ip
const RegisterScreen = () => {
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

//example style sheet, replace later in separate file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default RegisterScreen;

