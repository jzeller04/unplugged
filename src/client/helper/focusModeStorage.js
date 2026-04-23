import AsyncStorage from '@react-native-async-storage/async-storage';

const FOCUS_MODE_PREFS_STORAGE_KEY = 'focusModeLastUsedPrefs';

const normalizeSelectedPackages = (selectedPackages) => {
  if (!Array.isArray(selectedPackages)) {
    return [];
  }

  return Array.from(
    new Set(
      selectedPackages.reduce((packages, packageName) => {
        if (typeof packageName !== 'string') {
          return packages;
        }

        const normalizedPackageName = packageName.trim();
        if (!normalizedPackageName) {
          return packages;
        }

        packages.push(normalizedPackageName);
        return packages;
      }, []),
    ),
  );
};

const normalizeSelectedDuration = (selectedDuration) => {
  const parsedDuration = Number.parseFloat(selectedDuration);

  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
    return null;
  }

  return parsedDuration;
};

const normalizeFocusModePrefs = (prefs) => {
  if (!prefs || typeof prefs !== 'object') {
    return null;
  }

  return {
    selectedPackages: normalizeSelectedPackages(prefs.selectedPackages),
    selectedDuration: normalizeSelectedDuration(prefs.selectedDuration),
  };
};

export const loadFocusModePrefs = async () => {
  try {
    const storedPrefs = await AsyncStorage.getItem(FOCUS_MODE_PREFS_STORAGE_KEY);

    if (!storedPrefs) {
      return null;
    }

    const parsedPrefs = JSON.parse(storedPrefs);
    const normalizedPrefs = normalizeFocusModePrefs(parsedPrefs);

    if (!normalizedPrefs) {
      console.warn('[focusModeStorage] Stored focus prefs are invalid.');
      return null;
    }

    return normalizedPrefs;
  } catch (error) {
    console.error('[focusModeStorage] Failed to load focus prefs:', error);
    return null;
  }
};

export const saveFocusModePrefs = async (prefs) => {
  try {
    const normalizedPrefs = normalizeFocusModePrefs(prefs);

    if (!normalizedPrefs) {
      await AsyncStorage.removeItem(FOCUS_MODE_PREFS_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(
      FOCUS_MODE_PREFS_STORAGE_KEY,
      JSON.stringify(normalizedPrefs),
    );
  } catch (error) {
    console.error('[focusModeStorage] Failed to save focus prefs:', error);
  }
};

export const clearFocusModePrefs = async () => {
  try {
    await AsyncStorage.removeItem(FOCUS_MODE_PREFS_STORAGE_KEY);
  } catch (error) {
    console.error('[focusModeStorage] Failed to clear focus prefs:', error);
  }
};
