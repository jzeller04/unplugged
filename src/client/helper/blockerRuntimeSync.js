import blockingConfig from '../android/BlockingConfig';
import {
  loadActiveDetoxGroupId,
  loadDetoxGroups,
} from './detoxGroupStorage';

const normalizeRuntimePackages = (packages) => {
  if (!Array.isArray(packages)) {
    return [];
  }

  return Array.from(
    new Set(
      packages.reduce((normalizedPackages, packageName) => {
        const normalizedPackageName =
          typeof packageName === 'string'
            ? packageName.trim()
            : '';

        if (!normalizedPackageName) {
          return normalizedPackages;
        }

        normalizedPackages.push(normalizedPackageName);
        return normalizedPackages;
      }, []),
    ),
  );
};

let lastAppliedRuntimeState = null;
let savedGroupRuntimeState = null;
let activeFocusRuntimeState = null;

const normalizeRuntimeState = ({
  blockedPackages = [],
  blockingEnabled = false,
} = {}) => ({
  blockedPackages: normalizeRuntimePackages(blockedPackages),
  blockingEnabled: blockingEnabled === true,
});

const runtimePackagesMatch = (firstPackages, secondPackages) => {
  const first = normalizeRuntimePackages(firstPackages);
  const second = normalizeRuntimePackages(secondPackages);

  if (first.length !== second.length) {
    return false;
  }

  const secondPackageSet = new Set(second);
  return first.every((packageName) => secondPackageSet.has(packageName));
};

const mergeRuntimePackages = (...packageLists) =>
  normalizeRuntimePackages(
    packageLists.reduce((mergedPackages, packageList) => {
      if (!Array.isArray(packageList)) {
        return mergedPackages;
      }

      mergedPackages.push(...packageList);
      return mergedPackages;
    }, []),
  );

const findActiveGroupPackages = (groups, activeGroupId) => {
  const activeGroup = Array.isArray(groups)
    ? groups.find((group) => group.id === activeGroupId)
    : null;

  return normalizeRuntimePackages(activeGroup?.selectedPackages);
};

const rememberSavedGroupRuntimeState = (runtimeState) => {
  savedGroupRuntimeState = normalizeRuntimeState(runtimeState);
  return savedGroupRuntimeState;
};

const normalizeFocusRuntimeState = ({
  focusPhase,
  focusPackages,
} = {}) => {
  if (focusPhase === 'focus' || focusPhase === 'break') {
    return {
      focusPhase,
      focusPackages: normalizeRuntimePackages(focusPackages),
    };
  }

  return null;
};

export const resolveEffectiveRuntimeState = ({
  focusPhase,
  focusPackages,
  savedRuntimeState,
} = {}) => {
  const baselineRuntimeState = normalizeRuntimeState(savedRuntimeState);

  if (focusPhase === 'focus') {
    const effectivePackages = mergeRuntimePackages(
      baselineRuntimeState.blockedPackages,
      focusPackages,
    );

    return {
      blockedPackages: effectivePackages,
      blockingEnabled: effectivePackages.length > 0,
    };
  }

  return baselineRuntimeState;
};

export const readNativeBlockerRuntimeState = async () => {
  const nativeConfig = await blockingConfig.getBlockingConfig();

  return {
    blockedPackages: normalizeRuntimePackages(nativeConfig?.blockedPackages),
    blockingEnabled: nativeConfig?.blockingEnabled === true,
  };
};

export const setRuntimeBlockedPackages = async (blockedPackages) => {
  const normalizedPackages = normalizeRuntimePackages(blockedPackages);

  await blockingConfig.setBlockedPackages(normalizedPackages);
  lastAppliedRuntimeState = {
    blockedPackages: normalizedPackages,
    blockingEnabled: lastAppliedRuntimeState?.blockingEnabled,
  };
};

export const setRuntimeBlockingEnabled = async (blockingEnabled) => {
  const normalizedBlockingEnabled = blockingEnabled === true;

  await blockingConfig.setBlockingEnabled(normalizedBlockingEnabled);
  lastAppliedRuntimeState = {
    blockedPackages: lastAppliedRuntimeState?.blockedPackages,
    blockingEnabled: normalizedBlockingEnabled,
  };
};

