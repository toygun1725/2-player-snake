(function () {
  if (window.__twoPlayerSnakeIosBridgeInstalled) return;
  window.__twoPlayerSnakeIosBridgeInstalled = true;
  window.__nativeAdCallbacks = window.__nativeAdCallbacks || {};

  function safeSerialize(payload) {
    try {
      return payload == null ? "" : (typeof payload === "string" ? payload : JSON.stringify(payload));
    } catch (error) {
      return "";
    }
  }

  function postToNative(action, payload) {
    try {
      if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.iOS
      ) {
        window.webkit.messageHandlers.iOS.postMessage({
          action: action,
          payload: safeSerialize(payload)
        });
      }
    } catch (error) {
      console.warn("iOS Bridge call failed:", action, error);
    }
  }

  // Android köprüsünü taklit ederek web oyun koduna dokunmadan çalışmasını sağla
  window.Android = {
    onEatFood: function (payload) {
      postToNative("onEatFood", payload);
    },
    onGameStart: function (payload) {
      postToNative("onGameStart", payload);
    },
    onCollision: function (payload) {
      postToNative("onCollision", payload);
    },
    onGameOver: function (payload) {
      postToNative("onGameOver", payload);
    },
    emit: function (payload) {
      postToNative("emit", payload);
    },
    triggerVibration: function (durationMs) {
      postToNative("triggerVibration", { durationMs: durationMs });
    },
    requestReview: function () {
      postToNative("requestReview", {});
    },
    buyRemoveAds: function () {
      postToNative("buyRemoveAds", {});
    },
    restorePurchases: function () {
      postToNative("restorePurchases", {});
    },
    isAdsRemoved: function () {
      return (window.TwoPlayerSnakeAppSettings && window.TwoPlayerSnakeAppSettings.adsRemoved === true) ? "true" : "false";
    },
    adBreak: function (payload) {
      __nativeAdBreakShim(payload);
    },
    notifyHighScore: function (scoresJson, platform) {
      postToNative("notifyHighScore", { scoresJson: scoresJson, platform: platform });
    },
    showAchievements: function () {
      postToNative("showAchievements", {});
    }
  };

  // TwoPlayerSnakeNative nesnesi
  window.TwoPlayerSnakeNative = {
    emit: function (name, payload) {
      window.Android.emit(JSON.stringify({ name: name, payload: payload || {} }));
    },
    onEatFood: function (payload) {
      window.Android.onEatFood(safeSerialize(payload));
    },
    onGameStart: function (payload) {
      window.Android.onGameStart(safeSerialize(payload));
    },
    onCollision: function (payload) {
      window.Android.onCollision(safeSerialize(payload));
    },
    onGameOver: function (payload) {
      window.Android.onGameOver(safeSerialize(payload));
    }
  };

  window.dispatchAndroidGameEvent = function (name, payload) {
    switch (name) {
      case "eatFood":
        window.TwoPlayerSnakeNative.onEatFood(payload);
        break;
      case "gameStart":
        window.TwoPlayerSnakeNative.onGameStart(payload);
        break;
      case "collision":
        window.TwoPlayerSnakeNative.onCollision(payload);
        break;
      case "gameOver":
        window.TwoPlayerSnakeNative.onGameOver(payload);
        break;
      default:
        window.TwoPlayerSnakeNative.emit(name, payload);
        break;
    }
  };

  // Web custom event dinleyicileri
  [
    ["two-player-snake:eat-food", "onEatFood"],
    ["two-player-snake:game-start", "onGameStart"],
    ["two-player-snake:collision", "onCollision"],
    ["two-player-snake:game-over", "onGameOver"]
  ].forEach(function (entry) {
    var eventName = entry[0];
    var methodName = entry[1];
    var handler = function (event) {
      window.TwoPlayerSnakeNative[methodName](event && event.detail ? event.detail : {});
    };
    window.addEventListener(eventName, handler, { passive: true });
    document.addEventListener(eventName, handler, { passive: true });
  });

  // Native ayarlar senkronizasyonu
  window.dispatchNativeSettings = function (settings) {
    window.TwoPlayerSnakeAppSettings = settings || {};
    if (settings && typeof settings.adsRemoved !== "undefined") {
      window.adsRemoved = settings.adsRemoved === true || settings.adsRemoved === "true";
    }
    var event = new CustomEvent("two-player-snake:native-settings", {
      detail: window.TwoPlayerSnakeAppSettings
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    if (typeof window.onAndroidSettings === "function") {
      try { window.onAndroidSettings(window.TwoPlayerSnakeAppSettings); } catch (e) {}
    }
  };

  // --- Reklam Shim Entegrasyonu (iOS: Canlı Native AdMob & Kilitlenme Korumalı) ---
  window.adsbygoogle = window.adsbygoogle || [];

  function __nativeAdBreakShim(o) {
    var req = (o && typeof o === "object") ? o : {};
    var adType = req.type || "next";

    // The bundled offline game never requests a network ad. Interstitials are
    // skipped and a rewarded request is treated as dismissed, so it cannot
    // grant a reward without an actual ad impression.
    if (window.__twoPlayerSnakeOfflineMode === true) {
      try { if (typeof req.beforeAd === "function") req.beforeAd(); } catch (e) {}
      if (adType === "reward") {
        try { if (typeof req.beforeReward === "function") req.beforeReward(function () {}); } catch (e) {}
        try { if (typeof req.adDismissed === "function") req.adDismissed(); } catch (e) {}
      }
      try { if (typeof req.afterAd === "function") req.afterAd(); } catch (e) {}
      try { if (typeof req.adBreakDone === "function") req.adBreakDone(); } catch (e) {}
      if (window.AdManager) { window.AdManager.adInProgress = false; }
      return;
    }

    // 1. Premium veya reklamsız sürüm kontrolü: Anında atla
    if (window.Android.isAdsRemoved() === "true") {
      console.log("iOS Bridge: Reklamlar kaldırılmış, anında atlanıyor:", adType);
      try { if (typeof req.beforeAd === "function") req.beforeAd(); } catch (e) {}
      if (adType === "reward") {
        try { if (typeof req.beforeReward === "function") req.beforeReward(function () {}); } catch (e) {}
        try { if (typeof req.adViewed === "function") req.adViewed(); } catch (e) {}
      }
      try { if (typeof req.afterAd === "function") req.afterAd(); } catch (e) {}
      try { if (typeof req.adBreakDone === "function") req.adBreakDone(); } catch (e) {}
      if (window.AdManager) { window.AdManager.adInProgress = false; }
      return;
    }

    // 2. Canlı Native AdMob Akışı
    var callbackId = "adb_ios_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    window.__nativeAdCallbacks[callbackId] = {
      type: adType,
      beforeAd: (typeof req.beforeAd === "function") ? req.beforeAd : null,
      afterAd: (typeof req.afterAd === "function") ? req.afterAd : null,
      adBreakDone: (typeof req.adBreakDone === "function") ? req.adBreakDone : null,
      adViewed: (typeof req.adViewed === "function") ? req.adViewed : null,
      adDismissed: (typeof req.adDismissed === "function") ? req.adDismissed : null,
      beforeReward: (typeof req.beforeReward === "function") ? req.beforeReward : null
    };

    try {
      if (window.__nativeAdCallbacks[callbackId].beforeAd) {
        window.__nativeAdCallbacks[callbackId].beforeAd();
      }
    } catch (e) {
      console.warn("iOS Bridge: beforeAd callback error:", e);
    }

    if (adType === "reward") {
      try {
        if (window.__nativeAdCallbacks[callbackId].beforeReward) {
          window.__nativeAdCallbacks[callbackId].beforeReward(function () {});
        }
      } catch (e) {
        console.warn("iOS Bridge: beforeReward callback error:", e);
      }
    }

    // JS Emniyet Zamanlayıcısı: 8.5 saniye içinde native yanıt vermezse maçı otomatik kurtar
    var safetyTimer = setTimeout(function () {
      if (window.__nativeAdCallbacks[callbackId]) {
        console.warn("iOS Bridge: ⚠️ AdBreak JS zaman aşımı (8.5s), oyun kilitlenmesin diye devam ettiriliyor.");
        window.__onNativeAdDone(callbackId, true);
      }
    }, 8500);
    window.__nativeAdCallbacks[callbackId].safetyTimer = safetyTimer;

    // Swift tarafına reklam gösterim isteğini ilet
    postToNative("adBreak", {
      type: adType,
      name: req.name || "",
      callbackId: callbackId
    });
  }

  window.adConfig = function (o) {};
  window.adBreak = __nativeAdBreakShim;

  window.adsbygoogle.push = function (o) {
    if (o && typeof o === "object") {
      // The page assigns `adBreak` again during its own bootstrap. Those calls
      // arrive here, so every game ad type (including match-start) must be
      // forwarded to the native shim.
      if (o.type === "start" || o.type === "next" || o.type === "reward" || o.type === "browse") {
        __nativeAdBreakShim(o);
        return;
      }
    }
  };

  window.__onNativeAdDone = function (adBreakDoneCallbackName, success) {
    console.log("iOS Bridge: Native reklam tamamlandı callback:", adBreakDoneCallbackName, "success:", success);
    if (window.AdManager) {
      window.AdManager.adInProgress = false;
    }

    var callbacks = adBreakDoneCallbackName ? window.__nativeAdCallbacks[adBreakDoneCallbackName] : null;
    if (callbacks) {
      if (callbacks.safetyTimer) {
        clearTimeout(callbacks.safetyTimer);
      }

      if (callbacks.type === "reward") {
        try {
          if (success && typeof callbacks.adViewed === "function") {
            callbacks.adViewed();
          } else if (!success && typeof callbacks.adDismissed === "function") {
            callbacks.adDismissed();
          }
        } catch (e) {
          console.warn("iOS Bridge: reward callback error:", e);
        }
      }

      try {
        if (typeof callbacks.afterAd === "function") {
          callbacks.afterAd();
        }
      } catch (e) {
        console.warn("iOS Bridge: afterAd callback error:", e);
      }

      try {
        if (typeof callbacks.adBreakDone === "function") {
          callbacks.adBreakDone();
        }
      } catch (e) {
        console.warn("iOS Bridge: adBreakDone callback error:", e);
      }

      delete window.__nativeAdCallbacks[adBreakDoneCallbackName];
      return;
    }

    // Legacy fallback
    if (adBreakDoneCallbackName && typeof window[adBreakDoneCallbackName] === "function") {
      window[adBreakDoneCallbackName]();
    } else if (typeof window.adBreakDone === "function") {
      window.adBreakDone();
    }
  };

  // iOS Fullscreen, Safe Area, Symmetrical 2P & Edge-to-Edge Fix
  (function () {
    var styleId = "ios-fullscreen-and-safe-area-fix";
    if (document.getElementById(styleId)) return;
    var style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      html, body {
        height: 100% !important;
        min-height: 100% !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        background-color: var(--bg, #0b0f14) !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Bottom gap elimination: buttons touch the bottom glass edge */
      #p1-controls {
        padding-bottom: 0 !important;
        padding-top: 0 !important;
      }
      #p1-controls .turn-btn,
      #p2-controls .turn-btn {
        height: 100% !important;
      }
      #p1-controls .turn-btn.left {
        border-bottom-left-radius: 0 !important;
      }
      #p1-controls .turn-btn.right {
        border-bottom-right-radius: 0 !important;
      }
      #p2-controls .turn-btn.left {
        border-top-left-radius: 0 !important;
      }
      #p2-controls .turn-btn.right {
        border-top-right-radius: 0 !important;
      }

      /* 2-Player: P2 (üst panel) → Dynamic Island için top inset */
      #p2-controls:not(.hud-hidden) {
        height: calc(var(--control-bar-base-height) + env(safe-area-inset-top, 0px)) !important;
        max-height: 220px !important;
        min-height: calc(105px + env(safe-area-inset-top, 0px)) !important;
      }

      /* 2-Player: P1 (alt panel) → Home Indicator için bottom inset */
      #p1-controls:not(.hud-hidden):not(.dual-ai) {
        height: calc(var(--control-bar-base-height) + env(safe-area-inset-bottom, 0px)) !important;
        max-height: 220px !important;
        min-height: calc(105px + env(safe-area-inset-bottom, 0px)) !important;
      }

      /* Top player: insets from Dynamic Island */
      #p2-controls {
        padding-top: 0 !important;
      }
      #p2-controls .p2-panel {
        padding-top: calc(4px + env(safe-area-inset-top, 0px)) !important;
      }
      #p2-controls .turn-btn > svg {
        transform: translateY(calc(0.35 * env(safe-area-inset-top, 0px)));
      }

      /* Bottom player: insets above Home Indicator */
      #p1-controls:not(.dual-ai) #p1StatPanel {
        padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px)) !important;
      }
      #p1-controls:not(.dual-ai) .turn-btn > svg {
        transform: translateY(calc(-0.35 * env(safe-area-inset-bottom, 0px)));
      }

      /* 1P vs AI / Solo Mode */
      #p1-controls.dual-ai {
        height: calc(var(--control-bar-base-height) + env(safe-area-inset-bottom, 0px)) !important;
        padding-bottom: 0 !important;
      }
      #p1-controls.dual-ai .turn-btn > svg {
        transform: translateY(calc(-0.35 * env(safe-area-inset-bottom, 0px)));
      }
      #p1-controls.dual-ai .panel-with-btns {
        padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px)) !important;
      }

      /* Canvas: flex alanı tam doldursun, gap bırakmasın */
      #canvasWrap {
        flex: 1 1 auto !important;
        overflow: hidden !important;
        min-height: 0 !important;
      }

      /* P1 panelinin arka planını ekranın dibine uzat (::after trick) */
      #p1-controls {
        position: relative !important;
      }
      #p1-controls::after {
        content: '' !important;
        display: block !important;
        position: absolute !important;
        bottom: -80px !important;
        left: 0 !important;
        right: 0 !important;
        height: 80px !important;
        background: inherit !important;
        pointer-events: none !important;
        z-index: 0 !important;
      }

      /* ── iOS Retina GPU Performans & Sıfır Gecikme (Zero Input Lag) Optimizasyonları ── */
      /* 3x Retina ekranda 60 FPS canvas üzerinde ağır Gaussian blur compositing kilitlenmesini engelle */
      .banner.padded {
        background: linear-gradient(180deg, rgba(13, 22, 36, 0.90), rgba(10, 17, 29, 0.92)) !important;
        -webkit-backdrop-filter: blur(4px) !important;
        backdrop-filter: blur(4px) !important;
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45), 0 0 10px rgba(255, 79, 191, 0.25) !important;
        animation: none !important;
        transform: translateZ(0) !important;
        will-change: opacity, transform !important;
      }

      .banner.winner-glass-banner.padded {
        background: linear-gradient(160deg, rgba(10, 16, 28, 0.92), rgba(18, 28, 46, 0.88)) !important;
        -webkit-backdrop-filter: blur(4px) !important;
        backdrop-filter: blur(4px) !important;
        animation: none !important;
        transform: translateZ(0) !important;
      }

      .player-stat-panel::before {
        -webkit-backdrop-filter: blur(4px) !important;
        backdrop-filter: blur(4px) !important;
      }

      /* iOS WebKit sentetik 300ms tıklama gecikmesini sıfırla (0ms anlık tepki) */
      button, .btn, .turn-btn, .panel-pause-btn, .nav-btn, .option-btn, .tab-btn {
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
      }
    `;
    document.head.appendChild(style);
  })();

  // Android shell ile eşlik: WebKit dahili demo dondurmasını devreye al, harici H5 reklamlarını baypas et
  window.isAndroidWebView = true;
  document.documentElement.classList.add("android-webview");
  document.documentElement.setAttribute("data-ios-app", "true");
  document.documentElement.setAttribute("data-ios-shell", "true");
  document.documentElement.setAttribute("data-native-platform", "ios");
  window.__twoPlayerSnakePlatform = "ios";


  // ── Klavye Kapanınca Scroll Sıfırlama (Focusout) ──────────────────────────
  window.addEventListener("focusout", function (e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      setTimeout(function () {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }, 120);
    }
  }, true);

  // ── Haptic: Kesin ve Güvenli Yem Yeme Tespiti ──────────────────────────────
  // DOM Panel Score Watcher (MutationObserver + rAF fallback)
  // WebKit Audio veya Array prototype'larına ASLA dokunmaz.
  // Ses kapalı olsa dahi her yem yenildiğinde (1P, 2P, AI, Solo) anında haptic tetikler.
  (function installRobustFoodHaptics() {
    var lastP1 = 0;
    var lastP2 = 0;
    var lastHapticTime = 0;

    function triggerEatHaptic(type) {
      var now = Date.now();
      if (now - lastHapticTime < 50) return; // 50ms debounce
      lastHapticTime = now;
      postToNative("onEatFood", { type: type || "normal" });
    }

    function checkPanelLengths() {
      // Menü açıkken veya demo modundayken haptic tetikleme
      var banner = document.getElementById("banner");
      var isMenuVisible = banner && banner.classList.contains("show") && !banner.classList.contains("countdown-banner");
      if (isMenuVisible) {
        lastP1 = 0;
        lastP2 = 0;
        return;
      }

      var el1 = document.getElementById("p1PanelLen");
      var el2 = document.getElementById("p2PanelLen");

      if (el1) {
        var val1 = parseInt(el1.textContent, 10) || 0;
        if (val1 > 0) {
          if (lastP1 > 0 && val1 > lastP1) {
            triggerEatHaptic("normal");
          }
          lastP1 = val1;
        } else {
          lastP1 = 0;
        }
      }

      if (el2) {
        var val2 = parseInt(el2.textContent, 10) || 0;
        if (val2 > 0) {
          if (lastP2 > 0 && val2 > lastP2) {
            triggerEatHaptic("normal");
          }
          lastP2 = val2;
        } else {
          lastP2 = 0;
        }
      }
    }

    // Katman 1: MutationObserver ile 0ms gecikmeli DOM dinleme
    function setupObserver() {
      var el1 = document.getElementById("p1PanelLen");
      var el2 = document.getElementById("p2PanelLen");
      if (!el1 || !el2) {
        setTimeout(setupObserver, 150);
        return;
      }
      var obs = new MutationObserver(function () {
        checkPanelLengths();
      });
      obs.observe(el1, { characterData: true, childList: true, subtree: true });
      obs.observe(el2, { characterData: true, childList: true, subtree: true });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupObserver);
    } else {
      setupObserver();
    }

    // MutationObserver is sufficient here. A second requestAnimationFrame loop
    // woke WebKit every frame even while the menu/demo was visible.
  })();

})();
