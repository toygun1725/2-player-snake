import Foundation
import CoreFoundation
import CloudKit

struct CloudScore: Hashable {
    let name: String
    let score: Int64
}

private struct CloudScoreKey: Hashable {
    let scalars: [UInt32]
    let score: Int64
}

struct CloudSaveRecord {
    var mobileScores: [CloudScore] = []
    var pcScores: [CloudScore] = []
    var achievements: Set<String> = []

    enum Invalid: Error { case format }

    static func parse(_ value: Any, allowLegacy: Bool) throws -> CloudSaveRecord {
        guard let root = value as? [String: Any] else { throw Invalid.format }
        if let version = root["schemaVersion"] {
            guard let n = version as? NSNumber, CFGetTypeID(n) != CFBooleanGetTypeID(), n.doubleValue == 1 else { throw Invalid.format }
            guard root["mobileScores"] != nil, root["pcScores"] != nil, root["achievements"] != nil else { throw Invalid.format }
        } else if !allowLegacy { throw Invalid.format }

        func scores(_ field: String) throws -> [CloudScore] {
            guard let raw = root[field] else { return [] }
            guard let array = raw as? [[String: Any]] else { throw Invalid.format }
            return try array.map { item in
                guard let name = item["name"] as? String, let number = item["score"] as? NSNumber,
                      CFGetTypeID(number) != CFBooleanGetTypeID() else { throw Invalid.format }
                let score = number.doubleValue
                guard score.isFinite, score >= 0, score <= 9_007_199_254_740_991, score.rounded(.towardZero) == score else { throw Invalid.format }
                return CloudScore(name: name, score: Int64(score))
            }
        }
        var ids = Set<String>()
        if let raw = root["achievements"] {
            guard let array = raw as? [String] else { throw Invalid.format }
            for id in array {
                guard id.range(of: "^ACH_[A-Z0-9_]+$", options: .regularExpression) != nil else { throw Invalid.format }
                ids.insert(id)
            }
        }
        return try CloudSaveRecord(mobileScores: scores("mobileScores"), pcScores: scores("pcScores"), achievements: ids)
    }

    static func merge(_ records: [CloudSaveRecord]) -> CloudSaveRecord {
        func normalize(_ scores: [CloudScore]) -> [CloudScore] {
            var seen = Set<CloudScoreKey>()
            let unique = scores.filter { seen.insert(CloudScoreKey(scalars: $0.name.unicodeScalars.map { $0.value }, score: $0.score)).inserted }
            return Array(unique.sorted { left, right in
                if left.score != right.score { return left.score > right.score }
                return left.name.unicodeScalars.lexicographicallyPrecedes(right.name.unicodeScalars) { $0.value < $1.value }
            }.prefix(10))
        }
        return CloudSaveRecord(mobileScores: normalize(records.flatMap { $0.mobileScores }),
                               pcScores: normalize(records.flatMap { $0.pcScores }),
                               achievements: records.reduce(into: Set<String>()) { $0.formUnion($1.achievements) })
    }

    var dictionary: [String: Any] {
        func list(_ scores: [CloudScore]) -> [[String: Any]] { scores.map { ["name": $0.name, "score": $0.score] } }
        return ["schemaVersion": 1, "mobileScores": list(mobileScores), "pcScores": list(pcScores), "achievements": achievements.sorted()]
    }
}

enum CloudFetchResult { case found(CKRecord), missing, failure }
enum CloudWriteResult { case saved, conflict, failure }

/// The network adapter is replaceable so the real coordinator can be tested offline.
protocol CloudSaveTransport: AnyObject {
    func account(_ completion: @escaping (String?) -> Void)
    func fetch(_ completion: @escaping (CloudFetchResult) -> Void)
    func save(_ record: CKRecord, completion: @escaping (CloudWriteResult) -> Void)
    func cancel()
}

private final class CloudKitTransport: CloudSaveTransport {
    private let container: CKContainer
    private let recordID = CKRecord.ID(recordName: "twoPlayerSnakeSaveV1")
    private var operation: CKModifyRecordsOperation?

    init(identifier: String) { container = CKContainer(identifier: identifier) }

