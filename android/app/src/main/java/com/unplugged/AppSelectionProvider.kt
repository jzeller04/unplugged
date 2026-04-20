package com.unplugged

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.io.ByteArrayOutputStream
import java.util.Locale

class AppSelectionProvider(private val context: Context) {
    private val packageManager: PackageManager = context.packageManager

    fun getApps(): WritableArray {
        val launcherIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfos = packageManager.queryIntentActivities(launcherIntent, 0)
        val appsByPackage = linkedMapOf<String, WritableMap>()

        for (resolveInfo in resolveInfos) {
            val activityInfo = resolveInfo.activityInfo ?: continue
            val packageName = activityInfo.packageName ?: continue

            if (shouldExcludePackage(packageName) || appsByPackage.containsKey(packageName)) {
                continue
            }

            val appName = resolveInfo.loadLabel(packageManager)?.toString()?.trim()
                ?.takeIf { it.isNotEmpty() }
                ?: packageName

            appsByPackage[packageName] = Arguments.createMap().apply {
                putString("packageName", packageName)
                putString("appName", appName)
                putString("appIcon", drawableToBase64(resolveInfo.loadIcon(packageManager)))
            }
        }

        val sortedApps = appsByPackage.values.sortedWith(
            compareBy(String.CASE_INSENSITIVE_ORDER) { it.getString("appName") ?: "" }
        )

        return Arguments.createArray().apply {
            sortedApps.forEach { pushMap(it) }
        }
    }

    private fun shouldExcludePackage(packageName: String): Boolean {
        val normalizedPackageName = packageName.lowercase(Locale.US)
        return normalizedPackageName == UNPLUGGED_PACKAGE_NAME ||
            normalizedPackageName in EXCLUDED_NOISE_PACKAGES
    }

    private fun drawableToBase64(drawable: Drawable): String {
        val bitmap = Bitmap.createBitmap(
            if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 1,
            if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 1,
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)

        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
        return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    }

    companion object {
        private const val UNPLUGGED_PACKAGE_NAME = "com.unplugged"

        private val EXCLUDED_NOISE_PACKAGES = setOf(
            "com.android.systemui",
            "com.google.android.permissioncontroller",
            "com.android.permissioncontroller",
            "com.google.android.packageinstaller",
            "com.android.packageinstaller",
            "com.google.android.setupwizard",
            "com.android.provision",
            "com.android.launcher3",
            "com.android.launcher3.quickstep"
        )
    }
}
