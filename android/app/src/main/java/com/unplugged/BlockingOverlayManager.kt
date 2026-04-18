package com.unplugged

import android.os.Build
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView

class BlockingOverlayManager(
    context: Context,
    private val onExitClicked: () -> Unit
) {
    private val appContext = context.applicationContext
    private val windowManager =
        appContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val mainHandler = Handler(Looper.getMainLooper())

    private var overlayView: View? = null
    private val shrikhandTypeface: Typeface by lazy { loadShrikhandTypeface() }

    fun showOverlay() {
        runOnMainThread {
            if (overlayView != null) {
                return@runOnMainThread
            }

            try {
                val view = createOverlayView()
                val layoutParams = createLayoutParams()

                windowManager.addView(view, layoutParams)
                overlayView = view

                Log.d(TAG, "Blocking overlay shown")
            } catch (error: Exception) {
                Log.e(TAG, "Failed to show blocking overlay", error)
            }
        }
    }

    fun hideOverlay() {
        runOnMainThread {
            val view = overlayView ?: return@runOnMainThread

            try {
                windowManager.removeView(view)
                Log.d(TAG, "Blocking overlay hidden")
            } catch (error: Exception) {
                Log.e(TAG, "Failed to hide blocking overlay", error)
            } finally {
                overlayView = null
            }
        }
    }

    private inline fun runOnMainThread(crossinline action: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            action()
            return
        }

        mainHandler.post {
            action()
        }
    }

    private fun createOverlayView(): View {
        val metrics = appContext.resources.displayMetrics
        val layoutSpec = createLayoutSpec(metrics.widthPixels, metrics.heightPixels)

        val container = FrameLayout(appContext).apply {
            setBackgroundColor(PRIMARY_COLOR)
            isClickable = true
            isFocusable = true
            fitsSystemWindows = false
            setPadding(0, 0, 0, 0)
            systemUiVisibility =
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        }

        val logoBadge = createLogoBadge(layoutSpec)
        val blockedView = createBlockedTitleView()
        val wordmarkView = createWordmarkView()
        val subtitleView = createSubtitleView()
        val actionButton = createActionButton()

        container.addView(
            logoBadge,
            FrameLayout.LayoutParams(layoutSpec.logoBadgeSize, layoutSpec.logoBadgeSize).apply {
                gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                topMargin = layoutSpec.logoTop
            }
        )
        container.addView(
            blockedView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                topMargin = layoutSpec.titleTop
                marginStart = layoutSpec.horizontalMargin
                marginEnd = layoutSpec.horizontalMargin
            }
        )
        container.addView(
            wordmarkView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                topMargin = layoutSpec.wordmarkTop
                marginStart = layoutSpec.horizontalMargin
                marginEnd = layoutSpec.horizontalMargin
            }
        )
        container.addView(
            subtitleView,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                topMargin = layoutSpec.messageTop
                marginStart = layoutSpec.messageHorizontalMargin
                marginEnd = layoutSpec.messageHorizontalMargin
            }
        )
        container.addView(
            actionButton,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                marginStart = layoutSpec.horizontalMargin
                marginEnd = layoutSpec.horizontalMargin
                bottomMargin = layoutSpec.buttonBottom
            }
        )

        return container
    }

    private fun createLogoBadge(layoutSpec: OverlayLayoutSpec): View {
        val logoBadge = FrameLayout(appContext).apply {
            background =
                GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(LOGO_BADGE_COLOR)
                }
        }

        val logoView = ImageView(appContext).apply {
            setImageResource(R.drawable.unplugged_logo)
            scaleType = ImageView.ScaleType.FIT_CENTER
            translationY = layoutSpec.logoImageTranslationY.toFloat()
        }

        logoBadge.addView(
            logoView,
            FrameLayout.LayoutParams(layoutSpec.logoImageSize, layoutSpec.logoImageSize).apply {
                gravity = Gravity.CENTER
            }
        )

        return logoBadge
    }

    private fun createBlockedTitleView(): TextView {
        return TextView(appContext).apply {
            text = BLOCKED_TITLE_TEXT
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            textSize = BLOCKED_TITLE_TEXT_SIZE_SP
            typeface = Typeface.create("Verdana", Typeface.BOLD)
            letterSpacing = BLOCKED_TITLE_LETTER_SPACING
        }
    }

    private fun createWordmarkView(): TextView {
        return TextView(appContext).apply {
            text = WORDMARK_TEXT
            gravity = Gravity.CENTER
            setTextColor(LIGHT_ACCENT_COLOR)
            textSize = WORDMARK_TEXT_SIZE_SP
            typeface = shrikhandTypeface
        }
    }

    private fun createSubtitleView(): TextView {
        return TextView(appContext).apply {
            text = MESSAGE_TEXT
            gravity = Gravity.CENTER
            setTextColor(LIGHT_ACCENT_COLOR)
            textSize = MESSAGE_TEXT_SIZE_SP
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            setLineSpacing(dp(MESSAGE_LINE_SPACING_DP).toFloat(), 1f)
        }
    }

    private fun createActionButton(): TextView {
        return TextView(appContext).apply {
            text = ACTION_TEXT
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            textSize = ACTION_TEXT_SIZE_SP
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            setPadding(
                dp(ACTION_HORIZONTAL_PADDING_DP),
                dp(ACTION_VERTICAL_PADDING_DP),
                dp(ACTION_HORIZONTAL_PADDING_DP),
                dp(ACTION_VERTICAL_PADDING_DP)
            )
            minWidth = dp(ACTION_MIN_WIDTH_DP)
            background =
                GradientDrawable().apply {
                    shape = GradientDrawable.RECTANGLE
                    cornerRadius = dp(ACTION_CORNER_RADIUS_DP).toFloat()
                    setColor(BUTTON_COLOR)
                }
            isClickable = true
            isFocusable = true
            setOnClickListener {
                onExitClicked()
            }
        }
    }

    private fun createLayoutSpec(screenWidth: Int, screenHeight: Int): OverlayLayoutSpec {
        val base = minOf(screenWidth, screenHeight)
        val horizontalMargin = dp(HORIZONTAL_MARGIN_DP)
        val messageHorizontalMargin = dp(MESSAGE_HORIZONTAL_MARGIN_DP)

        return OverlayLayoutSpec(
            logoBadgeSize = (base * LOGO_BADGE_SIZE_RATIO).toInt(),
            logoImageSize = (base * LOGO_IMAGE_SIZE_RATIO).toInt(),
            logoImageTranslationY = dp(LOGO_IMAGE_TRANSLATION_Y_DP),
            logoTop = (screenHeight * LOGO_TOP_RATIO).toInt(),
            titleTop = (screenHeight * TITLE_TOP_RATIO).toInt(),
            wordmarkTop = (screenHeight * WORDMARK_TOP_RATIO).toInt(),
            messageTop = (screenHeight * MESSAGE_TOP_RATIO).toInt(),
            buttonBottom = (screenHeight * BUTTON_BOTTOM_RATIO).toInt(),
            horizontalMargin = horizontalMargin,
            messageHorizontalMargin = messageHorizontalMargin
        )
    }

    private fun loadShrikhandTypeface(): Typeface {
        return try {
            Typeface.createFromAsset(appContext.assets, "fonts/Shrikhand.ttf")
        } catch (error: Exception) {
            Log.w(TAG, "Failed to load Shrikhand font asset, falling back to serif", error)
            Typeface.create(Typeface.SERIF, Typeface.BOLD)
        }
    }

    private fun dp(value: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            value.toFloat(),
            appContext.resources.displayMetrics
        ).toInt()
    }

    private fun createLayoutParams(): WindowManager.LayoutParams {
        return WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        )
            .apply {
            gravity = Gravity.TOP or Gravity.START
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        }
    }

    companion object {
        private const val TAG = "Unplugged"
        private const val WORDMARK_TEXT = "unplugged"
        private const val BLOCKED_TITLE_TEXT = "App Blocked"
        private const val MESSAGE_TEXT = "Stay unplugged a little longer. This app can wait."
        private const val ACTION_TEXT = "Close"

        private const val PRIMARY_COLOR = 0xFF426B69.toInt()
        private const val LIGHT_ACCENT_COLOR = 0xFFB5CA8D.toInt()
        private const val BUTTON_COLOR = 0xFF222E50.toInt()
        private const val LOGO_BADGE_COLOR = 0xFFF0F0F0.toInt()

        private const val LOGO_BADGE_SIZE_RATIO = 0.32f
        private const val LOGO_IMAGE_SIZE_RATIO = 0.61f
        private const val LOGO_TOP_RATIO = 0.085f
        private const val TITLE_TOP_RATIO = 0.39f
        private const val WORDMARK_TOP_RATIO = 0.255f
        private const val MESSAGE_TOP_RATIO = 0.69f
        private const val BUTTON_BOTTOM_RATIO = 0.085f

        private const val HORIZONTAL_MARGIN_DP = 32
        private const val MESSAGE_HORIZONTAL_MARGIN_DP = 36
        private const val LOGO_IMAGE_TRANSLATION_Y_DP = 1
        private const val MESSAGE_LINE_SPACING_DP = 8
        private const val ACTION_HORIZONTAL_PADDING_DP = 18
        private const val ACTION_VERTICAL_PADDING_DP = 24
        private const val ACTION_MIN_WIDTH_DP = 180
        private const val ACTION_CORNER_RADIUS_DP = 24

        private const val WORDMARK_TEXT_SIZE_SP = 40f
        private const val BLOCKED_TITLE_TEXT_SIZE_SP = 38f
        private const val MESSAGE_TEXT_SIZE_SP = 19f
        private const val ACTION_TEXT_SIZE_SP = 18f
        private const val BLOCKED_TITLE_LETTER_SPACING = 0.02f
    }

    private data class OverlayLayoutSpec(
        val logoBadgeSize: Int,
        val logoImageSize: Int,
        val logoImageTranslationY: Int,
        val logoTop: Int,
        val titleTop: Int,
        val wordmarkTop: Int,
        val messageTop: Int,
        val buttonBottom: Int,
        val horizontalMargin: Int,
        val messageHorizontalMargin: Int
    )
}