    func account(_ completion: @escaping (String?) -> Void) {
        container.accountStatus { [container] status, error in
            guard error == nil, status == .available else { completion(nil); return }
            container.fetchUserRecordID { id, error in completion(error == nil ? id?.recordName : nil) }
        }
    }

    func fetch(_ completion: @escaping (CloudFetchResult) -> Void) {
        container.privateCloudDatabase.fetch(withRecordID: recordID) { record, error in
            if let error = error as? CKError, error.code == .unknownItem { completion(.missing) }
            else if error == nil, let record = record { completion(.found(record)) }
            else { completion(.failure) }
        }
    }

    func save(_ record: CKRecord, completion: @escaping (CloudWriteResult) -> Void) {
        let operation = CKModifyRecordsOperation(recordsToSave: [record], recordIDsToDelete: nil)
        operation.savePolicy = .ifServerRecordUnchanged
        operation.modifyRecordsCompletionBlock = { saved, _, error in
            if error == nil, saved?.count == 1 { completion(.saved); return }
            if let error = error as? CKError,
               error.code == .serverRecordChanged || (error.partialErrorsByItemID?.values.contains { ($0 as? CKError)?.code == .serverRecordChanged } ?? false) {
                completion(.conflict)
            } else { completion(.failure) }
        }
        self.operation = operation
        container.privateCloudDatabase.add(operation)
    }

    func cancel() { operation?.cancel(); operation = nil }
}

/// Keeps local and legacy data intact when KVS is unavailable, malformed, or newer than v1.
final class CloudSaveStore: NSObject {
    private let defaults: UserDefaults
    private let store = NSUbiquitousKeyValueStore.default
    private let suppliedTransport: CloudSaveTransport?
    private let usesKVS: Bool
    private let backupKey = "twoplayersnake_cloud_save_v1_backup"
    private let legacyKey = "twoplayersnake_cloud_save_backup"
    private let pendingKey = "twoplayersnake_cloud_save_v1_pending"
    private let cloudKey = "twoPlayerSnakeSave"
    // KVS is read-only while its replacement is developed: it has no atomic
    // conditional write and can otherwise overwrite an unseen remote update.
    private var mayReadCloud = false
    private var waitingForAccountSync = true
    private var syncGeneration = 0
    private var readScheduled = false
    // No container identifier is supplied until signing and iCloud setup are verified.
    private lazy var cloudTransport: CloudSaveTransport? = {
        if let supplied = suppliedTransport { return supplied }
        guard let identifier = Bundle.main.object(forInfoDictionaryKey: "SnakeCloudKitContainerIdentifier") as? String,
              identifier.hasPrefix("iCloud."), !identifier.contains("$(") else { return nil }
        return CloudKitTransport(identifier: identifier)
    }()
    private let cloudRecordID = CKRecord.ID(recordName: "twoPlayerSnakeSaveV1")
    private let cloudAccountKey = "twoplayersnake_cloudkit_v1_account"
    private var cloudGeneration = 0
    private var cloudBusy = false
    private var cloudNeedsRun = false
    var onLoaded: (([String: Any]) -> Void)?

    override init() {
        defaults = .standard
        suppliedTransport = nil
        usesKVS = true
        super.init()
        setupObservers()
        beginCloudRead()
    }

    /// Test-only injection also avoids touching the machine's real iCloud KVS.
    init(defaults: UserDefaults, transport: CloudSaveTransport) {
        self.defaults = defaults
        suppliedTransport = transport
        usesKVS = false
        super.init()
        setupObservers()
    }

