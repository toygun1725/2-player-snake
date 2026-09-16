# 2 Player Snake - iOS & TestFlight GitHub CI/CD Kurulum Rehberi (Mac Olmadan)

Bu belge, **fiziksel bir Mac bilgisayara ihtiyaç duymadan**, Windows bilgisayarınızdan GitHub ve Apple Developer altyapısını kullanarak **2 Player Snake** uygulamasını iOS için derleme, imzalama ve doğrudan **TestFlight** / **App Store**'a gönderme sürecinin eksiksiz teknik kılavuzudur.

---

## Güncel CI eki — Build 36 (2026-09-16)

- `ios-runtime-checks.yml`, main'deki ilgili değişikliklerde ve manuel çalıştırmada
  16 JS regresyon testini ve macOS WKWebView HTTPS-origin/offline kaynak smoke testini çalıştırır.
- TestFlight workflow'u da aynı kontrolü zorunlu önkoşul olarak çağırır.
- Tag `ios-v3.3.5-b36` native build 36'yı seçer; main push tek başına TestFlight yüklemez.
- Fastlane artık başka uygulamaları etkileyebilecek eski Apple sertifikasını otomatik
  silmez. Cache/private key yoksa ve kota doluysa doğru P12 kullanıcı tarafından sağlanmalıdır.
- `node tools/github-ios-status.cjs runs` / `jobs RUN_ID` / `log JOB_ID` mevcut Git
  kimlik yöneticisiyle salt-okunur durum sorgular; token çıktıya yazılmaz.
- Sonuç ve web yayını bağımlılığı: [iOS_Build_36_Verification.md](iOS_Build_36_Verification.md).
- Aşağıdaki Build 30 doğrulaması ve otomatik sertifika temizleme anlatımları tarihsel
  kurulum bilgisidir; güncel kaynak ve bu ek önceliklidir.

## Build 30 TestFlight Doğrulama Kontrolü

Build 30 başarıyla derlenmiş ve TestFlight'a yüklenmiştir (`ios-v3.3.5-b30` / Run #31). App Store Connect'te incelemedeki Build 29'u etkilemez. Gerçek iPhone üzerinde TestFlight üzerinden şu senaryoları doğrulayabilirsiniz:

1. **Oyna düğmesi:** Reklam gösterildiğinde ve gösterilemediğinde oyun ekranı akıcı açılmalı.
2. **Duraklat > Ana Menü:** Tek dokunuşta menüye dönmeli; ikinci dokunuş veya bekleyen reklam kilidi olmamalı.
3. **Uçak modu ile soğuk açılış:** Paket içindeki yerel iki kişilik oyun (`mobile_offline_fallback.html`) ve logo görünmeli; yerel maç sorunsuz başlamalı.
4. **Offline'dan Online'a geçiş:** Fallback ekranındayken ağ geri geldiğinde, online sürümü yenileme uyarısı çalışmalı; "Offline Devam Et" seçeneği yerel maçı korumalı.

---

## 1. Sistemin Çalışma Mantığı ve Mimarisi

Apple ekosisteminde bir iOS uygulamasının derlenmesi (`.ipa` üretimi) macOS işletim sistemi ve Xcode gerektirir. Masanızda bir Mac olmasa bile, **GitHub Actions** bünyesinde sağlanan bulut macOS sunucuları (`macos-14` / Apple Silicon) bu görevi üstlenir.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Geliştirici (Windows)
    participant GH as GitHub Reposu
    participant CI as GitHub Actions (macOS Runner)
    participant ASC as Apple App Store Connect
    participant TF as TestFlight (Tester Cihazları)

    Dev->>GH: Kodları push eder veya "Run Workflow" tıklar
    GH->>CI: macOS-14 sanal makinesi ayağa kaldırılır
    CI->>ASC: App Store Connect API Key (.p8) ile kimlik doğrulaması
    CI->>ASC: Dağıtım sertifikalarını & provizyon profillerini senkronize eder
    CI->>CI: Xcode ile TwoPlayerSnake.xcodeproj projesini derler (.ipa)
    CI->>ASC: Üretilen .ipa dosyasını TestFlight API'ye yükler
    ASC->>TF: Sürüm işlenir ve test kullanıcılarına bildirim gider
