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
      return (window.TwoPlayerSnakeAppSettings && window.TwoPlayerSnakeAppSettings.adsRemoved) ? "true" : "false";
    },
    adBreak: function (payload) {
      postToNative("adBreak", payload);
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
    var event = new CustomEvent("two-player-snake:native-settings", {
      detail: window.TwoPlayerSnakeAppSettings
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    if (typeof window.onAndroidSettings === "function") {
      try { window.onAndroidSettings(window.TwoPlayerSnakeAppSettings); } catch (e) {}
    }
  };

  // --- Reklam Shim Entegrasyonu ---
  window.adsbygoogle = window.adsbygoogle || [];

  function __nativeAdBreakShim(o) {
    var req = (o && typeof o === "object") ? o : {};

    // Reklamsız satın alındıysa reklamı atla
    if (window.TwoPlayerSnakeAppSettings && window.TwoPlayerSnakeAppSettings.adsRemoved === true) {
      var adType = req.type || "next";
      try { if (typeof req.beforeAd === "function") req.beforeAd(); } catch (e) {}
      if (adType === "reward") {
        try { if (typeof req.beforeReward === "function") req.beforeReward(function () {}); } catch (e) {}
        try { if (typeof req.adViewed === "function") req.adViewed(); } catch (e) {}
      }
      try { if (typeof req.afterAd === "function") req.afterAd(); } catch (e) {}
      try { if (typeof req.adBreakDone === "function") req.adBreakDone(); } catch (e) {}
      return;
    }

    var callbackId = "adb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    var fallbackTimer = setTimeout(function () {
      if (window.__nativeAdCallbacks && window.__nativeAdCallbacks[callbackId]) {
        console.warn("iOS Bridge: adBreak timeout (350ms) - auto continuing game for", callbackId);
        window.__onNativeAdDone(callbackId, true);
      }
    }, 350);

    window.__nativeAdCallbacks[callbackId] = {
      type: req.type || "next",
      timer: fallbackTimer,
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
    } catch (e) {}

    if ((req.type || "next") === "reward") {
      try {
        if (window.__nativeAdCallbacks[callbackId].beforeReward) {
          window.__nativeAdCallbacks[callbackId].beforeReward(function () {});
        }
      } catch (e) {}
    }

    postToNative("adBreak", {
      type: req.type || "next",
      name: req.name || "",
      callbackId: callbackId
    });
  }

  window.adConfig = function (o) {};
  window.adBreak = __nativeAdBreakShim;

  window.adsbygoogle.push = function (o) {
    if (o && typeof o === "object") {
      if (o.type === "next" || o.type === "reward" || o.type === "browse") {
        __nativeAdBreakShim(o);
        return;
      }
    }
  };

  window.__onNativeAdDone = function (adBreakDoneCallbackName, success) {
    var callbacks = adBreakDoneCallbackName ? window.__nativeAdCallbacks[adBreakDoneCallbackName] : null;
    if (callbacks) {
      if (callbacks.timer) {
        clearTimeout(callbacks.timer);
      }
      if (callbacks.type === "reward") {
        try {
          if (success && callbacks.adViewed) callbacks.adViewed();
          else if (!success && callbacks.adDismissed) callbacks.adDismissed();
        } catch (e) {}
      }
      try { if (callbacks.afterAd) callbacks.afterAd(); } catch (e) {}
      try { if (callbacks.adBreakDone) callbacks.adBreakDone(); } catch (e) {}
      delete window.__nativeAdCallbacks[adBreakDoneCallbackName];
      return;
    }
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
    `;
    document.head.appendChild(style);
  })();

  document.documentElement.setAttribute("data-android-app", "true");
  document.documentElement.setAttribute("data-ios-app", "true");
  document.documentElement.setAttribute("data-ios-shell", "true");

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

  // ── Pause "Home" Butonu Güvenli Geçiş Koruması ────────────────────────────
  // Pause menüsündeki ev butonuna tıklandığında olası reklam/balon takılmalarını baypas eder
  function handlePauseHomeSafely(e) {
    var homeBtn = e.target && e.target.closest ? e.target.closest('[data-action="home"]') : null;
    if (!homeBtn) return;
    
    var cw = document.getElementById("canvasWrap");
    if (cw) cw.classList.remove("paused-blur");
    document.querySelectorAll(".pause-bubbles").forEach(function (el) { el.remove(); });
    
    // Olası takılı kalan native ad callback'lerini serbest bırak
    if (window.__nativeAdCallbacks) {
      for (var cid in window.__nativeAdCallbacks) {
        if (typeof window.__onNativeAdDone === "function") {
          window.__onNativeAdDone(cid, true);
        }
      }
    }
    
    // Doğrudan ana menü açılışını garanti et
    setTimeout(function() {
      if (typeof window.openMainMenu === "function") {
        window.openMainMenu();
      }
    }, 50);
  }
  document.addEventListener("click", handlePauseHomeSafely, true);
  document.addEventListener("touchend", handlePauseHomeSafely, true);

  // ── Haptic: digestAnims & Web Audio Oscillator Hook ───────────────────────
  // Yılan yem yediğinde digestAnims.push({ startTime, color }) çağrılır.
  // Bu nesne hook'lanarak ses açık/kapalı fark etmeksizin anında haptic üretilir.
  (function installHapticHooks() {
    var lastEatTime = 0;

    function triggerEatHaptic(type) {
      var now = Date.now();
      if (now - lastEatTime < 45) return; // 45ms debounce
      lastEatTime = now;
      postToNative("onEatFood", { type: type || "normal" });
    }

    // Hook 1: Array.prototype.push — digestAnims tespiti (oyun içi kesin sinyal)
    var origPush = Array.prototype.push;
    Array.prototype.push = function () {
      if (arguments.length === 1 && arguments[0] && typeof arguments[0] === "object") {
        var item = arguments[0];
        if (item.startTime !== undefined && item.color !== undefined) {
          var c = item.color;
          var foodType = "normal";
          if (c === "#ffd166" || c === "#00cfff") foodType = "diamond";
          else if (c === "#ff1744") foodType = "heart";
          triggerEatHaptic(foodType);
        }
      }
      return origPush.apply(this, arguments);
    };

    // Hook 2: AudioContext.prototype.createOscillator (720Hz = SFX.eat)
    try {
      var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass && AudioCtxClass.prototype && AudioCtxClass.prototype.createOscillator) {
        var origCreateOsc = AudioCtxClass.prototype.createOscillator;
        AudioCtxClass.prototype.createOscillator = function () {
          var osc = origCreateOsc.apply(this, arguments);
          var origStart = osc.start;
          osc.start = function () {
            try {
              var freq = Math.round(osc.frequency.value);
              if (freq === 720) {
                triggerEatHaptic("normal");
              } else if (freq === 1200) {
                triggerEatHaptic("diamond");
              } else if (freq === 640) {
                triggerEatHaptic("heart");
              }
            } catch (err) {}
            return origStart.apply(this, arguments);
          };
          return osc;
        };
      }
    } catch (e) {
      console.warn("AudioContext hook failed:", e);
    }
  })();

})();
