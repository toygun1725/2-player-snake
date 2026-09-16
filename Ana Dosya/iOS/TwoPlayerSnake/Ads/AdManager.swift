import UIKit
import AppTrackingTransparency
import AdSupport
import GoogleMobileAds

final class AdManager: NSObject {
    static let shared = AdManager()

    // MARK: - Canlı AdMob iOS Kimlikleri
    let appId = "ca-app-pub-4114535776207741~3769407896"
    let interstitialId = "ca-app-pub-4114535776207741/6012427858"
    let rewardedId = "ca-app-pub-4114535776207741/7193260548"

    // MARK: - Reklam Durumu ve Referanslar
    private var interstitialAd: GADInterstitialAd?
    private var rewardedAd: GADRewardedAd?
    private var isInterstitialLoading = false
    private var isRewardedLoading = false
    private var isSdkInitialized = false

    private var interstitialCompletion: ((Bool) -> Void)?
    private var rewardedCompletion: ((Bool) -> Void)?
    private var userEarnedReward = false
    private var watchdogTimer: Timer?
    private var presentedCallback: (() -> Void)?
    private var activeAd: AnyObject?

    // Yeniden Deneme (Retry) Stratejisi
    private var interstitialRetryAttempt = 0
    private var rewardedRetryAttempt = 0
    private let retryDelays: [TimeInterval] = [15.0, 30.0, 60.0, 120.0, 300.0]

    private override init() {
        super.init()
    }

