package com.twoplayersnake.app.cloud

import org.json.JSONArray
import org.json.JSONObject

/** Canonical v1 values. A malformed or newer document is never interpreted as an empty save. */
internal data class CloudScore(val name: String, val score: Long)
internal data class CloudSaveData(
    val mobileScores: List<CloudScore> = emptyList(),
    val pcScores: List<CloudScore> = emptyList(),
    val achievements: Set<String> = emptySet(),
    val adsRemoved: Boolean = false
) {
    companion object {
        private const val MAX_SCORES = 10
        private const val MAX_SAFE_INTEGER = 9007199254740991L

        private fun scalarCompare(a: String, b: String): Int {
            var ai = 0
            var bi = 0
            while (ai < a.length && bi < b.length) {
                val ac = Character.codePointAt(a, ai)
                val bc = Character.codePointAt(b, bi)
                if (ac != bc) return ac.compareTo(bc)
                ai += Character.charCount(ac)
                bi += Character.charCount(bc)
            }
            return (a.length - ai).compareTo(b.length - bi)
        }

        private fun parseScores(root: JSONObject, field: String): List<CloudScore> {
            if (!root.has(field)) return emptyList()
            val array = root.get(field) as? JSONArray ?: error("Invalid $field")
            return List(array.length()) { index ->
                val entry = array.get(index) as? JSONObject ?: error("Invalid score entry")
                val name = entry.get("name") as? String ?: error("Invalid score name")
                val value = entry.get("score") as? Number ?: error("Invalid score value")
                val double = value.toDouble()
                require(double.isFinite() && double >= 0 && double <= MAX_SAFE_INTEGER && double % 1.0 == 0.0) { "Invalid score value" }
                CloudScore(name, double.toLong())
            }
        }

        fun parse(raw: String, allowLegacy: Boolean): CloudSaveData {
            val root = JSONObject(raw)
            if (root.has("schemaVersion")) {
                val value = root.get("schemaVersion") as? Number ?: error("Invalid schema version")
                require(value.toDouble() == 1.0) { "Unsupported schema version" }
                require(root.has("mobileScores") && root.has("pcScores") && root.has("achievements")) { "Incomplete v1 snapshot" }
            } else require(allowLegacy) { "Missing schema version" }
            val achievements = if (root.has("achievements")) {
                val array = root.get("achievements") as? JSONArray ?: error("Invalid achievements")
                List(array.length()) { index ->
                    val id = array.get(index) as? String ?: error("Invalid achievement")
                    require(id.matches(Regex("ACH_[A-Z0-9_]+"))) { "Invalid achievement" }
                    id
                }.toSet()
            } else emptySet()
            val adsRemoved = if (root.has("adsRemoved")) root.get("adsRemoved") as? Boolean ?: error("Invalid purchase flag") else false
            return CloudSaveData(parseScores(root, "mobileScores"), parseScores(root, "pcScores"), achievements, adsRemoved)
        }

        fun merge(vararg saves: CloudSaveData): CloudSaveData {
            fun scores(items: List<CloudScore>): List<CloudScore> = items.distinct()
                .sortedWith { a, b ->
                    val byScore = b.score.compareTo(a.score)
                    if (byScore != 0) byScore else scalarCompare(a.name, b.name)
                }.take(MAX_SCORES)
            return CloudSaveData(
                scores(saves.flatMap { it.mobileScores }),
                scores(saves.flatMap { it.pcScores }),
                saves.flatMap { it.achievements }.toSet(),
                saves.any { it.adsRemoved }
            )
        }
    }

    fun toJson(includeAdsRemoved: Boolean = true, legacy: Boolean = false): JSONObject {
        fun scoreArray(scores: List<CloudScore>) = JSONArray().apply {
            scores.forEach { put(JSONObject().put("name", it.name).put("score", it.score)) }
        }
        return JSONObject().apply {
            if (!legacy) put("schemaVersion", 1)
            put("mobileScores", scoreArray(mobileScores))
            put("pcScores", scoreArray(pcScores))
            if (!legacy) put("achievements", JSONArray(achievements.sorted()))
            if (includeAdsRemoved && adsRemoved) put("adsRemoved", true)
        }
    }
}
