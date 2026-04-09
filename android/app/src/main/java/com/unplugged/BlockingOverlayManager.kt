package com.unplugged

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView

class BlockingOverlayManager(context: Context) {
    private val appContext = context.applicationContext
    private val windowManager =
        appContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val mainHandler = Handler(Looper.getMainLooper())

    private var overlayView: View? = null

    fun showOverlay() {
        mainHandler.post {
            if (overlayView != null) {
                Log.d(TAG, "Overlay already showing; skipping duplicate add")
                return@post
            }

            val view = createOverlayView()
            val layoutParams = createLayoutParams()

            windowManager.addView(view, layoutParams)
            overlayView = view

            Log.d(TAG, "Blocking overlay shown")
        }
    }

    fun hideOverlay() {
        mainHandler.post {
            val view = overlayView ?: return@post

            windowManager.removeView(view)
            overlayView = null

            Log.d(TAG, "Blocking overlay hidden")
        }
    }

    private fun createOverlayView(): View {
        val container = FrameLayout(appContext).apply {
            setBackgroundColor(Color.argb(230, 200, 0, 0))
            isClickable = true
            isFocusable = true
        }

        val messageView = TextView(appContext).apply {
            text = "This app is blocked"
            setTextColor(Color.WHITE)
            textSize = 24f
            gravity = Gravity.CENTER
        }

        val messageLayoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )

        container.addView(messageView, messageLayoutParams)
        return container
    }

    private fun createLayoutParams(): WindowManager.LayoutParams {
        return WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
        }
    }

    companion object {
        private const val TAG = "Unplugged"
    }
}
