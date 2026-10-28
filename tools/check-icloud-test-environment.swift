import Foundation

// A macOS account signal only; it does not prove an iOS simulator is signed in.
let identityAvailable = FileManager.default.ubiquityIdentityToken != nil
print("macOS iCloud identity token: \(identityAvailable ? "available" : "unavailable")")

print("CloudKit account status is not assessed by this probe.")
print("No app built, no user data accessed, and no iOS simulator account verified.")

