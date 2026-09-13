# 2 Player Snake - iOS & TestFlight GitHub CI/CD Kurulum Rehberi (Mac Olmadan)

Bu belge, **fiziksel bir Mac bilgisayara ihtiyaç duymadan**, Windows bilgisayarınızdan GitHub ve Apple Developer altyapısını kullanarak **2 Player Snake** uygulamasını iOS için derleme, imzalama ve doğrudan **TestFlight** / **App Store**'a gönderme sürecinin eksiksiz teknik kılavuzudur.

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
* **Ortam:** `macos-14` (Apple Silicon M1/M2) üzerinde en güncel Xcode sürümü ile çalışır.

### 2. `Ana Dosya/iOS/fastlane/Fastfile`
* **İşlevi:** Dağıtım adımlarını yöneten Fastlane yapılandırmasıdır.
* **Yaptığı İşlemler:**
  1. App Store Connect API anahtarını tanımlar.
  2. İzole ve geçici bir macOS Keychain oluşturur.
  3. Apple Developer hesabınızdan gerekli dağıtım sertifikasını ve provisioning profilini otomatik temin eder.
  4. Build numarasını otomatik günceller.
  5. `build_app` (Gym) ile projeyi arşivleyip `.ipa` paketi üretir.
  6. `upload_to_testflight` (Pilot) ile `.ipa` dosyasını doğrudan TestFlight'a yükler.

### 3. `Ana Dosya/iOS/fastlane/Appfile`
* Bundle ID (`com.twoplayersnake.app`) ve Team ID tanımlarını içerir.

### 4. `Ana Dosya/iOS/Gemfile`
* Fastlane Ruby paket bağımlılığını tanımlar.

---

## 5. TestFlight Dağıtımı Nasıl Başlatılır?

GitHub Secrets tanımlamalarınızı yaptıktan sonra dağıtımı başlatmak için:

1. GitHub reponuza gidin.
2. Üst menüden **Actions** sekmesine tıklayın.
3. Sol menüden **iOS Build & TestFlight Deployment** iş akışını seçin.
4. Sağ taraftaki **Run workflow** açılır menüsüne tıklayın:
   * *(İsteğe bağlı)* `build_number` alanına özel bir numara yazabilir ya da boş bırakabilirsiniz (boş bırakırsanız GitHub çalışma numarası otomatik verilir).
5. Yeşil **Run workflow** butonuna basın.

İş akışı tamamlandığında (ortalama 5-10 dakika):
* Apple App Store Connect TestFlight sekmesinde yeni derlemeniz görünecektir.
* Apple'ın otomatik güvenlik taramasından (processing) sonra TestFlight tester'larınıza bildirim ulaşır.

---

## 6. iOS Native Proje Yapısı (2. Aşama Tamamlandı)

iOS native kabuk projesi Android ve Web yapısıyla birebir uyumlu olarak [`Ana Dosya/iOS/TwoPlayerSnake/`](file:///d:/#3%20Vibecoding/AI%20Games/2%20Player%20Snake/Ana%20Dosya/iOS/TwoPlayerSnake) altında oluşturulmuştur:

* **`TwoPlayerSnake.xcodeproj`:** Xcode 15/16 ve iOS 15.0+ uyumlu, GitHub Actions üzerinde otomatik derlenen proje ve paylaşılan şema (`xcshareddata/xcschemes/TwoPlayerSnake.xcscheme`).
* **`ViewController.swift`:** WKWebView motoru, tam ekran portrait kilit, Dynamic Island ve alt çubuk için Safe-Area CSS değişken enjeksiyonu (`--safe-area-top`), native splash/loading overlay ve internet kopmasında otomatik devreye giren native retry ekranı.
* **`HapticManager.swift`:** Apple Taptic Engine entegrasyonu (`UIImpactFeedbackGenerator`). Yem yeme (light), özel yem (medium), çarpışma (heavy) ve oyun sonu (error) bildirim titreşimleri.
* **`GameScriptMessageHandler.swift`:** Web oyunundan gelen köprü çağrılarını dinler ve native sistem işlevleriyle (titreşim, reklam, puan kaydı, mağaza oylaması) buluşturur.
* **`ios_bridge_bootstrap.js`:** Web oyununun kodunu değiştirmeden `window.Android` ve `window.TwoPlayerSnakeNative` objelerini taklit ederek iOS native köprüsüne bağlayan uyumluluk kütüphanesi.
* **`NetworkMonitor.swift`:** `NWPathMonitor` tabanlı canlı ağ durumu izleyici.
* **`AdManager.swift`:** Google AdMob ve Apple ATT (App Tracking Transparency) izin ve reklam altyapısı.
* **`Assets.xcassets`:** 1024x1024 piksel App Store uygulama ikonu (`appstore-1024.png`) ve renk paleti.
* **`LaunchScreen.storyboard`:** Siyah zemin üzerine yeşil neon "2 PLAYER SNAKE" açılış ekranı.
