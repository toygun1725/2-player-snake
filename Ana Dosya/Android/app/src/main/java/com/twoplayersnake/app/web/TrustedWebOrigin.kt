package com.twoplayersnake.app.web

import android.net.Uri

object TrustedWebOrigin {
    const val ENTRY_URL = "https://2playersnake.com/wp-content/uploads/game-mobile/index.html"
    const val OFFLINE_FALLBACK_URL = "file:///android_asset/offline/mobile_offline_fallback.html"

    private val allowedHosts = setOf(
        "2playersnake.com",
        "www.2playersnake.com"
    )

    private val allowedPathPrefixes = listOf(
        "/mobile",
        "/wp-content/uploads/game-mobile/",
        "/wp-content/uploads/game/"
    )

    fun isTrustedTopLevelUrl(url: String?): Boolean {
        if (url.isNullOrBlank()) return false
        if (url == OFFLINE_FALLBACK_URL) return true
        val uri = runCatching { Uri.parse(url) }.getOrNull() ?: return false
        val host = uri.host?.lowercase() ?: return false
        val scheme = uri.scheme?.lowercase()
        val path = uri.encodedPath ?: "/"
        return scheme == "https" &&
            host in allowedHosts &&
            allowedPathPrefixes.any { prefix -> path.startsWith(prefix) }
    }
}