```

---

## 2. Apple Tarafında Yapılacak Hazırlıklar

### A. Bundle Identifier (Uygulama Kimliği) Doğrulama
Android tarafındaki paket adımız: `com.twoplayersnake.app`
1. [developer.apple.com/account](https://developer.apple.com/account) adresine gidin.
2. **Certificates, Identifiers & Profiles** > **Identifiers** bölümüne tıklayın.
3. `+` butonuna basarak yeni bir **App IDs** oluşturun:
   * **Description:** `2 Player Snake`
   * **Bundle ID (Explicit):** `com.twoplayersnake.app`

---

### B. App Store Connect Üzerinde Uygulama Oluşturma
1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) adresine gidin.
2. **Apps** (Uygulamalarım) > `+` (Yeni Uygulama) butonuna tıklayın:
   * **Platforms:** `iOS`
   * **Name:** `2 Player Snake`
   * **Primary Language:** `English` (veya tercihiniz)
   * **Bundle ID:** Yukarıda oluşturduğunuz `com.twoplayersnake.app` seçeneğini seçin.
   * **SKU:** `twoplayersnake_ios_01` (benzersiz herhangi bir metin)
   * **User Access:** `Full Access`

---

### C. App Store Connect API Anahtarı (.p8) Alma (Çok Önemli)
Bu anahtar, GitHub sunucularının Apple hesabınıza şifresiz, güvenli ve 2FA (iki adımlı doğrulama) engeline takılmadan bağlanmasını sağlar.

1. [appstoreconnect.apple.com/access/integrations/api](https://appstoreconnect.apple.com/access/integrations/api) adresine gidin.
2. **Users and Access (Kullanıcılar ve Erişim)** sekmesinden **Integrations** > **App Store Connect API** bölümüne gelin.
3. `+` (Generate API Key / Anahtar Oluştur) butonuna tıklayın:
   * **Name:** `GitHub Actions TestFlight`
   * **Access:** `App Manager` veya `Admin` seçin (Uygulama yükleyebilmek için zorunludur).
4. Oluşturulduktan sonra sayfada **3 kritik veri** görünecektir:
   * **Issuer ID:** Sayfanın en üstünde yer alan uzun kod (Örn: `57246542-96be-1a50-e053-082ebd79346a`).
   * **Key ID:** Oluşturduğunuz anahtarın 10 haneli kimliği (Örn: `2X9R4HXF34`).
   * **Download API Key (.p8):** `Download API Key` butonuna basarak `AuthKey_2X9R4HXF34.p8` dosyasını bilgisayarınıza indirin.
   
> [!CAUTION]
> Apple bu `.p8` dosyasını **yalnızca bir defa** indirmenize izin verir! Dosyayı bilgisayarınızda güvenli bir yerde yedekleyin.

---

### D. Apple Team ID Öğrenme
1. [developer.apple.com/account](https://developer.apple.com/account) ana sayfasına gidin.
2. Sağ üstteki profil menüsünden veya sol menüdeki **Membership Details** sayfasına tıklayın.
3. **Team ID** başlığı altındaki 10 haneli kodu not edin (Örn: `A1B2C3D4E5`).

---

## 3. GitHub Depo Ayarları ve Gizli Değişkenler (Secrets)

GitHub deponuzun Apple ile haberleşebilmesi için bu bilgileri depoya **Repository Secret** olarak eklemeniz gerekir:

1. GitHub'da ilgili reponuza gidin.
2. **Settings** > Sol menüden **Secrets and variables** > **Actions** bölümünü açın.
3. **New repository secret** butonuna tıklayarak aşağıdaki değişkenleri tek tek ekleyin:

| Secret Adı | Değer / Açıklama |
|---|---|
| `APP_STORE_CONNECT_KEY_ID` | `JA97H3PRT7` |
| `APP_STORE_CONNECT_ISSUER_ID` | `087e9e31-e20e-47b1-ac63-5e6384254d8a` |
| `APP_STORE_CONNECT_PRIVATE_KEY` | `AuthKey_JA97H3PRT7.p8` dosyasını Not Defteri ile açıp **tüm metni** (`-----BEGIN PRIVATE KEY-----` ve `-----END PRIVATE KEY-----` dahil) kopyalayıp yapıştırın. |
| `APPLE_TEAM_ID` | `GUFQF359Q7` |
| `CI_KEYCHAIN_PASSWORD` | *(İsteğe Bağlı)* macOS sanal makinesinde geçici anahtarlık şifresi (Örn: `SnakePass2026!`) |

---

## 4. Projede Hazırlanan Otomasyon Dosyaları

Projenize şu dosyalar eklenmiştir:

### 1. `.github/workflows/ios-testflight.yml`
* **İşlevi:** GitHub Actions iş akışıdır.
* **Tetikleme:**
  * GitHub arayüzünden **Actions** sekmesinden "Run workflow" butonuyla manuel tetiklenebilir.
  * İstenirse `ios-v1.0.0` şeklinde bir git tag'i atıldığında otomatik çalışır.
* **Ortam:** `macos-latest` (macOS 26 Tahoe + Xcode 26.6 + iOS 26 SDK) üzerinde çalışır (Apple'ın 2026 yılı iOS 26 SDK zorunluluğunu karşılar).
* **Önbellek (Cache):** `actions/cache@v4` ile üretilen dağıtım sertifikasını (`certs/dist_certificate.p12`) saklar; böylece Apple'ın 2 sertifika kotası tükenmez.

### 2. `Ana Dosya/iOS/fastlane/Fastfile`
* **İşlevi:** Dağıtım adımlarını yöneten Fastlane yapılandırmasıdır.
* **Yaptığı İşlemler:**
  1. App Store Connect API anahtarını tanımlar.
  2. İzole ve geçici bir macOS Keychain oluşturur (`-db` uzantı uyumu ile).
  3. Kendi kendini onaran sertifika yöneticisi: Eğer Apple Developer hesabında 2 sertifika limiti dolmuşsa ve yerel anahtar yoksa, eski yetim sertifikaları silip yenisini üretir.
  4. Apple Developer hesabınızdan gerekli dağıtım sertifikasını ve provisioning profilini otomatik temin eder.
  5. Build numarasını otomatik günceller.
  6. `build_app` (Gym) ile projeyi arşivleyip `.ipa` paketi üretir.
  7. `upload_to_testflight` (Pilot) ile `.ipa` dosyasını doğrudan TestFlight'a yükler.

### 3. `Ana Dosya/iOS/fastlane/Appfile`
* Bundle ID (`com.twoplayersnake.app`) ve Team ID tanımlarını içerir.

### 4. `Ana Dosya/iOS/Gemfile`
* Fastlane Ruby paket bağımlılığını tanımlar.

---

## 5. TestFlight Dağıtımı ve Test Kullanıcılarına Açma

1. GitHub Actions üzerinden iş akışı tetiklenir (**Run workflow**).
2. Ortalama 4-5 dakikada `.ipa` derlenir, imzalanır ve App Store Connect'e yüklenir.
3. Apple sunucuları yapıyı otomatik işler (**Status: Complete / Ready to Submit**).
4. **TestFlight Grubu Ataması (İlk Kurulum):**
   * App Store Connect > TestFlight > **Internal Testing (İç Test)** sekmesinden bir grup oluşturulur.
   * Geliştirici e-postası testçi olarak eklenir.
   * **Builds** sekmesinden derleme (`1.0.0 (14)`) seçilerek gruba dahil edilir.
5. Kullanıcının iPhone'undaki **TestFlight** uygulamasına davet/güncelleme bildirimi düşer.
6. TestFlight uygulamasından **"Yükle" (Install)** butonuna basılarak oyun fiziksel iPhone'a yüklenir.

---

## 6. iOS Native Proje Yapısı (2. Aşama Tamamlandı & Doğrulandı)

iOS native kabuk projesi Android ve Web yapısıyla birebir uyumlu olarak [`Ana Dosya/iOS/TwoPlayerSnake/`](file:///d:/#3%20Vibecoding/AI%20Games/2%20Player%20Snake/Ana%20Dosya/iOS/TwoPlayerSnake) altında oluşturulmuştur ve **fiziksel iPhone üzerinde başarıyla açılıp doğrulanmıştır**:

* **`TwoPlayerSnake.xcodeproj`:** Xcode 26 ve iOS 15.0+ uyumlu, GitHub Actions üzerinde otomatik derlenen proje ve paylaşılan şema (`xcshareddata/xcschemes/TwoPlayerSnake.xcscheme`).
* **`ViewController.swift`:** WKWebView motoru, tam ekran portrait kilit, Dynamic Island ve alt çubuk için Safe-Area CSS değişken enjeksiyonu (`--safe-area-top`), native splash/loading overlay ve internet kopmasında otomatik devreye giren native retry ekranı.
* **`HapticManager.swift`:** Apple Taptic Engine entegrasyonu (`UIImpactFeedbackGenerator`). Yem yeme (light), özel yem (medium), çarpışma (heavy) ve oyun sonu (error) bildirim titreşimleri.
* **`GameScriptMessageHandler.swift`:** Web oyunundan gelen köprü çağrılarını dinler ve native sistem işlevleriyle (titreşim, reklam, puan kaydı, mağaza oylaması) buluşturur.
* **`ios_bridge_bootstrap.js`:** Web oyununun kodunu değiştirmeden `window.Android` ve `window.TwoPlayerSnakeNative` objelerini taklit ederek iOS native köprüsüne bağlayan uyumluluk kütüphanesi.
* **`NetworkMonitor.swift`:** `NWPathMonitor` tabanlı canlı ağ durumu izleyici.
* **`AdManager.swift`:** Google AdMob ve Apple ATT (App Tracking Transparency) izin ve reklam altyapısı.
* **`Assets.xcassets`:** 1024x1024 piksel App Store uygulama ikonu (`appstore-1024.png`) ve renk paleti.
* **`LaunchScreen.storyboard`:** Siyah zemin üzerine yeşil neon "2 PLAYER SNAKE" açılış ekranı.

---

## 7. Çözülen Kritik Sorunlar ve Çözümleri

1. **Fastlane Keychain Bulunamadı Hatası:** macOS Sonoma/Tahoe üzerinde `create_keychain`, sonuna `-db` ekler (`github_actions_keychain-db`). Fastlane'in `get_certificates` eylemine fiziksel dosya yolu `-db` ile birlikte verilerek çözüldü.
2. **Apple Dağıtım Sertifikası Kotası (2 Certs Limit):** GitHub sanal makineleri geçici olduğu için üretilen özel anahtar makine kapanınca yok oluyordu. Fastlane'e Spaceship API ile eski kullanılmayan sertifikaları temizleyen "Self-Healing" mekanizması ve GitHub Actions `actions/cache@v4` entegre edildi.
3. **Apple SDK 2026 Kuralı (iOS 26 SDK Zorunluluğu):** Apple'ın `All iOS apps must be built with the iOS 26 SDK or later, included in Xcode 26` hatası, GitHub runner `macos-latest` (macOS 26 + Xcode 26.6) sürümüne yükseltilerek çözüldü.
4. **TestFlight Yapı Görünmeme Durumu:** Yapı "Complete" olduktan sonra TestFlight grubuna build atanarak kullanıcıya anında davet bildirimi gönderilmesi sağlandı.
