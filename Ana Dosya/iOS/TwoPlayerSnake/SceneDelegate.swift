import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = (scene as? UIWindowScene) else { return }

        let window = UIWindow(windowScene: windowScene)
        let rootViewController = ViewController()

        // Universal Link, Custom Scheme veya Quick Action Shortcut ile soğuk başlangıç (cold start) kontrolü
        if let userActivity = connectionOptions.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }),
           let url = userActivity.webpageURL {
            rootViewController.handleDeepLink(url: url)
        } else if let url = connectionOptions.urlContexts.first?.url {
            rootViewController.handleDeepLink(url: url)
        } else if let shortcutItem = connectionOptions.shortcutItem {
            rootViewController.handleShortcut(shortcutId: shortcutItem.type)
        }

        window.rootViewController = rootViewController
        window.backgroundColor = .black
        self.window = window
        window.makeKeyAndVisible()
    }

    // MARK: - Home Screen Quick Actions (Uygulama arka plandayken kısayol seçimi)
    func windowScene(
        _ windowScene: UIWindowScene,
        performActionFor shortcutItem: UIApplicationShortcutItem,
        completionHandler: @escaping (Bool) -> Void
    ) {
        if let rootViewController = window?.rootViewController as? ViewController {
            rootViewController.handleShortcut(shortcutId: shortcutItem.type)
            completionHandler(true)
        } else {
            completionHandler(false)
        }
    }

    // MARK: - Universal Links (Uygulama arka plandayken / etkinken gelen web bağlantıları)
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = userActivity.webpageURL else { return }

        if let rootViewController = window?.rootViewController as? ViewController {
            rootViewController.handleDeepLink(url: url)
        }
    }

    // MARK: - Custom URL Scheme (twoplayersnake://)
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }

        if let rootViewController = window?.rootViewController as? ViewController {
            rootViewController.handleDeepLink(url: url)
        }
    }

    func sceneDidDisconnect(_ scene: UIScene) {}

    func sceneDidBecomeActive(_ scene: UIScene) {
        NotificationCenter.default.post(name: NSNotification.Name("AppDidBecomeActive"), object: nil)
        NotificationManager.shared.clearBadgeAndDeliveredNotifications()
    }

    func sceneWillResignActive(_ scene: UIScene) {
        NotificationCenter.default.post(name: NSNotification.Name("AppWillResignActive"), object: nil)
    }

    func sceneWillEnterForeground(_ scene: UIScene) {}

    func sceneDidEnterBackground(_ scene: UIScene) {}
}
