import Foundation
import CloudKit

private final class SimulatedCloud {
    var revision = 0
    var payload: String?

    func snapshot() -> CloudFetchResult {
        guard let payload = payload else { return .missing }
        let record = CKRecord(recordType: "SnakeSave", recordID: CKRecord.ID(recordName: "twoPlayerSnakeSaveV1"))
        record["payload"] = payload as CKRecordValue
        record["revision"] = NSNumber(value: revision)
        return .found(record)
    }

    func commit(_ record: CKRecord) -> CloudWriteResult {
        let expected = (record["revision"] as? NSNumber)?.intValue ?? 0
        guard expected == revision else { return .conflict }
        guard let payload = record["payload"] as? String else { return .failure }
        self.payload = payload
        revision += 1
        return .saved
    }
}

private final class SimulatedTransport: CloudSaveTransport {
    let cloud: SimulatedCloud
    var identity: String? = "account-a"
    var fetchFails = false
    var holdFetches = false
    var holdWrites = false
    var forcedConflicts = 0
    var fetchCalls = 0
    var writeCalls = 0
    var cancellations = 0
    var waitingFetches: [(CloudFetchResult) -> Void] = []
    var waitingWrites: [(CKRecord, (CloudWriteResult) -> Void)] = []

    init(_ cloud: SimulatedCloud) { self.cloud = cloud }
    func account(_ completion: @escaping (String?) -> Void) { completion(identity) }
    func fetch(_ completion: @escaping (CloudFetchResult) -> Void) {
        fetchCalls += 1
        if holdFetches { waitingFetches.append(completion) }
        else if fetchFails { completion(.failure) }
        else { completion(cloud.snapshot()) }
    }
    func save(_ record: CKRecord, completion: @escaping (CloudWriteResult) -> Void) {
        writeCalls += 1
        if holdWrites { waitingWrites.append((record, completion)); return }
        if forcedConflicts > 0 { forcedConflicts -= 1; completion(.conflict); return }
        completion(cloud.commit(record))
    }
    func cancel() { cancellations += 1 }
    func releaseWrite() {
        let (record, completion) = waitingWrites.removeFirst()
        completion(cloud.commit(record))
    }
    func releaseFetch(_ result: CloudFetchResult) { waitingFetches.removeFirst()(result) }
}

enum CloudSaveCoordinatorProbe {
    private static let pending = "twoplayersnake_cloud_save_v1_pending"
    private static let backup = "twoplayersnake_cloud_save_v1_backup"

    private static func settings() -> UserDefaults {
        UserDefaults(suiteName: "CloudSaveProbe." + UUID().uuidString)!
    }
    private static func json(_ name: String, _ score: Int, version: Int = 1) -> String {
        let value: [String: Any] = ["schemaVersion": version, "mobileScores": [["name": name, "score": score]], "pcScores": [], "achievements": []]
        return String(data: try! JSONSerialization.data(withJSONObject: value), encoding: .utf8)!
    }
    private static func names(_ raw: String?) throws -> [String] {
        guard let raw = raw, let bytes = raw.data(using: .utf8) else { return [] }
        return try CloudSaveRecord.parse(JSONSerialization.jsonObject(with: bytes), allowLegacy: false).mobileScores.map { $0.name }
    }
    private static func wait(_ message: String, _ condition: () -> Bool) {
        let deadline = Date().addingTimeInterval(4)
        while !condition() && Date() < deadline { RunLoop.current.run(until: Date().addingTimeInterval(0.01)) }
        precondition(condition(), message)
    }

