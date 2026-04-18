package com.unplugged

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class UnpluggedPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules = mutableListOf<NativeModule>()
        modules.add(AppSelectionModule(reactContext))
        modules.add(BlockingConfigModule(reactContext))
        modules.add(PermissionSettingsModule(reactContext))
        modules.add(UsageStatsModule(reactContext))
        return modules
    }

    override fun createViewManagers(
            reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
