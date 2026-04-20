package com.unplugged

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class BlockingConfigStoreTest {
    private lateinit var context: Context
    private lateinit var configStore: BlockingConfigStore

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        configStore = BlockingConfigStore(context)
        configStore.clearConfig()
    }

    @After
    fun tearDown() {
        configStore.clearConfig()
    }

    @Test
    fun blockingEnabled_defaultsToFalse() {
        assertFalse(configStore.isBlockingEnabled())
    }

    @Test
    fun setBlockingEnabled_persistsValue() {
        configStore.setBlockingEnabled(true)

        assertTrue(configStore.isBlockingEnabled())
    }

    @Test
    fun setBlockedPackages_persistsExactPackageSet() {
        val blockedPackages = linkedSetOf(
            "com.instagram.android",
            "com.google.android.youtube"
        )

        configStore.setBlockedPackages(blockedPackages)

        assertEquals(blockedPackages, configStore.getBlockedPackages())
    }

    @Test
    fun clearConfig_resetsEnabledFlagAndBlockedPackages() {
        configStore.setBlockingEnabled(true)
        configStore.setBlockedPackages(setOf("com.instagram.android"))

        configStore.clearConfig()

        assertFalse(configStore.isBlockingEnabled())
        assertTrue(configStore.getBlockedPackages().isEmpty())
    }
}
