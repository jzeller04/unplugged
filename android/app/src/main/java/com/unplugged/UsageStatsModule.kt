package com.unplugged

import android.app.usage.UsageStatsManager
import android.app.usage.UsageEvents
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import java.io.ByteArrayOutputStream
import java.util.Calendar
import java.util.Locale

class UsageStatsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "UsageStatsModule"

    @ReactMethod
    fun getTodayStats(promise: Promise) {
        val usageStatsManager =
            reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as
                UsageStatsManager

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
            if (
                usageStat.totalTimeInForeground > 0 &&
                !isExcludedNoisePackage(usageStat.packageName)
            ) {
                val map = Arguments.createMap()
                map.putString("packageName", usageStat.packageName)
                map.putDouble(
                    "totalTime",
                    usageStat.totalTimeInForeground.toDouble()
                )
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

            val usageByPackageName = getUsageByPackageNameFromEvents(
                usageStatsManager = usageStatsManager,
                startTime = startTime,
                endTime = endTime
            )
            val statsList = mutableListOf<WritableMap>()

            for ((packageName, usageStat) in usageByPackageName) {
                val totalTime = usageStat.totalTimeInForeground
                val openCount = usageStat.openCount

                if (totalTime > 0 && (totalTime >= MIN_DISPLAY_USAGE_MILLIS || openCount > 0)) {
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
                    map.putInt("openCount", openCount)

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

                        map.putString("appIcon", convertAppIconToBase64(packageManager, appInfo))
                    } catch (e: PackageManager.NameNotFoundException) {
                        continue
                    }

                    map.putString("appName", resolvedAppName)
                    map.putBoolean("isSystemApp", isSystemApp)
                    statsList.add(map)
                }
            }

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

    private fun convertAppIconToBase64(
        packageManager: PackageManager,
        appInfo: ApplicationInfo
    ): String {
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
        return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
    }

    private fun isExcludedNoisePackage(packageName: String): Boolean {
        val normalizedPackageName = packageName.lowercase(Locale.US)
        return normalizedPackageName in EXCLUDED_NOISE_PACKAGES
    }

    private data class AppUsageEventStats(
        var totalTimeInForeground: Long = 0L,
        var openCount: Int = 0,
        var lastTimeUsed: Long = 0L
    )

    private fun getUsageByPackageNameFromEvents(
        usageStatsManager: UsageStatsManager,
        startTime: Long,
        endTime: Long
    ): Map<String, AppUsageEventStats> {
        val usageByPackageName = mutableMapOf<String, AppUsageEventStats>()
        val events = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()
        var currentForegroundPackageName: String? = null
        var lastForegroundPackageName: String? = null
        var currentForegroundStartTime = startTime

        while (events.hasNextEvent()) {
            events.getNextEvent(event)

            val type = event.eventType
            val eventTime = event.timeStamp.coerceIn(startTime, endTime)
            val packageName = event.packageName ?: continue
            val isForegroundEvent =
                type == UsageEvents.Event.ACTIVITY_RESUMED ||
                    type == UsageEvents.Event.MOVE_TO_FOREGROUND
            val isBackgroundEvent =
                type == UsageEvents.Event.ACTIVITY_PAUSED ||
                    type == UsageEvents.Event.MOVE_TO_BACKGROUND

            if (isForegroundEvent) {
                if (
                    currentForegroundPackageName != null &&
                    currentForegroundPackageName != packageName
                ) {
                    addForegroundDuration(
                        usageByPackageName = usageByPackageName,
                        packageName = currentForegroundPackageName,
                        foregroundStartTime = currentForegroundStartTime,
                        foregroundEndTime = eventTime
                    )
                }

                if (lastForegroundPackageName != packageName) {
                    val stats = usageByPackageName.getOrPut(packageName) {
                        AppUsageEventStats()
                    }
                    stats.openCount += 1
                }

                if (currentForegroundPackageName != packageName) {
                    currentForegroundPackageName = packageName
                    currentForegroundStartTime = eventTime
                }

                lastForegroundPackageName = packageName

                val stats = usageByPackageName.getOrPut(packageName) {
                    AppUsageEventStats()
                }
                stats.lastTimeUsed = maxOf(stats.lastTimeUsed, eventTime)
            } else if (
                isBackgroundEvent &&
                currentForegroundPackageName == packageName
            ) {
                addForegroundDuration(
                    usageByPackageName = usageByPackageName,
                    packageName = packageName,
                    foregroundStartTime = currentForegroundStartTime,
                    foregroundEndTime = eventTime
                )
                currentForegroundPackageName = null
                currentForegroundStartTime = startTime
            }
        }

        if (currentForegroundPackageName != null) {
            addForegroundDuration(
                usageByPackageName = usageByPackageName,
                packageName = currentForegroundPackageName,
                foregroundStartTime = currentForegroundStartTime,
                foregroundEndTime = endTime
            )
        }

        return usageByPackageName
    }

    private fun addForegroundDuration(
        usageByPackageName: MutableMap<String, AppUsageEventStats>,
        packageName: String?,
        foregroundStartTime: Long,
        foregroundEndTime: Long
    ) {
        if (packageName == null || foregroundEndTime <= foregroundStartTime) {
            return
        }

        val stats = usageByPackageName.getOrPut(packageName) {
            AppUsageEventStats()
        }
        stats.totalTimeInForeground += foregroundEndTime - foregroundStartTime
        stats.lastTimeUsed = maxOf(stats.lastTimeUsed, foregroundEndTime)
    }

    companion object {
        private const val MIN_DISPLAY_USAGE_MILLIS = 60_000L

        private val EXCLUDED_NOISE_PACKAGES = setOf(
            "com.unplugged",
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
