import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

let HOT_RELOAD_COUNTER = (global.HOT_RELOAD_COUNTER || 0) + 1;
global.HOT_RELOAD_COUNTER = HOT_RELOAD_COUNTER;

const SpinningCircle = ({ size, value }) => {
  const spin = value.interpolate({
    inputRange: [0, 0.75, 1],
    outputRange: ['0deg', '-270deg', '-360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          bottom: -(size / 2),
          left: -(size / 2),
          transform: [{ rotate: spin }, { rotate: '-45deg' }],
        },
      ]}
    />
  );
};

const LoadingScreen = () => {
  const rotateRef = useRef(new Animated.Value(0));
  const rotate = rotateRef.current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (loopRef.current) loopRef.current.stop();
    rotate.stopAnimation();
    rotate.setValue(0);

    const sequence = Animated.sequence([
      Animated.timing(rotate, {
        toValue: 0.75,
        duration: 2500,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(1500),
    ]);

    loopRef.current = Animated.loop(sequence, { resetBeforeIteration: true });
    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
      rotate.stopAnimation();
    };
  }, [rotate]);

  return (
    <View style={styles.container} key={HOT_RELOAD_COUNTER}>
      <Text style={styles.logo}>unplugged</Text>
      <SpinningCircle size={200} value={rotate} />
      <SpinningCircle size={300} value={rotate} />
      <SpinningCircle size={400} value={rotate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#426B69',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    color: '#B5CA8D',
    fontFamily: 'Shrikhand',
    fontSize: 48,
    marginBottom: 250,
    textAlign: 'center',
  },
  circle: {
    position: 'absolute',
    borderWidth: 4,
    borderTopColor: '#B5CA8D',
    borderRightColor: 'transparent',
    borderBottomColor: '#B5CA8D',
    borderLeftColor: '#B5CA8D',
  },
});

export default LoadingScreen;