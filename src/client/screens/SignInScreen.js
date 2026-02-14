import React, { useState } from 'react';
import { 
  KeyboardAvoidingView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { API_URL } from '@env'; // do this: npm install react-native-dotenv
import { saveUser } from '../helper/userStorage.js';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    try {
    //console.log('hello2');
      const signingInUser = {
        email: email,
        password: password
      };

      //console.log("about to fetch:", `${API_URL}/users/signin`);
      const response = await fetch(`${API_URL}/users/signin`, { // the stuff in orange is the post request. this is the exact same thing as html for context
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(signingInUser),
      });
      const data = await response.json(); // check for response from server
      console.log("Server responded!", data);

      // a lil sum sum
      if(data.success)
      {
        const user = data.user;
        //console.log(user);
        console.log(data);
        saveUser(user);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }], 
        });
        // need to add logic for multiple accounts and user storage
      }
      else
      {
        Alert.alert("Incorrect email or password");
        return; 
      }
      
    } catch (error) {
       console.log(error);
       Alert.alert("Whoops, something went wrong!");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput
        style={styles.input}
        placeholder="Email address"
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
      <Text style={styles.forgotPassword}>Forgot password?</Text>
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.signInButtonText}>Sign in</Text>
      </TouchableOpacity>
      <Text style={styles.haveAccount}>Don't have an account?</Text>
      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
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
  signInButton: {
    backgroundColor: '#426B69',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 50,
  },
  registerButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  signInButtonText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
  },
  registerButtonText: {
  fontFamily: 'Verdana',
  color: '#426B69',
  fontSize: 16,
  },
  forgotPassword: {
    fontFamily: 'Verdana',
    color: '#426B69',
    marginLeft: 16,
    textDecorationLine: 'underline',
  },
  haveAccount: {
    fontFamily: 'Verdana',
    color: '#222E50',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default SignInScreen;