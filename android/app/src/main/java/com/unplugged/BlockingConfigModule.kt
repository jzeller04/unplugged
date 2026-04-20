package com.unplugged

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.Arguments
import android.util.Log

class BlockingConfigModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val configStore = BlockingConfigStore(reactContext)

    override fun getName(): String {
        return "BlockingConfigModule"
    }

    @ReactMethod
    fun getBlockingConfig(promise: Promise) {
        try {
            val config = Arguments.createMap()
            val blockedPackagesArray = Arguments.createArray()

            configStore.getBlockedPackages()
                .forEach { blockedPackagesArray.pushString(it) }

            config.putBoolean("blockingEnabled", configStore.isBlockingEnabled())
            config.putArray("blockedPackages", blockedPackagesArray)

            Log.d(
                TAG,
                "BRIDGE read config enabled=${config.getBoolean("blockingEnabled")} packages=${blockedPackagesArray.size()}"
            )
            promise.resolve(config)
        } catch (error: Exception) {
            Log.e(TAG, "BRIDGE read config failed", error)
            promise.reject(
                "ERR_GET_BLOCKING_CONFIG",
                "Failed to read blocking config",
                error
            )
        }
    }

    @ReactMethod
    fun setBlockingEnabled(enabled: Boolean, promise: Promise) {
        try {
            configStore.setBlockingEnabled(enabled)
            Log.d(TAG, "BRIDGE save enabled=$enabled")
            promise.resolve(null)
        } catch (error: Exception) {
            Log.e(TAG, "BRIDGE save enabled failed: enabled=$enabled", error)
            promise.reject(
                "ERR_SET_BLOCKING_ENABLED",
                "Failed to save blocking enabled state",
                error
            )
        }
    }

    @ReactMethod
    fun setBlockedPackages(packages: ReadableArray, promise: Promise) {
        try {
            val normalizedPackages = linkedSetOf<String>()

            for (index in 0 until packages.size()) {
                if (packages.getType(index) != ReadableType.String) {
                    promise.reject(
                        "ERR_INVALID_BLOCKED_PACKAGES",
                        "setBlockedPackages expects an array of package name strings"
                    )
                    return
                }

                val normalizedPackageName = packages.getString(index)?.trim().orEmpty()
                if (normalizedPackageName.isNotEmpty()) {
                    normalizedPackages.add(normalizedPackageName)
                }
            }

            Log.d(
                TAG,
                "BRIDGE save packages=${normalizedPackages.toList()}"
            )
            configStore.setBlockedPackages(normalizedPackages)
            promise.resolve(null)
        } catch (error: Exception) {
            Log.e(TAG, "BRIDGE save packages failed", error)
            promise.reject(
                "ERR_SET_BLOCKED_PACKAGES",
                "Failed to save blocked packages",
                error
            )
        }
    }

    companion object {
        private const val TAG = "Unplugged"
    }
}
