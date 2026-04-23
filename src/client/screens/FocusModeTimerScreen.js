import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { syncFocusModeRuntimeToNative } from '../helper/blockerRuntimeSync';

const COLORS = {
  background: '#FFFFFF',
  title: '#222E50',
  card: '#F0F0F0',
  primary: '#426B69',
  accent: '#B5CA8D',
  white: '#FFFFFF',
  muted: '#6F7894',
  body: '#555555',
  focusSoft: '#E7EFE8',
  breakSoft: '#EEF4DF',
  completeSoft: '#E8EBEF',
};

const PHASE_COPY = {
  focus: {
    badge: 'Focus Time',
    title: 'Focus Session',
    eyebrow: 'Focus ends in',
    message: 'Stay focused until your break begins.',
    ringColor: COLORS.primary,
    trackColor: COLORS.accent,
    badgeBackground: COLORS.focusSoft,
    badgeTextColor: COLORS.primary,
  },
  break: {
    badge: 'Break Time',
    title: 'Focus Session',
    eyebrow: 'Break ends in',
    message: 'Take a short break before returning to focus.',
    ringColor: COLORS.accent,
    trackColor: COLORS.primary,
    badgeBackground: COLORS.breakSoft,
    badgeTextColor: COLORS.primary,
  },
  complete: {
    badge: 'Complete',
    title: 'Focus Finished',
    eyebrow: 'Session complete',
    message: 'Great work. Your focus session is finished.',
    ringColor: COLORS.primary,
    trackColor: COLORS.accent,
    badgeBackground: COLORS.completeSoft,
    badgeTextColor: COLORS.title,
  },
};

const normalizeSelectedStrings = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.reduce((normalizedValues, value) => {
    const normalizedValue =
      typeof value === 'string'
        ? value.trim()
        : '';

    if (!normalizedValue) {
      return normalizedValues;
    }

    normalizedValues.push(normalizedValue);
    return normalizedValues;
  }, []);
};

const normalizeDurationMs = (durationMs, durationMinutes) => {
  const parsedDurationMs = Number.parseFloat(durationMs);

  if (Number.isFinite(parsedDurationMs) && parsedDurationMs > 0) {
    return Math.max(1, Math.round(parsedDurationMs));
  }

  const parsedDurationMinutes = Number.parseFloat(durationMinutes);

  if (Number.isFinite(parsedDurationMinutes) && parsedDurationMinutes > 0) {
    return Math.max(1, Math.round(parsedDurationMinutes * 60 * 1000));
  }

  return null;
};

const normalizeSessionStartTimeMs = (sessionStartTimeMs, sessionStartTime) => {
  const parsedStartTimeMs = Number.parseFloat(sessionStartTimeMs);

  if (Number.isFinite(parsedStartTimeMs) && parsedStartTimeMs > 0) {
    return parsedStartTimeMs;
  }

  const parsedStartTime = Date.parse(sessionStartTime);

  if (Number.isFinite(parsedStartTime)) {
    return parsedStartTime;
  }

  return null;
};