    // MARK: - 1. ATT (App Tracking Transparency) & SDK Başlatma
    /// Apple ATT izin diyaloğunu gösterir ve ardından AdMob SDK'sını başlatır.
    func requestTrackingAuthorization(completion: (() -> Void)? = nil) {
        if #available(iOS 14.5, *) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                ATTrackingManager.requestTrackingAuthorization { [weak self] status in
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
                    self?.startMobileAdsSDK(completion: completion)
                }
            }
        } else {
            startMobileAdsSDK(completion: completion)
        }
    }

    /// Google Mobile Ads SDK'yı başlatır ve ilk reklamları önceden yükler (Preload)
    func startMobileAdsSDK(completion: (() -> Void)? = nil) {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in self?.startMobileAdsSDK(completion: completion) }
            return
        }
        guard !isSdkInitialized else {
            completion?()
            return
        }
        isSdkInitialized = true

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            print("AdManager: Google Mobile Ads SDK başlatılıyor...")
            
            // TestFlight ve geliştirme ortamı için simülatör test ID kaydı
            GADMobileAds.sharedInstance().requestConfiguration.testDeviceIdentifiers = [
                GADSimulatorID
            ]

            GADMobileAds.sharedInstance().start { [weak self] status in
                print("AdManager: Google Mobile Ads SDK hazır. Reklamlar önden yükleniyor...")
                self?.loadInterstitial()
                self?.loadRewarded()
                completion?()
            }
        }
    }

    // MARK: - 2. Geçiş (Interstitial) Reklamı Yönetimi
    func loadInterstitial() {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in self?.loadInterstitial() }
            return
        }
        guard isSdkInitialized, NetworkMonitor.shared.isOnline(), !IAPManager.shared.isAdsRemoved else { return }
        guard interstitialAd == nil, !isInterstitialLoading else { return }
        isInterstitialLoading = true

        let request = GADRequest()
        print("AdManager: Interstitial yükleme isteği gönderiliyor (ID: \(interstitialId))...")
        GADInterstitialAd.load(withAdUnitID: interstitialId, request: request) { [weak self] ad, error in
            guard let self = self else { return }
            self.isInterstitialLoading = false

            if let error = error {
                print("AdManager: Interstitial yüklenemedi: \(error.localizedDescription)")
                self.interstitialAd = nil
                self.scheduleInterstitialRetry()
                return
            }

            self.interstitialAd = ad
            self.interstitialAd?.fullScreenContentDelegate = self
            self.interstitialRetryAttempt = 0
            print("AdManager: Interstitial başarıyla yüklendi ve hazır!")
        }
    }

    private func scheduleInterstitialRetry() {
        guard NetworkMonitor.shared.isOnline() else {
            print("AdManager: Cihaz çevrimdışı, interstitial yeniden denemesi ertelendi.")
            return
        }
        let delay = retryDelays[min(interstitialRetryAttempt, retryDelays.count - 1)]
        interstitialRetryAttempt += 1
        print("AdManager: Interstitial \(delay) saniye sonra tekrar denenecek (Deneme #\(interstitialRetryAttempt))")
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
            self?.loadInterstitial()
        }
    }

    func showInterstitial(from viewController: UIViewController, callbackId: String?, onPresented: @escaping () -> Void = {}, onComplete: @escaping (Bool) -> Void) {
        if IAPManager.shared.isAdsRemoved {
            print("AdManager: Reklamlar kaldırılmış (Premium), interstitial atlanıyor.")
            onComplete(true)
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            guard self.interstitialCompletion == nil, self.rewardedCompletion == nil else { onComplete(false); return }
            guard let ad = self.interstitialAd else {
                print("AdManager: Interstitial henüz hazır değil. Oyun kilitlenmesin diye atlanıyor.")
                self.loadInterstitial()
                onComplete(true)
                return
            }

            self.interstitialCompletion = onComplete
            self.activeAd = ad
            self.presentedCallback = onPresented
            self.startWatchdogTimer(for: "interstitial")

            print("AdManager: Interstitial reklamı gösteriliyor...")
            ad.present(fromRootViewController: viewController)
        }
    }

    // MARK: - 3. Ödüllü (Rewarded) Reklam Yönetimi
    func loadRewarded() {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in self?.loadRewarded() }
            return
        }
        guard isSdkInitialized, NetworkMonitor.shared.isOnline(), !IAPManager.shared.isAdsRemoved else { return }
        guard rewardedAd == nil, !isRewardedLoading else { return }
        isRewardedLoading = true

        let request = GADRequest()
        print("AdManager: Rewarded yükleme isteği gönderiliyor (ID: \(rewardedId))...")
        GADRewardedAd.load(withAdUnitID: rewardedId, request: request) { [weak self] ad, error in
            guard let self = self else { return }
            self.isRewardedLoading = false

            if let error = error {
                print("AdManager: Rewarded yüklenemedi: \(error.localizedDescription)")
                self.rewardedAd = nil
                self.scheduleRewardedRetry()
                return
            }

            self.rewardedAd = ad
            self.rewardedAd?.fullScreenContentDelegate = self
            self.rewardedRetryAttempt = 0
            print("AdManager: Rewarded başarıyla yüklendi ve hazır!")
        }
    }

    private func scheduleRewardedRetry() {
        guard NetworkMonitor.shared.isOnline() else {
            print("AdManager: Cihaz çevrimdışı, rewarded yeniden denemesi ertelendi.")
            return
        }
        let delay = retryDelays[min(rewardedRetryAttempt, retryDelays.count - 1)]
        rewardedRetryAttempt += 1
        print("AdManager: Rewarded \(delay) saniye sonra tekrar denenecek (Deneme #\(rewardedRetryAttempt))")
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
            self?.loadRewarded()
        }
    }


    func showRewarded(from viewController: UIViewController, callbackId: String?, onPresented: @escaping () -> Void = {}, onComplete: @escaping (Bool) -> Void) {
        if IAPManager.shared.isAdsRemoved {
            print("AdManager: Reklamlar kaldırılmış (Premium), ödüllü reklam atlanıyor ve ödül veriliyor.")
            onComplete(true)
            return
        }

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            guard self.interstitialCompletion == nil, self.rewardedCompletion == nil else { onComplete(false); return }
            guard let ad = self.rewardedAd else {
                print("AdManager: Rewarded henüz hazır değil. Oyun kilitlenmesin diye atlanıyor.")
                self.loadRewarded()
                onComplete(false)
                return
            }

            self.rewardedCompletion = onComplete
            self.activeAd = ad
            self.presentedCallback = onPresented
            self.userEarnedReward = false
            self.startWatchdogTimer(for: "rewarded")

            print("AdManager: Rewarded reklamı gösteriliyor...")
            ad.present(fromRootViewController: viewController) { [weak self, weak ad] in
                guard let self = self, let ad = ad, self.activeAd === ad else { return }
                print("AdManager: Oyuncu ödüllü reklamı tamamlayarak ödülü kazandı! 🌟")
                self.userEarnedReward = true
            }
        }
    }

    // MARK: - 4. Güvenlik Zamanlayıcısı (Watchdog Timer)
    /// Bounds presentation startup only; cancelled when a real ad begins presenting.
    private func startWatchdogTimer(for type: String) {
        cancelWatchdogTimer()
        watchdogTimer = Timer.scheduledTimer(withTimeInterval: 7.5, repeats: false) { [weak self] _ in
            guard let self = self else { return }
            self.activeAd = nil
            self.presentedCallback = nil
            print("AdManager: Reklam sunumu zaman aşımı (7.5s): \(type)")
            if type == "interstitial" {
                let comp = self.interstitialCompletion
                self.interstitialCompletion = nil
                self.interstitialAd = nil
                self.loadInterstitial()
                comp?(true)
            } else {
                let comp = self.rewardedCompletion
                self.rewardedCompletion = nil
                self.rewardedAd = nil
                self.loadRewarded()
                comp?(self.userEarnedReward)
            }
        }
    }

    private func cancelWatchdogTimer() {
        watchdogTimer?.invalidate()
        watchdogTimer = nil
    }
}

