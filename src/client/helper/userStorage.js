import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUser = async (user) =>
{
  try {
    await AsyncStorage.setItem('user', JSON.stringify(
      user
    ));
    console.log("Saved user info on client", user);
  } catch (error) {
    console.error("Error saving user data in client", error);
  }
};

export const getUser = async () => {
  try {
    const value = await AsyncStorage.getItem('user');
    if (value !== null) {
      return JSON.parse(value); // parse ONCE
    }
  } catch (error) {
    console.error('Error reading user data from client', error);
  }
};

export const deleteUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    //temp error message for linting
    console.error('Error', error);
  }
}

export const updateUserStreak = async (user) =>
{
  try {
    const oldObj = await AsyncStorage.getItem('user');
    if(oldObj !== null)
    {
      const oldObjS = JSON.parse(oldObj);
      const newUser = {...user, ...oldObjS};
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    }
  } catch (error) {
    //temp error message for linting
    console.error('Error', error);
  }
};
