package com.unplugged

import android.accessibilityservice.AccessibilityService
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class MyAccessibilityService : AccessibilityService() {
    private lateinit var blockingConfigStore: BlockingConfigStore
    private lateinit var blockingOverlayManager: BlockingOverlayManager
    private var cachedBlockingEnabled = false
    private var cachedBlockedPackages: Set<String> = emptySet()
    private var blockingState = BlockingState.IDLE
    private var blockedTargetPackage: String? = null
    private var cooldownSuppressedPackage: String? = null
    private var lastExitedBlockedPackage: String? = null
    private var lastExitCompletedAtMs = 0L
    private var lastProcessedPackage: String? = null
    private var stateGeneration = 0
    private var blockConfirmationGeneration = 0
    private var lastLoggedConfigSnapshot: String? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private val configChangeListener =
        SharedPreferences.OnSharedPreferenceChangeListener { _, _ ->
            refreshConfig("SharedPreferences change")
            reconcileActiveBlockWithConfig("SharedPreferences change")
        }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "SERVICE connected")
        blockingConfigStore = BlockingConfigStore(this)
        blockingOverlayManager = BlockingOverlayManager(this) {
            handleOverlayExitRequest()
        }
        refreshConfig("service connected")
        blockingConfigStore.registerChangeListener(configChangeListener)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        val packageName = event.packageName?.toString().orEmpty()
        val className = event.className?.toString().orEmpty()

        if (packageName.isEmpty()) {
            return
        }

        refreshConfig("package event for $packageName")
        reconcileActiveBlockWithConfig("package event for $packageName")

        if (packageName == lastProcessedPackage) {
            return
        }

        lastProcessedPackage = packageName
        Log.d(TAG, "EVENT pkg=$packageName state=$blockingState block=${shouldBlockPackage(packageName)}")

        if (isSelfPackage(packageName)) {
            return
        }

        when (blockingState) {
            BlockingState.IDLE -> handleIdleEvent(packageName, className)
            BlockingState.BLOCKING_ACTIVE -> handleBlockingActiveEvent(packageName)
            BlockingState.EXIT_REQUESTED -> {
                return
            }
            BlockingState.EXIT_TRANSITIONING -> handleExitTransitionEvent(packageName)
            BlockingState.COOLDOWN -> handleCooldownEvent(packageName, className)
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "SERVICE interrupted")
        resetBlockingFlow("Accessibility service interrupted")
    }

    override fun onDestroy() {
        if (::blockingConfigStore.isInitialized) {
            blockingConfigStore.unregisterChangeListener(configChangeListener)
        }
        Log.d(TAG, "SERVICE destroyed")
        resetBlockingFlow("Accessibility service destroyed")
        super.onDestroy()
    }

    private fun handleIdleEvent(packageName: String, className: String) {
        if (isAmbiguousTransitionPackage(packageName)) {
            return
        }

        if (!shouldBlockPackage(packageName)) {
            clearPostExitGuardForTrustedPackage(packageName)
            return
        }

        if (shouldConfirmBlockedPackageAfterExit(packageName)) {
            scheduleBlockedPackageConfirmation(
                packageName = packageName,
                className = className,
                reason = "Confirmed blocked package after recent exit"
            )
            return
        }

        startBlockingSession(
            packageName = packageName,
            className = className,
            reason = "Blocked package detected while idle"
        )
    }

    private fun handleBlockingActiveEvent(packageName: String) {
        if (isAmbiguousTransitionPackage(packageName)) {
            return
        }

        if (isBlockedPackage(packageName)) {
            return
        }
    }

    private fun handleExitTransitionEvent(packageName: String) {
        val targetPackage = blockedTargetPackage
        if (targetPackage == null) {
            return
        }

        if (packageName == targetPackage) {
            return
        }

        Log.d(TAG, "EXIT observedHome pkg=$packageName target=$targetPackage")
        completeExitTransitionIfCurrent(
            expectedGeneration = stateGeneration,
            exitedPackage = targetPackage,
            completionReason = "Observed post-HOME package=$packageName"
        )
    }

    private fun handleCooldownEvent(packageName: String, className: String) {
        if (packageName == cooldownSuppressedPackage) {
            scheduleBlockedPackageConfirmation(
                packageName = packageName,
                className = className,
                reason = "Confirmed blocked package during cooldown"
            )
            return
        }

        if (isAmbiguousTransitionPackage(packageName)) {
            return
        }

        if (!shouldBlockPackage(packageName)) {
            return
        }

        startBlockingSession(
            packageName = packageName,
            className = className,
            reason = "Blocked package detected during cooldown"
        )
    }

    private fun startBlockingSession(packageName: String, className: String, reason: String) {
        cancelPendingBlockConfirmation()
        blockedTargetPackage = packageName
        cooldownSuppressedPackage = null
        lastExitedBlockedPackage = null
        lastExitCompletedAtMs = 0L
        Log.d(TAG, "BLOCK start pkg=$packageName reason=$reason")

        transitionTo(
            BlockingState.BLOCKING_ACTIVE,
            "$reason: packageName=$packageName, className=$className"
        )
        blockingOverlayManager.showOverlay()
    }

    private fun refreshConfig(reason: String) {
        if (!::blockingConfigStore.isInitialized) {
            return
        }

        cachedBlockingEnabled = blockingConfigStore.isBlockingEnabled()
        cachedBlockedPackages = blockingConfigStore.getBlockedPackages()

        val configSnapshot =
            "enabled=$cachedBlockingEnabled, blockedPackages=${cachedBlockedPackages.toList().sorted()}"
        val shouldAlwaysLog = !reason.startsWith("package event")
        if (shouldAlwaysLog || configSnapshot != lastLoggedConfigSnapshot) {
            Log.d(TAG, "CFG snapshot $configSnapshot")
            lastLoggedConfigSnapshot = configSnapshot
        }
    }

    private fun reconcileActiveBlockWithConfig(reason: String) {
        if (!cachedBlockingEnabled) {
            if (blockingState != BlockingState.IDLE) {
                resetBlockingFlow("Released due to disabled config; reason=$reason")
            }
            return
        }

        val targetPackage = blockedTargetPackage ?: return
        if (targetPackage !in cachedBlockedPackages) {
            resetBlockingFlow(
                "Released because blocked target was removed from config; reason=$reason; blockedTargetPackage=$targetPackage"
            )
        }
    }

    private fun shouldConfirmBlockedPackageAfterExit(packageName: String): Boolean {
        val exitedPackage = lastExitedBlockedPackage ?: return false
        if (packageName != exitedPackage) {
            return false
        }

        return SystemClock.uptimeMillis() - lastExitCompletedAtMs <= POST_EXIT_REBLOCK_GUARD_MS
    }

    private fun scheduleBlockedPackageConfirmation(
        packageName: String,
        className: String,
        reason: String
    ) {
        blockConfirmationGeneration += 1
        val confirmationGeneration = blockConfirmationGeneration

        Log.d(TAG, "REBLOCK pending pkg=$packageName")

        mainHandler.postDelayed(
            {
                confirmBlockedPackageIfCurrent(
                    confirmationGeneration = confirmationGeneration,
                    packageName = packageName,
                    className = className,
                    reason = reason
                )
            },
            BLOCK_CONFIRMATION_DELAY_MS
        )
    }

    private fun confirmBlockedPackageIfCurrent(
        confirmationGeneration: Int,
        packageName: String,
        className: String,
        reason: String
    ) {
        if (
            (blockingState != BlockingState.IDLE && blockingState != BlockingState.COOLDOWN) ||
            confirmationGeneration != blockConfirmationGeneration
        ) {
            return
        }

        val activePackage = rootInActiveWindow?.packageName?.toString().orEmpty()
        if (activePackage == packageName) {
            startBlockingSession(
                packageName = packageName,
                className = className,
                reason = reason
            )
            return
        }

        Log.d(TAG, "REBLOCK cancelled pkg=$packageName active=$activePackage")
        lastProcessedPackage = null

        if (
            activePackage.isNotEmpty() &&
            !isSelfPackage(activePackage) &&
            !isAmbiguousTransitionPackage(activePackage)
        ) {
            clearPostExitGuardForTrustedPackage(activePackage)
        }
    }

    private fun handleOverlayExitRequest() {
        if (blockingState != BlockingState.BLOCKING_ACTIVE) {
            Log.d(TAG, "EXIT ignored state=$blockingState")
            return
        }

        val targetPackage = blockedTargetPackage
        if (targetPackage == null) {
            Log.d(TAG, "EXIT ignored noTarget")
            return
        }

        Log.d(TAG, "EXIT requested target=$targetPackage")

        transitionTo(
            BlockingState.EXIT_REQUESTED,
            "Overlay close pressed for blockedTargetPackage=$targetPackage"
        )

        val homeStarted = performGlobalAction(GLOBAL_ACTION_HOME)
        Log.d(TAG, "EXIT home success=$homeStarted target=$targetPackage")
        if (!homeStarted) {
            transitionTo(
                BlockingState.BLOCKING_ACTIVE,
                "HOME action failed; remaining blocked for blockedTargetPackage=$targetPackage"
            )
            return
        }

        transitionTo(
            BlockingState.EXIT_TRANSITIONING,
            "HOME action accepted for blockedTargetPackage=$targetPackage"
        )

        val transitionGeneration = stateGeneration
        mainHandler.postDelayed(
            {
                completeExitTransitionFromTimeoutIfCurrent(transitionGeneration, targetPackage)
            },
            EXIT_TRANSITION_TIMEOUT_MS
        )
    }

    private fun completeExitTransitionFromTimeoutIfCurrent(
        expectedGeneration: Int,
        exitedPackage: String
    ) {
        completeExitTransitionIfCurrent(
            expectedGeneration = expectedGeneration,
            exitedPackage = exitedPackage,
            completionReason = "Exit transition timeout reached"
        )
    }

    private fun completeExitTransitionIfCurrent(
        expectedGeneration: Int,
        exitedPackage: String,
        completionReason: String
    ) {
        if (
            blockingState != BlockingState.EXIT_TRANSITIONING ||
            stateGeneration != expectedGeneration
        ) {
            return
        }

        Log.d(TAG, "EXIT complete pkg=$exitedPackage reason=$completionReason")
        blockingOverlayManager.hideOverlay()
        blockedTargetPackage = null
        cooldownSuppressedPackage = exitedPackage
        lastExitedBlockedPackage = exitedPackage
        lastExitCompletedAtMs = SystemClock.uptimeMillis()
        lastProcessedPackage = null

        transitionTo(
            BlockingState.COOLDOWN,
            "Controlled exit completed for blockedTargetPackage=$exitedPackage; reason=$completionReason"
        )

        val cooldownGeneration = stateGeneration
        mainHandler.postDelayed(
            {
                finishCooldownIfCurrent(cooldownGeneration)
            },
            COOLDOWN_DURATION_MS
        )
    }

    private fun finishCooldownIfCurrent(expectedGeneration: Int) {
        if (blockingState != BlockingState.COOLDOWN || stateGeneration != expectedGeneration) {
            return
        }

        cooldownSuppressedPackage = null
        lastProcessedPackage = null
        transitionTo(BlockingState.IDLE, "Cooldown finished")
    }

    private fun resetBlockingFlow(reason: String) {
        stateGeneration += 1
        cancelPendingBlockConfirmation()
        blockedTargetPackage = null
        cooldownSuppressedPackage = null
        lastExitedBlockedPackage = null
        lastExitCompletedAtMs = 0L
        lastProcessedPackage = null

        if (::blockingOverlayManager.isInitialized) {
            blockingOverlayManager.hideOverlay()
        }

        if (blockingState == BlockingState.IDLE) {
            return
        }

        val previousState = blockingState
        blockingState = BlockingState.IDLE
        Log.d(TAG, "STATE $previousState -> ${BlockingState.IDLE} reason=$reason")
    }

    private fun transitionTo(newState: BlockingState, reason: String) {
        if (blockingState == newState) {
            return
        }

        val previousState = blockingState
        blockingState = newState
        stateGeneration += 1
        Log.d(
            TAG,
            "STATE $previousState -> $newState target=$blockedTargetPackage cooldown=$cooldownSuppressedPackage reason=$reason"
        )
    }

    private fun cancelPendingBlockConfirmation() {
        blockConfirmationGeneration += 1
    }

    private fun clearPostExitGuardForTrustedPackage(packageName: String) {
        if (lastExitedBlockedPackage == null) {
            return
        }

        Log.d(TAG, "REBLOCK cleared trustedPkg=$packageName lastExit=$lastExitedBlockedPackage")
        lastExitedBlockedPackage = null
        lastExitCompletedAtMs = 0L
        cancelPendingBlockConfirmation()
    }

    private fun isSelfPackage(packageName: String): Boolean {
        return packageName == SELF_PACKAGE_NAME
    }

    private fun isBlockedPackage(packageName: String): Boolean {
        return packageName in cachedBlockedPackages
    }

    private fun shouldBlockPackage(packageName: String): Boolean {
        return cachedBlockingEnabled && isBlockedPackage(packageName)
    }

    private fun isAmbiguousTransitionPackage(packageName: String): Boolean {
        return packageName in AMBIGUOUS_TRANSITION_PACKAGES ||
            packageName.contains("launcher") ||
            packageName.contains("quickstep") ||
            packageName.contains("systemui") ||
            packageName.contains("trebuchet")
    }

    companion object {
        private const val TAG = "Unplugged"
        private const val SELF_PACKAGE_NAME = "com.unplugged"
        private const val EXIT_TRANSITION_TIMEOUT_MS = 1500L
        private const val COOLDOWN_DURATION_MS = 1000L
        private const val POST_EXIT_REBLOCK_GUARD_MS = 3000L
        private const val BLOCK_CONFIRMATION_DELAY_MS = 250L
        private val AMBIGUOUS_TRANSITION_PACKAGES = setOf(
            "com.android.launcher",
            "com.android.launcher3",
            "com.google.android.apps.nexuslauncher",
            "com.miui.home",
            "com.sec.android.app.launcher",
            "com.android.systemui"
        )
    }

    private enum class BlockingState {
        IDLE,
        BLOCKING_ACTIVE,
        EXIT_REQUESTED,
        EXIT_TRANSITIONING,
        COOLDOWN
    }
}
