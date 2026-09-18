import Foundation
import UIKit
import GameKit

/// Apple Game Center (GameKit) Yöneticisi
/// Android tarafındaki Google Play Games Servisleri ile birebir uyumlu 15 başarımı Game Center'a senkronize eder.
final class GameCenterManager: NSObject, GKGameCenterControllerDelegate {

    static let shared = GameCenterManager()

    private(set) var isAuthenticated: Bool = false
    private var isAuthenticating: Bool = false

    private override init() {
        super.init()
    }

    // MARK: - Kimlik Doğrulama
    /// Uygulama açılışında Game Center yerel oyuncu doğrulamasını başlatır
    func authenticateLocalPlayer(presentingVC: UIViewController?) {
        guard !isAuthenticated && !isAuthenticating else { return }
        isAuthenticating = true

        GKLocalPlayer.local.authenticateHandler = { [weak self, weak presentingVC] gcAuthVC, error in
            guard let self = self else { return }
            self.isAuthenticating = false

            if let authVC = gcAuthVC {
                // Apple Game Center giriş arayüzünü kullanıcıya göster
                presentingVC?.present(authVC, animated: true)
            } else if GKLocalPlayer.local.isAuthenticated {
                self.isAuthenticated = true
                print("GameCenterManager: Kullanıcı başarıyla bağlandı: \(GKLocalPlayer.local.displayName) (\(GKLocalPlayer.local.gamePlayerID))")
            } else {
                self.isAuthenticated = false
                let errDesc = error?.localizedDescription ?? "Bilinmeyen hata"
                print("GameCenterManager: Kimlik doğrulama tamamlanamadı: \(errDesc)")
            }
        }
    }

    // MARK: - Başarım Bildirme
    /// Verilen başarım kimliğini Game Center'a %100 tamamlandı olarak iletir ve tamamlanma banner'ını gösterir.
    func reportAchievement(identifier: String, percentComplete: Double = 100.0) {
        guard GKLocalPlayer.local.isAuthenticated else {
            print("GameCenterManager: Başarım kaydedilemedi (Kullanıcı giriş yapmamış): \(identifier)")
            return
        }

        let achievement = GKAchievement(identifier: identifier)
        achievement.percentComplete = percentComplete
        achievement.showsCompletionBanner = true

        GKAchievement.report([achievement]) { error in
            if let error = error {
                print("GameCenterManager: Başarım raporlama hatası (\(identifier)): \(error.localizedDescription)")
            } else {
                print("GameCenterManager: Başarım başarıyla raporlandı: \(identifier) (\(percentComplete)%)")
            }
        }
    }

    // MARK: - Game Center Arayüzü Açma
    /// Yerel Game Center başarımlar penceresini açar
    func showAchievements(from viewController: UIViewController?) {
        guard let vc = viewController else { return }

        guard GKLocalPlayer.local.isAuthenticated else {
            print("GameCenterManager: Game Center açık değil, giriş yapılamadı.")
            return
        }

        if #available(iOS 14.0, *) {
            let gcVC = GKGameCenterViewController(state: .achievements)
            gcVC.gameCenterDelegate = self
            vc.present(gcVC, animated: true)
        } else {
            let gcVC = GKGameCenterViewController()
            gcVC.gameCenterDelegate = self
            gcVC.viewState = .achievements
            vc.present(gcVC, animated: true)
        }
    }

    // MARK: - GKGameCenterControllerDelegate
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
