package com.twoplayersnake.app.web

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.webkit.RenderProcessGoneDetail
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient

class GameWebViewClient(
    private val context: Context,
    private val onMainFrameLoadingStarted: (String) -> Unit,
    private val onTrustedPageFinished: (String) -> Unit,
    private val onMainFrameLoadFailed: () -> Unit,
    private val onRenderProcessGone: () -> Unit
) : WebViewClient() {

    override fun shouldInterceptRequest(
        view: WebView?,
        request: WebResourceRequest
    ): WebResourceResponse? {
        val url = request.url.toString()
        val assetMatch = resolveBundledWebAsset(url)
        if (assetMatch != null) {
            val (assetPath, mimeType, encoding) = assetMatch
            return try {
                val stream = context.assets.open(assetPath)
                WebResourceResponse(mimeType, encoding, stream).apply {
                    responseHeaders = mapOf(
                        "Access-Control-Allow-Origin" to "*",
                        "Cache-Control" to "public, max-age=31536000, immutable"
                    )
                }
            } catch (_: Exception) {
                super.shouldInterceptRequest(view, request)
            }
        }
        return super.shouldInterceptRequest(view, request)
    }

    private fun resolveBundledWebAsset(url: String): Triple<String, String, String?>? {
        val lower = url.lowercase()
        return when {
            lower.contains("fonts.googleapis.com/css") && (lower.contains("orbitron") || lower.contains("vt323")) ->
                Triple("web_assets/fonts.css", "text/css", "UTF-8")
            lower.endsWith("/orbitron.ttf") ->
                Triple("web_assets/orbitron.ttf", "font/ttf", null)
            lower.endsWith("/vt323.ttf") ->
                Triple("web_assets/vt323.ttf", "font/ttf", null)
            lower.contains("font-awesome") && lower.contains("all.min.css") ->
                Triple("web_assets/fontawesome.css", "text/css", "UTF-8")
            lower.contains("fa-solid-900.woff2") ->
                Triple("web_assets/fa-solid-900.woff2", "font/woff2", null)
            lower.contains("fa-regular-400.woff2") ->
                Triple("web_assets/fa-regular-400.woff2", "font/woff2", null)
            lower.contains("fa-brands-400.woff2") ->
                Triple("web_assets/fa-brands-400.woff2", "font/woff2", null)
            lower.contains("blogger.googleusercontent.com") && lower.contains("snake%20logo.png") ->
                Triple("web_assets/offline_logo.png", "image/png", null)
            else -> null
        }
    }

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest): Boolean {
        if (!request.isForMainFrame) return false
        return handleTopLevelNavigation(request.url.toString())
    }

    @Deprecated("Deprecated in Java")
    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
        return handleTopLevelNavigation(url)
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        if (TrustedWebOrigin.isTrustedTopLevelUrl(url)) {
            onMainFrameLoadingStarted(url ?: TrustedWebOrigin.ENTRY_URL)
        }
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        if (TrustedWebOrigin.isTrustedTopLevelUrl(url)) {
            onTrustedPageFinished(url ?: TrustedWebOrigin.ENTRY_URL)
        }
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest,
        error: WebResourceError
    ) {
        super.onReceivedError(view, request, error)
        if (request.isForMainFrame) {
            onMainFrameLoadFailed()
        }
    }

    override fun onReceivedSslError(
        view: WebView?,
        handler: SslErrorHandler,
        error: SslError
    ) {
        handler.cancel()
        onMainFrameLoadFailed()
    }

    override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
        onRenderProcessGone()
        return true
    }

    private fun handleTopLevelNavigation(url: String?): Boolean {
        if (TrustedWebOrigin.isTrustedTopLevelUrl(url)) {
            return false
        }

        if (!url.isNullOrBlank()) {
            val uri = Uri.parse(url)
            val scheme = uri.scheme?.lowercase()
            if (scheme == "http" || scheme == "https") {
                val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                    addCategory(Intent.CATEGORY_BROWSABLE)
                }
                runCatching { context.startActivity(intent) }
            }
        }
        return true
    }
}
