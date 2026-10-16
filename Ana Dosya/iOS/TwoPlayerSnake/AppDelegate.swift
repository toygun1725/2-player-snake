import UIKit
import AVFoundation

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Audio Session: Oyun seslerinin diğer arka plan sesleriyle (müzik vb.) uyumlu çalışması
        configureAudioSession()

        // RevenueCat / IAP: Uygulama içi satın alma altyapısını başlat
        IAPManager.shared.configure()

        // Ana Ekran Hızlı Eylemleri (Quick Actions — 21 Dil)
        Self.configureShortcutItems(for: application)

        return true
    }

    static func configureShortcutItems(for application: UIApplication = .shared) {
        let normal1P = UIApplicationShortcutItem(
            type: "normal_1p",
            localizedTitle: AppStrings.Shortcuts.normal1P,
            localizedSubtitle: nil,
            icon: UIApplicationShortcutIcon(systemImageName: "person.fill"),
            userInfo: nil
        )
        let fc2P = UIApplicationShortcutItem(
            type: "fc_2p",
            localizedTitle: AppStrings.Shortcuts.fastCompetitive2P,
            localizedSubtitle: nil,
            icon: UIApplicationShortcutIcon(systemImageName: "person.2.fill"),
            userInfo: nil
        )
        let fc1PAI = UIApplicationShortcutItem(
            type: "fc_1p_ai",
            localizedTitle: AppStrings.Shortcuts.fastCompetitive1PAI,
            localizedSubtitle: nil,
            icon: UIApplicationShortcutIcon(systemImageName: "cpu"),
            userInfo: nil
        )
        application.shortcutItems = [normal1P, fc2P, fc1PAI]
    }

    private func configureAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("AppDelegate: Audio Session yapılandırılamadı: \(error)")
        }
    }

    // MARK: UISceneSession Lifecycle

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    func application(
        _ application: UIApplication,
        didDiscardSceneSessions sceneSessions: Set<UISceneSession>
    ) {}
}
