import UIKit
import AppTrackingTransparency
import AdSupport

final class AdManager {
    static let shared = AdManager()

    // MARK: - AdMob Birim Kimlikleri
    // Not: Test aşamasında Google'ın resmi iOS Test ID'leri kullanılır.
    // Canlıya çıkarken AdMob panelinizden alacağınız ID'lerle güncelleyebilirsiniz.
    var interstitialId: String = "ca-app-pub-3940256099942544/4411468910" // Test ID
    var rewardedId: String = "ca-app-pub-3940256099942544/1712485313"     // Test ID

    private init() {}

    /// Apple App Tracking Transparency (ATT) İzin Talebi
    func requestTrackingAuthorization(completion: (() -> Void)? = nil) {
        if #available(iOS 14.5, *) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                ATTrackingManager.requestTrackingAuthorization { status in
                    switch status {
                    case .authorized:
                        print("AdManager: ATT İzni verildi (Kişiselleştirilmiş reklamlar)")
                    case .denied:
                        print("AdManager: ATT İzni reddedildi (Genel reklamlar)")
                    case .notDetermined:
                        print("AdManager: ATT İzni belirlenmedi")
                    case .restricted:
                        print("AdManager: ATT Kısıtlı")
                    @unknown default:
                        break
                    }
                    completion?()
                }
            }
        } else {
            completion?()
        }
    }

    /// Geçiş reklamı gösterme isteği
    func showInterstitial(from viewController: UIViewController, callbackId: String?, onComplete: @escaping (Bool) -> Void) {
        // Reklam gösterimi tamamlandığında oyunun kaldığı yerden devam etmesi sağlanır
        print("AdManager: showInterstitial tetiklendi (callbackId: \(callbackId ?? "nil"))")
        onComplete(true)
    }

    /// Ödüllü reklam gösterme isteği
    func showRewarded(from viewController: UIViewController, callbackId: String?, onComplete: @escaping (Bool) -> Void) {
        print("AdManager: showRewarded tetiklendi (callbackId: \(callbackId ?? "nil"))")
        onComplete(true)
    }
}
