package com.unplugged.nativecore

import android.content.Context
import android.os.PowerManager


class ScreenStateMonitor(private val context: Context) {

    fun isScreenOn(): Boolean {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        // Future: use pm.isInteractive or pm.isScreenOn depending on API
        return false
    }

    // Placeholder for listening to real-time screen events.
    fun registerScreenStateReceiver() {
        // Future: register BroadcastReceiver for ACTION_SCREEN_ON/OFF
    }

    fun unregisterScreenStateReceiver() {
        // Future: unregister BroadcastReceiver
    }
}
