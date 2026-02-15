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

export const updateUserStatsOnAppOpen = async (app) => {
  try {

    if (!app || !app.name) {
      console.warn("No app name passed:", app);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const appName = app.name;

    const storedUser = await AsyncStorage.getItem('user');
    let user = storedUser ? JSON.parse(storedUser) : {};

    if (!user.appOpenedByDate) {
      user.appOpenedByDate = {};
    }

    // init day object
    if (!user.appOpenedByDate[today]) {
      user.appOpenedByDate[today] = {};
    }

    // init app counter
    if (!user.appOpenedByDate[today][appName]) {
      user.appOpenedByDate[today][appName] = 0;
    }

    // increment
    user.appOpenedByDate[today][appName] += 1;

    await AsyncStorage.setItem('user', JSON.stringify(user));

    console.log("Updated stats:", user.appOpenedByDate);
  } catch (error) {
    console.error("Failed to update app stats:", error);
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

function isNextDay(lastDateStr, todayStr) {
  const last = new Date(lastDateStr);
  const today = new Date(todayStr);

  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export async function calculateStreaksAndUpdate() {
  try {
    const storedUser = await AsyncStorage.getItem('user');
    let user = storedUser ? JSON.parse(storedUser) : {};

    const today = new Date().toISOString().split('T')[0];
    const last = user.lastLogin;

  console.log("Stored user raw:", storedUser);
    if (today === last) {
      console.log('Already logged in today');
    } else if (last && isNextDay(last, today)) {
      user.streakCount = user.streakCount + 1;
      console.log('Streak increased!');
    } else {
      user.streakCount = 1;
      console.log('Streak reset.');
    }

    if(user.streakGoal == "week" && user.streakCount >= 7)
    {
      user.streakGoal = "month";
    } else
    {
      user.streakGoal = "week";
    }

    user.lastLogin = today;

    await AsyncStorage.setItem('user', JSON.stringify(user));
    console.log('Updated user:', user);

    return true;
  } catch (error) {
    console.error('Error updating streaks:', error);
    return false;
  }
}
