package com.unplugged

import android.app.usage.UsageStatsManager
import android.app.usage.UsageEvents
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.facebook.react.bridge.*
import java.util.*
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.util.Locale

class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "UsageStatsModule"

    @ReactMethod
    fun getTodayStats(promise: Promise) {
        val usageStatsManager =
            reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as
                UsageStatsManager

        // Set time range: From midnight today until now
        val calendar = Calendar.getInstance()
        val endTime = calendar.timeInMillis
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        val startTime = calendar.timeInMillis

        val stats =
            usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

        val array = Arguments.createArray()
        for (usageStat in stats) {
            if (usageStat.totalTimeInForeground > 0) {
                val map = Arguments.createMap()
                map.putString("packageName", usageStat.packageName)
                map.putDouble(
                    "totalTime",
                    usageStat.totalTimeInForeground.toDouble()
                ) // in milliseconds
                array.pushMap(map)
            }
        }
        promise.resolve(array)
    }

    @ReactMethod
    fun getAggregateUsageData(promise: Promise) {
        try {
            val usageStatsManager =
                reactApplicationContext.getSystemService(
                    Context.USAGE_STATS_SERVICE
                ) as
                    UsageStatsManager
            val packageManager = reactApplicationContext.packageManager

            val calendar = Calendar.getInstance()
            val endTime = calendar.timeInMillis
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            val startTime = calendar.timeInMillis

            val openCounts = getOpenCountsByPackageName(
                usageStatsManager = usageStatsManager,
                startTime = startTime,
                endTime = endTime
            )

            // Group usage stats by package name
            val aggregatedStats =
                usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
            val statsList = mutableListOf<WritableMap>()

            for ((packageName, usageStat) in aggregatedStats) {
                val totalTime = usageStat.totalTimeInForeground

                // Filter out apps with 0ms usage
                if (totalTime > 0) {
                    val isUserLaunchable =
                        packageManager.getLaunchIntentForPackage(packageName) != null
                    if (!isUserLaunchable || isExcludedNoisePackage(packageName)) {
                        continue
                    }

                    val map = Arguments.createMap()
                    map.putString("packageName", packageName)
                    map.putDouble("totalTimeInForeground", totalTime.toDouble())
                    map.putDouble(
                        "lastTimeUsed",
                        usageStat.lastTimeUsed.toDouble()
                    )
                    map.putInt("openCount", openCounts[packageName] ?: 0)

                    var resolvedAppName = packageName
                    var isSystemApp = false
                    try {
                        val appInfo =
                            packageManager.getApplicationInfo(
                                packageName,
                                PackageManager.GET_META_DATA
                            )

                        resolvedAppName =
                            packageManager
                                .getApplicationLabel(appInfo)
                                .toString()
                        isSystemApp =
                            (appInfo.flags and
                                ApplicationInfo.FLAG_SYSTEM) != 0

                    // Extract and convert the App Icon to Base64
                    val drawable = packageManager.getApplicationIcon(appInfo)
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
                    map.putString("appIcon", Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP))
                    } catch (e: PackageManager.NameNotFoundException) {
                        continue
                    }

                    map.putString("appName", resolvedAppName)
                    map.putBoolean("isSystemApp", isSystemApp)
                    statsList.add(map)
                }
            }

            // Sort descending by highest total time in foreground
            statsList.sortByDescending { it.getDouble("totalTimeInForeground") }

            val array = Arguments.createArray()
            statsList.forEach { array.pushMap(it) }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject(
                "ERR_USAGE_STATS",
                "Failed to retrieve aggregated usage data",
                e
            )
        }
    }

    private fun isExcludedNoisePackage(packageName: String): Boolean {
        val normalizedPackageName = packageName.lowercase(Locale.US)
        return normalizedPackageName in EXCLUDED_NOISE_PACKAGES
    }

    private fun getOpenCountsByPackageName(
        usageStatsManager: UsageStatsManager,
        startTime: Long,
        endTime: Long
    ): Map<String, Int> {
        val counts = mutableMapOf<String, Int>()

        val events = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()

        var lastForegroundPackageName: String? = null
        while (events.hasNextEvent()) {
            events.getNextEvent(event)

            val type = event.eventType
            val isForegroundEvent =
                type == UsageEvents.Event.ACTIVITY_RESUMED ||
                    type == UsageEvents.Event.MOVE_TO_FOREGROUND

            if (!isForegroundEvent) {
                continue
            }

            val packageName = event.packageName ?: continue
            if (packageName == lastForegroundPackageName) {
                continue
            }

            counts[packageName] = (counts[packageName] ?: 0) + 1
            lastForegroundPackageName = packageName
        }

        return counts
    }

    companion object {
        private val EXCLUDED_NOISE_PACKAGES = setOf(
            "com.android.systemui",
            "com.google.android.permissioncontroller",
            "com.android.permissioncontroller",
            "com.google.android.packageinstaller",
            "com.android.packageinstaller",
            "com.google.android.setupwizard",
            "com.android.provision",
            "com.android.launcher3.quickstep"
        )
    }
}
