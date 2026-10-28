do {
let suite = "AutoReviewProbe." + UUID().uuidString
guard let defaults = UserDefaults(suiteName: suite) else { fatalError("Test defaults unavailable") }
defer { defaults.removePersistentDomain(forName: suite) }

precondition(isValidReviewMatchPayload(["isMatchFinal": true, "isForfeit": false]))
precondition(!isValidReviewMatchPayload(["isMatchFinal": false, "isForfeit": false]))
precondition(!isValidReviewMatchPayload(["isMatchFinal": true, "isForfeit": true]))
precondition(!isValidReviewMatchPayload(["isMatchFinal": 1, "isForfeit": 0]))
precondition(!isValidReviewMatchPayload(["isMatchFinal": true]))
precondition(!isValidReviewMatchPayload("not an object"))

precondition(!AutoReviewGate.claim(version: "", defaults: defaults))
precondition(AutoReviewGate.claim(version: "3.6.5", defaults: defaults))
precondition(!AutoReviewGate.claim(version: "3.6.5", defaults: defaults))
precondition(AutoReviewGate.claim(version: "3.6.6", defaults: defaults))
print("Review payload and per-version gate probes passed")
}

