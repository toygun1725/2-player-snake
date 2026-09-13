package com.twoplayersnake.app.ads

import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

class AdManager(private val activity: Activity) {

    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private var isInitializing = false

    private val handler = Handler(Looper.getMainLooper())
    private var interstitialRetryAttempt = 0
    private var rewardedRetryAttempt = 0
    private val retryDelays = longArrayOf(15000, 30000, 60000, 120000, 300000) // 15s, 30s, 1m, 2m, 5m

    private val interstitialRetryRunnable = Runnable {
        Log.d(TAG, "Retrying to load Interstitial Ad (Attempt ${interstitialRetryAttempt + 1})")
        loadInterstitial()
    }

    private val rewardedRetryRunnable = Runnable {
        Log.d(TAG, "Retrying to load Rewarded Ad (Attempt ${rewardedRetryAttempt + 1})")
        loadRewarded()
    }

    // Production Ad Units
    private val interstitialId = "ca-app-pub-4114535776207741/9558608665"
    private val rewardedId = "ca-app-pub-4114535776207741/3268532483"

    fun initialize() {
        if (isInitializing) return
        isInitializing = true
        
        MobileAds.initialize(activity) {
            Log.d(TAG, "MobileAds Initialized")
            loadInterstitial()
            loadRewarded()
        }
    }

    fun loadInterstitial() {
        handler.removeCallbacks(interstitialRetryRunnable)
        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(activity, interstitialId, adRequest, object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) {
                interstitialAd = ad
                interstitialRetryAttempt = 0
                Log.d(TAG, "Interstitial Ad Loaded")
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                interstitialAd = null
                Log.e(TAG, "Interstitial Failed to Load: ${error.message}")
                scheduleInterstitialRetry()
            }
        })
    }

    fun loadRewarded() {
        handler.removeCallbacks(rewardedRetryRunnable)
        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(activity, rewardedId, adRequest, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) {
                rewardedAd = ad
                rewardedRetryAttempt = 0
                Log.d(TAG, "Rewarded Ad Loaded")
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                rewardedAd = null
                Log.e(TAG, "Rewarded Failed to Load: ${error.message}")
                scheduleRewardedRetry()
            }
        })
    }

    private fun scheduleInterstitialRetry() {
        val delay = retryDelays[interstitialRetryAttempt.coerceAtMost(retryDelays.size - 1)]
        Log.d(TAG, "Scheduling Interstitial Ad retry in ${delay / 1000}s")
        handler.postDelayed(interstitialRetryRunnable, delay)
        interstitialRetryAttempt++
    }

    private fun scheduleRewardedRetry() {
        val delay = retryDelays[rewardedRetryAttempt.coerceAtMost(retryDelays.size - 1)]
        Log.d(TAG, "Scheduling Rewarded Ad retry in ${delay / 1000}s")
        handler.postDelayed(rewardedRetryRunnable, delay)
        rewardedRetryAttempt++
    }

    fun showInterstitial(onDone: () -> Unit) {
        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    Log.d(TAG, "Interstitial Dismissed")
                    onDone()
                    loadInterstitial() // Cache next ad
                }

                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    Log.e(TAG, "Interstitial Failed to Show: ${error.message}")
                    onDone()
                    loadInterstitial()
                }
            }
            ad.show(activity)
        } else {
            Log.w(TAG, "Interstitial not ready")
            onDone()
            loadInterstitial()
        }
    }

    fun showRewarded(onDone: (rewarded: Boolean) -> Unit) {
        val ad = rewardedAd
        if (ad != null) {
            var earnedReward = false
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    Log.d(TAG, "Rewarded Dismissed")
                    onDone(earnedReward)
                    loadRewarded()
                }

                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    Log.e(TAG, "Rewarded Failed to Show: ${error.message}")
                    onDone(false)
                    loadRewarded()
                }
            }
            
            ad.show(activity) { rewardItem ->
                Log.d(TAG, "User earned reward: ${rewardItem.amount} ${rewardItem.type}")
                earnedReward = true
            }
        } else {
            Log.w(TAG, "Rewarded not ready")
            onDone(false)
            loadRewarded()
        }
    }

    companion object {
        private const val TAG = "AdManager"
    }
}
