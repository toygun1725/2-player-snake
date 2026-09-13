package com.twoplayersnake.app.ui

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ComponentCallbacks2
import android.content.Intent
import android.content.pm.ActivityInfo
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.twoplayersnake.app.BuildConfig
import com.twoplayersnake.app.R
import com.twoplayersnake.app.bridge.GameJavascriptBridge
import com.twoplayersnake.app.connectivity.NetworkMonitor
import com.twoplayersnake.app.databinding.ActivityMainBinding
import com.twoplayersnake.app.prefs.AppPreferences
import com.twoplayersnake.app.web.GameWebViewClient
import com.twoplayersnake.app.web.JavascriptBridgeInjector
import com.twoplayersnake.app.web.TrustedWebOrigin
import com.twoplayersnake.app.ads.AdManager

import com.google.android.gms.games.PlayGames
import android.util.Log
import com.google.android.play.core.review.ReviewManagerFactory
import com.google.android.play.core.review.ReviewInfo
import com.revenuecat.purchases.CustomerInfo
import com.revenuecat.purchases.LogLevel
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration
import com.revenuecat.purchases.getCustomerInfoWith
import com.revenuecat.purchases.getOfferingsWith
import com.revenuecat.purchases.purchaseWith
import com.revenuecat.purchases.restorePurchasesWith
// v3.3.1 — Bildirim sistemi
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.twoplayersnake.app.notifications.NotificationHelper
import com.twoplayersnake.app.notifications.NotificationStrings
import com.twoplayersnake.app.notifications.NotificationWorker
import java.util.concurrent.TimeUnit
// v3.3.2 — Klavye + Cloud Save
import android.view.KeyEvent
import com.twoplayersnake.app.cloud.CloudSaveManager

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var preferences: AppPreferences
    private lateinit var networkMonitor: NetworkMonitor
    private lateinit var gameBridge: GameJavascriptBridge
    private lateinit var adManager: AdManager

    private var pageReady = false
    private var pageHasLoadedOnce = false
    private var currentTrustedPage = false
    private var lastProgress = 0
    private var activeMediaPlayer: android.media.MediaPlayer? = null
    private var loadingVideoShouldPlay = false
    private var shortcutParam: String? = null
    private var deepLinkRoom: String? = null
    private var deepLinkMode: String? = null

    private val settingsLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK || result.resultCode == Activity.RESULT_CANCELED) {
                publishSettingsToGame()
            }
        }

    // v3.3.1 — Bildirim izni launcher (Android 13+)
    private val notificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            preferences.notificationPermissionAsked = true
            if (granted) {
                NotificationHelper.createChannel(this)
                scheduleReEngagementNotifications()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        applyMobileOrientationLock()
        
        // Play Games Services SDK başlatması SnakeApplication.onCreate()'e taşındı.
        // Buradan çağrılması Activity yeniden oluşturulduğunda popup'a neden oluyordu.

        // Initialize RevenueCat
        Purchases.logLevel = LogLevel.DEBUG
        Purchases.configure(
            PurchasesConfiguration.Builder(this, "goog_RTZchIHQaIxXoqgGcwvriNeVOGE").build()
        )

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        preferences = AppPreferences(this)
        networkMonitor = NetworkMonitor(this)
        
        adManager = AdManager(this)
        adManager.initialize()

        gameBridge = GameJavascriptBridge(
            context = this,
            preferences = preferences,
            isTrustedPage = { currentTrustedPage },
            onAdRequest = { type, callbackId ->
                runOnUiThread {
                    if (type == "reward") {
                        adManager.showRewarded { success ->
                            resumeGameAfterAd(callbackId, success)
                        }
                    } else {
                        adManager.showInterstitial {
                            resumeGameAfterAd(callbackId, true) // interstitial completed normally
                        }
                    }
                }
            },
            onReviewRequest = {
                runOnUiThread { launchInAppReview() }
            },
            onBuyRemoveAds = {
                runOnUiThread { launchPurchaseFlow() }
            },
            onRestorePurchases = {
                runOnUiThread { launchRestoreFlow() }
            },
            // v3.3.2 — Native PGS ekranı açılamazsa HTML başarım menüsü fallback olarak açılır
            onShowAchievementsFailed = {
                runOnUiThread {
                    binding.webView.evaluateJavascript(
                        "if(typeof window.openHtmlAchievementsMenu==='function'){window.openHtmlAchievementsMenu();}",
                        null
                    )
                }
            }
        )

        enableImmersiveMode()
        setupBackPress()
        setupNativeUi()
        setupWebView()
        refreshLauncherShortcuts()

        // Handle shortcut intent if present
        handleShortcutIntent(intent)

        // Resilience: Hemen yuklemeye basla, interneti WebView'in kendi cache akisi yonetsin.
        loadGame()

        // v2.97.6 — 3. girişte otomatik In-App Review tetikle (3 saniye gecikmeyle)
        preferences.appLaunchCount += 1
        if (preferences.appLaunchCount == 3 && !preferences.ratingFlowCompleted) {
            Handler(Looper.getMainLooper()).postDelayed({
                launchInAppReview(autoTriggered = true)
            }, 3000L)
        }

        // v3.3.1 — Son oynama zamanını güncelle ve bildirimleri yeniden planla
        preferences.lastPlayedAt = System.currentTimeMillis()
        NotificationHelper.createChannel(this)
        if (hasNotificationPermission()) {
            scheduleReEngagementNotifications()
        } else if (!preferences.notificationPermissionAsked && preferences.appLaunchCount >= 3) {
            // 3. oturumda izin iste (Android 13+)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                // Android 12 ve altı: izin gerekmez, direkt planla
                preferences.notificationPermissionAsked = true
                scheduleReEngagementNotifications()
            }
        }

        // v3.3.0 — Uygulama açıldığında premium durumunu RevenueCat'ten güncelle
        checkPremiumStatus()
    }

    override fun onStart() {
        super.onStart()
        networkMonitor.start { isOnline ->
            runOnUiThread {
                if (isOnline && (binding.offlineOverlay.visibility == android.view.View.VISIBLE)) {
                    loadGame()
                }
            }
        }
    }

    override fun onStop() {
        stopLoadingMediaPlayback()
        super.onStop()
        networkMonitor.stop()
    }

    override fun onPause() {
        binding.webView.evaluateJavascript("if (typeof window.onAndroidPause === 'function') { window.onAndroidPause(); }", null)
        binding.webView.onPause()
        binding.webView.pauseTimers()
        stopLoadingMediaPlayback()
        super.onPause()
    }

    override fun onResume() {
        super.onResume()
        binding.webView.onResume()
        binding.webView.resumeTimers()
        enableImmersiveMode()
        publishSettingsToGame()
        binding.webView.evaluateJavascript("if (typeof window.onAndroidResume === 'function') { window.onAndroidResume(); }", null)
        // Arkaplan'dan donulunce loading overlay hala aciksa teaser'i yeniden baslatir.
        // setVideoURI(null) VideoView'in internal MediaPlayer'ini tamamen temizledigi icin
        // bu olmadan Android bazi versiyonlarda VideoView.onResume() ile sesi sizmaya devam eder.
        if (binding.loadingOverlay.visibility == android.view.View.VISIBLE) {
            setupLoadingVideo()
        }
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        when (level) {
            ComponentCallbacks2.TRIM_MEMORY_RUNNING_MODERATE,
            ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW,
            ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL -> {
                binding.webView.evaluateJavascript(
                    "if (typeof window.onAndroidTrimMemory === 'function') { window.onAndroidTrimMemory('critical'); }",
                    null
                )
            }
            ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN,
            ComponentCallbacks2.TRIM_MEMORY_BACKGROUND,
            ComponentCallbacks2.TRIM_MEMORY_MODERATE,
            ComponentCallbacks2.TRIM_MEMORY_COMPLETE -> {
                binding.webView.evaluateJavascript(
                    "if (typeof window.onAndroidTrimMemory === 'function') { window.onAndroidTrimMemory('background'); }",
                    null
                )
                binding.webView.clearCache(false)
                System.gc()
            }
        }
    }

    override fun onLowMemory() {
        super.onLowMemory()
        binding.webView.evaluateJavascript(
            "if (typeof window.onAndroidTrimMemory === 'function') { window.onAndroidTrimMemory('low'); }",
            null
        )
        binding.webView.clearCache(false)
        System.gc()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleShortcutIntent(intent)
        if (shortcutParam != null) {
            loadGame()
        }
    }

    private fun handleShortcutIntent(intent: Intent?) {
        shortcutParam = intent?.getStringExtra("shortcut")
        deepLinkRoom = null
        deepLinkMode = null
        
        // Handle deep link
        if (intent?.action == Intent.ACTION_VIEW) {
            val uri = intent.data
            if (uri != null && uri.host == "2playersnake.com" && uri.path?.startsWith("/invite") == true) {
                deepLinkRoom = uri.getQueryParameter("room")
                deepLinkMode = uri.getQueryParameter("mode")
                if (deepLinkRoom != null) {
                    shortcutParam = "online"
                }
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enableImmersiveMode()
    }

    override fun onDestroy() {
        stopLoadingMediaPlayback()
        binding.webView.apply {
            stopLoading()
            onPause()
            pauseTimers()
            clearCache(false)
            webChromeClient = null
            removeJavascriptInterface("Android")
            destroy()
        }
        super.onDestroy()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() = with(binding.webView) {
        setBackgroundColor(android.graphics.Color.BLACK)
        isHorizontalScrollBarEnabled = false
        isVerticalScrollBarEnabled = false
        overScrollMode = WebView.OVER_SCROLL_NEVER
        isHapticFeedbackEnabled = false
        setOnLongClickListener { true }

        // Oyun motoru icin GPU donanim hizlandirmasini zorla
        setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            loadsImagesAutomatically = true
            javaScriptCanOpenWindowsAutomatically = false
            cacheMode = WebSettings.LOAD_DEFAULT
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            // Offline fallback HTML android_asset altinda acilacagi icin gerekli.
            allowFileAccess = true
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            
            // Viewport/olcek ayarlari:
            // - Mobilde mevcut davranis korunur.
            // - GPGPC'de WebView'in otomatik overview/wide scaling'i devre disi kalir;
            //   boyut normalizasyonu JS tarafinda kontrollu yapilir.
            if (isRunningOnPlayGamesPc()) {
                loadWithOverviewMode = false
                useWideViewPort = false
                textZoom = 100
                defaultFontSize = 16
                defaultFixedFontSize = 16
            } else {
                loadWithOverviewMode = true
                useWideViewPort = true
            }
        }

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
        addJavascriptInterface(gameBridge, "Android")

        webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                lastProgress = newProgress
                binding.loadingProgress.progress = newProgress
                binding.loadingPercent.text = getString(R.string.loading_percent, newProgress)

                if (newProgress == 100) {
                    showStartButton()
                }
            }
        }

        webViewClient = GameWebViewClient(
            context = this@MainActivity,
            onMainFrameLoadingStarted = { url ->
                currentTrustedPage = TrustedWebOrigin.isTrustedTopLevelUrl(url)
                pageReady = false
                showLoadingState()
            },
            onTrustedPageFinished = { url ->
                currentTrustedPage = TrustedWebOrigin.isTrustedTopLevelUrl(url)
                pageReady = true
                pageHasLoadedOnce = true
                hideOfflineState()
                JavascriptBridgeInjector.install(this, this@MainActivity)
                applyGpgpcUiScaleTweaks()
                publishSettingsToGame()

                // v3.3.2 — Cloud Save: sayfa yüklendikten sonra cloud verisi çekip HTML'e inject et
                CloudSaveManager.load(this@MainActivity) { json ->
                    if (json != null) {
                        // Premium durumu cloud'dan geldiyse sessizce set et (asla false yazma)
                        runCatching {
                            val obj = org.json.JSONObject(json)
                            if (obj.optBoolean("adsRemoved", false) && !preferences.adsRemoved) {
                                preferences.adsRemoved = true
                                runOnUiThread { publishSettingsToGame() }
                                Log.d("CloudSave", "adsRemoved cloud'dan geri yüklendi.")
                            }
                        }
                        // HTML'ye inject et
                        runOnUiThread {
                            binding.webView.evaluateJavascript(
                                "if(typeof window.onCloudSaveLoaded==='function'){window.onCloudSaveLoaded($json);}",
                                null
                            )
                        }
                    }
                }

                // Logic changed: wait for user to click START if progress is 100%
                if (lastProgress == 100) {
                    showStartButton()
                }
            },
            onMainFrameLoadFailed = {
                currentTrustedPage = false
                pageReady = false
                
                // Sadece internet yoksa ve daha once hic yuklenemediyse hata goster.
                if (!networkMonitor.isOnline() && !pageHasLoadedOnce) {
                    hideLoadingState()
                    showOfflineState()
                }
            },
            onRenderProcessGone = {
                currentTrustedPage = false
                pageReady = false
                
                if (!networkMonitor.isOnline() && !pageHasLoadedOnce) {
                    hideLoadingState()
                    showOfflineState()
                }
            }
        )
    }

    private fun setupNativeUi() {
        binding.retryButton.setOnClickListener {
            if (networkMonitor.isOnline()) {
                loadGame()
            } else {
                showOfflineState()
            }
        }

        binding.startButton.setOnClickListener {
            hideLoadingState()
        }
    }

    private fun refreshLauncherShortcuts() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return
        val shortcutManager = getSystemService(ShortcutManager::class.java) ?: return

        val shortcuts = listOf(
            buildLauncherShortcut("normal_1p", R.string.shortcut_normal_1p),
            buildLauncherShortcut("fc_2p", R.string.shortcut_fc_2p),
            buildLauncherShortcut("fc_1p_ai", R.string.shortcut_fc_1p_ai)
        )

        runCatching {
            shortcutManager.removeAllDynamicShortcuts()
            shortcutManager.dynamicShortcuts = shortcuts
            shortcutManager.updateShortcuts(shortcuts)
        }
    }

    private fun buildLauncherShortcut(shortcutId: String, labelRes: Int): ShortcutInfo {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            putExtra("shortcut", shortcutId)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }

        val label = getString(labelRes)
        return ShortcutInfo.Builder(this, shortcutId)
            .setShortLabel(label)
            .setLongLabel(label)
            .setIcon(Icon.createWithResource(this, R.drawable.ic_launcher_foreground_inset))
            .setIntent(launchIntent)
            .build()
    }

    private fun showStartButton() {
        if (binding.startButton.visibility == android.view.View.VISIBLE) return

        binding.loadingProgress.visibility = android.view.View.GONE
        binding.loadingPercent.visibility = android.view.View.GONE
        binding.loadingTitle.visibility = android.view.View.GONE
        binding.loadingSubtitle.visibility = android.view.View.GONE

        binding.startButton.visibility = android.view.View.VISIBLE
        val flashAnim = android.view.animation.AnimationUtils.loadAnimation(this, R.anim.flash)
        binding.startButton.startAnimation(flashAnim)
    }

    private fun loadGame() {
        hideOfflineState()
        showLoadingState()

        // Smart Caching: Online iken sunucuyu kontrol et, offline iken cache'den aç.
        val isOnline = networkMonitor.isOnline()
        binding.webView.settings.cacheMode = if (isOnline) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        val targetUrl = if (isOnline) buildGameUrl() else TrustedWebOrigin.OFFLINE_FALLBACK_URL
        binding.webView.loadUrl(targetUrl)
    }

    private fun isRunningOnPlayGamesPc(): Boolean {
        val pm = packageManager
        return pm.hasSystemFeature("com.google.android.play.feature.HPE_EXPERIENCE") ||
            pm.hasSystemFeature("android.hardware.type.pc")
    }

    private fun applyMobileOrientationLock() {
        if (!isRunningOnPlayGamesPc()) {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }
    }

    private fun resolveGameBaseUrl(): String {
        return if (isRunningOnPlayGamesPc()) {
            BuildConfig.GAME_URL_PC
        } else {
            BuildConfig.GAME_URL_MOBILE
        }
    }

    private fun buildGameUrl(): String {
        val baseUri = Uri.parse(resolveGameBaseUrl())
        val builder = baseUri.buildUpon()

        builder.appendQueryParameter("app", "android")
        builder.appendQueryParameter("app_ver", BuildConfig.VERSION_NAME)
        builder.appendQueryParameter("app_code", BuildConfig.VERSION_CODE.toString())
        builder.appendQueryParameter("app_device", if (isRunningOnPlayGamesPc()) "gpgpc" else "mobile")

        if (networkMonitor.isOnline()) {
            // Force fresh top-level HTML on each launch so shortcut flows don't open stale game code.
            builder.appendQueryParameter("__ts", System.currentTimeMillis().toString())
        }

        shortcutParam?.let { shortcut ->
            builder.appendQueryParameter("shortcut", shortcut)
        }

        if (shortcutParam == "online") {
            deepLinkRoom?.let { room ->
                builder.appendQueryParameter("room", room)
            }
            deepLinkMode?.let { mode ->
                builder.appendQueryParameter("mode", mode)
            }
        }

        return builder.build().toString()
    }

    private fun publishSettingsToGame() {
        if (!pageReady || !currentTrustedPage) return
        JavascriptBridgeInjector.publishSettings(binding.webView, preferences)
    }

    private fun applyGpgpcUiScaleTweaks() {
        if (!isRunningOnPlayGamesPc()) return
        if (!currentTrustedPage) return

        val script = """
            (function () {
              try {
                var root = document.documentElement;
                root.classList.add('gpgpc-webview-tune');
                var width = Math.max(window.innerWidth || 0, 1);
                var height = Math.max(window.innerHeight || 0, 1);
                var longSide = Math.max(width, height);
                var shortSide = Math.min(width, height);
                var isLandscape = longSide >= shortSide * 1.2;

                var menuScale = isLandscape
                  ? Math.max(0.68, Math.min(0.94, width / 1920))
                  : Math.max(0.62, Math.min(0.86, width / 1440));
                var hudScale = isLandscape
                  ? Math.max(0.72, Math.min(0.96, width / 1920))
                  : Math.max(0.66, Math.min(0.90, width / 1440));
                var hudHeight = isLandscape
                  ? Math.max(148, Math.min(176, Math.round(height * 0.16)))
                  : Math.max(138, Math.min(168, Math.round(height * 0.18)));

                root.style.setProperty('--gpgpc-menu-scale', menuScale.toFixed(3));
                root.style.setProperty('--gpgpc-hud-scale', hudScale.toFixed(3));
                root.style.setProperty('--gpgpc-hud-height', hudHeight + 'px');

                var styleId = 'gpgpc-webview-tune-style';
                var styleEl = document.getElementById(styleId);
                if (!styleEl) {
                  styleEl = document.createElement('style');
                  styleEl.id = styleId;
                  document.head.appendChild(styleEl);
                }

                styleEl.textContent = `
html.gpgpc-webview-tune .banner.main-menu-banner,
html.gpgpc-webview-tune .banner.game-mode-menu,
html.gpgpc-webview-tune .banner.padded {
  zoom: var(--gpgpc-menu-scale) !important;
}
html.gpgpc-webview-tune .panel-left,
html.gpgpc-webview-tune .panel-right,
html.gpgpc-webview-tune .controls-panel,
html.gpgpc-webview-tune .panel-center {
  zoom: var(--gpgpc-hud-scale) !important;
}
html.gpgpc-webview-tune body:not(.hud-collapsed) {
  --hud-footer-height: var(--gpgpc-hud-height) !important;
}
html.gpgpc-webview-tune body.hud-collapsed {
  --hud-footer-height: 0px !important;
}
                `;
              } catch (e) {}
            })();
        """.trimIndent()

        binding.webView.evaluateJavascript(script, null)
    }

    private fun showLoadingState() {
        loadingVideoShouldPlay = true
        binding.loadingOverlay.alpha = 1f
        binding.loadingOverlay.visibility = android.view.View.VISIBLE
        binding.startButton.visibility = android.view.View.GONE
        binding.loadingProgress.visibility = android.view.View.VISIBLE
        binding.loadingPercent.visibility = android.view.View.VISIBLE
        binding.loadingTitle.visibility = android.view.View.VISIBLE
        binding.loadingSubtitle.visibility = android.view.View.VISIBLE

        if (lastProgress == 0) {
            binding.loadingProgress.progress = 8
            binding.loadingPercent.text = getString(R.string.loading_percent, 8)
        }

        setupLoadingVideo()
    }

    private fun setupLoadingVideo() {
        stopLoadingMediaPlayback()
        loadingVideoShouldPlay = true

        val videoPath = "android.resource://" + packageName + "/" + R.raw.loading_video
        binding.loadingVideoView.setVideoURI(android.net.Uri.parse(videoPath))
        
        binding.loadingVideoView.setOnPreparedListener { mp ->
            if (!loadingVideoShouldPlay || binding.loadingOverlay.visibility != android.view.View.VISIBLE) {
                runCatching { mp.setVolume(0f, 0f) }
                runCatching { mp.stop() }
                return@setOnPreparedListener
            }

            mp.isLooping = true
            mp.setVolume(1f, 1f)   // Teaser sesi acik — sessiz mod kaldirildi
            activeMediaPlayer = mp
            
            // Refined Center Crop scaling for VideoView
            val videoWidth = mp.videoWidth.toFloat()
            val videoHeight = mp.videoHeight.toFloat()
            val viewWidth = binding.loadingVideoView.width.toFloat()
            val viewHeight = binding.loadingVideoView.height.toFloat()

            val scaleX = viewWidth / videoWidth
            val scaleY = viewHeight / videoHeight
            val maxScale = Math.max(scaleX, scaleY)

            binding.loadingVideoView.scaleX = (videoWidth * maxScale) / viewWidth
            binding.loadingVideoView.scaleY = (videoHeight * maxScale) / viewHeight

            binding.loadingVideoView.start()
        }
        binding.loadingVideoView.setOnCompletionListener { mp ->
            if (loadingVideoShouldPlay && binding.loadingOverlay.visibility == android.view.View.VISIBLE) {
                mp.start()
            }
        }
    }

    private fun hideLoadingState() {
        loadingVideoShouldPlay = false
        // Immediately mute and stop the video to prevent lingering audio
        stopLoadingMediaPlayback()

        binding.loadingOverlay.animate()
            .alpha(0f)
            .setDuration(300L)
            .withEndAction {
                binding.loadingOverlay.visibility = android.view.View.GONE
                binding.loadingProgress.progress = 0
                binding.loadingPercent.text = getString(R.string.loading_percent, 0)
                lastProgress = 0
            }
            .start()
    }

    private fun stopLoadingMediaPlayback() {
        loadingVideoShouldPlay = false
        runCatching {
            activeMediaPlayer?.setVolume(0f, 0f)
            activeMediaPlayer?.pause()
            activeMediaPlayer?.stop()
        }
        runCatching { binding.loadingVideoView.setOnPreparedListener(null) }
        runCatching { binding.loadingVideoView.setOnCompletionListener(null) }
        runCatching { binding.loadingVideoView.suspend() }
        runCatching { binding.loadingVideoView.stopPlayback() }
        // URI'yi null yaparak VideoView'in internal MediaPlayer state'ini tamamen temizle.
        // Bu olmadan bazi Android versiyonlari onResume'da VideoView'i otomatik resume ediyor
        // ve activeMediaPlayer referansi kayip oldugu icin ses sizmaya devam ediyor.
        runCatching { binding.loadingVideoView.setVideoURI(null) }
        activeMediaPlayer = null
    }

    private fun showOfflineState() {
        binding.offlineOverlay.visibility = android.view.View.VISIBLE
        binding.offlineOverlay.alpha = 1f
        binding.loadingOverlay.visibility = android.view.View.GONE
    }

    private fun hideOfflineState() {
        binding.offlineOverlay.visibility = android.view.View.GONE
    }

    private fun setupBackPress() {
        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    when {
                        binding.webView.canGoBack() -> binding.webView.goBack()
                        else -> showExitDialog()
                    }
                }
            }
        )
    }

    private fun showExitDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.exit_title)
            .setMessage(R.string.exit_message)
            .setNegativeButton(R.string.cancel, null)
            .setNeutralButton(R.string.open_settings) { _, _ ->
                settingsLauncher.launch(Intent(this, SettingsActivity::class.java))
            }
            .setPositiveButton(R.string.exit) { _, _ -> finish() }
            .show()
    }

    private fun resumeGameAfterAd(callbackId: String?, success: Boolean) {
        val script = "if (typeof window.__onNativeAdDone === 'function') { window.__onNativeAdDone('${callbackId ?: ""}', $success); }"
        binding.webView.evaluateJavascript(script, null)
    }

    private fun enableImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowInsetsControllerCompat(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    private fun launchInAppReview(autoTriggered: Boolean = false) {
        val manager = ReviewManagerFactory.create(this)
        manager.requestReviewFlow().addOnCompleteListener { task ->
            if (task.isSuccessful) {
                manager.launchReviewFlow(this, task.result)
                    .addOnCompleteListener {
                        // Otomatik tetiklendiyse bir daha gösterme
                        if (autoTriggered) preferences.ratingFlowCompleted = true
                    }
            } else {
                // Fallback: Play Store doğrudan aç
                runCatching {
                    startActivity(
                        android.content.Intent(android.content.Intent.ACTION_VIEW,
                            Uri.parse("market://details?id=com.twoplayersnake.app"))
                    )
                }.onFailure {
                    startActivity(
                        android.content.Intent(android.content.Intent.ACTION_VIEW,
                            Uri.parse("https://play.google.com/store/apps/details?id=com.twoplayersnake.app"))
                    )
                }
            }
        }
    }

    // --- RevenueCat Premium Functions ---

    private fun checkPremiumStatus() {
        Purchases.sharedInstance.getCustomerInfoWith(
            onError = { error ->
                android.util.Log.w("MainActivity", "RevenueCat getCustomerInfo error: ${error.message}")
            },
            onSuccess = { customerInfo ->
                val isPremium = customerInfo.entitlements["remove_ads"]?.isActive == true
                if (preferences.adsRemoved != isPremium) {
                    preferences.adsRemoved = isPremium
                    runOnUiThread { publishSettingsToGame() }
                }
            }
        )
    }

    private fun launchPurchaseFlow() {
        Purchases.sharedInstance.getOfferingsWith(
            onError = { error ->
                android.util.Log.e("MainActivity", "RevenueCat getOfferings error: ${error.message}")
                runOnUiThread {
                    MaterialAlertDialogBuilder(this)
                        .setTitle("Hata")
                        .setMessage("Satın alma işlemi başlatılamadı. Lütfen tekrar deneyin.")
                        .setPositiveButton("Tamam", null)
                        .show()
                }
            },
            onSuccess = { offerings ->
                val pkg = offerings.current?.lifetime
                if (pkg == null) {
                    android.util.Log.e("MainActivity", "RevenueCat: no lifetime package in current offering")
                    return@getOfferingsWith
                }
                runOnUiThread {
                    Purchases.sharedInstance.purchaseWith(
                        purchaseParams = com.revenuecat.purchases.PurchaseParams.Builder(this, pkg).build(),
                        onError = { error, userCancelled ->
                            if (!userCancelled) {
                                android.util.Log.e("MainActivity", "Purchase error: ${error.message}")
                                MaterialAlertDialogBuilder(this)
                                    .setTitle("Hata")
                                    .setMessage("Satın alma başarısız: ${error.message}")
                                    .setPositiveButton("Tamam", null)
                                    .show()
                            }
                        },
                        onSuccess = { _, customerInfo ->
                            val isPremium = customerInfo.entitlements["remove_ads"]?.isActive == true
                            preferences.adsRemoved = isPremium
                            publishSettingsToGame()
                            if (isPremium) {
                                MaterialAlertDialogBuilder(this)
                                    .setTitle("👑 Reklamlar Kaldırıldı!")
                                    .setMessage("Teşekkürler! Artık reklamsız bir deneyimin tadını çıkarabilirsin.")
                                    .setPositiveButton("Harika!", null)
                                    .show()
                            }
                        }
                    )
                }
            }
        )
    }

    private fun launchRestoreFlow() {
        Purchases.sharedInstance.restorePurchasesWith(
            onError = { error ->
                android.util.Log.e("MainActivity", "Restore error: ${error.message}")
                runOnUiThread {
                    MaterialAlertDialogBuilder(this)
                        .setTitle("Hata")
                        .setMessage("Satın alımlar geri yüklenemedi. Lütfen tekrar deneyin.")
                        .setPositiveButton("Tamam", null)
                        .show()
                }
            },
            onSuccess = { customerInfo ->
                val isPremium = customerInfo.entitlements["remove_ads"]?.isActive == true
                preferences.adsRemoved = isPremium
                runOnUiThread {
                    publishSettingsToGame()
                    val msg = if (isPremium)
                        "👑 Reklamsız satın alımın başarıyla geri yüklendi!"
                    else
                        "Bu Google hesabında daha önce reklam kaldırma satın alımı bulunamadı."
                    MaterialAlertDialogBuilder(this)
                        .setTitle("Satın Alımları Geri Yükle")
                        .setMessage(msg)
                        .setPositiveButton("Tamam", null)
                        .show()
                }
            }
        )
    }

    // ─── v3.3.1: Bildirim yardımcı fonksiyonları ─────────────────────────────

    /** Android 13+ için POST_NOTIFICATIONS iznini kontrol eder. */
    private fun hasNotificationPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                this, Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true // Android 12 ve altında izin gerekmez
        }
    }

    /**
     * Mevcut tüm re-engagement worker'larını iptal edip
     * Day1 (24s), Day3 (72s), Day7 (168s) yeni worker'lar planlar.
     * Her uygulama açılışında çağrılır — böylece timer sıfırlanır.
     */
    private fun scheduleReEngagementNotifications() {
        val workManager = WorkManager.getInstance(this)

        // Önceki planları temizle
        workManager.cancelAllWorkByTag(NotificationWorker.TAG_DAY1)
        workManager.cancelAllWorkByTag(NotificationWorker.TAG_DAY3)
        workManager.cancelAllWorkByTag(NotificationWorker.TAG_DAY7)

        // Day 1 — 24 saat
        val day1Request = OneTimeWorkRequestBuilder<NotificationWorker>()
            .setInitialDelay(24, TimeUnit.HOURS)
            .setInputData(
                Data.Builder().putString(NotificationWorker.INPUT_STAGE, NotificationStrings.STAGE_DAY1).build()
            )
            .addTag(NotificationWorker.TAG_DAY1)
            .build()

        // Day 3 — 72 saat
        val day3Request = OneTimeWorkRequestBuilder<NotificationWorker>()
            .setInitialDelay(72, TimeUnit.HOURS)
            .setInputData(
                Data.Builder().putString(NotificationWorker.INPUT_STAGE, NotificationStrings.STAGE_DAY3).build()
            )
            .addTag(NotificationWorker.TAG_DAY3)
            .build()

        // Day 7 — 168 saat
        val day7Request = OneTimeWorkRequestBuilder<NotificationWorker>()
            .setInitialDelay(168, TimeUnit.HOURS)
            .setInputData(
                Data.Builder().putString(NotificationWorker.INPUT_STAGE, NotificationStrings.STAGE_DAY7).build()
            )
            .addTag(NotificationWorker.TAG_DAY7)
            .build()

        workManager.enqueue(listOf(day1Request, day3Request, day7Request))
    }

    // -----------------------------------------------------------------------
    // v3.3.2 — GPG on PC: Fiziksel klavye olaylarını WebView'e ilet
    // -----------------------------------------------------------------------

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        // Sadece GPG PC modunda ve güvenilir sayfa hazırsa devreye gir
        if (!isRunningOnPlayGamesPc()) return super.dispatchKeyEvent(event)
        if (!pageReady || !currentTrustedPage) return super.dispatchKeyEvent(event)
        if (event.action != KeyEvent.ACTION_DOWN && event.action != KeyEvent.ACTION_UP) {
            return super.dispatchKeyEvent(event)
        }

        val jsKey = mapKeyCode(event.keyCode) ?: return super.dispatchKeyEvent(event)
        val eventType = if (event.action == KeyEvent.ACTION_DOWN) "keydown" else "keyup"

        // PC HTML'nin dinlediği KeyboardEvent formatı
        val js = "document.dispatchEvent(new KeyboardEvent('$eventType'," +
            "{key:'$jsKey',code:'$jsKey',bubbles:true,cancelable:true}));"
        binding.webView.evaluateJavascript(js, null)
        return true
    }

    private fun mapKeyCode(keyCode: Int): String? = when (keyCode) {
        KeyEvent.KEYCODE_W            -> "w"
        KeyEvent.KEYCODE_A            -> "a"
        KeyEvent.KEYCODE_S            -> "s"
        KeyEvent.KEYCODE_D            -> "d"
        KeyEvent.KEYCODE_DPAD_UP      -> "ArrowUp"
        KeyEvent.KEYCODE_DPAD_DOWN    -> "ArrowDown"
        KeyEvent.KEYCODE_DPAD_LEFT    -> "ArrowLeft"
        KeyEvent.KEYCODE_DPAD_RIGHT   -> "ArrowRight"
        KeyEvent.KEYCODE_SPACE        -> " "
        KeyEvent.KEYCODE_ENTER, KeyEvent.KEYCODE_NUMPAD_ENTER -> "Enter"
        KeyEvent.KEYCODE_R            -> "r"
        KeyEvent.KEYCODE_M            -> "m"
        KeyEvent.KEYCODE_SHIFT_LEFT   -> "ShiftLeft"
        KeyEvent.KEYCODE_SHIFT_RIGHT  -> "ShiftRight"
        else -> null
    }
}
