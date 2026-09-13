package com.twoplayersnake.app.prefs

import android.content.Context

class AppPreferences(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var vibrationEnabled: Boolean
        get() = prefs.getBoolean(KEY_VIBRATION_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_VIBRATION_ENABLED, value).apply()

    var soundEnabled: Boolean
        get() = prefs.getBoolean(KEY_SOUND_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_SOUND_ENABLED, value).apply()

    var appLaunchCount: Int
        get() = prefs.getInt(KEY_APP_LAUNCH_COUNT, 0)
        set(value) = prefs.edit().putInt(KEY_APP_LAUNCH_COUNT, value).apply()

    var ratingFlowCompleted: Boolean
        get() = prefs.getBoolean(KEY_RATING_FLOW_COMPLETED, false)
        set(value) = prefs.edit().putBoolean(KEY_RATING_FLOW_COMPLETED, value).apply()

    var adsRemoved: Boolean
        get() = prefs.getBoolean(KEY_ADS_REMOVED, false)
        set(value) = prefs.edit().putBoolean(KEY_ADS_REMOVED, value).apply()

    // v3.3.1
    var lastPlayedAt: Long
        get() = prefs.getLong(KEY_LAST_PLAYED_AT, 0L)
        set(value) = prefs.edit().putLong(KEY_LAST_PLAYED_AT, value).apply()

    var notificationPermissionAsked: Boolean
        get() = prefs.getBoolean(KEY_NOTIFICATION_PERMISSION_ASKED, false)
        set(value) = prefs.edit().putBoolean(KEY_NOTIFICATION_PERMISSION_ASKED, value).apply()

    // v3.3.2 — Cloud Save: bu oturumda cloud verisi yüklendi mi?
    var cloudSaveLoaded: Boolean
        get() = prefs.getBoolean(KEY_CLOUD_SAVE_LOADED, false)
        set(value) = prefs.edit().putBoolean(KEY_CLOUD_SAVE_LOADED, value).apply()

    companion object {
        private const val PREFS_NAME = "two_player_snake_prefs"
        private const val KEY_VIBRATION_ENABLED = "vibration_enabled"
        private const val KEY_SOUND_ENABLED = "sound_enabled"
        private const val KEY_APP_LAUNCH_COUNT = "app_launch_count"
        private const val KEY_RATING_FLOW_COMPLETED = "rating_flow_completed"
        private const val KEY_ADS_REMOVED = "ads_removed"
        // v3.3.1
        private const val KEY_LAST_PLAYED_AT = "last_played_at"
        private const val KEY_NOTIFICATION_PERMISSION_ASKED = "notification_permission_asked"
        // v3.3.2
        private const val KEY_CLOUD_SAVE_LOADED = "cloud_save_loaded"
    }
}

