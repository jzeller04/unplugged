package com.unplugged.nativecore

import android.app.usage.UsageStatsManager
import android.content.Context
import java.util.*


class UsageStatsProvider(private val context: Context) {

    // Placeholder for retrieving total screen time today.
    fun getTotalUsageMinutes(): Int {
        // Future implementation will use UsageStatsManager.queryUsageStats()
        return -1
    }

    // Placeholder for retrieving usage per app.
    fun getAppUsageMap(): Map<String, Int> {
        // Future logic will parse UsageStats objects.
        return emptyMap()
    }

    // Returns a placeholder for "most used app".
    fun getMostUsedApp(): String {
        return "unlinked"
    }

    private fun getUsageStatsManager(): UsageStatsManager {
        return context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    }
}
