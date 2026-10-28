import Foundation

@main
struct CloudSaveRecordProbe {
    static func main() throws {
        let first: [String: Any] = ["schemaVersion": 1, "mobileScores": [["name": "Ada", "score": 30]], "pcScores": [], "achievements": ["ACH_FIRST_FOOD"]]
        let second: [String: Any] = ["schemaVersion": 1, "mobileScores": [["name": "Ada", "score": 30], ["name": "Ece", "score": 40]], "pcScores": [["name": "Can", "score": 5]], "achievements": ["ACH_AI_HUNTER"]]
        let merged = CloudSaveRecord.merge([try CloudSaveRecord.parse(first, allowLegacy: false), try CloudSaveRecord.parse(second, allowLegacy: false)])
        precondition(merged.mobileScores.map { $0.name } == ["Ece", "Ada"])
        precondition(merged.pcScores.map { $0.name } == ["Can"])
        precondition(merged.achievements == Set(["ACH_FIRST_FOOD", "ACH_AI_HUNTER"]))
        var newer = first
        newer["schemaVersion"] = 2
        do {
            _ = try CloudSaveRecord.parse(newer, allowLegacy: false)
            preconditionFailure("A newer schema must not be accepted")
        } catch {}
        var malformed = first
        malformed["mobileScores"] = "bad data"
        do {
            _ = try CloudSaveRecord.parse(malformed, allowLegacy: false)
            preconditionFailure("Malformed scores must not be accepted")
        } catch {}
        print("Cloud save parsing and merge probe passed")
    }
}

