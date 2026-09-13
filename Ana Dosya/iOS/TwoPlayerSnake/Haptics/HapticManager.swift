import UIKit
import AudioToolbox

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

            self.mediumImpact?.prepare()
            self.heavyImpact?.prepare()
        }
    }

    /// Yem yendiğinde (Android: 18ms titreşim karşılığı — Taptic Engine Peek 1519 + Medium Impact)
    func playFoodHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            // Fiziksel Taptic Engine Actuator tetikle (Peek — SystemSound 1519)
            AudioServicesPlaySystemSound(1519)
            let generator = self.mediumImpact ?? UIImpactFeedbackGenerator(style: .medium)
            generator.prepare()
            generator.impactOccurred(intensity: 1.0)
        }
    }

    /// Özel yem / güçlendirici yendiğinde (Taptic Engine Pop 1520 + Heavy Impact)
    func playSpecialFoodHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            // Fiziksel Taptic Engine Actuator tetikle (Pop — SystemSound 1520)
            AudioServicesPlaySystemSound(1520)
            let generator = self.heavyImpact ?? UIImpactFeedbackGenerator(style: .heavy)
            generator.prepare()
            generator.impactOccurred(intensity: 1.0)
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
