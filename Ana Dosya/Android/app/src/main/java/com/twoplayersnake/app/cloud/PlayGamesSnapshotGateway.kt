package com.twoplayersnake.app.cloud

import android.app.Activity
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.SnapshotsClient
import com.google.android.gms.games.snapshot.Snapshot
import com.google.android.gms.games.snapshot.SnapshotMetadataChange
import org.json.JSONObject

/** All errors leave the caller's local backup intact; an inaccessible file is not an empty file. */
internal class PlayGamesSnapshotGateway(private val activity: Activity, private val playerId: String) : CloudSnapshotBackend<Snapshot> {
    private val client = PlayGames.getSnapshotsClient(activity)

    private fun samePlayer(done: (Boolean) -> Unit) {
        if (activity.isFinishing || activity.isDestroyed) { done(false); return }
        PlayGames.getPlayersClient(activity).currentPlayerId
            .addOnSuccessListener { done(!activity.isFinishing && !activity.isDestroyed && it == playerId) }
            .addOnFailureListener { done(false) }
    }

    override fun discard(handle: Snapshot, done: (Boolean) -> Unit) {
        try { client.discardAndClose(handle).addOnSuccessListener { done(true) }.addOnFailureListener { done(false) } }
        catch (_: Exception) { done(false) }
    }

    private fun parse(snapshot: Snapshot, legacy: Boolean, allowEmpty: Boolean): CloudSaveData {
        val bytes = snapshot.snapshotContents.readFully()
        if (bytes.isEmpty()) {
            require(allowEmpty) { "Unexpected empty snapshot" }
            return CloudSaveData()
        }
        val raw = String(bytes, Charsets.UTF_8)
        if (legacy) require(!JSONObject(raw).has("schemaVersion")) { "Unexpected legacy schema" }
        return CloudSaveData.parse(raw, allowLegacy = legacy)
    }

    private fun convert(data: SnapshotsClient.DataOrConflict<Snapshot>, legacy: Boolean, allowEmpty: Boolean, done: (CloudSnapshotResult<Snapshot>) -> Unit) {
        if (data.isConflict) {
            val conflict = data.conflict ?: run { done(CloudSnapshotResult.Failure()); return }
            val first = conflict.snapshot
            val second = conflict.conflictingSnapshot
            try {
                val a = parse(first, legacy, false)
                val b = parse(second, legacy, false)
                done(CloudSnapshotResult.Conflict(conflict.conflictId, first, a, second, b))
            } catch (_: Exception) {
                discard(first) { discard(second) { done(CloudSnapshotResult.Failure()) } }
            }
        } else {
            val snapshot = data.data ?: run { done(CloudSnapshotResult.Failure()); return }
            try { done(CloudSnapshotResult.Opened(snapshot, parse(snapshot, legacy, allowEmpty))) }
            catch (_: Exception) { discard(snapshot) { done(CloudSnapshotResult.Failure()) } }
        }
    }

    override fun resolve(conflictId: String, chosen: Snapshot, merged: CloudSaveData, legacy: Boolean, done: (CloudSnapshotResult<Snapshot>) -> Unit) {
        samePlayer { matches ->
            if (!matches) { discard(chosen) { done(CloudSnapshotResult.Failure()) }; return@samePlayer }
            try {
                chosen.snapshotContents.writeBytes(merged.toJson(legacy = legacy).toString().toByteArray(Charsets.UTF_8))
                client.resolveConflict(conflictId, chosen)
                    .addOnSuccessListener { convert(it, legacy, false, done) }
                    .addOnFailureListener { done(CloudSnapshotResult.Failure()) }
            } catch (_: Exception) { discard(chosen) { done(CloudSnapshotResult.Failure()) } }
        }
    }

    override fun commit(handle: Snapshot, merged: CloudSaveData, done: (Boolean) -> Unit) {
        samePlayer { matches ->
            if (!matches) { discard(handle) { done(false) }; return@samePlayer }
            try {
                handle.snapshotContents.writeBytes(merged.toJson().toString().toByteArray(Charsets.UTF_8))
                client.commitAndClose(handle, SnapshotMetadataChange.EMPTY_CHANGE)
                    .addOnSuccessListener { done(true) }
                    .addOnFailureListener { done(false) }
            } catch (_: Exception) { discard(handle) { done(false) } }
        }
    }

    /** A metadata lookup distinguishes a missing file from a failed read. */
    fun process(name: String, legacy: Boolean, incoming: CloudSaveData?, done: (CloudSaveData?) -> Unit) {
        samePlayer { matches ->
            if (!matches) { done(null); return@samePlayer }
            client.load(true).addOnFailureListener { done(null) }.addOnSuccessListener { annotated ->
                if (annotated.isStale) { annotated.get()?.release(); done(null); return@addOnSuccessListener }
                val buffer = annotated.get() ?: run { done(null); return@addOnSuccessListener }
                val exists = try { buffer.any { it.uniqueName == name } } finally { buffer.release() }
                samePlayer stillSame@ { stillMatches ->
                    if (!stillMatches) { done(null); return@stillSame }
                    if (!exists && incoming == null) { done(CloudSaveData()); return@stillSame }
                    val create = !exists && incoming != null
                    client.open(name, create, SnapshotsClient.RESOLUTION_POLICY_MANUAL)
                        .addOnFailureListener { done(null) }
                        .addOnSuccessListener { result ->
                            convert(result, legacy, create) { opened ->
                                CloudSnapshotResolver(this).run(opened, legacy, incoming) { merged ->
                                    samePlayer { same -> done(if (same) merged else null) }
                                }
                            }
                        }
                }
            }
        }
    }
}
