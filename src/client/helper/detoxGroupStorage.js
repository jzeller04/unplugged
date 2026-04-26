import AsyncStorage from '@react-native-async-storage/async-storage';

const DETOX_GROUPS_STORAGE_KEY = 'detoxGroups';
const ACTIVE_DETOX_GROUP_ID_STORAGE_KEY = 'activeDetoxGroupId';

const normalizeSelectedPackages = (selectedPackages) => {
  if (!Array.isArray(selectedPackages)) {
    return [];
  }

  const normalizedPackages = [];
  const seenPackages = new Set();

  for (const packageName of selectedPackages) {
    if (typeof packageName !== 'string') {
      continue;
    }

    const normalizedPackageName = packageName.trim();
    if (!normalizedPackageName || seenPackages.has(normalizedPackageName)) {
      continue;
    }

    seenPackages.add(normalizedPackageName);
    normalizedPackages.push(normalizedPackageName);
  }

  return normalizedPackages;
};

const normalizeDetoxGroup = (group) => {
  if (!group || typeof group !== 'object') {
    return null;
  }

  if (typeof group.id !== 'string' || group.id.trim().length === 0) {
    return null;
  }

  return {
    id: group.id.trim(),
    name: typeof group.name === 'string' ? group.name : '',
    startTime: typeof group.startTime === 'string' ? group.startTime : '09:00 AM',
    endTime: typeof group.endTime === 'string' ? group.endTime : '05:00 PM',
    selectedPackages: normalizeSelectedPackages(group.selectedPackages),
  };
};

const normalizeActiveDetoxGroupId = (activeGroupId) => {
  if (typeof activeGroupId !== 'string') {
    return null;
  }

  const normalizedActiveGroupId = activeGroupId.trim();
  return normalizedActiveGroupId.length > 0 ? normalizedActiveGroupId : null;
};

export const loadDetoxGroups = async () => {
  try {
    const storedGroups = await AsyncStorage.getItem(DETOX_GROUPS_STORAGE_KEY);

    if (!storedGroups) {
      return [];
    }

    const parsedGroups = JSON.parse(storedGroups);
    if (!Array.isArray(parsedGroups)) {
      console.warn('[detoxGroupStorage] Stored detox groups value is not an array.');
      return [];
    }

    return parsedGroups.map(normalizeDetoxGroup).filter(Boolean);
  } catch (error) {
    console.error('[detoxGroupStorage] Failed to load detox groups:', error);
    return [];
  }
};

export const saveDetoxGroups = async (groups) => {
  try {
    const normalizedGroups = Array.isArray(groups)
      ? groups.map(normalizeDetoxGroup).filter(Boolean)
      : [];

    await AsyncStorage.setItem(
      DETOX_GROUPS_STORAGE_KEY,
      JSON.stringify(normalizedGroups),
    );
  } catch (error) {
    console.error('[detoxGroupStorage] Failed to save detox groups:', error);
  }
};

export const clearDetoxGroups = async () => {
  try {
    await AsyncStorage.removeItem(DETOX_GROUPS_STORAGE_KEY);
  } catch (error) {
    console.error('[detoxGroupStorage] Failed to clear detox groups:', error);
  }
};

export const loadActiveDetoxGroupId = async () => {
  try {
    const storedActiveGroupId = await AsyncStorage.getItem(ACTIVE_DETOX_GROUP_ID_STORAGE_KEY);
    return normalizeActiveDetoxGroupId(storedActiveGroupId);
  } catch (error) {
    console.error('[detoxGroupStorage] Failed to load active detox group id:', error);
    return null;
  }
};

export const saveActiveDetoxGroupId = async (activeGroupId) => {
  try {
    const normalizedActiveGroupId = normalizeActiveDetoxGroupId(activeGroupId);

    if (!normalizedActiveGroupId) {
      await AsyncStorage.removeItem(ACTIVE_DETOX_GROUP_ID_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(
      ACTIVE_DETOX_GROUP_ID_STORAGE_KEY,
      normalizedActiveGroupId,
    );
  } catch (error) {
    console.error('[detoxGroupStorage] Failed to save active detox group id:', error);
  }
};

export const clearActiveDetoxGroupId = async () => {
  try {
    await AsyncStorage.removeItem(ACTIVE_DETOX_GROUP_ID_STORAGE_KEY);
  } catch (error) {
    console.error('[detoxGroupStorage] Failed to clear active detox group id:', error);
  }
};
