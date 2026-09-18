import Foundation
import UIKit
import WebKit
import StoreKit
import GameKit

final class GameScriptMessageHandler: NSObject, WKScriptMessageHandler {

    weak var viewController: ViewController?

    init(viewController: ViewController) {
        self.viewController = viewController
        super.init()
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "iOS", let body = message.body as? [String: Any] else {
            return
        }

        let action = body["action"] as? String ?? ""
        let payload = body["payload"]

        switch action {
        case "gameReady":
            guard message.frameInfo.isMainFrame else { return }
            viewController?.gameDidBecomeReady()

        case "performanceReport":
            // Aggregate timings only: no names, scores, identifiers or network addresses.
            if let report = payload as? String { print("[GamePerformance] \(report)") }

        case "onEatFood":
            // SFX patch'ten gelen type bilgisine göre haptic şiddeti ayarla
            var foodType = "normal"
            if let dict = payload as? [String: Any], let t = dict["type"] as? String {
                foodType = t
            } else if let str = payload as? String,
                      let data = str.data(using: .utf8),
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let t = json["type"] as? String {
                foodType = t
            }
            switch foodType {
            case "heart":
                HapticManager.shared.playGameOverHaptic() // güçlü — beast mode
            case "diamond":
                HapticManager.shared.playSpecialFoodHaptic() // orta
            default:
                HapticManager.shared.playFoodHaptic() // hafif — normal yem
            }

        case "onGameStart":
            print("Bridge: Oyun Başladı")

        case "onCollision":
            HapticManager.shared.playCollisionHaptic()

        case "onGameOver":
            HapticManager.shared.playGameOverHaptic()

        case "triggerVibration":
            var ms = 30
            if let dict = payload as? [String: Any], let duration = dict["durationMs"] as? Int {
                ms = duration
            } else if let str = payload as? String, let parsed = Int(str) {
                ms = parsed
            }
            HapticManager.shared.triggerVibration(durationMs: ms)

        case "adBreak":
            handleAdBreak(payload: payload)

        case "requestReview":
            requestInAppReview()

        case "buyRemoveAds":
            handleBuyRemoveAds()

        case "restorePurchases":
            handleRestorePurchases()

        case "notifyHighScore":
            print("Bridge: Yüksek Skor Bildirildi: \(String(describing: payload))")

        case "showAchievements":
            print("Bridge: Başarımlar Menüsü İstendi")
            if GameCenterManager.shared.isAuthenticated {
                GameCenterManager.shared.showAchievements(from: viewController)
            } else {
                // Game Center oturumu yoksa oyun içi HTML başarımlar menüsünü aç
                viewController?.evaluateJavaScript("if(typeof window.openHtmlAchievementsMenu==='function'){window.openHtmlAchievementsMenu();}")
            }

        case "unlockAchievement":
            handleUnlockAchievement(payload: payload)

        case "emit":
            print("Bridge: Emit Event: \(String(describing: payload))")
            handleEmitEvent(payload: payload)

        default:
            print("Bridge: Bilinmeyen eylem: \(action)")
        }
    }

    private func handleAdBreak(payload: Any?) {
        guard let vc = viewController else { return }
        var callbackId: String? = nil
        var adType = "next"

        if let dict = payload as? [String: Any] {
            callbackId = dict["callbackId"] as? String
            adType = dict["type"] as? String ?? "next"
        } else if let str = payload as? String,
                  let data = str.data(using: .utf8),
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            callbackId = json["callbackId"] as? String
            adType = json["type"] as? String ?? "next"
        }

