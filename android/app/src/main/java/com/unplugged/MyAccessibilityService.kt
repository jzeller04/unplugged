package com.unplugged

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class MyAccessibilityService : AccessibilityService() {
    private lateinit var blockingOverlayManager: BlockingOverlayManager
    private var currentBlockedTargetPackage: String? = null
    private var isOverlayShowing: Boolean = false
    private var lastExternalForegroundPackage: String? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        blockingOverlayManager = BlockingOverlayManager(this)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        val packageName = event.packageName?.toString().orEmpty()
        val className = event.className?.toString().orEmpty()

        Log.d(
            TAG,
            "Accessibility event detected: eventType=${event.eventType}, packageName=$packageName, className=$className"
        )   

        if (packageName.isEmpty()) {
            return
        }

        if (packageName == SELF_PACKAGE_NAME) {
            Log.d(
                TAG,
                "Ignoring self package event while blocked target remains active: packageName=$packageName, currentBlockedTargetPackage=$currentBlockedTargetPackage"
            )
            return
        }

        lastExternalForegroundPackage = packageName

        if (packageName == BLOCKED_PACKAGE_NAME) {
            currentBlockedTargetPackage = packageName
            triggerBlockingForPackage(packageName, className)
            return
        }

        clearBlockingState()
    }

    override fun onInterrupt() {
        clearBlockingState()
    }

    override fun onDestroy() {
        clearBlockingState()
        super.onDestroy()
    }

    private fun triggerBlockingForPackage(packageName: String, className: String) {
        currentBlockedTargetPackage = packageName

        Log.d(
            TAG,
            "Blocking trigger entered: packageName=$packageName, className=$className, lastExternalForegroundPackage=$lastExternalForegroundPackage"
        )

        if (isOverlayShowing) {
            Log.d(TAG, "Blocking overlay already active for target=$currentBlockedTargetPackage")
            return
        }

        blockingOverlayManager.showOverlay()
        isOverlayShowing = true
    }

    private fun hideOverlay() {
        if (!::blockingOverlayManager.isInitialized || !isOverlayShowing) {
            return
        }

        blockingOverlayManager.hideOverlay()
        isOverlayShowing = false
    }

    private fun clearBlockingState() {
        hideOverlay()
        currentBlockedTargetPackage = null
        lastExternalForegroundPackage = null
    }

    companion object {
        private const val TAG = "Unplugged"
        private const val BLOCKED_PACKAGE_NAME = "host.exp.exponent"
        private const val SELF_PACKAGE_NAME = "com.unplugged"
    }
}