    private func setupObservers() {
        NotificationCenter.default.addObserver(self, selector: #selector(cloudChanged(_:)), name: NSUbiquitousKeyValueStore.didChangeExternallyNotification, object: store)
        NotificationCenter.default.addObserver(self, selector: #selector(identityChanged), name: .NSUbiquityIdentityDidChange, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(identityChanged), name: .CKAccountChanged, object: nil)
    }

    deinit { NotificationCenter.default.removeObserver(self) }

    private func localRecord() throws -> CloudSaveRecord {
        var records = [CloudSaveRecord]()
        for (key, legacy) in [(backupKey, false), (legacyKey, true)] {
            guard let raw = defaults.object(forKey: key) else { continue }
            guard let string = raw as? String, let data = string.data(using: .utf8) else { throw CloudSaveRecord.Invalid.format }
            records.append(try CloudSaveRecord.parse(JSONSerialization.jsonObject(with: data), allowLegacy: legacy))
        }
        return CloudSaveRecord.merge(records)
    }

    private func saveLocal(_ record: CloudSaveRecord) throws {
        let data = try JSONSerialization.data(withJSONObject: record.dictionary, options: [.sortedKeys])
        guard let text = String(data: data, encoding: .utf8) else { throw CloudSaveRecord.Invalid.format }
        defaults.set(text, forKey: backupKey)
        defaults.set(true, forKey: pendingKey)
    }

    func accept(_ json: String) -> Bool {
        do {
            guard let bytes = json.data(using: .utf8) else { return false }
            let incoming = try CloudSaveRecord.parse(JSONSerialization.jsonObject(with: bytes), allowLegacy: false)
            let merged = CloudSaveRecord.merge([try localRecord(), incoming])
            try saveLocal(merged)
            onLoaded?(merged.dictionary)
            if !mayReadCloud { beginCloudRead() }
            // The bridge acknowledges local acceptance, not cloud delivery.
            // A malformed or newer cloud record must not turn that acceptance
            // into a failure; reconciliation leaves the local backup pending.
            _ = reconcile()
            return true
        } catch { return false }
    }

    func refresh() {
        beginCloudRead()
        _ = reconcile()
    }

    @objc private func identityChanged() {
        if !Thread.isMainThread {
            DispatchQueue.main.async { [weak self] in self?.identityChanged() }
            return
        }
        defaults.set(true, forKey: pendingKey)
        cloudGeneration += 1
        cloudTransport?.cancel()
        cloudBusy = false
        cloudNeedsRun = false
        beginCloudRead(replacing: true)
    }

    /// Defer importing KVS data while account synchronization is in progress.
    private func beginCloudRead(replacing: Bool = false) {
        guard usesKVS else { return }
        if readScheduled && !replacing { return }
        syncGeneration += 1
        let generation = syncGeneration
        mayReadCloud = false
        waitingForAccountSync = true
        readScheduled = false
        guard store.synchronize() else { return }
        readScheduled = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
            guard let self = self, self.syncGeneration == generation else { return }
            self.readScheduled = false
            guard self.store.synchronize() else { return }
            self.waitingForAccountSync = false
            self.mayReadCloud = true
            _ = self.reconcile()
        }
    }

    @objc private func cloudChanged(_ notification: Notification) {
        if !Thread.isMainThread {
            DispatchQueue.main.async { [weak self] in self?.cloudChanged(notification) }
            return
        }
        let reason = notification.userInfo?[NSUbiquitousKeyValueStoreChangeReasonKey] as? Int
        if reason == NSUbiquitousKeyValueStoreQuotaViolationChange {
            syncGeneration += 1
            mayReadCloud = false
            waitingForAccountSync = true
            readScheduled = false
            defaults.set(true, forKey: pendingKey)
            return
        }
        if reason == NSUbiquitousKeyValueStoreAccountChange {
            // A KVS account change can arrive independently of the CloudKit
            // notification. Invalidate both paths before any delayed callback.
            identityChanged()
            return
        }
        if reason == NSUbiquitousKeyValueStoreInitialSyncChange {
            beginCloudRead(replacing: true)
        } else if reason == NSUbiquitousKeyValueStoreServerChange {
            if waitingForAccountSync { beginCloudRead(replacing: true); return }
            waitingForAccountSync = false
            mayReadCloud = true
            _ = reconcile()
        }
    }

    @discardableResult private func reconcile() -> Bool {
        do {
            let local = try localRecord()
            onLoaded?(local.dictionary)
            var records = [local]
            if !waitingForAccountSync, let value = store.object(forKey: cloudKey) {
                records.append(try CloudSaveRecord.parse(value, allowLegacy: false))
            }
            let merged = CloudSaveRecord.merge(records)
            try saveLocal(merged)
            onLoaded?(merged.dictionary)
            // Preserve imported and locally accepted data, but never write KVS.
            requestCloudSync()
            return true
        } catch { return false }
    }

    /// CloudKit stays disabled unless an explicitly configured container exists.
    private func requestCloudSync() {
        guard let transport = cloudTransport else { return }
        cloudNeedsRun = true
        guard !cloudBusy else { return }
        cloudBusy = true
        cloudNeedsRun = false
        let generation = cloudGeneration
        transport.account { [weak self] account in
            DispatchQueue.main.async {
                guard let self = self, self.cloudGeneration == generation else { return }
                guard let account = account else { self.finishCloudSync(generation, succeeded: false); return }
                if let bound = self.defaults.string(forKey: self.cloudAccountKey), bound != account {
                    self.finishCloudSync(generation, succeeded: false)
                    return
                }
                self.defaults.set(account, forKey: self.cloudAccountKey)
                self.fetchCloudRecord(transport, account: account, generation: generation, attempt: 0)
            }
        }
    }

    private func fetchCloudRecord(_ transport: CloudSaveTransport, account: String, generation: Int, attempt: Int) {
        transport.fetch { [weak self] result in
            DispatchQueue.main.async {
                guard let self = self, self.cloudGeneration == generation else { return }
                switch result {
                case .missing:
                    self.prepareCloudWrite(transport, account: account, generation: generation, attempt: attempt,
                                           record: CKRecord(recordType: "SnakeSave", recordID: self.cloudRecordID), isNew: true)
                case .found(let record):
                    self.prepareCloudWrite(transport, account: account, generation: generation, attempt: attempt,
                                           record: record, isNew: false)
                case .failure:
                    self.finishCloudSync(generation, succeeded: false)
                }
            }
        }
    }

    private func prepareCloudWrite(_ transport: CloudSaveTransport, account: String, generation: Int,
                                   attempt: Int, record: CKRecord, isNew: Bool) {
        do {
            var records = [try localRecord()]
            if !isNew {
                guard record.recordType == "SnakeSave", let raw = record["payload"] as? String,
                      let bytes = raw.data(using: .utf8) else {
                    finishCloudSync(generation, succeeded: false); return
                }
                records.append(try CloudSaveRecord.parse(JSONSerialization.jsonObject(with: bytes), allowLegacy: false))
            }
            let merged = CloudSaveRecord.merge(records)
            try saveLocal(merged)
            onLoaded?(merged.dictionary)
            let data = try JSONSerialization.data(withJSONObject: merged.dictionary, options: [.sortedKeys])
            guard data.count < 900_000, let payload = String(data: data, encoding: .utf8) else {
                finishCloudSync(generation, succeeded: false); return
            }
            record["payload"] = payload as CKRecordValue
            // Recheck the account immediately before submitting a write.
            transport.account { [weak self] currentAccount in
                DispatchQueue.main.async {
                    guard let self = self, self.cloudGeneration == generation else { return }
                    guard currentAccount == account else { self.finishCloudSync(generation, succeeded: false); return }
                    transport.save(record) { [weak self] result in
                        DispatchQueue.main.async {
                            guard let self = self, self.cloudGeneration == generation else { return }
                            switch result {
                            case .saved:
                                self.finishCloudSync(generation, succeeded: true)
                            case .conflict where attempt < 2:
                                self.fetchCloudRecord(transport, account: account, generation: generation, attempt: attempt + 1)
                            case .conflict, .failure:
                                self.finishCloudSync(generation, succeeded: false)
                            }
                        }
                    }
                }
            }
        } catch {
            finishCloudSync(generation, succeeded: false)
        }
    }

    private func finishCloudSync(_ generation: Int, succeeded: Bool) {
        guard cloudGeneration == generation else { return }
        cloudBusy = false
        if succeeded && !cloudNeedsRun { defaults.set(false, forKey: pendingKey) }
        // Do not spin on network, quota, account, or malformed-data failures.
        if succeeded && cloudNeedsRun { requestCloudSync() }
    }
}

