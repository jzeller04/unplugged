import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { 
  toggleUserAppblocking, 
  isAppBlockingEnabled 
} from '../helper/userStorage';

const FOCUS_TIME = (25 * 60);
const BREAK_TIME = (5 * 60);

const StudyModeScreen = ({ navigation }) => {
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const intervalRef = useRef(null);
  const totalIntervalRef = useRef(null);
  const modeRef = useRef('focus');

  const totalSeconds = mode === 'focus' ? FOCUS_TIME : BREAK_TIME;

  // Apps to block during study mode
  const studyApps = ["instagram", "tiktok", "twitter"];

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleStudyBlocking = async (shouldBlock) => {
    try {
      for (const app of studyApps) {
        const isBlocked = await isAppBlockingEnabled({ name: app });

        if (isBlocked !== shouldBlock) {
          await toggleUserAppblocking({ name: app });
        }
      }
    } catch (error) {
      console.error("Error toggling study blocking:", error);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextMode = modeRef.current === 'focus' ? 'break' : 'focus';
          setMode(nextMode);
          return nextMode === 'focus' ? FOCUS_TIME : BREAK_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    if (!totalIntervalRef.current) {
      totalIntervalRef.current = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (totalIntervalRef.current) {
      clearInterval(totalIntervalRef.current);
      totalIntervalRef.current = null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      startTimer();
      toggleStudyBlocking(true); // 🔒 Block apps when entering

      return () => {
        pauseTimer();
        toggleStudyBlocking(false); // 🔓 Unblock when leaving
      };
    }, [])
  );

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const radius = 120;
  const strokeWidth = 30;
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
            stroke="#B5CA8D"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx="150"
            cy="150"
            r={radius}
            stroke="#426B69"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="270"
            origin="150,150"
          />
        </Svg>

        <View style={styles.timerTextContainer}>
          <Text style={styles.label}>Apps blocked for</Text>
          <Text style={styles.timerText}>
            {format(secondsLeft)}
          </Text>
        </View>
      </View>

      <Text style={styles.remainingText}>
        {format(totalElapsed)} in study mode
      </Text>

      <TouchableOpacity
        style={styles.stopButton}
        onPress={async () => {
          pauseTimer();
          await toggleStudyBlocking(false); // 🔓 Unblock apps
          navigation.goBack();
        }}
      >
        <Text style={styles.stopButtonText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
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
    color: '#222E50',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#222E50',
    fontFamily: 'Verdana',
  },
  remainingText: {
    fontSize: 18,
    color: '#222E50',
    fontFamily: 'Verdana',
    marginBottom: 40,
  },
  stopButton: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
  },
  stopButtonText: {
    fontFamily: 'Verdana',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});

export default StudyModeScreen;