// MARK: - 5. GADFullScreenContentDelegate
extension AdManager: GADFullScreenContentDelegate {
    func adWillPresentFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        guard activeAd === (ad as AnyObject) else { return }
        // The watchdog covers failed presentation, not time spent watching a real ad.
        cancelWatchdogTimer()
        presentedCallback?()
        presentedCallback = nil
    }

    func adDidRecordImpression(_ ad: GADFullScreenPresentingAd) {
        print("AdManager: Reklam gösterimi başarıyla kaydedildi")
    }

    func adWillDismissFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        print("AdManager: Reklam kapanmak üzere...")
    }

    func adDidDismissFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        guard activeAd === (ad as AnyObject) else { return }
        activeAd = nil
        presentedCallback = nil
        print("AdManager: Reklam kapatıldı, oyun akışı devam ettiriliyor.")
        cancelWatchdogTimer()

        if ad is GADInterstitialAd {
            interstitialAd = nil
            let comp = interstitialCompletion
            interstitialCompletion = nil
            loadInterstitial() // Bir sonraki geçiş için önden yükle
            comp?(true)
        } else if ad is GADRewardedAd {
            rewardedAd = nil
            let earned = userEarnedReward
            let comp = rewardedCompletion
            rewardedCompletion = nil
            loadRewarded() // Bir sonraki ödül için önden yükle
            comp?(earned)
        }
    }

    func ad(_ ad: GADFullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        guard activeAd === (ad as AnyObject) else { return }
        activeAd = nil
        presentedCallback = nil
        print("AdManager: Reklam tam ekran gösterilirken hata oluştu: \(error.localizedDescription)")
        cancelWatchdogTimer()

        if ad is GADInterstitialAd {
            interstitialAd = nil
            let comp = interstitialCompletion
            interstitialCompletion = nil
            loadInterstitial()
            comp?(true) // Oyun kilitlenmesin diye maça devam ettir
        } else if ad is GADRewardedAd {
            rewardedAd = nil
            let comp = rewardedCompletion
            rewardedCompletion = nil
            loadRewarded()
            comp?(false)
        }
    }
}
