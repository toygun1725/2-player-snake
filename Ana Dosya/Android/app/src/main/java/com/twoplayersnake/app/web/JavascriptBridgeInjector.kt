package com.twoplayersnake.app.web

import android.content.Context
import android.webkit.WebView
import com.twoplayersnake.app.prefs.AppPreferences

object JavascriptBridgeInjector {
    private var bootstrapScript: String? = null
    private val androidViewportFixScript =
        """
            (function() {
                const styleId = "android-top-controls-fix";
                if (document.getElementById(styleId)) return;
                const style = document.createElement("style");
                style.id = styleId;
                style.textContent = `
                    #p2-controls {
                        padding-top: 0 !important;
                    }
                    #p2-controls .p2-panel {
                        padding-top: calc(2px + var(--safe-area-top)) !important;
                    }
                `;
                document.head.appendChild(style);
                document.documentElement.setAttribute("data-android-app", "true");
            })();
        """.trimIndent()

    fun install(webView: WebView, context: Context) {
        val script = bootstrapScript ?: context.assets
            .open("js/android_bridge_bootstrap.js")
            .bufferedReader()
            .use { it.readText() }
            .also { bootstrapScript = it }

        webView.evaluateJavascript(script, null)
        webView.evaluateJavascript(androidViewportFixScript, null)
    }

    fun publishSettings(webView: WebView, preferences: AppPreferences) {
        val payload = """
            (function() {
                var settings = {
                    vibrationEnabled: ${preferences.vibrationEnabled},
                    soundEnabled: ${preferences.soundEnabled},
                    adsRemoved: ${preferences.adsRemoved}
                };
                if (typeof window.dispatchNativeSettings === "function") {
                    window.dispatchNativeSettings(settings);
                }
                if (typeof window.onAndroidSettings === "function") {
                    try { window.onAndroidSettings(settings); } catch(e) {}
                }
            })();
        """.trimIndent()

        webView.evaluateJavascript(payload, null)
    }
}
