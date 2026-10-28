package com.twoplayersnake.app.cloud

import android.app.Activity
import android.content.Context
import com.google.android.gms.games.PlayGames
import org.json.JSONArray
import org.json.JSONObject

/** Runs on the UI thread. The durable local backup is never removed after a cloud error. */
internal class CloudSaveCoordinator(
    private val activity: Activity,
    private val adsRemoved: () -> Boolean,
    private val onLoaded: (CloudSaveData) -> Unit
) {
    private val prefs = activity.getSharedPreferences("cloud_save_v1", Context.MODE_PRIVATE)
    private var running = false
    private var revision = 0L
    private val legacyName = "two_player_snake_save"
    private val v1Name = "two_player_snake_save_v1"

    private fun readLocal(): CloudSaveData {
        val raw = prefs.getString("backup", null) ?: return CloudSaveData()
        return CloudSaveData.parse(raw, allowLegacy = false)
    }

    private fun persist(data: CloudSaveData, pending: Boolean): Boolean = prefs.edit()
        .putString("backup", data.toJson().toString())
        .putBoolean("pending", pending)
        .commit()

    fun accept(payload: String): Boolean {
        return try {
            val json = JSONObject(payload)
            // Only native purchase verification and prior trusted data may set this flag.
            json.remove("adsRemoved")
            val incoming = CloudSaveData.parse(json.toString(), allowLegacy = false)
            acceptData(incoming)
        } catch (_: Exception) { false }
    }

    fun acceptLegacy(scores: String, platform: String): Boolean {
        return try {
            val json = JSONObject().put("schemaVersion", 1)
                .put("mobileScores", JSONArray()).put("pcScores", JSONArray()).put("achievements", JSONArray())
            json.put(if (platform == "pc") "pcScores" else "mobileScores", JSONArray(scores))
            accept(json.toString())
        } catch (_: Exception) { false }
    }

    private fun acceptData(incoming: CloudSaveData): Boolean {
        val merged = try { CloudSaveData.merge(readLocal(), incoming, CloudSaveData(adsRemoved = adsRemoved())) }
        catch (_: Exception) { return false }
        if (!persist(merged, true)) return false
        revision++
        onLoaded(merged)
        retry()
        return true
    }

    fun entitlementChanged() { acceptData(CloudSaveData(adsRemoved = adsRemoved())) }

    /** Called after page load and foreground, including to import newly updated legacy scores. */
    fun refresh() {
        try { onLoaded(readLocal()) } catch (_: Exception) { return }
        revision++
        retry()
    }

    private fun retry() {
        if (running || activity.isFinishing || activity.isDestroyed) return
        running = true
        val started = revision
        fun finish() {
            running = false
            if (revision != started) retry()
        }
        PlayGames.getPlayersClient(activity).currentPlayerId
            .addOnFailureListener { finish() }
            .addOnSuccessListener { playerId ->
                val gateway = PlayGamesSnapshotGateway(activity, playerId)
                gateway.process(legacyName, legacy = true, incoming = null) legacy@ { legacy ->
                    if (legacy == null) { finish(); return@legacy }
                    gateway.process(v1Name, legacy = false, incoming = null) v1@ { cloud ->
                        if (cloud == null) { finish(); return@v1 }
                        val merged = try { CloudSaveData.merge(readLocal(), legacy, cloud, CloudSaveData(adsRemoved = adsRemoved())) }
                        catch (_: Exception) { finish(); return@v1 }
                        if (!persist(merged, true)) { finish(); return@v1 }
                        onLoaded(merged)
                        gateway.process(v1Name, legacy = false, incoming = merged) save@ { saved ->
                            if (saved == null) { finish(); return@save }
                            // Keep changes accepted while the network request was running.
                            val latest = try { CloudSaveData.merge(readLocal(), saved) } catch (_: Exception) { finish(); return@save }
                            if (!persist(latest, pending = revision != started)) { finish(); return@save }
                            onLoaded(latest)
                            finish()
                        }
                    }
                }
            }
    }
}
