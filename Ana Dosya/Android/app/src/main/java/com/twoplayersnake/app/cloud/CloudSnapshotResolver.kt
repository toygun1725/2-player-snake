package com.twoplayersnake.app.cloud

/** Handles one opened snapshot without treating errors as empty data. */
internal interface CloudSnapshotBackend<H> {
    fun discard(handle: H, done: (Boolean) -> Unit)
    fun resolve(conflictId: String, chosen: H, merged: CloudSaveData, legacy: Boolean, done: (CloudSnapshotResult<H>) -> Unit)
    fun commit(handle: H, merged: CloudSaveData, done: (Boolean) -> Unit)
}

internal sealed class CloudSnapshotResult<H> {
    class Opened<H>(val handle: H, val data: CloudSaveData) : CloudSnapshotResult<H>()
    class Conflict<H>(val id: String, val first: H, val firstData: CloudSaveData, val second: H, val secondData: CloudSaveData) : CloudSnapshotResult<H>()
    class Failure<H> : CloudSnapshotResult<H>()
}

internal class CloudSnapshotResolver<H>(private val backend: CloudSnapshotBackend<H>) {
    /** Each operation permits at most three conflict-resolution calls. */
    fun run(initial: CloudSnapshotResult<H>, legacy: Boolean, incoming: CloudSaveData?, done: (CloudSaveData?) -> Unit) {
        var completed = false
        fun finish(value: CloudSaveData?) {
            if (!completed) { completed = true; done(value) }
        }
        fun handle(result: CloudSnapshotResult<H>, count: Int) {
            if (completed) return
            when (result) {
                is CloudSnapshotResult.Failure -> finish(null)
                is CloudSnapshotResult.Opened -> {
                    val merged = if (incoming == null) result.data else CloudSaveData.merge(result.data, incoming)
                    if (incoming == null) backend.discard(result.handle) { ok -> finish(if (ok) merged else null) }
                    else backend.commit(result.handle, merged) { ok -> finish(if (ok) merged else null) }
                }
                is CloudSnapshotResult.Conflict -> {
                    if (count >= 3) {
                        backend.discard(result.first) { backend.discard(result.second) { finish(null) } }
                        return
                    }
                    val merged = if (incoming == null) CloudSaveData.merge(result.firstData, result.secondData)
                    else CloudSaveData.merge(result.firstData, result.secondData, incoming)
                    backend.discard(result.second) { discarded ->
                        if (!discarded) { backend.discard(result.first) { finish(null) }; return@discard }
                        // resolve takes ownership of the first handle, including on failure.
                        backend.resolve(result.id, result.first, merged, legacy) { next -> handle(next, count + 1) }
                    }
                }
            }
        }
        handle(initial, 0)
    }
}
