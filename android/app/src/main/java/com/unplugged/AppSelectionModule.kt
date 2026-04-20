package com.unplugged

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppSelectionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val appSelectionProvider = AppSelectionProvider(reactContext)

    override fun getName(): String = "AppSelectionModule"

    @ReactMethod
    fun getApps(promise: Promise) {
        try {
            promise.resolve(appSelectionProvider.getApps())
        } catch (e: Exception) {
            promise.reject("ERR_APP_SELECTION", "Failed to load installed apps", e)
        }
    }
}
