package com.unplugged.nativecore

import android.content.Context


class NativeUsageManager(context: Context) {

    private val usageProvider = UsageStatsProvider(context)
    private val screenMonitor = ScreenStateMonitor(context)
    private val sessionStore = FocusSessionStore(context)

    fun getDailyUsageMinutes(): Int {
        return usageProvider.getTotalUsageMinutes()
    }

    fun getMostUsedApp(): String {
        return usageProvider.getMostUsedApp()
    }

    fun isScreenOn(): Boolean {
        return screenMonitor.isScreenOn()
    }

}
