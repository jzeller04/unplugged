// Javascript interface wrapper for the NativeUsageManager.
// Ensures JS code can shape around  native integration.

export function getDailyUsageMinutes() {
  console.warn("NativeUsageManager not linked");
  return -1;
}

export function getMostUsedApp() {
  console.warn("NativeUsageManager not linked");
  return "unlinked";
}

export function isScreenOn() {
  console.warn("NativeUsageManager not linked");
  return false;
}

export function startFocusSession(ts) {
  console.warn("NativeUsageManager not linked");
  return true;
}

export function endFocusSession(ts) {
  console.warn("NativeUsageManager not linked");
  return true;
}

export function getLastSession() {
  console.warn("NativeUsageManager not linked");
  return { start: -1, end: -1 };
}
