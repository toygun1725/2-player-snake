(function () {
  if (window.__twoPlayerSnakeAndroidBridgeInstalled) return;
  window.__twoPlayerSnakeAndroidBridgeInstalled = true;
  window.__nativeAdCallbacks = window.__nativeAdCallbacks || {};

  function safeSerialize(payload) {
    try {
      return payload == null ? "" : JSON.stringify(payload);
    } catch (error) {
      return "";
    }
  }

  function safeCall(method, payload) {
    try {
      if (window.Android && typeof window.Android[method] === "function") {
        window.Android[method](safeSerialize(payload));
      }
    } catch (error) {
      console.warn("Android bridge call failed:", method, error);
    }
  }

  window.TwoPlayerSnakeNative = {
    emit: function (name, payload) {
      safeCall("emit", { name: name, payload: payload || {} });
    },
    onEatFood: function (payload) {
      safeCall("onEatFood", payload || {});
    },
    onGameStart: function (payload) {
      safeCall("onGameStart", payload || {});
    },
    onCollision: function (payload) {
      safeCall("onCollision", payload || {});
    },
    onGameOver: function (payload) {
      safeCall("onGameOver", payload || {});
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

  window.dispatchNativeSettings = function (settings) {
    window.TwoPlayerSnakeAppSettings = settings || {};
    var event = new CustomEvent("two-player-snake:native-settings", {
      detail: window.TwoPlayerSnakeAppSettings
    });
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    // Notify the game page via the onAndroidSettings hook (v3.3.0+)
    if (typeof window.onAndroidSettings === "function") {
      try { window.onAndroidSettings(window.TwoPlayerSnakeAppSettings); } catch(e) {}
    }
  };

  // --- H5 Ad Shim Integration ---
  window.adsbygoogle = window.adsbygoogle || [];

  // Core shim logic — routes adBreak calls to the native Android bridge.
  // Defined as a standalone function so both the adBreak override and the
  // adsbygoogle.push override can call it without infinite recursion.
  function __nativeAdBreakShim(o) {
      console.log("Android Shell: adBreak requested", o);

      var req = (o && typeof o === "object") ? o : {};

      // --- Premium bypass: skip ads entirely if adsRemoved is true ---
      if (window.TwoPlayerSnakeAppSettings && window.TwoPlayerSnakeAppSettings.adsRemoved === true) {
          console.log("Android Shell: adsRemoved=true, bypassing ad", req.type);
          var adType = req.type || "next";
          try { if (typeof req.beforeAd === "function") req.beforeAd(); } catch(e) {}
          if (adType === "reward") {
              // For rewarded: fire beforeReward (no-op fn), then adViewed, then afterAd, then adBreakDone
              try { if (typeof req.beforeReward === "function") req.beforeReward(function() {}); } catch(e) {}
              try { if (typeof req.adViewed === "function") req.adViewed(); } catch(e) {}
          }
          try { if (typeof req.afterAd === "function") req.afterAd(); } catch(e) {}
          try { if (typeof req.adBreakDone === "function") req.adBreakDone(); } catch(e) {}
          return;
      }
      // --- End premium bypass ---

      var callbackId = "adb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      window.__nativeAdCallbacks[callbackId] = {
          type: req.type || "next",
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
          console.warn("Android Shell: beforeAd callback error", e);
      }

      // For reward-type ads, trigger beforeReward with a no-op showAdFn.
      // The native SDK manages actual display; this call ensures the game
      // sets rewardFlowAvailable = true before the native ad fires.
      if ((req.type || "next") === "reward") {
          try {
              if (window.__nativeAdCallbacks[callbackId].beforeReward) {
                  window.__nativeAdCallbacks[callbackId].beforeReward(function() {
                      // no-op: native SDK handles ad display
                  });
              }
          } catch (e) {
              console.warn("Android Shell: beforeReward callback error", e);
          }
      }

      // Send only serializable data to native
      safeCall("adBreak", {
          type: req.type || "next",
          name: req.name || "",
          callbackId: callbackId
      });
  }

  // FORCE override — the HTML page defines adBreak/adConfig before this
  // bootstrap runs, so using "||" would skip the shim entirely.
  window.adConfig = function(o) {
      console.log("Android Shell: adConfig received", o);
  };

  window.adBreak = __nativeAdBreakShim;

  // Override adsbygoogle.push to catch ad calls that go through the
  // original HTML path (adBreak -> adsbygoogle.push). We call the shim
  // function directly (not window.adBreak) to avoid infinite recursion.
  window.adsbygoogle.push = function(o) {
      if (o && typeof o === 'object') {
          if (o.type === 'next' || o.type === 'reward' || o.type === 'browse') {
              __nativeAdBreakShim(o);
              return;
          }
      }
      // Non-ad calls (e.g. adConfig onReady) — silently consume.
  };

  // Callback for Native to resume the game
  window.__onNativeAdDone = function(adBreakDoneCallbackName, success) {
      console.log("Android Shell: Native ad finished, triggering callback:", adBreakDoneCallbackName, "success:", success);
      const callbacks = adBreakDoneCallbackName ? window.__nativeAdCallbacks[adBreakDoneCallbackName] : null;
      if (callbacks) {
          // adViewed / adDismissed only make sense for reward-type ads.
          // Interstitials do not define these callbacks.
          if (callbacks.type === "reward") {
              try {
                  if (success) {
                      if (callbacks.adViewed) callbacks.adViewed();
                  } else {
                      if (callbacks.adDismissed) callbacks.adDismissed();
                  }
              } catch (e) {
                  console.warn("Android Shell: reward callback error", e);
              }
          }
          try {
              if (callbacks.afterAd) callbacks.afterAd();
          } catch (e) {
              console.warn("Android Shell: afterAd callback error", e);
          }
          try {
              if (callbacks.adBreakDone) callbacks.adBreakDone();
          } catch (e) {
              console.warn("Android Shell: adBreakDone callback error", e);
          }
          delete window.__nativeAdCallbacks[adBreakDoneCallbackName];
          return;
      }

      // Legacy fallback
      if (adBreakDoneCallbackName && typeof window[adBreakDoneCallbackName] === 'function') {
          window[adBreakDoneCallbackName]();
      } else if (typeof window.adBreakDone === 'function') {
          window.adBreakDone();
      }
  };

  // --- Quality & Memory Optimization Lifecycle Hooks ---
  window.onAndroidPause = window.onAndroidPause || function () {
      try {
          if (window.AudioContext && window.__gameAudioCtx && window.__gameAudioCtx.state === 'running') {
              window.__gameAudioCtx.suspend();
          }
      } catch (e) {}
  };

  window.onAndroidResume = window.onAndroidResume || function () {
      try {
          if (window.AudioContext && window.__gameAudioCtx && window.__gameAudioCtx.state === 'suspended') {
              window.__gameAudioCtx.resume();
          }
      } catch (e) {}
  };

  window.onAndroidTrimMemory = window.onAndroidTrimMemory || function (level) {
      try {
          // Clear temporary cached canvases, image buffers if available
          if (window.__temporaryCanvases && Array.isArray(window.__temporaryCanvases)) {
              window.__temporaryCanvases.forEach(function (c) {
                  if (c) { c.width = 1; c.height = 1; }
              });
              window.__temporaryCanvases = [];
          }
      } catch (e) {}
  };

  document.documentElement.setAttribute("data-android-shell", "true");
})();
