package com.twoplayersnake.app.connectivity

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities

class NetworkMonitor(context: Context) {
    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private var callback: ConnectivityManager.NetworkCallback? = null

    fun isOnline(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    fun start(onChanged: (Boolean) -> Unit) {
        stop()
        callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                onChanged(true)
            }

            override fun onLost(network: Network) {
                onChanged(isOnline())
            }

            override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) {
                val hasInternet = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                onChanged(hasInternet)
            }
        }
        connectivityManager.registerDefaultNetworkCallback(callback!!)
    }

    fun stop() {
        callback?.let {
            runCatching {
                connectivityManager.unregisterNetworkCallback(it)
            }
        }
        callback = null
    }
}
