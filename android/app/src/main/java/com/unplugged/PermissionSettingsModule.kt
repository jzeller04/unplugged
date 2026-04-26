package com.unplugged

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PermissionSettingsModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PermissionSettings"
    }

    @ReactMethod
    fun openUsageAccessSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun openOverlaySettings() {
        val uri = Uri.parse("package:${reactContext.packageName}")
        val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, uri)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun checkUsageAccess(promise: Promise) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactContext.packageName
            )
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (error: Exception) {
            promise.reject("ERR_USAGE_CHECK", error.message)
        }
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        try {
            var isAccessibilityEnabled = 0

            try {
                isAccessibilityEnabled = Settings.Secure.getInt(
                    reactContext.contentResolver,
                    Settings.Secure.ACCESSIBILITY_ENABLED
                )
            } catch (_: Settings.SettingNotFoundException) {
            }

            if (isAccessibilityEnabled == 1) {
                val settingValue = Settings.Secure.getString(
                    reactContext.contentResolver,
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                )
                if (settingValue != null && settingValue.contains(reactContext.packageName)) {
                    promise.resolve(true)
                    return
                }
            }
            promise.resolve(false)
        } catch (error: Exception) {
            promise.reject("ERR_ACCESSIBILITY_CHECK", error.message)
        }
    }

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            val granted = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactContext)
            } else {
                true
            }
            promise.resolve(granted)
        } catch (error: Exception) {
            promise.reject("ERR_OVERLAY_CHECK", error.message)
        }
    }
}
