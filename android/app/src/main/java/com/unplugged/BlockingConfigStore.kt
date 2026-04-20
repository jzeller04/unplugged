package com.unplugged

import android.content.Context
import android.content.SharedPreferences
import android.util.Log

class BlockingConfigStore(context: Context) {
    private val preferences: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFERENCES_FILE_NAME, Context.MODE_PRIVATE)

    fun isBlockingEnabled(): Boolean {
        return preferences.getBoolean(KEY_BLOCKING_ENABLED, DEFAULT_BLOCKING_ENABLED)
    }

    fun setBlockingEnabled(isEnabled: Boolean) {
        Log.d(TAG, "CFG save enabled=$isEnabled")
        preferences.edit()
            .putBoolean(KEY_BLOCKING_ENABLED, isEnabled)
            .apply()
    }

    fun getBlockedPackages(): Set<String> {
        return preferences.getStringSet(KEY_BLOCKED_PACKAGES, emptySet())?.toSet() ?: emptySet()
    }

    fun setBlockedPackages(blockedPackages: Set<String>) {
        Log.d(
            TAG,
            "CFG save packages=${blockedPackages.toList().sorted()}"
        )
        preferences.edit()
            .putStringSet(KEY_BLOCKED_PACKAGES, blockedPackages.toSet())
            .apply()
    }

    fun clearConfig() {
        Log.d(TAG, "CFG clear")
        preferences.edit()
            .clear()
            .apply()
    }

    fun registerChangeListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) {
        preferences.registerOnSharedPreferenceChangeListener(listener)
    }

    fun unregisterChangeListener(listener: SharedPreferences.OnSharedPreferenceChangeListener) {
        preferences.unregisterOnSharedPreferenceChangeListener(listener)
    }

    companion object {
        private const val TAG = "Unplugged"
        private const val PREFERENCES_FILE_NAME = "blocking_config"
        private const val KEY_BLOCKING_ENABLED = "blocking_enabled"
        private const val KEY_BLOCKED_PACKAGES = "blocked_packages"
        private const val DEFAULT_BLOCKING_ENABLED = false
    }
}
