import Foundation
import CloudKit

// A macOS account signal only; it does not prove an iOS simulator is signed in.
let identityAvailable = FileManager.default.ubiquityIdentityToken != nil
print("macOS iCloud identity token: \(identityAvailable ? "available" : "unavailable")")

// The diagnostic process has no application iCloud entitlement. Therefore an
// indeterminate/error result cannot diagnose the game's CloudKit entitlement.
let done = DispatchSemaphore(value: 0)
CKContainer(identifier: "iCloud.com.twoplayersnake.app").accountStatus { status, error in
    let value: String
    if error != nil {
        value = "error or unavailable (unen­titled diagnostic)"
    } else {
        switch status {
        case .available: value = "available"
        case .noAccount: value = "no account"
        case .restricted: value = "restricted"
        case .couldNotDetermine: value = "could not determine"
        case .temporarilyUnavailable: value = "temporarily unavailable"
        @unknown default: value = "unknown"
        }
    }
    print("CloudKit account status: \(value)")
    done.signal()
}
if done.wait(timeout: .now() + 25) == .timedOut {
    print("CloudKit account status: timed out")
}
print("No app built, no user data accessed, and no iOS simulator account verified.")

