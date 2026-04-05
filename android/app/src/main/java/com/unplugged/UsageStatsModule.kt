package com.unplugged

import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.facebook.react.bridge.*
import java.util.*
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Base64
import java.io.ByteArrayOutputStream

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

            // Group usage stats by package name
            val aggregatedStats =
                usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
            val statsList = mutableListOf<WritableMap>()

            for ((packageName, usageStat) in aggregatedStats) {
                val totalTime = usageStat.totalTimeInForeground

                // Filter out apps with 0ms usage
                if (totalTime > 0) {
                    val map = Arguments.createMap()
                    map.putString("packageName", packageName)
                    map.putDouble("totalTimeInForeground", totalTime.toDouble())
                    map.putDouble(
                        "lastTimeUsed",
                        usageStat.lastTimeUsed.toDouble()
                    )

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
                        resolvedAppName = packageName
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
}
