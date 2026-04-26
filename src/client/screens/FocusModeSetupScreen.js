import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppSelectionService from '../android/AppSelectionService';
import { loadFocusModePrefs, saveFocusModePrefs } from '../helper/focusModeStorage';

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

const normalizeMinuteInput = (rawValue) =>
  String(rawValue || '').replace(/[^\d]/g, '');

const normalizeMinutes = (rawValue, fallbackValue) => {
  const parsedValue = Number.parseInt(rawValue, 10);

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return fallbackValue;
};

const normalizeSelectedPackages = (packages) => {
  if (!Array.isArray(packages)) {
    return [];
  }

  return Array.from(
    new Set(
      packages.reduce((cleanPackages, packageName) => {
        const normalizedPackageName =
          typeof packageName === 'string'
            ? packageName.trim()
            : '';

        if (!normalizedPackageName) {
          return cleanPackages;
        }

        cleanPackages.push(normalizedPackageName);
        return cleanPackages;
      }, []),
    ),
  );
};

const buildAppNameMap = (apps) => {
  if (!Array.isArray(apps)) {
    return {};
  }

  return apps.reduce((appNameMap, app) => {
    const packageName =
      typeof app?.packageName === 'string'
        ? app.packageName.trim()
        : '';
    const appName =
      typeof app?.appName === 'string'
        ? app.appName.trim()
        : '';

    if (!packageName || !appName) {
      return appNameMap;
    }

    appNameMap[packageName] = appName;
    return appNameMap;
  }, {});
};

const getSelectedAppNames = (selectedPackages, appNamesByPackage) =>
  selectedPackages.reduce((selectedAppNames, packageName) => {
    const appName = appNamesByPackage[packageName];

    if (appName) {
      selectedAppNames.push(appName);
    }

    return selectedAppNames;
  }, []);

const getSelectedAppsSummary = (selectedPackages, appNamesByPackage) => {
  if (selectedPackages.length === 0) {
    return {
      headline: 'No apps selected',
      detail: 'Choose apps to block during this session.',
    };
  }

  const selectedAppNames = getSelectedAppNames(selectedPackages, appNamesByPackage);
  const previewApps = selectedAppNames.slice(0, 3);
  const extraCount = selectedPackages.length - previewApps.length;

  if (previewApps.length === 0) {
    return {
      headline: `${selectedPackages.length} apps selected`,
      detail: 'Selection saved for this focus session.',
    };
  }

  return {
    headline: `${selectedPackages.length} apps selected`,
    detail: extraCount > 0
      ? `${previewApps.join(', ')} +${extraCount} more`
      : previewApps.join(', '),
  };
};

const buildFocusSessionConfig = ({
  selectedPackages,
  selectedAppNames,
  focusDurationMinutes,
  breakDurationMinutes,
}) => {
  const sessionStartTimeMs = Date.now();

  return {
    selectedPackages: normalizeSelectedPackages(selectedPackages),
    selectedApps: Array.isArray(selectedAppNames) ? selectedAppNames : [],
    focusDurationMinutes,
    breakDurationMinutes,
    focusDurationMs: Math.max(1, Math.round(focusDurationMinutes * 60 * 1000)),
    breakDurationMs: Math.max(1, Math.round(breakDurationMinutes * 60 * 1000)),
    sessionStartTime: new Date(sessionStartTimeMs).toISOString(),
    sessionStartTimeMs,
    initialPhase: 'focus',
  };
};