export const applyBlockerRuntimeState = async ({
  blockedPackages = [],
  blockingEnabled = false,
} = {}) => {
  const {
    blockedPackages: normalizedPackages,
    blockingEnabled: normalizedBlockingEnabled,
  } = normalizeRuntimeState({
    blockedPackages,
    blockingEnabled,
  });
  const shouldWritePackages =
    !lastAppliedRuntimeState
    || !Array.isArray(lastAppliedRuntimeState.blockedPackages)
    || !runtimePackagesMatch(
      lastAppliedRuntimeState.blockedPackages,
      normalizedPackages,
    );
  const shouldWriteBlockingEnabled =
    !lastAppliedRuntimeState
    || typeof lastAppliedRuntimeState.blockingEnabled !== 'boolean'
    || lastAppliedRuntimeState.blockingEnabled !== normalizedBlockingEnabled;

  if (shouldWritePackages) {
    await blockingConfig.setBlockedPackages(normalizedPackages);
  }

  if (shouldWriteBlockingEnabled) {
    await blockingConfig.setBlockingEnabled(normalizedBlockingEnabled);
  }

  lastAppliedRuntimeState = {
    blockedPackages: normalizedPackages,
    blockingEnabled: normalizedBlockingEnabled,
  };

  return lastAppliedRuntimeState;
};

export const resolveSavedGroupRuntimeState = async ({
  groups,
  activeGroupId,
  blockingEnabled,
} = {}) => {
  const hasExplicitBlockingEnabled = typeof blockingEnabled === 'boolean';
  const canUseCachedBlockingEnabled =
    !hasExplicitBlockingEnabled
    && activeFocusRuntimeState
    && typeof savedGroupRuntimeState?.blockingEnabled === 'boolean';
  const [
    storedGroups,
    storedActiveGroupId,
    nativeConfig,
  ] = await Promise.all([
    Array.isArray(groups) ? Promise.resolve(groups) : loadDetoxGroups(),
    typeof activeGroupId === 'string' || activeGroupId === null
      ? Promise.resolve(activeGroupId)
      : loadActiveDetoxGroupId(),
    hasExplicitBlockingEnabled || canUseCachedBlockingEnabled
      ? Promise.resolve(null)
      : readNativeBlockerRuntimeState(),
  ]);

  return {
    blockedPackages: findActiveGroupPackages(storedGroups, storedActiveGroupId),
    blockingEnabled:
      hasExplicitBlockingEnabled
        ? blockingEnabled
        : canUseCachedBlockingEnabled
          ? savedGroupRuntimeState.blockingEnabled
          : nativeConfig?.blockingEnabled === true,
  };
};

const getSavedGroupRuntimeState = async () => {
  if (savedGroupRuntimeState) {
    return savedGroupRuntimeState;
  }

  return rememberSavedGroupRuntimeState(
    await resolveSavedGroupRuntimeState(),
  );
};

export const syncSavedGroupRuntimeToNative = async ({
  groups,
  activeGroupId,
  blockingEnabled,
} = {}) => {
  const runtimeState = await resolveSavedGroupRuntimeState({
    groups,
    activeGroupId,
    blockingEnabled,
  });
  const savedRuntimeState = rememberSavedGroupRuntimeState(runtimeState);
  const effectiveRuntimeState = resolveEffectiveRuntimeState({
    focusPhase: activeFocusRuntimeState?.focusPhase,
    focusPackages: activeFocusRuntimeState?.focusPackages,
    savedRuntimeState,
  });

  await applyBlockerRuntimeState(effectiveRuntimeState);
  return savedRuntimeState;
};

export const syncFocusModeRuntimeToNative = async ({
  focusPhase,
  focusPackages,
} = {}) => {
  activeFocusRuntimeState = normalizeFocusRuntimeState({
    focusPhase,
    focusPackages,
  });

  const savedRuntimeState = await getSavedGroupRuntimeState();
  const effectiveRuntimeState = resolveEffectiveRuntimeState({
    focusPhase: activeFocusRuntimeState?.focusPhase,
    focusPackages: activeFocusRuntimeState?.focusPackages,
    savedRuntimeState,
  });

  return applyBlockerRuntimeState(effectiveRuntimeState);
};
