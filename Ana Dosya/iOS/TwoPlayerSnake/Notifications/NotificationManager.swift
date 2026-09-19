import Foundation
import UserNotifications
import UIKit

/// v3.3.7 — Re-engagement yerel bildirim yöneticisi (iOS).
/// Android sürümüyle birebir paralel çalışır:
/// 1. Gün (24s), 3. Gün (72s) ve 7. Gün (168s) için yerel bildirimler planlar.
/// Her uygulama açılışında sayaçlar sıfırlanır; aktif oynayan kullanıcı rahatsız edilmez.
final class NotificationManager: NSObject, UNUserNotificationCenterDelegate {

    static let shared = NotificationManager()

    private let defaults = UserDefaults.standard
    private let keyLaunchCount = "snake_app_launch_count"
    private let keyPermissionAsked = "snake_notification_permission_asked"
    private let keyLastPlayedAt = "snake_last_played_at"

    private override init() {
        super.init()
        UNUserNotificationCenter.current().delegate = self
    }

    // MARK: - Uygulama Açılışı Yönetimi
    func handleAppLaunch() {
        let count = defaults.integer(forKey: keyLaunchCount) + 1
        defaults.set(count, forKey: keyLaunchCount)
        defaults.set(Date().timeIntervalSince1970, forKey: keyLastPlayedAt)

        let permissionAsked = defaults.bool(forKey: keyPermissionAsked)

        UNUserNotificationCenter.current().getNotificationSettings { [weak self] settings in
            DispatchQueue.main.async {
                switch settings.authorizationStatus {
                case .authorized, .provisional:
                    self?.scheduleReEngagementNotifications()
                case .notDetermined:
                    // Android ile aynı: 3. açılışta nazikçe izin iste
                    if count >= 3 && !permissionAsked {
                        self?.requestPermission()
                    }
                case .denied, .ephemeral:
                    break
                @unknown default:
                    break
                }
            }
        }
    }

    // MARK: - İzin İsteme
    func requestPermission(completion: ((Bool) -> Void)? = nil) {
        defaults.set(true, forKey: keyPermissionAsked)
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { [weak self] granted, error in
            DispatchQueue.main.async {
                if granted {
                    self?.scheduleReEngagementNotifications()
                }
                completion?(granted)
            }
        }
    }

    // MARK: - Bildirimleri Planlama
    func scheduleReEngagementNotifications() {
        let center = UNUserNotificationCenter.current()

        // Önceki planları temizle
        let identifiers = [
            NotificationStrings.Stage.day1.rawValue,
            NotificationStrings.Stage.day3.rawValue,
            NotificationStrings.Stage.day7.rawValue
        ]
        center.removePendingNotificationRequests(withIdentifiers: identifiers)

        // 1. Gün (24 saat = 86.400 sn)
        scheduleNotification(
            stage: .day1,
            timeInterval: 24 * 3600
        )

        // 3. Gün (72 saat = 259.200 sn)
        scheduleNotification(
            stage: .day3,
            timeInterval: 72 * 3600
        )

        // 7. Gün (168 saat = 604.800 sn)
        scheduleNotification(
            stage: .day7,
            timeInterval: 168 * 3600
        )
    }

    private func scheduleNotification(stage: NotificationStrings.Stage, timeInterval: TimeInterval) {
        let text = NotificationStrings.get(for: stage)

        let content = UNMutableNotificationContent()
        content.title = text.title
        content.body = text.body
        content.sound = .default
        content.badge = 1

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(identifier: stage.rawValue, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                NSLog("[NotificationManager] Failed to schedule %@: %@", stage.rawValue, error.localizedDescription)
            }
        }
    }

    // MARK: - UNUserNotificationCenterDelegate
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        UIApplication.shared.applicationIconBadgeNumber = 0
        completionHandler()
    }
}