const normalizeSessionConfig = (sessionConfig) => {
  if (!sessionConfig || typeof sessionConfig !== 'object') {
    return null;
  }

  const focusDurationMinutes = Number.parseFloat(sessionConfig.focusDurationMinutes);
  const breakDurationMinutes = Number.parseFloat(sessionConfig.breakDurationMinutes);
  const focusDurationMs = normalizeDurationMs(
    sessionConfig.focusDurationMs,
    sessionConfig.focusDurationMinutes,
  );
  const breakDurationMs = normalizeDurationMs(
    sessionConfig.breakDurationMs,
    sessionConfig.breakDurationMinutes,
  );
  const selectedPackages = normalizeSelectedStrings(sessionConfig.selectedPackages);
  const selectedApps = normalizeSelectedStrings(sessionConfig.selectedApps);
  const sessionStartTime =
    typeof sessionConfig.sessionStartTime === 'string'
      ? sessionConfig.sessionStartTime.trim()
      : '';
  const sessionStartTimeMs = normalizeSessionStartTimeMs(
    sessionConfig.sessionStartTimeMs,
    sessionStartTime,
  );

  if (
    !Number.isFinite(focusDurationMinutes)
    || focusDurationMinutes <= 0
    || !Number.isFinite(breakDurationMinutes)
    || breakDurationMinutes <= 0
    || !focusDurationMs
    || !breakDurationMs
    || selectedPackages.length === 0
    || !sessionStartTimeMs
  ) {
    return null;
  }

  return {
    focusDurationMinutes,
    breakDurationMinutes,
    focusDurationMs,
    breakDurationMs,
    selectedPackages,
    selectedApps,
    sessionStartTime: sessionStartTime || new Date(sessionStartTimeMs).toISOString(),
    sessionStartTimeMs,
  };
};

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const formatSessionTime = (sessionStartTime) => {
  const parsedDate = new Date(sessionStartTime);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Started just now';
  }

  return `Started ${parsedDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

const getTimerSnapshot = ({
  nowMs,
  sessionStartTimeMs,
  focusDurationMs,
  breakDurationMs,
}) => {
  const elapsedMs = Math.max(0, nowMs - sessionStartTimeMs);
  const totalDurationMs = focusDurationMs + breakDurationMs;

  if (elapsedMs >= totalDurationMs) {
    return {
      phase: 'complete',
      remainingMs: 0,
      progress: 1,
    };
  }

  if (elapsedMs >= focusDurationMs) {
    const breakElapsedMs = elapsedMs - focusDurationMs;
    const remainingMs = Math.max(0, breakDurationMs - breakElapsedMs);

    return {
      phase: 'break',
      remainingMs,
      progress: remainingMs / breakDurationMs,
    };
  }

  const remainingMs = Math.max(0, focusDurationMs - elapsedMs);

  return {
    phase: 'focus',
    remainingMs,
    progress: remainingMs / focusDurationMs,
  };
};

const getDisplaySeconds = (remainingMs) => Math.ceil(Math.max(0, remainingMs) / 1000);

const FocusModeTimerScreen = ({ navigation, route }) => {
  const launchedSession = useMemo(
    () => normalizeSessionConfig(route?.params?.sessionConfig),
    [route?.params?.sessionConfig],
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const intervalRef = useRef(null);
  const runtimeSyncRunIdRef = useRef(0);

  const timerSnapshot = useMemo(() => {
    if (!launchedSession) {
      return null;
    }

    return getTimerSnapshot({
      nowMs,
      sessionStartTimeMs: launchedSession.sessionStartTimeMs,
      focusDurationMs: launchedSession.focusDurationMs,
      breakDurationMs: launchedSession.breakDurationMs,
    });
  }, [launchedSession, nowMs]);
  const timerPhase = timerSnapshot?.phase;

  useEffect(() => {
    setNowMs(Date.now());
  }, [launchedSession?.sessionStartTimeMs]);

  useFocusEffect(
    useCallback(() => {
      setNowMs(Date.now());
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setNowMs(Date.now());
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!launchedSession || timerSnapshot?.phase === 'complete') {
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [launchedSession, timerSnapshot?.phase]);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cancelPendingRuntimeSync = () => {
    runtimeSyncRunIdRef.current += 1;
  };

  const restoreSavedRuntimeState = useCallback(async () => {
    await syncFocusModeRuntimeToNative({
      focusPhase: 'inactive',
      focusPackages: [],
    });
  }, []);

  useEffect(() => {
    if (!launchedSession || !timerPhase) {
      return undefined;
    }

    const syncRunId = runtimeSyncRunIdRef.current + 1;
    runtimeSyncRunIdRef.current = syncRunId;

    const syncRuntimeForPhase = async () => {
      if (runtimeSyncRunIdRef.current !== syncRunId) {
        return;
      }

      await syncFocusModeRuntimeToNative({
        focusPhase: timerPhase,
        focusPackages: launchedSession.selectedPackages,
      });
    };

    syncRuntimeForPhase().catch((error) => {
      console.error('[FocusModeTimerScreen] Failed to sync focus runtime:', error);
    });

    return undefined;
  }, [
    launchedSession,
    timerPhase,
  ]);

  useEffect(() => () => {
    cancelPendingRuntimeSync();
    clearTimer();
    restoreSavedRuntimeState().catch((error) => {
      console.error('[FocusModeTimerScreen] Failed to restore saved runtime:', error);
    });
  }, [restoreSavedRuntimeState]);

  const handleExit = async () => {
    cancelPendingRuntimeSync();
    clearTimer();
    try {
      await restoreSavedRuntimeState();
    } catch (error) {
      console.error('[FocusModeTimerScreen] Failed to restore saved runtime before exit:', error);
    } finally {
      navigation.goBack();
    }
  };

  if (!launchedSession) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={[styles.phaseBadge, { backgroundColor: COLORS.completeSoft }]}>
            <Text style={[styles.phaseBadgeText, { color: COLORS.title }]}>Setup Needed</Text>
          </View>

          <Text style={styles.title}>Focus Mode</Text>
          <Text style={styles.subtitle}>
            Start a focus session from the setup screen before opening the timer.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleExit}
        >
          <Text style={styles.stopButtonText}>
            Back to Setup
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const phaseCopy = PHASE_COPY[timerSnapshot.phase];
  const progress = timerSnapshot.progress;
  const radius = 120;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const sessionTimingText = `${launchedSession.focusDurationMinutes} min focus / ${launchedSession.breakDurationMinutes} min break`;
  const sessionStartText = formatSessionTime(launchedSession.sessionStartTime);
  const primaryButtonText = timerSnapshot.phase === 'complete' ? 'Return to Setup' : 'End Session';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View
          style={[
            styles.phaseBadge,
            { backgroundColor: phaseCopy.badgeBackground },
          ]}
        >
          <Text
            style={[
              styles.phaseBadgeText,
              { color: phaseCopy.badgeTextColor },
            ]}
          >
            {phaseCopy.badge}
          </Text>
        </View>

        <Text style={styles.title}>{phaseCopy.title}</Text>
        <Text style={styles.subtitle}>{phaseCopy.message}</Text>
      </View>

      <View style={styles.circleContainer}>
        <Svg width={300} height={300}>
          <Circle
            cx="150"
            cy="150"
            r={radius}
            stroke={phaseCopy.trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx="150"
            cy="150"
            r={radius}
            stroke={phaseCopy.ringColor}
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
          <Text style={styles.eyebrow}>{phaseCopy.eyebrow}</Text>
          <Text style={styles.timeText}>
            {timerSnapshot.phase === 'complete'
              ? 'Done'
              : formatTime(getDisplaySeconds(timerSnapshot.remainingMs))}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Session Info</Text>
        <Text style={styles.infoCardBody}>{sessionTimingText}</Text>
        <Text style={styles.infoCardMeta}>{sessionStartText}</Text>
      </View>

      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleExit}
        >
          <Text style={styles.stopButtonText}>
            {primaryButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 18,
    alignItems: 'center',
  },
  phaseBadge: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 18,
    alignSelf: 'center',
    alignItems: 'center',
  },
  phaseBadgeText: {
    fontFamily: 'Verdana',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.title,
    fontFamily: 'Times New Roman',
    fontSize: 42,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    color: COLORS.body,
    fontFamily: 'Verdana',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  eyebrow: {
    color: COLORS.muted,
    fontFamily: 'Verdana',
    fontSize: 14,
    marginBottom: 8,
  },
  timeText: {
    color: COLORS.title,
    fontFamily: 'Verdana',
    fontSize: 52,
    fontWeight: '700',
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  infoCardTitle: {
    color: COLORS.title,
    fontFamily: 'Times New Roman',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'left',
  },
  infoCardBody: {
    color: COLORS.body,
    fontFamily: 'Verdana',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'left',
  },
  infoCardMeta: {
    color: COLORS.muted,
    fontFamily: 'Verdana',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  actionGroup: {
    width: '100%',
  },
  stopButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  stopButtonText: {
    color: COLORS.white,
    fontFamily: 'Verdana',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});

export default FocusModeTimerScreen;
