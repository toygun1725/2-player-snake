import UIKit
import AudioToolbox

final class HapticManager {
    static let shared = HapticManager()

    private static let preferenceKey = "hapticsEnabled"
    var isHapticsEnabled: Bool {
        didSet { UserDefaults.standard.set(isHapticsEnabled, forKey: Self.preferenceKey) }
    }

    private var selectionFeedback: UISelectionFeedbackGenerator?
    private var lightImpact: UIImpactFeedbackGenerator?
    private var mediumImpact: UIImpactFeedbackGenerator?
    private var heavyImpact: UIImpactFeedbackGenerator?
    private var rigidImpact: UIImpactFeedbackGenerator?
    private var notificationFeedback: UINotificationFeedbackGenerator?

    private init() {
        isHapticsEnabled = UserDefaults.standard.object(forKey: Self.preferenceKey) as? Bool ?? true
        prepareGenerators()
    }

    private func prepareGenerators() {
        DispatchQueue.main.async {
            self.selectionFeedback = UISelectionFeedbackGenerator()
            self.lightImpact = UIImpactFeedbackGenerator(style: .light)
            self.mediumImpact = UIImpactFeedbackGenerator(style: .medium)
            self.heavyImpact = UIImpactFeedbackGenerator(style: .heavy)
            self.rigidImpact = UIImpactFeedbackGenerator(style: .rigid)
            self.notificationFeedback = UINotificationFeedbackGenerator()

            self.selectionFeedback?.prepare()
            self.lightImpact?.prepare()
            self.mediumImpact?.prepare()
            self.heavyImpact?.prepare()
            self.rigidImpact?.prepare()
            self.notificationFeedback?.prepare()
        }
    }

    /// Menü butonu / geri sayım tıkı (Android: "tick" / 10ms karşılığı)
    func playTickHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            let generator = self.selectionFeedback ?? UISelectionFeedbackGenerator()
            generator.selectionChanged()
            generator.prepare()
        }
    }

    /// Normal yem yendiğinde (Android: "light" / 18ms karşılığı — Taptic Engine Peek 1519 + Medium Impact)
    func playFoodHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            AudioServicesPlaySystemSound(1519)
            let generator = self.mediumImpact ?? UIImpactFeedbackGenerator(style: .medium)
            generator.prepare()
            generator.impactOccurred(intensity: 0.85)
        }
    }

    /// Elmas / özel yem yendiğinde (Android: "medium" / 30ms karşılığı — Taptic Engine Pop 1520 + Heavy Impact)
    func playSpecialFoodHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            AudioServicesPlaySystemSound(1520)
            let generator = self.heavyImpact ?? UIImpactFeedbackGenerator(style: .heavy)
            generator.prepare()
            generator.impactOccurred(intensity: 0.95)
        }
    }

    /// Kalp / Canavar Modu yemi yendiğinde (Android: "beastFood" çift nabız karşılığı)
    func playBeastFoodHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            AudioServicesPlaySystemSound(1520)
            let primary = self.heavyImpact ?? UIImpactFeedbackGenerator(style: .heavy)
            primary.prepare()
            primary.impactOccurred(intensity: 1.0)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.075) {
                guard self.isHapticsEnabled else { return }
                let secondary = self.rigidImpact ?? UIImpactFeedbackGenerator(style: .rigid)
                secondary.impactOccurred(intensity: 1.0)
                secondary.prepare()
            }
        }
    }

    /// Çarpışma olduğunda (Android: "heavy" / 40ms titreşim karşılığı)
    func playCollisionHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            let generator = self.heavyImpact ?? UIImpactFeedbackGenerator(style: .heavy)
            generator.impactOccurred(intensity: 1.0)
            generator.prepare()
        }
    }

    /// Zafer / Tur kazanıldığında (Android: "win" / 50ms karşılığı)
    func playWinHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            let generator = self.notificationFeedback ?? UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
            generator.prepare()
        }
    }

    /// Oyun bittiğinde / Yandığında (Android: "gameOver" / 80ms karşılığı)
    func playGameOverHaptic() {
        guard isHapticsEnabled else { return }
        DispatchQueue.main.async {
            let generator = self.notificationFeedback ?? UINotificationFeedbackGenerator()
            generator.notificationOccurred(.error)
            generator.prepare()
        }
    }

    /// 7 katmanlı semantik haptic yönlendirici
    func playHapticEvent(eventType: String?, durationMs: Int?) {
        guard isHapticsEnabled else { return }
        switch eventType {
        case "tick":
            playTickHaptic()
        case "light":
            playFoodHaptic()
        case "medium":
            playSpecialFoodHaptic()
        case "beastFood":
            playBeastFoodHaptic()
        case "heavy":
            playCollisionHaptic()
        case "win":
            playWinHaptic()
        case "gameOver":
            playGameOverHaptic()
        default:
            triggerVibration(durationMs: durationMs ?? 18)
        }
    }

    /// Süre bazlı genel titreşim çağrısı
    func triggerVibration(durationMs: Int) {
        guard isHapticsEnabled else { return }
        if durationMs <= 12 {
            playTickHaptic()
        } else if durationMs <= 22 {
            playFoodHaptic()
        } else if durationMs <= 35 {
            playSpecialFoodHaptic()
        } else if durationMs <= 55 {
            playCollisionHaptic()
        } else {
            playGameOverHaptic()
        }
    }
}
