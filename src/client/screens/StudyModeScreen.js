import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';

const FOCUS_TIME = (25 * 60);
const BREAK_TIME = (5 * 60);

const StudyModeScreen = ({ navigation }) => {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME);
  const intervalRef = useRef(null);

  const totalSeconds = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          if (mode === 'focus') {
            setMode('break');
            setTimeout(() => startTimer(), 50);
            return BREAK_TIME;
          } else {
            setMode('focus');
            setTimeout(() => startTimer(), 50);
            return FOCUS_TIME;
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    }
  };

  useFocusEffect(
    useCallback(() => {
    startTimer();        // auto-start when screen is focused
    return () => pauseTimer();  // cleanup when leaving screen
    }, [])
  );

  // Circular progress math, change if needed based on visual changes
  const radius = 120;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = secondsLeft / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === 'focus' ? 'Focus Mode' : 'Break Mode'}
      </Text>

      <View style={styles.circleContainer}>
        <Svg width={300} height={300}>
          <Circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#D0E8D0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#4CAF50"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>

        <View style={styles.timerTextContainer}>
          <Text style={styles.label}>Apps Blocked For:</Text>
          <Text style={styles.timerText}>
            {format(totalSeconds - secondsLeft)}
          </Text>
        </View>
      </View>

      <Text style={styles.remainingText}>
        {format(secondsLeft)} remaining in {mode} mode
      </Text>

      <TouchableOpacity
        style={styles.stopButton}
        onPress={() => {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          navigation.goBack();
        }}
      >
        <Text style={styles.stopButtonText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
};

// change whatever you need to visually
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222E50',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#222E50',
  },
  remainingText: {
    fontSize: 18,
    color: '#444',
    marginBottom: 40,
  },
  stopButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default StudyModeScreen;