import UIKit

final class HapticManager {
    static let shared = HapticManager()

    var isHapticsEnabled: Bool = true

    private var lightImpact: UIImpactFeedbackGenerator?
    private var mediumImpact: UIImpactFeedbackGenerator?
    private var heavyImpact: UIImpactFeedbackGenerator?
    private var notificationFeedback: UINotificationFeedbackGenerator?

    private init() {
        prepareGenerators()
    }

    private func prepareGenerators() {
        DispatchQueue.main.async {
            self.lightImpact = UIImpactFeedbackGenerator(style: .light)
            self.mediumImpact = UIImpactFeedbackGenerator(style: .medium)
            self.heavyImpact = UIImpactFeedbackGenerator(style: .heavy)
            self.notificationFeedback = UINotificationFeedbackGenerator()

            self.lightImpact?.prepare()
            self.mediumImpact?.prepare()
        }
    }

    /// Yem yendiğinde (Android: 18ms titreşim karşılığı)
    func playFoodHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            self.lightImpact?.impactOccurred()
            self.lightImpact?.prepare()
        }
    }

    /// Özel yem / güçlendirici yendiğinde
    func playSpecialFoodHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            self.mediumImpact?.impactOccurred()
            self.mediumImpact?.prepare()
        }
    }

    /// Çarpışma olduğunda (Android: 40ms titreşim karşılığı)
    func playCollisionHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            self.heavyImpact?.impactOccurred()
            self.heavyImpact?.prepare()
        }
    }

    /// Oyun bittiğinde / Yandığında
    func playGameOverHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            self.notificationFeedback?.notificationOccurred(.error)
            self.notificationFeedback?.prepare()
        }
    }

    /// Süre bazlı genel titreşim çağrısı
    func triggerVibration(durationMs: Int) {
        guard isHapticsEnabled else { return }
        if durationMs <= 25 {
            playFoodHaptic()
        } else if durationMs <= 50 {
            playCollisionHaptic()
        } else {
            playGameOverHaptic()
        }
    }
}