const FocusModeSetupScreen = ({ navigation }) => {
  const [customFocusMinutes, setCustomFocusMinutes] = useState(String(DEFAULT_FOCUS_MINUTES));
  const [customBreakMinutes, setCustomBreakMinutes] = useState(String(DEFAULT_BREAK_MINUTES));
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [appNamesByPackage, setAppNamesByPackage] = useState({});
  const [isLaunchingSession, setIsLaunchingSession] = useState(false);
  const isLaunchingSessionRef = useRef(false);
  const canStartSession = selectedPackages.length > 0;
  const selectedAppNames = getSelectedAppNames(selectedPackages, appNamesByPackage);
  const selectedAppsSummary = getSelectedAppsSummary(selectedPackages, appNamesByPackage);

  const persistFocusModePrefs = async ({
    nextSelectedPackages = selectedPackages,
  } = {}) => {
    await saveFocusModePrefs({
      selectedPackages: normalizeSelectedPackages(nextSelectedPackages),
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadInstalledApps = async () => {
      try {
        const installedApps = await AppSelectionService.getApps();

        if (!isMounted) {
          return;
        }

        setAppNamesByPackage(buildAppNameMap(installedApps));
      } catch (error) {
        console.error('[FocusModeSetupScreen] Failed to load app names:', error);
      }
    };

    loadInstalledApps();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSavedFocusModePrefs = async () => {
      const savedPrefs = await loadFocusModePrefs();

      if (!isMounted || !savedPrefs) {
        return;
      }

      setSelectedPackages(normalizeSelectedPackages(savedPrefs.selectedPackages));
    };

    loadSavedFocusModePrefs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChooseApps = () => {
    navigation.navigate('BlockingAppSelection', {
      initialSelectedPackages: selectedPackages,
      onSelectionConfirm: (nextSelectedPackages) => {
        const normalizedPackages = normalizeSelectedPackages(nextSelectedPackages);
        setSelectedPackages(normalizedPackages);
        persistFocusModePrefs({ nextSelectedPackages: normalizedPackages }).catch((error) => {
          console.error('[FocusModeSetupScreen] Failed to save selected apps:', error);
        });
      },
    });
  };

  const handleFocusMinutesChange = (nextValue) => {
    const nextIntegerValue = normalizeMinuteInput(nextValue);
    setCustomFocusMinutes(nextIntegerValue);
  };

  const handleBreakMinutesChange = (nextValue) => {
    setCustomBreakMinutes(normalizeMinuteInput(nextValue));
  };

  const handleStartFocusSession = () => {
    if (isLaunchingSessionRef.current) {
      return;
    }

    if (!canStartSession) {
      Alert.alert(
        'Choose Apps First',
        'Select at least one app before starting a focus session.',
      );
      return;
    }

    const focusDurationMinutes = normalizeMinutes(customFocusMinutes, DEFAULT_FOCUS_MINUTES);
    const breakDurationMinutes = normalizeMinutes(customBreakMinutes, DEFAULT_BREAK_MINUTES);
    const sessionConfig = buildFocusSessionConfig({
      selectedPackages,
      selectedAppNames,
      focusDurationMinutes,
      breakDurationMinutes,
    });

    isLaunchingSessionRef.current = true;
    setIsLaunchingSession(true);

    navigation.navigate('FocusModeTimer', {
      sessionConfig,
    });

    requestAnimationFrame(() => {
      isLaunchingSessionRef.current = false;
      setIsLaunchingSession(false);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Focus</Text>
      <Text style={styles.description}>
        Start a timed focus session and block distractions
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Duration</Text>

        <Text style={styles.inputLabel}>Focus Duration</Text>
        <TextInput
          style={styles.input}
          value={customFocusMinutes}
          onChangeText={handleFocusMinutesChange}
          keyboardType="number-pad"
          placeholder="25"
        />

        <Text style={styles.inputLabel}>Break Duration</Text>
        <TextInput
          style={styles.input}
          value={customBreakMinutes}
          onChangeText={handleBreakMinutesChange}
          keyboardType="number-pad"
          placeholder="5"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selected Apps</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryHeadline}>{selectedAppsSummary.headline}</Text>
          <Text style={styles.summaryDetail}>{selectedAppsSummary.detail}</Text>
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleChooseApps}>
          <Text style={styles.secondaryButtonText}>Choose Apps</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!canStartSession || isLaunchingSession) && styles.primaryButtonDisabled,
        ]}
        onPress={handleStartFocusSession}
        disabled={!canStartSession || isLaunchingSession}
      >
        <Text style={styles.primaryButtonText}>Start Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 48,
    fontWeight: '600',
    marginTop: 50,
    marginBottom: 12,
  },
  description: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 18,
    marginBottom: 18,
  },
  section: {
    backgroundColor: '#F0F0F0',
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#222E50',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  durationOption: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    marginHorizontal: '1%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationOptionSelected: {
    backgroundColor: '#426B69',
  },
  durationOptionText: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
    fontWeight: '600',
  },
  durationOptionTextSelected: {
    color: '#FFFFFF',
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  summaryHeadline: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryDetail: {
    color: '#555555',
    fontFamily: 'Verdana',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#222E50',
    fontFamily: 'Verdana',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#426B69',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9AB1AF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Verdana',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});

export default FocusModeSetupScreen;
