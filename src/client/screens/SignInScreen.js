import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { API_URL } from '@env'; // do this: npm install react-native-dotenv

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {

      if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }
    

    try {
    console.log('hello2');
      const signingInUser = {
          email: email,
          password: password
      };

      console.log("about to fetch:", `${API_URL}/users/signin`);
      setTimeout(() => console.log("⏳ still waiting on fetch..."), 5000);
      const response = await fetch(`${API_URL}/users/signin`, { // the stuff in orange is the post request. this is the exact same thing as html for context
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(signingInUser),
      });
      const data = await response.json(); // check for response from server
      console.log("Server responded! ✅", data);

      // a lil sum sum
      if(data.success)
      {
        Alert.alert("Signing in!");
        navigation.reset({ // MOVE THIS HERE!!!!!!!!!!!!!
        index: 0,
        routes: [{ name: 'Dashboard' }],
        });
      }
      else
      {
        Alert.alert("Incorrect email or password");
        return; // why the fuck does this not work gang
      }
      
    } catch (error) {
       console.log(error);
       Alert.alert("Whoops, something went wrong!", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
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
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button1} onPress={handleSignIn}>
        <Text style={styles.buttonText1}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText2}>Register</Text>
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
  button1: {
    backgroundColor: '#426B69',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  button2: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText1: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonText2: {
  fontFamily: 'Verdana',
  color: '#426B69',
  fontSize: 16,
  }
});

export default SignInScreen;