    static func run() throws {
        // A network failure keeps the local score pending; a later refresh retries.
        do {
            let cloud = SimulatedCloud(), transport = SimulatedTransport(cloud), defaults = settings()
            transport.fetchFails = true
            let store = CloudSaveStore(defaults: defaults, transport: transport)
            precondition(store.accept(json("Ada", 15)))
            wait("network failure was not observed") { transport.fetchCalls == 1 }
            RunLoop.current.run(until: Date().addingTimeInterval(0.05))
            precondition(defaults.bool(forKey: pending) && transport.writeCalls == 0)
            let savedNames = try names(defaults.string(forKey: backup))
            precondition(savedNames == ["Ada"])
            transport.fetchFails = false
            store.refresh()
            wait("network recovery did not sync") { cloud.payload != nil && !defaults.bool(forKey: pending) }
            let cloudNames = try names(cloud.payload)
            precondition(cloudNames == ["Ada"])
        }

        // Unknown future records are not overwritten and local progress remains.
        do {
            let cloud = SimulatedCloud(), transport = SimulatedTransport(cloud), defaults = settings()
            let future = json("Future", 100, version: 2)
            cloud.payload = future
            let store = CloudSaveStore(defaults: defaults, transport: transport)
            precondition(store.accept(json("Ada", 15)))
            wait("future record was not read") { transport.fetchCalls == 1 }
            RunLoop.current.run(until: Date().addingTimeInterval(0.05))
            precondition(transport.writeCalls == 0 && defaults.bool(forKey: pending))
            let savedNames = try names(defaults.string(forKey: backup))
            precondition(savedNames == ["Ada"])
            precondition(cloud.payload == future)
        }

        // Two devices fetch an empty account simultaneously; the second retries
        // after its conditional write conflicts and joins both devices' scores.
        do {
            let cloud = SimulatedCloud(), one = SimulatedTransport(cloud), two = SimulatedTransport(cloud)
            let d1 = settings(), d2 = settings()
            one.holdWrites = true; two.holdWrites = true
            let first = CloudSaveStore(defaults: d1, transport: one), second = CloudSaveStore(defaults: d2, transport: two)
            precondition(first.accept(json("Ada", 10)) && second.accept(json("Ece", 20)))
            wait("simultaneous writes did not queue") { one.waitingWrites.count == 1 && two.waitingWrites.count == 1 }
            one.holdWrites = false; two.holdWrites = false
            one.releaseWrite(); two.releaseWrite()
            wait("conflict did not retry") { two.writeCalls == 2 && !d2.bool(forKey: pending) }
            let cloudNames = try names(cloud.payload)
            precondition(cloudNames == ["Ece", "Ada"])
        }

        // The retry limit is three attempts; no endless retry occurs offline.
        do {
            let cloud = SimulatedCloud(), transport = SimulatedTransport(cloud), defaults = settings()
            transport.forcedConflicts = 3
            let store = CloudSaveStore(defaults: defaults, transport: transport)
            precondition(store.accept(json("Ada", 10)))
            wait("conflict retry limit not reached") { transport.writeCalls == 3 }
            RunLoop.current.run(until: Date().addingTimeInterval(0.05))
            precondition(transport.writeCalls == 3 && defaults.bool(forKey: pending))
        }

        // A score recorded during a pending write is sent in a subsequent pass.
        do {
            let cloud = SimulatedCloud(), transport = SimulatedTransport(cloud), defaults = settings()
            transport.holdWrites = true
            let store = CloudSaveStore(defaults: defaults, transport: transport)
            precondition(store.accept(json("Ada", 10)))
            wait("first write not queued") { transport.waitingWrites.count == 1 }
            precondition(store.accept(json("Ece", 20)))
            transport.holdWrites = false
            transport.releaseWrite()
            wait("new local data was not retried") { transport.writeCalls == 2 && !defaults.bool(forKey: pending) }
            let cloudNames = try names(cloud.payload)
            precondition(cloudNames == ["Ece", "Ada"])
        }

        // Delayed results from the prior account must not write to the next account.
        do {
            let cloud = SimulatedCloud(), transport = SimulatedTransport(cloud), defaults = settings()
            transport.holdFetches = true
            let store = CloudSaveStore(defaults: defaults, transport: transport)
            precondition(store.accept(json("Ada", 10)))
            wait("delayed fetch not queued") { transport.waitingFetches.count == 1 }
            transport.identity = "account-b"
            NotificationCenter.default.post(name: .CKAccountChanged, object: nil)
            transport.releaseFetch(.missing)
            RunLoop.current.run(until: Date().addingTimeInterval(0.05))
            precondition(transport.cancellations > 0 && transport.writeCalls == 0 && defaults.bool(forKey: pending))
            store.refresh()
            RunLoop.current.run(until: Date().addingTimeInterval(0.05))
            precondition(transport.writeCalls == 0 && defaults.bool(forKey: pending))
        }
        print("Cloud coordinator simulated conflict, retry, offline and account probes passed")
    }
}