        if adType == "reward" {
            AdManager.shared.showRewarded(from: vc, callbackId: callbackId, onPresented: { [weak self] in
                self?.adDidBegin(callbackId: callbackId)
            }) { [weak self] success in
                self?.finishAd(callbackId: callbackId, success: success)
            }
        } else {
            AdManager.shared.showInterstitial(from: vc, callbackId: callbackId, onPresented: { [weak self] in
                self?.adDidBegin(callbackId: callbackId)
            }) { [weak self] success in
                self?.finishAd(callbackId: callbackId, success: success)
            }
        }
    }

    private func adDidBegin(callbackId: String?) {
        guard let cid = callbackId,
              let data = try? JSONSerialization.data(withJSONObject: [cid]),
              let json = String(data: data, encoding: .utf8) else { return }
        viewController?.evaluateJavaScript("if(window.__onNativeAdPresented) window.__onNativeAdPresented(\(json)[0]);")
    }

    private func finishAd(callbackId: String?, success: Bool) {
        let cid = callbackId ?? ""
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
            guard let self = self, let vc = self.viewController else { return }
            let js = "if (typeof window.__onNativeAdDone === 'function') { window.__onNativeAdDone('\(cid)', \(success)); }"
            vc.evaluateJavaScript(js) { result, error in
                if let error = error {
                    print("Bridge: __onNativeAdDone evaluateJavaScript hatası: \(error.localizedDescription)")
                } else {
                    print("Bridge: __onNativeAdDone başarıyla iletildi (cid: \(cid), success: \(success))")
                }
            }
        }
    }

    private func requestInAppReview() {
        DispatchQueue.main.async {
            // Apple HIG: Kullanıcı menüden "Bize Puan Ver!" butonuna bizzat tıkladığında,
            // SKStoreReviewController kota kısıtlamasına (yılda max 3 ve TestFlight'ta kapalı) takılmamak
            // ve doğrudan 5 yıldız/yorum penceresini açmak için resmi App Store write-review URL'i açılır.
            let appId = "6811546748"
            if let reviewUrl = URL(string: "itms-apps://itunes.apple.com/app/id\(appId)?action=write-review"),
               UIApplication.shared.canOpenURL(reviewUrl) {
                UIApplication.shared.open(reviewUrl, options: [:], completionHandler: nil)
            } else if let webUrl = URL(string: "https://apps.apple.com/app/id\(appId)?action=write-review") {
                UIApplication.shared.open(webUrl, options: [:], completionHandler: nil)
            } else if let windowScene = self.viewController?.view.window?.windowScene {
                if #available(iOS 14.0, *) {
                    SKStoreReviewController.requestReview(in: windowScene)
                } else {
                    SKStoreReviewController.requestReview()
                }
            }
        }
    }

    private func handleBuyRemoveAds() {
        guard let vc = viewController else { return }
        print("Bridge: buyRemoveAds çağrıldı")
        IAPManager.shared.buyRemoveAds(from: vc) { [weak self] success, errorMessage in
            guard let self = self, let vc = self.viewController else { return }
            if success {
                vc.publishSettingsToGame()
                vc.showAlert(
                    title: "👑 Reklamlar Kaldırıldı!",
                    message: "Teşekkürler! Artık reklamsız bir deneyimin tadını çıkarabilirsin.",
                    buttonTitle: "Harika!"
                )
            } else if let error = errorMessage, !error.isEmpty {
                vc.showAlert(
                    title: "Hata",
                    message: "Satın alma başarısız: \(error)",
                    buttonTitle: "Tamam"
                )
            }
        }
    }

    private func handleRestorePurchases() {
        guard let vc = viewController else { return }
        print("Bridge: restorePurchases çağrıldı")
        IAPManager.shared.restorePurchases { [weak self] isPremium, errorMessage in
            guard let self = self, let vc = self.viewController else { return }
            if let error = errorMessage, !error.isEmpty {
                vc.showAlert(
                    title: "Hata",
                    message: "Satın alımlar geri yüklenemedi: \(error)",
                    buttonTitle: "Tamam"
                )
            } else {
                vc.publishSettingsToGame()
                let msg = isPremium
                    ? "👑 Reklamsız satın alımın başarıyla geri yüklendi!"
                    : "Bu Apple hesabında daha önce reklam kaldırma satın alımı bulunamadı."
                vc.showAlert(
                    title: "Satın Alımları Geri Yükle",
                    message: msg,
                    buttonTitle: "Tamam"
                )
            }
        }
    }

    private func handleEmitEvent(payload: Any?) {
        var dict: [String: Any]? = payload as? [String: Any]
        if dict == nil, let str = payload as? String, let data = str.data(using: .utf8) {
            dict = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
        }

        guard let eventDict = dict, let name = eventDict["name"] as? String else { return }

        switch name {
        case "unlockAchievement":
            handleUnlockAchievement(payload: eventDict["payload"])
        default:
            break
        }
    }

    private func handleUnlockAchievement(payload: Any?) {
        var achKey: String? = nil
        if let dict = payload as? [String: Any] {
            achKey = dict["key"] as? String
        } else if let str = payload as? String {
            if let data = str.data(using: .utf8),
               let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
               let k = json["key"] as? String {
                achKey = k
            } else {
                achKey = str
            }
        }

        guard let key = achKey, !key.isEmpty else { return }
        print("Bridge: Başarım kilidi açılıyor: \(key)")
        GameCenterManager.shared.reportAchievement(identifier: key)
    }
}
