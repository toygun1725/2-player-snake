package com.twoplayersnake.app.bridge

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.webkit.JavascriptInterface
import com.twoplayersnake.app.prefs.AppPreferences
import com.twoplayersnake.app.cloud.CloudSaveManager
import org.json.JSONObject
import com.google.android.gms.games.PlayGames

class GameJavascriptBridge(
    private val context: Context,
    private val preferences: AppPreferences,
    private val isTrustedPage: () -> Boolean,
    private val onAdRequest: (type: String, adConfigId: String?) -> Unit,
    private val onReviewRequest: () -> Unit = {},
    private val onBuyRemoveAds: () -> Unit = {},
    private val onRestorePurchases: () -> Unit = {},
    // v3.3.2 — Native PGS ekranı açılamazsa HTML fallback tetiklenir
    private val onShowAchievementsFailed: () -> Unit = {}
) {
    private val achievementMap = mapOf(
        "ACH_FIRST_FOOD" to "CgkInayM2KgMEAIQCw",
        "ACH_AI_HUNTER" to "CgkInayM2KgMEAIQCA",
        "ACH_STUBBORN_SURVIVOR" to "CgkInayM2KgMEAIQDA",
        "ACH_RAINBOW_POWER" to "CgkInayM2KgMEAIQAw",
        "ACH_GIANT_SNAKE" to "CgkInayM2KgMEAIQBA",
        "ACH_ZERO_ERROR" to "CgkInayM2KgMEAIQDQ",
        "ACH_FEARLESS" to "CgkInayM2KgMEAIQBQ",
        "ACH_DIMENSION_TRAVELER" to "CgkInayM2KgMEAIQDw",
        "ACH_ROBOT_TAMER" to "CgkInayM2KgMEAIQAQ",
        "ACH_LAST_SECOND_HERO" to "CgkInayM2KgMEAIQCQ",
        "ACH_GREAT_COMEBACK" to "CgkInayM2KgMEAIQBg",
        "ACH_NO_DRAW" to "CgkInayM2KgMEAIQAg",
        "ACH_GHOST_PASS" to "CgkInayM2KgMEAIQBw",
        "ACH_LIGHTNING_REFLEX" to "CgkInayM2KgMEAIQDg",
        "ACH_ADVENTURE_COMPLETE" to "CgkInayM2KgMEAIQCg"
    )
    private val vibrator: Vibrator? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            context.getSystemService(VibratorManager::class.java)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

    @JavascriptInterface
    fun onEatFood(payload: String?) {
        if (!isCallAllowed()) return
        vibrate(18L)
        logEvent("eat_food", payload)
    }

    @JavascriptInterface
    fun onGameStart(payload: String?) {
        if (!isCallAllowed()) return
        logEvent("game_start", payload)
    }

    @JavascriptInterface
    fun onCollision(payload: String?) {
        if (!isCallAllowed()) return
        vibrate(40L)
        logEvent("collision", payload)
    }

    @JavascriptInterface
    fun onGameOver(payload: String?) {
        if (!isCallAllowed()) return
        vibrate(40L)
        logEvent("game_over", payload)
    }

    @JavascriptInterface
    fun adBreak(payload: String?) {
        if (!isCallAllowed() || payload.isNullOrBlank()) return
        runCatching {
            val config = JSONObject(payload)
            val type = config.optString("type", "next")
            val id = config.optString("callbackId", config.optString("adBreakDone", ""))
            Log.d(TAG, "adBreak requested: type=$type callbackId=$id")
            onAdRequest(type, id)
        }.onFailure {
            Log.w(TAG, "Failed to parse adBreak payload", it)
        }
    }

    @JavascriptInterface
    fun unlockAchievement(logicalKey: String?) {
        if (!isCallAllowed() || logicalKey.isNullOrBlank()) return
        val achievementId = achievementMap[logicalKey] ?: run {
            Log.w(TAG, "Achievement key not found: $logicalKey")
            return
        }
        val activity = context as android.app.Activity

        // v3.3.2 — Sign-in güvencesi: SDK hazır olmadan unlock() çağrılırsa sessizce
        // başarısız olabiliyor. Önce giriş durumunu kontrol edip garantiye alıyoruz.
        PlayGames.getGamesSignInClient(activity).isAuthenticated
            .addOnCompleteListener { task ->
                val isAuth = task.isSuccessful && task.result?.isAuthenticated == true
                if (isAuth) {
                    doUnlock(activity, logicalKey, achievementId)
                } else {
                    PlayGames.getGamesSignInClient(activity).signIn()
                        .addOnCompleteListener { signInTask ->
                            if (signInTask.isSuccessful) {
                                doUnlock(activity, logicalKey, achievementId)
                            } else {
                                Log.w(TAG, "Sign-in başarısız, achievement açılamadı: $logicalKey")
                            }
                        }
                }
            }
    }

    private fun doUnlock(activity: android.app.Activity, key: String, id: String) {
        runCatching {
            PlayGames.getAchievementsClient(activity).unlock(id)
            Log.d(TAG, "Achievement buluta gönderildi: $key ($id)")
        }.onFailure {
            Log.e(TAG, "Achievement unlock hatası: $key", it)
        }
    }


    @JavascriptInterface
    fun emit(payload: String?) {
        if (!isCallAllowed() || payload.isNullOrBlank()) return
        runCatching {
            val event = JSONObject(payload)
            when (event.optString("name")) {
                "eatFood" -> onEatFood(event.optJSONObject("payload")?.toString())
                "gameStart" -> onGameStart(event.optJSONObject("payload")?.toString())
                "collision" -> onCollision(event.optJSONObject("payload")?.toString())
                "gameOver" -> onGameOver(event.optJSONObject("payload")?.toString())
                "adBreak" -> adBreak(event.optJSONObject("payload")?.toString())
                "unlockAchievement" -> unlockAchievement(event.optJSONObject("payload")?.optString("key"))
            }
        }.onFailure {
            Log.w(TAG, "Failed to decode bridge payload", it)
        }
    }

    @JavascriptInterface
    fun triggerVibration(durationMs: String?) {
        if (!isCallAllowed() || durationMs.isNullOrBlank()) return
        val duration = durationMs.toLongOrNull() ?: return
        vibrate(duration)
    }

    @JavascriptInterface
    fun requestReview() {
        if (!isCallAllowed()) return
        onReviewRequest()
    }

    @JavascriptInterface
    fun buyRemoveAds() {
        if (!isCallAllowed()) return
        Log.d(TAG, "buyRemoveAds called from WebView")
        onBuyRemoveAds()
    }

    @JavascriptInterface
    fun restorePurchases() {
        if (!isCallAllowed()) return
        Log.d(TAG, "restorePurchases called from WebView")
        onRestorePurchases()
    }

    @JavascriptInterface
    fun isAdsRemoved(): String {
        return preferences.adsRemoved.toString()
    }

    // v3.3.2 — Cloud Save: addHighScore() çağrıldığında HTML bu metodu çağırır
    @JavascriptInterface
    fun notifyHighScore(scoresJson: String?, platform: String?) {
        if (!isCallAllowed() || scoresJson.isNullOrBlank()) return
        val activity = context as android.app.Activity
        val resolvedPlatform = if (platform == "pc") "pc" else "mobile"
        CloudSaveManager.save(
            activity   = activity,
            scoresJson = scoresJson,
            platform   = resolvedPlatform,
            adsRemoved = preferences.adsRemoved
        )
    }

    // v3.3.2 — Sidekick: Ana menüden "Başarımlar" butonuna basınca PGS native ekranı açılır
    // Akış: achievementsIntent direkt dene → başarısız → auth kontrol et →
    //        auth yoksa signIn() → tekrar dene → yine başarısız → HTML fallback
    @JavascriptInterface
    fun showAchievements() {
        if (!isCallAllowed()) return
        val activity = context as android.app.Activity
        // İlk deneme: doğrudan intent al (kullanıcı zaten authenticated ise anında açılır)
        PlayGames.getAchievementsClient(activity)
            .achievementsIntent
            .addOnSuccessListener { intent ->
                activity.runOnUiThread { activity.startActivity(intent) }
            }
            .addOnFailureListener { firstError ->
                Log.w(TAG, "showAchievements: ilk deneme başarısız, auth kontrol ediliyor", firstError)
                // İlk deneme başarısız → authenticated mi kontrol et
                PlayGames.getGamesSignInClient(activity).isAuthenticated
                    .addOnCompleteListener { authTask ->
                        val isAuth = authTask.isSuccessful && authTask.result?.isAuthenticated == true
                        if (isAuth) {
                            // Giriş yapılmış ama intent hata verdi → HTML fallback
                            Log.e(TAG, "showAchievements: giriş yapılmış ama intent alınamadı → HTML fallback")
                            onShowAchievementsFailed()
                        } else {
                            // Giriş yapılmamış → sign-in dene, sonra tekrar intent al
                            PlayGames.getGamesSignInClient(activity).signIn()
                                .addOnCompleteListener { signInTask ->
                                    if (signInTask.isSuccessful) {
                                        doShowAchievements(activity)
                                    } else {
                                        Log.w(TAG, "showAchievements: sign-in başarısız → HTML fallback")
                                        onShowAchievementsFailed()
                                    }
                                }
                        }
                    }
            }
    }

    private fun doShowAchievements(activity: android.app.Activity) {
        // sign-in sonrası ikinci deneme
        PlayGames.getAchievementsClient(activity)
            .achievementsIntent
            .addOnSuccessListener { intent ->
                activity.runOnUiThread { activity.startActivity(intent) }
            }
            .addOnFailureListener {
                Log.e(TAG, "showAchievements: ikinci deneme de başarısız → HTML fallback", it)
                onShowAchievementsFailed()
            }
    }

    private fun isCallAllowed(): Boolean = isTrustedPage()

    private fun vibrate(durationMs: Long) {
        if (!preferences.vibrationEnabled) return
        val target = vibrator ?: return
        if (!target.hasVibrator()) return
        target.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
    }

    private fun logEvent(name: String, payload: String?) {
        Log.d(TAG, "Bridge event: $name payload=$payload")
    }

    private companion object {
        const val TAG = "GameJavascriptBridge"
    }
}
