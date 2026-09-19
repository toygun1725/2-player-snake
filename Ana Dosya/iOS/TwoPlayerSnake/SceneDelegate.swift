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

        // Universal Link veya Custom Scheme ile soğuk başlangıç (cold start) kontrolü
        if let userActivity = connectionOptions.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }),
           let url = userActivity.webpageURL {
            rootViewController.handleDeepLink(url: url)
        } else if let url = connectionOptions.urlContexts.first?.url {
            rootViewController.handleDeepLink(url: url)
        }

        window.rootViewController = rootViewController
        window.backgroundColor = .black
        self.window = window
        window.makeKeyAndVisible()
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
    }

    func sceneWillResignActive(_ scene: UIScene) {
        NotificationCenter.default.post(name: NSNotification.Name("AppWillResignActive"), object: nil)
    }

    func sceneWillEnterForeground(_ scene: UIScene) {}

    func sceneDidEnterBackground(_ scene: UIScene) {}
}
