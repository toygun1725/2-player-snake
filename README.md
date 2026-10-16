# 🐍 2 Player Snake

> **2 Players. One Screen. Real-Time Online & Local Arcade Battle.**  
> Official Website: [2playersnake.com](https://2playersnake.com) | App Store: [iOS App](https://apps.apple.com/app/id6811546748) | Google Play: [Android App](https://play.google.com/store/apps/details?id=com.twoplayersnake.app)

---

## 📖 Geliştirme Hikayesi & Vibecoding Retrospektifi

Yazılım geçmişi olmayan bir video yapımcısı ve bir avukatın, yapay zekayı bir çift programcı olarak kullanarak sıfırdan Web, Android ve iOS (Mac olmadan bulut CI/CD ile!) platformlarında küresel bir oyunu nasıl inşa ettiğini okumak için:

👉 **[The Story of 2 Player Snake: Sıfırdan Zirveye Bir Vibecoding Hikayesi](MD%20Files/The_Story_of_2_Player_Snake.md)**

---

## 🌟 Öne Çıkan Özellikler

- **Aynı Cihazda 2 Kişilik Kapışma (Same-Screen Local Battle):** Tek telefonda veya tablette iki kişi yan yana internet gerekmeden oynayabilir.
- **Gerçek Zamanlı Online PvP:** Dünyanın her yerinden rakiplere veya arkadaşlara karşı anlık düellolar.
- **Evrensel Davet Linkleri (Universal Links):** WhatsApp veya mesaj ile tek tıkla arkadaşının maç odasına bağlanma.
- **Çoklu Oyun Modları:** Normal (Klasik), Fast Competitive (Hızlı Rekabetçi), Adventure (Macera), Self Area 51 (Bölünmüş Ekran).
- **21 Dilde Küresel Yerelleştirme:** Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Rusça, Çince, Japonca, Korece ve daha fazlası.
- **Akıllı ve Oyuncu Dostu:** 60 FPS Metal/Canvas optimizasyonu, katmanlı dokunsal titreşim (haptics), 30 saniyelik optimize edilmiş reklam bekleme süresi ve kesintisiz ses motoru.

---

## 🛠️ Teknik Ekosistem

| Platform | Teknoloji / Altyapı |
| :--- | :--- |
| **Web (PC & Mobil)** | Vanilla JS, HTML5 Canvas, Socket.IO, CSS Glassmorphism |
| **Android** | Native WebView Wrapper, Kotlin & Java, Google Play Games Services (15 Başarım) |
| **iOS** | Swift, WKWebView, Apple Game Center (15 Başarım), StoreKit / RevenueCat IAP |
| **CI/CD & Dağıtım** | GitHub Actions (macOS Runner), Fastlane, TestFlight Automation |
| **Sunucu** | Node.js, Socket.IO, Express, REST API |

---

## 📂 Proje Dokümantasyonu

Tüm teknik kılavuzlar ve sürüm geçmişi [`MD Files/`](MD%20Files/) dizinindedir:
- [Sürüm Notları (Release Notes)](MD%20Files/Release_Notes.md)
- [v3.6.0 Online Boost Doğrulaması](MD%20Files/v3.6.0_Online_Boost_Verification.md)
- [v3.5.9 Solo Uzunluk Göstergesi Doğrulaması](MD%20Files/v3.5.9_Solo_Milestone_Verification.md)
- [v3.5.9 Kutlama Yazısı Doğrulaması](MD%20Files/v3.5.9_Win_Glyph_Verification.md)
- [Mobil Web Geliştirici Kılavuzu](MD%20Files/AI_Guide_Mobile.md)
- [PC Web Geliştirici Kılavuzu](MD%20Files/AI_Guide_PC.md)
- [iOS Geliştirici Kılavuzu](MD%20Files/AI_Guide_iOS.md)
- [Android Geliştirici Kılavuzu](MD%20Files/AI_Guide_Android.md)
- [iOS TestFlight & CI/CD Kılavuzu](MD%20Files/AI_Guide_iOS_TestFlight_CI_CD.md)
- [RevenueCat & IAP Kılavuzu](MD%20Files/AI_Guide_RevenueCat.md)
- [Reklam & Gelir Modeli Kılavuzu](MD%20Files/AI_Guide_Ads.md)
- [App Store Açıklamaları (Tüm Diller)](MD%20Files/App_Store_Descriptions.md)

> **Final Sürüm (Canlıda):** `v3.6.0` — Online Boost/Dash kuralı (yalnız PC–PC Hızlı Rekabetçi maçlarda aktif, cross-play ve mobil maçlarda kapalı), Android ve iOS çevrimdışı fallback eşitliği, 1P Normal 10'luk uzunluk kutlaması ve düzeltilmiş kutlama glifleri. PC ve Mobile için nihai final sürümdür ve canlı yayındadır. **195/195 otomatik test** ve **13 Socket.IO kontrolü** doğrulanmıştır ([v3.6.0 Online Boost Doğrulaması](MD%20Files/v3.6.0_Online_Boost_Verification.md)). Native sürümler Android Code 71 / v3.4.9 ve iOS Build 47 / 3.5.8 olarak kalır.

---
© 2026 RomiToy Games. All rights reserved.
