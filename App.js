// import { registerRootComponent } from 'expo';
// import React from 'react';
// import RootNavigator from './src/client/navigation/RootNavigator.js';
// import { useFonts } from 'expo-font';

// const App = () => {
//   const [fontsLoaded] = useFonts({
//     Verdana: require('./src/client/assets/fonts/Verdana.ttf'),
//     'Times New Roman': require('./src/client/assets/fonts/TIMESBD.ttf'),
//     Shrikhand: require('./src/client/assets/fonts/Shrikhand.ttf'),
//   });

//   if (!fontsLoaded) {
//     // Don’t render until fonts are ready
//     return null;
//   }

//   return <RootNavigator />;
// };

// registerRootComponent(App);

import React from 'react';
import RootNavigator from './src/client/navigation/RootNavigator';

const App = () => {
  return <RootNavigator />;
};

export default App;
