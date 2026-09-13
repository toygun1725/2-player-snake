package com.twoplayersnake.app.ui

import android.os.Bundle
import android.content.pm.ActivityInfo
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import com.twoplayersnake.app.databinding.ActivitySettingsBinding
import com.twoplayersnake.app.prefs.AppPreferences

class SettingsActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySettingsBinding
    private lateinit var preferences: AppPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        applyMobileOrientationLock()
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        preferences = AppPreferences(this)

        binding.toolbar.setNavigationOnClickListener { finish() }
        binding.vibrationSwitch.isChecked = preferences.vibrationEnabled
        binding.soundSwitch.isChecked = preferences.soundEnabled

        binding.vibrationSwitch.setOnCheckedChangeListener { _, isChecked ->
            preferences.vibrationEnabled = isChecked
        }

        binding.soundSwitch.setOnCheckedChangeListener { _, isChecked ->
            preferences.soundEnabled = isChecked
        }
    }

    private fun applyMobileOrientationLock() {
        val pm = packageManager
        val isPlayGamesPc =
            pm.hasSystemFeature("com.google.android.play.feature.HPE_EXPERIENCE") ||
                pm.hasSystemFeature("android.hardware.type.pc")
        if (!isPlayGamesPc) {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
    }
}
