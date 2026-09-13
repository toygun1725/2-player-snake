package com.twoplayersnake.app.cloud

import android.app.Activity
import android.util.Log
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.snapshot.SnapshotMetadataChange
import org.json.JSONArray
import org.json.JSONObject

/**
 * v3.3.2 — Google Play Games Services Cloud Save (Snapshots API)
 *
 * Kaydedilen veri yapısı (JSON):
 * {
 *   "mobileScores": [{ "name": "...", "score": 42 }, ...],  // max 10
 *   "pcScores":     [{ "name": "...", "score": 38 }, ...],  // max 10
 *   "adsRemoved": false,
 *   "savedAt": 1234567890000
 * }
 *
 * Kurallar:
 * - "adsRemoved: true" cloud'dan gelirse yerel tercihe yazılır.
 * - "adsRemoved: false" cloud'dan gelirse RevenueCat durumu üstün gelir (asla sıfırlamaz).
 * - Çakışma: her iki cihazın skorları birleştirilir, en yüksek 10'u saklanır.
 */
object CloudSaveManager {

    private const val TAG = "CloudSaveManager"
    private const val SNAPSHOT_NAME = "two_player_snake_save"
    private const val MAX_SCORES = 10

    /**
     * Mevcut snapshot'ı Google'a kaydeder.
     * @param activity Çağıran Activity
     * @param scoresJson Skor listesi (JSON array string)
     * @param platform "mobile" veya "pc"
     * @param adsRemoved Mevcut premium durumu
     */
    fun save(activity: Activity, scoresJson: String, platform: String, adsRemoved: Boolean) {
        PlayGames.getSnapshotsClient(activity)
            .open(SNAPSHOT_NAME, /* createIfNotFound */ true)
            .addOnSuccessListener { dataOrConflict ->
                if (dataOrConflict.isConflict) {
                    // Çakışma: her iki tarafın verisini oku, birleştir
                    val conflict = dataOrConflict.conflict!!
                    val baseData = conflict.snapshot.snapshotContents.readFully()
                    val serverData = conflict.conflictingSnapshot.snapshotContents.readFully()
                    val merged = mergeSnapshots(baseData, serverData, scoresJson, platform, adsRemoved)
                    conflict.snapshot.snapshotContents.writeBytes(merged)
                    PlayGames.getSnapshotsClient(activity).resolveConflict(
                        conflict.conflictId, conflict.snapshot
                    )
                    Log.d(TAG, "Çakışma çözüldü ve snapshot birleştirildi.")
                } else {
                    val snapshot = dataOrConflict.data!!
                    val existing = snapshot.snapshotContents.readFully()
                    val updated = updateSnapshot(existing, scoresJson, platform, adsRemoved)
                    snapshot.snapshotContents.writeBytes(updated)
                    val metadata = SnapshotMetadataChange.Builder()
                        .setDescription("2 Player Snake Save")
                        .build()
                    PlayGames.getSnapshotsClient(activity).commitAndClose(snapshot, metadata)
                        .addOnSuccessListener { Log.d(TAG, "Snapshot kaydedildi. Platform: $platform") }
                        .addOnFailureListener { Log.e(TAG, "Snapshot kaydetme hatası", it) }
                }
            }
            .addOnFailureListener { Log.e(TAG, "Snapshot açma hatası", it) }
    }

    /**
     * Mevcut snapshot'ı Google'dan yükler.
     * @param onResult JSON string döner; hata/yoksa null döner
     */
    fun load(activity: Activity, onResult: (String?) -> Unit) {
        PlayGames.getSnapshotsClient(activity)
            .open(SNAPSHOT_NAME, /* createIfNotFound */ false)
            .addOnSuccessListener { dataOrConflict ->
                if (dataOrConflict.isConflict) {
                    // Çakışma varsa sunucu versiyonunu döndür
                    val data = dataOrConflict.conflict!!.conflictingSnapshot.snapshotContents.readFully()
                    onResult(String(data))
                    Log.d(TAG, "Snapshot yüklendi (çakışma → sunucu versiyonu).")
                } else {
                    val data = dataOrConflict.data!!.snapshotContents.readFully()
                    val json = String(data)
                    onResult(if (json.isBlank()) null else json)
                    Log.d(TAG, "Snapshot yüklendi.")
                }
            }
            .addOnFailureListener {
                Log.w(TAG, "Snapshot yüklenemedi (yeni kullanıcı veya hata): ${it.message}")
                onResult(null)
            }
    }

    // -----------------------------------------------------------------------
    // Yardımcı fonksiyonlar
    // -----------------------------------------------------------------------

    /** Mevcut snapshot JSON'ına yeni skorları ekler, adsRemoved günceller. */
    private fun updateSnapshot(
        existing: ByteArray,
        scoresJson: String,
        platform: String,
        adsRemoved: Boolean
    ): ByteArray {
        return runCatching {
            val root = if (existing.isEmpty()) JSONObject() else JSONObject(String(existing))
            val field = if (platform == "pc") "pcScores" else "mobileScores"
            root.put(field, mergeScores(root.optJSONArray(field), JSONArray(scoresJson)))
            // adsRemoved: cloud asla false yazamaz, sadece true olabilir
            if (adsRemoved) root.put("adsRemoved", true)
            root.put("savedAt", System.currentTimeMillis())
            root.toString().toByteArray()
        }.getOrElse {
            Log.e(TAG, "updateSnapshot parse hatası", it)
            existing
        }
    }

    /** İki snapshot'ı birleştirir. */
    private fun mergeSnapshots(
        base: ByteArray, server: ByteArray,
        newScoresJson: String, platform: String, adsRemoved: Boolean
    ): ByteArray {
        return runCatching {
            val baseObj  = if (base.isEmpty())   JSONObject() else JSONObject(String(base))
            val serverObj = if (server.isEmpty()) JSONObject() else JSONObject(String(server))
            val field = if (platform == "pc") "pcScores" else "mobileScores"

            // Her iki tarafın skorlarını birleştir
            val merged = JSONObject()
            merged.put("mobileScores", mergeScores(baseObj.optJSONArray("mobileScores"), serverObj.optJSONArray("mobileScores")))
            merged.put("pcScores",     mergeScores(baseObj.optJSONArray("pcScores"),     serverObj.optJSONArray("pcScores")))
            // Yeni skorları da ekle
            merged.put(field, mergeScores(merged.optJSONArray(field), JSONArray(newScoresJson)))
            // adsRemoved: en az birinde true varsa true
            val anyAdsRemoved = baseObj.optBoolean("adsRemoved") || serverObj.optBoolean("adsRemoved") || adsRemoved
            if (anyAdsRemoved) merged.put("adsRemoved", true)
            merged.put("savedAt", System.currentTimeMillis())
            merged.toString().toByteArray()
        }.getOrElse {
            Log.e(TAG, "mergeSnapshots parse hatası", it)
            base
        }
    }

    /** İki JSONArray skor listesini birleştirip en yüksek MAX_SCORES tanesini döndürür. */
    private fun mergeScores(a: JSONArray?, b: JSONArray?): JSONArray {
        val combined = mutableListOf<Pair<String, Int>>()
        fun extract(arr: JSONArray?) {
            arr ?: return
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                combined.add(obj.optString("name", "?") to obj.optInt("score", 0))
            }
        }
        extract(a)
        extract(b)
        combined.sortByDescending { it.second }
        val result = JSONArray()
        combined.take(MAX_SCORES).forEach { (name, score) ->
            result.put(JSONObject().put("name", name).put("score", score))
        }
        return result
    }
}
