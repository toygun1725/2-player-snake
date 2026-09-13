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
import android.webkit.WebView
import android.webkit.WebViewClient

class GameWebViewClient(
    private val context: Context,
    private val onMainFrameLoadingStarted: (String) -> Unit,
    private val onTrustedPageFinished: (String) -> Unit,
    private val onMainFrameLoadFailed: () -> Unit,
    private val onRenderProcessGone: () -> Unit
) : WebViewClient() {

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
