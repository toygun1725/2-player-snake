import Foundation
import WebKit
import StoreKit

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
        case "onEatFood":
            HapticManager.shared.playFoodHaptic()

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
            // HTML başarımlar menüsünü aç
            viewController?.evaluateJavaScript("if(typeof window.openHtmlAchievementsMenu==='function'){window.openHtmlAchievementsMenu();}")

        case "emit":
            print("Bridge: Emit Event: \(String(describing: payload))")

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
            AdManager.shared.showRewarded(from: vc, callbackId: callbackId) { [weak self] success in
                self?.finishAd(callbackId: callbackId, success: success)
            }
        } else {
            AdManager.shared.showInterstitial(from: vc, callbackId: callbackId) { [weak self] success in
                self?.finishAd(callbackId: callbackId, success: success)
            }
        }
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
            if let windowScene = self.viewController?.view.window?.windowScene {
                if #available(iOS 14.0, *) {
                    SKStoreReviewController.requestReview(in: windowScene)
                } else {
                    SKStoreReviewController.requestReview()
                }
            }
        }
    }

    private func handleBuyRemoveAds() {
        print("Bridge: buyRemoveAds çağrıldı")
        // Satın alma akışı hazır kancası
    }

    private func handleRestorePurchases() {
        print("Bridge: restorePurchases çağrıldı")
        // Satın alma geri yükleme kancası
    }
}
