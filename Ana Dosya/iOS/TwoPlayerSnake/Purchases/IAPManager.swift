import Foundation
import UIKit
import StoreKit
import RevenueCat

/// RevenueCat ve Apple StoreKit tabanlı Uygulama İçi Satın Alma (IAP) Yöneticisi
/// Android tarafındaki RevenueCat yapısıyla birebir uyumlu çalışır.
final class IAPManager: NSObject {

    static let shared = IAPManager()

    // MARK: - Yapılandırma Sabitleri
    private let apiKey = "appl_BioGpdwieqcynDcpKXsuKlEeQUQ"
    private let entitlementId = "remove_ads"
    private let userDefaultsKey = "adsRemoved"

    static let premiumStatusDidChangeNotification = Notification.Name("IAPManagerPremiumStatusDidChangeNotification")

    // MARK: - Kalıcı Durum
    /// Reklamların kaldırılıp kaldırılmadığını döner (UserDefaults ile cihazda kalıcıdır)
    var isAdsRemoved: Bool {
        get {
            return UserDefaults.standard.bool(forKey: userDefaultsKey)
        }
        set {
            let oldValue = UserDefaults.standard.bool(forKey: userDefaultsKey)
            UserDefaults.standard.set(newValue, forKey: userDefaultsKey)
            if oldValue != newValue {
                print("IAPManager: isAdsRemoved güncellendi -> \(newValue)")
                NotificationCenter.default.post(name: IAPManager.premiumStatusDidChangeNotification, object: nil)
            }
        }
    }

    private override init() {
        super.init()
    }

    // MARK: - SDK Başlatma
    /// Uygulama açılışında RevenueCat SDK'sını başlatır ve en güncel lisansı sorgular
    func configure() {
        Purchases.logLevel = .warn
        Purchases.configure(withAPIKey: apiKey)
        print("IAPManager: RevenueCat yapılandırıldı. Lisans durumu sorgulanıyor...")
        checkPremiumStatus()
    }

    // MARK: - Lisans Sorgulama
    /// Apple sunucularından en güncel satın alım durumunu sorgular
    func checkPremiumStatus(completion: ((Bool) -> Void)? = nil) {
        Purchases.shared.getCustomerInfo { [weak self] customerInfo, error in
            guard let self = self else { return }

            if let error = error {
                print("IAPManager: getCustomerInfo hatası: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion?(self.isAdsRemoved)
                }
                return
            }

            let isActive = customerInfo?.entitlements[self.entitlementId]?.isActive == true
            self.isAdsRemoved = isActive

            DispatchQueue.main.async {
                completion?(isActive)
            }
        }
    }

    // MARK: - Satın Alma Akışı (Remove Ads)
    /// Tek seferlik ömür boyu reklamsız paketini satın alma akışını başlatır
    func buyRemoveAds(from viewController: UIViewController, completion: @escaping (_ success: Bool, _ errorMessage: String?) -> Void) {
        if isAdsRemoved {
            completion(true, nil)
            return
        }

        Purchases.shared.getOfferings { [weak self] offerings, error in
            guard let self = self else { return }

            if let error = error {
                print("IAPManager: getOfferings hatası: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion(false, "Satın alma seçenekleri yüklenemedi: \(error.localizedDescription)")
                }
                return
            }

            // Öncelikle 'current' veya 'default' teklifinden lifetime paketini bul
            var targetPackage: Package? = offerings?.current?.lifetime

            if targetPackage == nil {
                // Alternatif: availablePackages listesinde remove_ads_premium ürününü ara
                if let packages = offerings?.current?.availablePackages {
                    targetPackage = packages.first { $0.storeProduct.productIdentifier == "remove_ads_premium" }
                }
            }

            if targetPackage == nil {
                // Alternatif 2: Tüm teklif gruplarını tara
                for (_, offering) in offerings?.all ?? [:] {
                    if let pkg = offering.lifetime ?? offering.availablePackages.first(where: { $0.storeProduct.productIdentifier == "remove_ads_premium" }) {
                        targetPackage = pkg
                        break
                    }
                }
            }

            guard let packageToBuy = targetPackage else {
                print("IAPManager: 'lifetime' veya 'remove_ads_premium' paketi bulunamadı!")
                DispatchQueue.main.async {
                    completion(false, "Satın alma paketi bulunamadı. Lütfen daha sonra tekrar deneyin.")
                }
                return
            }

            DispatchQueue.main.async {
                Purchases.shared.purchase(package: packageToBuy) { [weak self] transaction, customerInfo, purchaseError, userCancelled in
                    guard let self = self else { return }

                    if userCancelled {
                        print("IAPManager: Kullanıcı satın almayı iptal etti.")
                        completion(false, nil)
                        return
                    }

                    if let purchaseError = purchaseError {
                        print("IAPManager: Satın alma hatası: \(purchaseError.localizedDescription)")
                        completion(false, purchaseError.localizedDescription)
                        return
                    }

                    let isActive = customerInfo?.entitlements[self.entitlementId]?.isActive == true
                    self.isAdsRemoved = isActive

                    print("IAPManager: Satın alma tamamlandı! Entitlement aktif mi: \(isActive)")
                    completion(isActive, nil)
                }
            }
        }
    }

    // MARK: - Satın Alımları Geri Yükleme (Restore Purchases)
    /// Apple hesabı ile daha önce yapılmış satın alımları geri yükler
    func restorePurchases(completion: @escaping (_ isPremium: Bool, _ errorMessage: String?) -> Void) {
        Purchases.shared.restorePurchases { [weak self] customerInfo, error in
            guard let self = self else { return }

            if let error = error {
                print("IAPManager: restorePurchases hatası: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion(false, error.localizedDescription)
                }
                return
            }

            let isActive = customerInfo?.entitlements[self.entitlementId]?.isActive == true
            self.isAdsRemoved = isActive

            print("IAPManager: Geri yükleme tamamlandı. Entitlement aktif mi: \(isActive)")
            DispatchQueue.main.async {
                completion(isActive, nil)
            }
        }
    }
}
