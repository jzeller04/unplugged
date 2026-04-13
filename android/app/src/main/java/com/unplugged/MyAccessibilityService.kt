package com.unplugged

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class MyAccessibilityService : AccessibilityService() {
    private lateinit var blockingOverlayManager: BlockingOverlayManager
    private var blockedTargetPackage: String? = null
    private var isOverlayShowing = false
    private var lastProcessedPackage: String? = null
    private var lastMeaningfulExternalPackage: String? = null
    private var isExitInProgress = false

    override fun onServiceConnected() {
        super.onServiceConnected()
        blockingOverlayManager = BlockingOverlayManager(this) {
            handleOverlayExitRequest()
        }
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

        if (packageName == lastProcessedPackage) {
            Log.d(TAG, "Skipping duplicate package event: packageName=$packageName")
            return
        }

        lastProcessedPackage = packageName

        if (isExitInProgress) {
            Log.d(TAG, "Ignoring accessibility event during controlled exit: packageName=$packageName")
            return
        }

        if (isSelfPackage(packageName)) {
            Log.d(
                TAG,
                "Ignoring self package event for unblock decisions: packageName=$packageName, blockedTargetPackage=$blockedTargetPackage"
            )
            return
        }

        if (packageName == BLOCKED_PACKAGE_NAME) {
            lastMeaningfulExternalPackage = packageName
            triggerBlockingForPackage(packageName, className)
            return
        }

        if (isAmbiguousTransitionPackage(packageName)) {
            Log.d(
                TAG,
                "Ignoring ambiguous transition package for unblock decisions: packageName=$packageName, blockedTargetPackage=$blockedTargetPackage"
            )
            return
        }

        if (blockedTargetPackage != null) {
            Log.d(
                TAG,
                "Keeping strict block latched despite trusted external package change: packageName=$packageName, blockedTargetPackage=$blockedTargetPackage"
            )
            return
        }

        lastMeaningfulExternalPackage = packageName
    }

    override fun onInterrupt() {
        resetBlockingState()
    }

    override fun onDestroy() {
        resetBlockingState()
        super.onDestroy()
    }

    private fun triggerBlockingForPackage(packageName: String, className: String) {
        blockedTargetPackage = packageName

        Log.d(
            TAG,
            "Blocking trigger entered: packageName=$packageName, className=$className, lastMeaningfulExternalPackage=$lastMeaningfulExternalPackage"
        )

        if (isOverlayShowing) {
            Log.d(TAG, "Blocking overlay already active for target=$blockedTargetPackage")
            return
        }

        blockingOverlayManager.showOverlay()
        isOverlayShowing = true
    }

    private fun handleOverlayExitRequest() {
        if (isExitInProgress) {
            Log.d(TAG, "Ignoring overlay exit request because exit is already in progress")
            return
        }

        if (blockedTargetPackage == null) {
            Log.d(TAG, "Ignoring overlay exit request because no blocked target is latched")
            return
        }

        isExitInProgress = true
        Log.d(TAG, "Starting controlled exit for blockedTargetPackage=$blockedTargetPackage")

        val homeStarted = performGlobalAction(GLOBAL_ACTION_HOME)
        if (!homeStarted) {
            Log.d(TAG, "Home action failed; remaining in strict blocking mode")
            isExitInProgress = false
            return
        }

        Log.d(TAG, "Home action started successfully; clearing latched blocking state")
        clearBlockingStateAfterSuccessfulExit()
    }

    private fun hideOverlay() {
        if (!::blockingOverlayManager.isInitialized || !isOverlayShowing) {
            return
        }

        blockingOverlayManager.hideOverlay()
        isOverlayShowing = false
    }

    private fun clearBlockingStateAfterSuccessfulExit() {
        hideOverlay()
        blockedTargetPackage = null
        lastMeaningfulExternalPackage = null
        isExitInProgress = false
    }

    private fun resetBlockingState() {
        hideOverlay()
        blockedTargetPackage = null
        lastMeaningfulExternalPackage = null
        lastProcessedPackage = null
        isExitInProgress = false
    }

    private fun isSelfPackage(packageName: String): Boolean {
        return packageName == SELF_PACKAGE_NAME
    }

    private fun isAmbiguousTransitionPackage(packageName: String): Boolean {
        if (blockedTargetPackage == null) {
            return false
        }

        return packageName in AMBIGUOUS_TRANSITION_PACKAGES ||
            packageName.contains("launcher") ||
            packageName.contains("quickstep") ||
            packageName.contains("systemui") ||
            packageName.contains("trebuchet")
    }

    companion object {
        private const val TAG = "Unplugged"
        private const val BLOCKED_PACKAGE_NAME = "host.exp.exponent"
        private const val SELF_PACKAGE_NAME = "com.unplugged"
        private val AMBIGUOUS_TRANSITION_PACKAGES = setOf(
            "com.android.launcher",
            "com.android.launcher3",
            "com.google.android.apps.nexuslauncher",
            "com.miui.home",
            "com.sec.android.app.launcher",
            "com.android.systemui"
        )
    }
}
