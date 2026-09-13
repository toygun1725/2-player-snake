# 2 Player Snake - Android Surumu Yapay Zeka Rehberi

Bu belge, `2 Player Snake` projesinin Android hibrit uygulama katmani icin teknik referanstir. Amac sadece bir WebView sarmali yapmak degil; Google Play tarafinda "dusuk degerli salt WebView uygulama" riskini azaltan, native hissi olan, Kotlin tabanli bir Android shell surdurmektir.

Bu rehber, ilk Android promptunda istenen hedefleri ve bugun bu hedeflere gore fiilen yaptigimiz tum isleri toplar.

## Referans Durum
- Android shell kaynagi: `d:\#3 Vibecoding\AI Games\2 Player Snake\Ana Dosya\Android`
- Guncel web kaynak referansi: `2 Player Snake Mobile v3.3.5 / PC v3.3.5`
- Guncel kaynak `versionCode`: **69**
- Guncel kaynak `versionName`: **`v3.3.5`**
- Yayin/AAB durumu: versionCode 69 (v3.3.5) AAB derlendi ve imzalandı (`2PlayerSnake-v3.3.5-release.aab` ve `app/build/outputs/bundle/release/app-release.aab`).

## Son Android Shell Notu (versionCode 69 / v3.3.5)
- **versionCode 69 (v3.3.5)**: Google Play Kalite, Bellek Optimizasyonu ve Yaşam Döngüsü Uyum Sürümü.
  - **Bellek Yönetimi (RAM & Lifecycle):** `MainActivity` ve `SnakeApplication` içinde `onTrimMemory(level)` ve `onLowMemory()` yaşam döngüleri entegre edildi. Sistem kritik RAM baskısı altındayken veya arka plana geçildiğinde WebView önbelleği (`clearCache(false)`) ve bellek kancaları tetiklenir.
  - **Arka Plan CPU/RAM Dondurma:** `onPause` esnasında `webView.onPause()` ve `webView.pauseTimers()` çağrılarak arka planda çalışan timer ve animasyonların RAM/CPU tüketimi durdurulur; `onResume` ile `webView.onResume()` ve `webView.resumeTimers()` üzerinden kesintisiz devam eder.
  - **DEX Kod Optimizasyonu (R8):** `proguard-rules.pro` temizlenerek R8 budama (shrinking) kapsamı maksimize edildi, Google'ın minimum %25 kod optimizasyon şartı fazlasıyla karşılandı.
  - **Keystore Yolu:** İmzalama yolu göreceli (`../../Play Store Key/Play Store Key`) yapılandırıldı.
  - `versionCode`: 68 → 69, `versionName`: v3.3.4 → v3.3.5.
  - AAB: `2PlayerSnake-v3.3.5-release.aab` derlendi ve imzalandı.

## Son Android Shell Notu (versionCode 68 / v3.3.4)
- **versionCode 68 (v3.3.4)**: Google Play Faturalandırma Kitaplığı (Billing 8+) Güncellemesi.
  - **Google Play Billing Library 8.0.0+:** RevenueCat SDK'sı `com.revenuecat.purchases:purchases:9.0.1` sürümüne yükseltilerek doğrudan `com.android.billingclient:billing:8.0.0` dahil edildi ve Google Play Console faturalandırma uyarısı tam olarak giderildi.
  - **Target API 36 (Android 16):** `compileSdk = 36` ve `targetSdk = 36` korundu (Google Play tarafından doğrulandı ve kabul edildi).
  - `versionCode`: 67 → 68, `versionName`: v3.3.4.
  - AAB: `app/build/outputs/bundle/release/app-release.aab` derlendi ve imzalandı.

## Son Web Kaynak Notu (v3.3.4)
- Mobil ve PC HTML referans dosyalari v3.3.4 olarak olusturuldu.
- v3.3.4, PC online odalarini yerel PC oyunu ile ayni `64x36` grid boyutuna tasir. Mobil `24x...` grid pazarligi korunur.
- v3.3.3; mobilde carpisma/render maliyeti azaltma, iki istemcide oyuncu adi HTML escape korumasi ve PC tarafinda kod/cache temizligi icerir.
- Ortak `server.js` oyuncu adlarini kontrol karakterlerinden arindirir, bosluklari normalize eder ve 12 Unicode karakterle sinirlar. Mobil/PC matchmaking, ozel oda ve temel oyun olaylari yerel Socket.IO entegrasyon testinde dogrulandi.
- Bu sunucu degisikligi canliya alinmadan once `server.js` yuklenmeli ve Node sureci yeniden baslatilmalidir.
- Android offline fallback su anda v3.2.0 icerigindedir; v3.3.4 Android yayini oncesinde fallback senkronizasyonu, `versionName`/`versionCode` guncellemesi, imzali AAB derlemesi ve cihaz testi gereklidir.

## Son Android Shell Notu (versionCode 62 / v3.3.2)
- **versionCode 62 (v3.3.2)**: Cloud Save, GPG PC Klavye ve Play Games Sidekick Entegrasyonu.
  - **Cloud Save (Snapshots API):** Google Play Oyun Hizmetleri yedekleme entegrasyonu tamamlandı. Yüksek skorlar (Mobil ve PC için ayrı ayrı) ve premium reklamsız (adsRemoved) satın alma durumu artık kullanıcının Google hesabında güvenle yedeklenir. Cihazlar arası çakışma çözümü (conflict resolution) ile en yüksek 10 skor birleştirilerek korunur. Premium durumu lisansı RevenueCat öncelikli olacak şekilde korunur.
  - **GPG PC Klavye Desteği:** Google Play Games on PC ortamı için fiziksel klavye tuş vuruşları (`w`, `a`, `s`, `d`, `ArrowUp/Down/Left/Right`, `ShiftLeft/Right`, `Space`, `Enter`, `r`, `m`) native katmanda yakalanarak WebView'e yönlendirildi.
  - **Play Games Sidekick:** Native Google Play Games başarımlar ekranı (`showAchievements()`) JS Köprüsü üzerinden tetiklenecek şekilde entegre edildi.
  - **PGS Sign-In & Achievement Unlock Güvencesi (v3.3.2 birleştirilmiş sürümü):** Arka planda sessiz giriş (`isAuthenticated()` + `signIn()`) ve başarım kilidi açılmadan önce giriş kontrolü (`doUnlock()`) güvenceye alındı.
  - `versionCode`: 60 → 62, `versionName`: v3.3.1 → v3.3.2.
  - AAB: `app/build/outputs/bundle/release/app-release.aab` derlendi ve imzalandı.
- **versionCode 60 (v3.3.1)**: Premium (Reklamsız Sürüm) Entegrasyonu ve Yerel Hatırlatıcı Bildirim Sistemi.
  - **Yerel Hatırlatıcı Bildirimler (WorkManager):** Sunucusuz ve tamamen yerel olarak cihazda çalışan bir bildirim zamanlama sistemi kuruldu (`androidx.work:work-runtime-ktx:2.9.1`). Kullanıcı oyunu 1, 3 ve 7 gün boyunca oynamadıysa tetiklenecek 3 farklı aşamada yerelleştirilmiş bildirimler planlanır. Kullanıcı oyuna her girdiğinde tüm sayaçlar ve planlar sıfırlanır.
  - **21 Dilde Otomatik Yerelleştirme:** Cihazın sistem dili algılanarak 21 farklı dilde (Türkçe, İngilizce, Almanca, Fransızca, Japonca, Rusça vb.) doğru bildirim başlıkları ve metinleri gönderilir. Eşleşmeyen diller için İngilizce (EN) fallback kullanılır.
  - **Akıllı İzin İsteme Zamanlaması:** Kullanıcıyı rahatsız etmemek ve izin kabul oranını artırmak için Android 13+ (`POST_NOTIFICATIONS`) bildirim izni ilk açılışta değil, **3. oyun oturumu açılışında** kullanıcıdan istenir.
  - **Bildirim İkonu:** Bildirimlerin solunda gösterilecek simge olarak varsayılan uygulama ikonu (`R.mipmap.ic_launcher`) ayarlandı.
  - **RevenueCat Entegrasyonu:** Native katmanda satın alma, satın alımları geri yükleme ve açılışta lisans durumunu sorgulama altyapısı kuruldu. API Key: `goog_RTZchIHQaIxXoqgGcwvriNeVOGE`.
  - **JS Köprüsü (Bridge) Genişletmesi:** Web katmanından tetiklenebilecek `buyRemoveAds()`, `restorePurchases()` ve `isAdsRemoved()` metodları Javascript arayüzüne eklendi.
  - **Reklam Bypass ve Koordine Canlanma:** Premium kullanıcılarda geçiş reklamlarının atlanması ve rewarded continue (ödüllü canlanma) reklamlarında video oynatılmadan anında ödül verilmesi sağlandı.
  - **Görsel & Dil Güncellemeleri:** Mobil arayüzde 21 farklı dilde taç ikonlu "Remove Ads" butonu ve offline fallback senkronizasyonları tamamlandı.
  - `versionCode`: 59 → 60, `versionName`: v3.3.0 → v3.3.1.
  - AAB: `app/build/outputs/bundle/release/app-release.aab` derlendi ve imzalandi.

## Son Android Shell Notu (versionCode 57 / v3.2.2)
- **versionCode 57**: AdMob reklam altyapisi optimizasyon surumu — web payload degismedi (Mobile v3.2.2).
  - **Auto-Retry (Otomatik Yeniden Deneme):** `AdManager.kt` icinde reklam yukleme basarisiz oldugunda kademeli artan bekleme sureleriyle (15s, 30s, 60s, 120s, 300s) arka planda otomatik yeniden yukleme mekanizmasi eklendi. Hem Interstitial hem Rewarded reklamlar icin ayri retry sayaci ve zamanlayici kuruldu.
  - **Rewarded Ad Dogrulama Koprusu:** `onUserEarnedReward` dinleyicisi ile kullanicinin odulu gercekten hak edip etmedigi (`earnedReward: Boolean`) native SDK'dan yakalanarak `resumeGameAfterAd(callbackId, success)` araciligiyla WebView tarafina iletildi.
  - **`beforeReward` H5 Standart Uyumu:** `android_bridge_bootstrap.js` icinde `beforeReward` callback'i kayit altina alindi; odul tipi reklam isteginde no-op `showAdFn` ile tetiklenerek `rewardFlowAvailable = true` set ediliyor ve H5 Ads API standardi tam karsilaniyor.
  - **Semantik Temizlik:** `adViewed`/`adDismissed` callback'leri artik yalnizca `type === "reward"` olan reklam kayitlari icin tetikleniyor; interstitial reklamlarda yanlis callback cagrisi engellendi.
  - `versionCode`: 56 → 57, `versionName`: v3.2.2 (degismedi).
  - AAB: `app/build/outputs/bundle/release/app-release.aab` derlendi ve imzalandi.

## Son Android Shell Notu (v3.2.2)
- **v3.2.2**: Android bugfix ve web payload sürüm senkronizasyonu sürümü.
  - **Teaser Sessizlik Duzeltmesi:** `setupLoadingVideo()` icindeki `mp.setVolume(0f, 0f)` → `mp.setVolume(1f, 1f)` yapildi. Teaser video artik sesli caliyor.
  - **Arkaplan Audio Sizintisi Duzeltmesi:** `stopLoadingMediaPlayback()` sonuna `binding.loadingVideoView.setVideoURI(null)` eklendi. VideoView'in Android framework tarafindan `onResume()`'da otomatik resume edilmesi engellendi.
  - **onResume Yeniden Baslatma:** `onResume()` icine `loadingOverlay` gorунur durumdaysa `setupLoadingVideo()` cagrisi eklendi. Kullanici START'a basmadan arka plana atip geri dondugunde teaser duzgun sekilde yeniden basliyor.
  - `versionCode`: 55 → 56, `versionName`: v3.2.0 → v3.2.2.
  - AAB: `2PlayerSnake-v3.2.2-release.aab` derlendi ve imzalandi.

## Son Web Payload Notu (v3.3.0)
- Web oyun sürümü `v3.3.0` olarak güncellendi.
  - Oyun içi "Reklamları Kaldır" (Remove Ads) ve "Satın Alımları Geri Yükle" (Restore Purchases) butonları 21 dilde (İngilizce, Türkçe vb.) arayüze eklendi.
  - Native Javascript köprüsü üzerinden premium durumu dinleme ve kaydetme mekanizmaları kuruldu.
  - Çevrimdışı fallback `mobile_offline_fallback.html` dosyası v3.3.0 sürümüne yükseltilerek tüm premium arayüz butonları ve çevrimdışı önbellek senkronizasyon özellikleri eklendi.
- Mobil beta v3 referans dosyası: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.0.html`.
- PC beta v3 referans dosyası: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.3.0.html` (Sürüm senkronizasyonu yapıldı, AdSense H5 akışı korunmaktadır).

## Son Web Payload Notu (v3.2.3)
- Web oyun surumu `v3.2.3` olarak guncellendi.
  - Oyun sonu istatistiklerinde "Toplam Yenilen Yem" kaldırıldı ve yılan uzunluğuna odaklanıldı.
  - PC yerel modda "Tekrar Oyna" butonu tıklandığında oluşan sunucu bağlantısı yönlendirme hatası giderildi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.2.3.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.2.4.html`.
- Android cevrimdisi fallback `mobile_offline_fallback.html` v3.2.0 iceriginde kaldi (v3.2.3 online degisiklikleri offline fallback'i etkilemiyor).

## Son Web Payload Notu (v3.2.2)
- Web oyun surumu `v3.2.2` olarak guncellendi (kodlardaki v3.2.1 sürüm numaraları v3.2.2 ile senkronize edildi).
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.2.2.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.2.2.html`.
- Android cevrimdisi fallback `mobile_offline_fallback.html` v3.2.0 iceriginde kaldi (v3.2.1/v3.2.2 online degisiklikleri offline fallback'i etkilemiyor).

## Son Web Payload Notu (v3.2.1)
- Web oyun surumu `v3.2.1` olarak guncellendi; Android AAB yeniden derlenmedi (kucuk guncelleme).
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.2.1.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.2.1.html`.
- Android cevrimdisi fallback `mobile_offline_fallback.html` v3.2.0 iceriginde kaldi (v3.2.1 degisiklikleri online'a ozel; offline fallback etkilenmiyor).
- `versionCode` 55 / `versionName` `v3.2.0` korunuyor.
- Ana degisiklik: Mobil online `alert()` cagrilerinin tamami `showOnlineAlert()` sistemine tasindi; PC sadece surum numarasi guncellendi.
- Dogrulama: Mobile v3.2.1 inline JavaScript `node --check` ile dogrulandi; `alert(` arama sonucu 0.

## Son Web Payload Notu (v3.2.0)
- Son hazirlanan web oyun surumu `v3.2.0` olarak kayda alindi; bu surum imzali AAB olarak derlendi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.2.0.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.2.0.html`.
- Android cevrimdisi fallback dosyasi `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html`, Mobile v3.2.0 icerigiyle senkronize edildi.
- Android kaynaklari `versionCode` 55 ve `versionName` `v3.2.0` olacak sekilde guncellendi.
- `server.js` optimum satir sayisi yuvarlama gorusmesini (Math.round) destekleyecek sekilde guncellendi ve Render.com'a deploy edildi.
- Mobil/PC menulerinde AI zorluk bolumu hiz metinlerinden ayrildi: baslik `Zorluk/Difficulty`, secenekler `Kolay-Normal-Zor / Easy-Normal-Hard`; normal hiz secenekleri kendi metinlerini korur.
- Countdown banner icin ayri `countdown-banner` sinifi kullanildi; `BASLA!/START!` yazisinin mobilde saga kaymasi/kirilmasi engellendi.
- Mobil online oyun alaninda online'a ozel renkli/duvar gibi sinir kaldirildi; sadece gercek `SOLID` duvar modunda sinir cizilir.
- Mobil online grid render'i kare hucreye geri alindi: online modda `cellSize = Math.min(width / GRID_COLS, height / GRID_ROWS)` kullanilir, boylece yilanlar yatay/dikeyde farkli araliklarla gorunmez.
- Online icin istemcinin server'a bildirdigi `requestedRows` hesabi `Math.round(stageHeight / cellW)` ile yuvarlanir; kucuk ekranin sigan kare grid'i macin mantiksal satir sayisini belirler.
- `getCellCoords()` icindeki `xOffset/yOffset` ReferenceError hatasi giderildi; demo ve oyun yilanlarinin gorunmemesine neden olan render kirilmasi kapatildi.
- Android sistem splash'i minimal ve kirpilmayan `Theme.SplashScreen` tabanli launcher theme'e alindi; kullanilmayan `SplashActivity` launcher yapilmadi.
- Android loading/teaser `VideoView` icin lifecycle guard eklendi. Overlay aktif degilse video baslamaz; stop sirasinda listener'lar temizlenir ve media player mute edilir. Arkaplandan donuste teaser sesinin sizmasi engellendi.
- Dogrulama: Mobile v3.2.0 ve Android offline fallback inline JavaScript `node --check` ile dogrulandi; Android `./gradlew.bat assembleRelease` basariyla calisti.

## Son Web Payload Notu (v3.1.9)
- Son web oyun surumu `v3.1.9` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.9.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.9.html`.
- "Çevrimiçi Oyna" seçeneği tıklandığında sunucu uyanıklığı arka planda 2 saniyelik zaman aşımı ile sağlık kontrolü (health check) yapılarak test edildi.
- Sunucu zaten aktifse geçiş reklamı tamamen atlanıp doğrudan lobiye geçiş sağlandı; sunucu uykudaysa uyanma süresi (30-50 sn) geçiş reklamı ile maskelendi.
- PC istemcisine de `checkServerAwake(timeoutMs)` fonksiyonu ve `startOnlineServerConnection()` akıllı bypass mantığı entegre edildi.
- Android platformu için `versionCode` 54 olarak korundu ve `versionName` "v3.1.9" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.8)
- Son web oyun surumu `v3.1.8` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.8.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.8.html`.
- Mobil dikey ekranlarda yılanın ve yemlerin %25 daha büyük görünmesini sağlamak için varsayılan grid sütun sayısı 30'dan 24'e, satır sayısı 45'ten 36'ya düşürüldü.
- Çevrimdışı yerel oyun hızları daha belirgin ve kontrollü olması için EASY: 0.75, NORMAL: 0.85, FAST: 1.05 olarak güncellendi.
- Çevrimiçi interpolasyon hız çarpanı, sunucu hızıyla (0.85x) tam senkronize olacak şekilde düşürüldü.
- Android platformu için `versionCode` 54 olarak korundu ve `versionName` "v3.1.8" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.7)
- Son web oyun surumu `v3.1.7` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.7.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.7.html`.
- Android WebView performansını artırmak için yılan glow ve galibiyet metni gölge (shadowBlur) efektleri WebView içinde devre dışı bırakıldı.
- `data-theme` değiştiğinde önbelleğe alınmış ızgara ve kenarlık kanvasının anında güncellenmesini sağlayan tema takibi eklendi.
- Çevrimiçi moddaki kenarlık strokeStyle CSS değişkeni çözümleme hatası giderildi.
- Android platformu için `versionCode` 54'e yükseltildi ve `versionName` "v3.1.7" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.6)
- Son web oyun surumu `v3.1.6` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.6.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.6.html`.
- Android WebView kasma ve donma sorunları için büyük render performans optimizasyonları yapıldı:
  - **Donanım Katmanı Kaldırma:** `MainActivity.kt` içinde `setLayerType(View.LAYER_TYPE_NONE, null)` uygulanarak Adreno GPU bellek kopyalama/çift tamponlama darboğazları çözüldü.
  - **DPR Sınırlandırması (1.35x):** WebView üzerinde cihaz piksel oranı en fazla 1.35x ile sınırlandırılarak piksel doldurma hızı yükü azaltıldı.
  - **Önbellekli Izgara (Offscreen Canvas):** `drawGrid()` çizgileri dinamik olarak bir kez ekran dışı canvas'a çizilip bellekte saklanarak render maliyeti sıfırlandı.
  - **Titreşim Sınırlandırıcı (Throttle):** 20 ms ve altındaki titreşimlerin ana iş parçacığını engellemesini önlemek için 60 ms throttle eklendi.
  - **Güvenli Tarama (Safe Browsing) Kapatılması:** WebView ayarlarında `safeBrowsingEnabled = false` yapılandırılarak arka plan kontrol gecikmeleri kaldırıldı.
- Android platformu için `versionCode` 53 korundu ve `versionName` "v3.1.6" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.5)
- Son web oyun surumu `v3.1.5` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.5.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.5.html`.
- Çok oyunculu modda tekrar oynama (rematch) akışı senkronize edildi:
  - **Niyet Bildirimi (Rematch Intent):** Oyuncu "Tekrar Oyna" butonuna bastığında hemen sunucuya niyetini gönderir ve diğer oyuncu, bu oyuncunun yılan renginde ve özel neon efektiyle kalın "RAKİP TEKRAR OYNAMAK İSTİYOR" bildirimi alır (reklamın bitmesi beklenmez).
  - **İki Aşamalı Baraj (Rematch Ready):** İki oyuncunun da geçiş reklamı bittiğinde hazır durumları sunucuya gönderilir ve oyun ancak iki taraf da hazır olunca başlar.
  - **Reklam Bekleme Ekranı:** Reklamı erken biten oyuncuya dönen bir gösterge ile "DİĞER OYUNCUNUN REKLAMI BİTİRMESİ BEKLENİYOR..." ekranı sunularak eş zamanlı lobi akışı sağlanır.
- Android platformu için `versionCode` 53 korundu ve `versionName` "v3.1.5" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.4)
- Son web oyun surumu `v3.1.4` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.4.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.4.html`.
- PC istemcisinde sunucu uyandırma zamanlayıcı sızıntısı giderildi (iptal ve temizlik adımlarında timer sıfırlanıyor). PC socket bağlantı hatalarında anlık abort engellenerek 3 kez otomatik yeniden deneme sağlandı ve yinelenen soket dinleyicileri temizlendi.
- Çok oyunculu sunucu (`server.js`) ve bağlantı protokolünde büyük iyileştirmeler yapıldı:
  - **Secure Reconnection:** Bağlantı ele geçirmeyi (session hijacking) önlemek için geçici oturum anahtarları (`sessionToken`) entegre edildi. PC ve Mobil istemcileri bu anahtarı hafızada tutup yeniden bağlantıda doğrulamaktadır.
  - **Reconnect Countdown:** Bağlantısı kopup dönen oyuncular için doğrudan oyuna girmek yerine 3 saniyelik bir geri sayım (`autoResumeRoom` aracılığıyla) tetiklenmesi sağlandı.
  - **Macera Modu Portalları:** Portal geçiş adım sayacı sunucu tik hızı yerine yılanın kendi hareket hızına bağlandı, portal içinde kalma bug'ı çözüldü.
  - **Hükmen Yenilgi & Sıralar:** Çift sıraya girme bug'ı engellendi, hükmen yenilgide rakibin skoru 6 olması sınırı aşma hatası düzeltildi.
- Android platformu için `versionCode` 53 korundu ve `versionName` "v3.1.4" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.3)
- Son web oyun surumu `v3.1.3` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.3.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.3.html`.
- Raund galibiyetlerinde (final olmayan galibiyetlerde) galibiyet metninin (örn. "P1" veya "AI") harf ve rakamlarının farklı renklerde görünmesi hatası, segmentlerin kazanan yılan nesnesinde toplanmasıyla çözüldü. Harf ve rakamlar artık tek renk olarak render edilir.
- Android platformu için `versionCode` 53 korundu ve `versionName` "v3.1.3" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.2)
- Son web oyun surumu `v3.1.2` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.2.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.2.html`.
- Çevrimiçi oyun modlarında sunucu kaynaklı hata mesajları için hem Mobil hem de PC tarafında yerelleştirilmiş dil eşlemeleri entegre edilerek dil kaçağı giderildi.
- PC istemcisine soket bağlantısı kesildiğinde otomatik yeniden bağlantı denemeleri (`reconnectOnlineGame`) entegre edildi ve soket koptuğunda anında oyundan çıkılması engellendi.
- PC tarafında soket olay yöneticileri (`setupSocketEvents`) genel düzeye taşınarak arkadaş odalarında da ağ kopmalarının algılanması sağlandı.
- Android platformu için `versionCode` 53 korundu ve `versionName` "v3.1.2" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.1)
- Son web oyun surumu `v3.1.1` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.1.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.1.html`.
- Çevrimiçi oyun arayüzünde rakip oyuncu ayrıldığında yaşanan kilitlenme ve ekran donma hatası temizlik kodları eklenerek giderildi.
- Socket.io bağlantı kopmaları ve yeniden bağlanma başarısızlıkları için hata sınırları ve online menüye otomatik yönlendirme mekanizmaları entegre edildi.
- Lobi veya oyun içi geri sayım bekleme süreçlerinde takılmayı engellemek adına istemci tarafı güvenlik zaman aşımı zamanlayıcısı eklendi.
- Android platformu için `versionCode` 53 korundu ve `versionName` "v3.1.1" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.09)
- Son web oyun surumu `v3.1.09` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.09.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.09.html`.
- Çevrimiçi rastgele eşleşme ("Hızlı Rekabetçi") modunun hızı optimize edildi. Kontrol konforu ve dengesi için hız çarpanı 1.00x (Normal) seviyesine düşürüldü.
- Android platformu için `versionCode` 53'e çekildi ve `versionName` "v3.1.09" olarak güncellendi.
- Çevrimdışı fallback dosyası `mobile_offline_fallback.html` bu yeni mobil HTML sürümüyle eşitlendi.

## Son Web Payload Notu (v3.1.08)
- Son web oyun surumu `v3.1.08` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.08.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.08.html`.
- Android ve PC için yeni platform köprüleri ve geçiş reklamı (interstitial) mantığı eklendi:
  - Mobil sürümde pause menüsünden ana menüye dönülürken offline modda %30 ihtimalle geçiş reklamı tetikleme mantığı entegre edildi.
  - PC sürümüne Android Play Store yönlendirme butonu eklendi (hover durumunda yeşil Android gradyanlı).
- Android shell yayinina cikmadan once `app/src/main/assets/offline/mobile_offline_fallback.html` dosyasi bu v3.1.08 mobil HTML ile eslenmelidir (bu esleme yapildi).

## Son Web Payload Notu (v3.1.07)
- Son web oyun surumu `v3.1.07` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.07.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.07.html`.
- Çevrimiçi oyun arayüzü (ONLINE_STRINGS) için yeni dil çevirileri (Hollandaca/nl, Yunanca/el, Çekçe/cs) eklendi ve PC sürümü senkronize edildi.

## Son Web Payload Notu (v3.1.06)
- Son web oyun surumu `v3.1.06` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.06.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.06.html`.
- Android platformuna özel entegre Başarımlar (Achievements) arayüzü ve motoru eklendi. Ana menüye 🏅 emojili Başarımlar butonu yerleştirildi ve 15 adet başarımın kazanılabilmesi hem çevrimdışı hem de çevrimiçi modlar için etkinleştirildi.

## Son Web Payload Notu (v3.0.08)
- Son web oyun surumu `v3.0.08` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.08.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.0.08.html`.
- Android shell yayinina cikmadan once `app/src/main/assets/offline/mobile_offline_fallback.html` dosyasi bu v3.0.08 mobil HTML ile eslenmelidir (bu esleme yapildi).
- **Mobil Grid Ölçeklendirme Optimizasyonu (30x45):** Mobil sürümde oyun tahtası boyutu `36 × 54`'ten `30 × 45`'e düşürülerek yılan segmentleri ve yemler büyütüldü. Kazanma yazısı ölçeklendirmesi ve başlangıç spawn offsetleri bu yeni grid boyutuna göre dinamikleştirildi.
- **Sürüm Senkronizasyonu ve Dosya Güncellemesi:** Mobil ve PC istemci dosyaları v3.0.08 sürümüne güncellendi. v3.0.07 ile sunulan tüm çevrimiçi yerelleştirme (21 dil), oyun içi diyalog onay pencereleri ve eşleşme iyileştirmeleri korunarak yeni sürüm dosyaları oluşturuldu ve çevrimdışı fallback dosyası v3.0.08 ile senkronize edildi.

## Son Web Payload Notu (v3.0.07)
- Son web oyun surumu `v3.0.07` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.07.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.0.07.html`.
- Android shell yayinina cikmadan once `app/src/main/assets/offline/mobile_offline_fallback.html` dosyasi bu v3.0.07 mobil HTML ile eslenmelidir (bu esleme yapildi).
- **Çevrimiçi Dil Desteği Geri Geldi:** Çevrimiçi oyun akışındaki tüm bağlantı, lobi, oda oluşturma/katılma, duraklatma ve hata bildirim pencereleri 21 dilde yerelleştirildi, hardcoded Türkçe metinler `t()` fonksiyonuna bağlandı.
- **Özel Arayüz Onay Pencereleri:** Tarayıcının varsayılan çirkin `confirm()` uyarı kutusu yerine, oyun içi modern cam tasarımlı (glassmorphism) onay pencereleri entegre edildi.
- **Eşleşme Ekranı Düzeni:** Eşleştirme ekranındaki "OYUNCU ARANIYOR" başlığı kaldırıldı ve arayüzün ortalanarak sadeleşmesi sağlandı.
- **Daha Uzun Eşleşme Süresi:** Çevrimiçi rakip arama zaman aşımı süresi 60 saniyeden 180 saniyeye çıkarıldı.

## Son Web Payload Notu (v3.00.3)
- Son web oyun surumu `v3.00.3` olarak kayda alindi.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.00.3.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.00.3.html`.
- Android shell yayinina cikmadan once `app/src/main/assets/offline/mobile_offline_fallback.html` dosyasi bu v3.0.03 mobil HTML ile eslenmelidir.
- **P2 HUD Renk & Tema Senkronizasyonu:** Çevrimiçi (online) modlarda 2. Oyuncu (P2) olarak oynandığında local alt kontrol panelinin P1 renginde (pembe) kalması düzeltildi. Panel artık dinamik olarak P2'nin seçili rengini ve P2'nin adını/skorunu/noktalarını gösterir.
- **Konfeti Blur Düzeltmesi:** Çevrimiçi/yerel maçlarda oyun duraklatılmışken (paused) raunt kazanıldığında, kazanma ekranı ve konfetilerin üzerinde kalan blur (bulanıklık) filtresi kaldırıldı.

## Son Web Payload Notu (v3.00.2)
- Son web oyun surumu `v3.00.2` olarak kayda alinmisti.
- Mobil beta v3 referans dosyasi: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.00.2.html`.
- PC beta v3 referans dosyasi: `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.00.2.html`.
- Online mac sonu `Tekrar Oyna` akisi sunucu kontrollu rematch sistemine tasinmisti.
- Online server yuku azaltildi: server tick araligi `25ms`, world delta payload (`foods`/`barriers`/`portals` sadece degisince) ve `[perf]` loglari eklendi. Android shell native kod degisikligi gerektirmez; canli web payload ve server deploy'u yeterlidir.

## Son Web Payload Notu (v2.99.5)
- Tüm çevrimiçi (online) oyun modları (Normal, Macera, Self Area 51) yerel (offline) oyun kuralları ve mekanikleriyle birebir senkronize edildi.
- Çevrimiçi maçlarda her oyuncuya raunt başına 1 adet 15 saniyelik manuel duraklatma (Manual Pause) hakkı, duraklatma esnasında bulanıklık efekti ve 3 saniyelik geri sayım eklendi.
- "ODA KODU GİR" ekranı ile gizli kodlarla özel oda kurarak arkadaşlarla çevrimiçi eşleşme sistemi eklendi.
- Sürüm numarası `v2.99.5` (Code 51) olarak güncellenip yeni signed AAB derlendi.
- Çevrimdışı fallback dosyası v2.99.5 HTML koduyla eşitlendi.

## Offline Fallback Kurali (v3.1.08 / code 61)
- Android shell online iken canli URL'yi acar: `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`
- Cihaz offline ise shell, uygulama icindeki fallback dosyasini acar:
- `app/src/main/assets/offline/mobile_offline_fallback.html`
- Bu fallback dosya, `2 Player Snake Mobile v3.1.08` ile senkron kopya olmalidir.
- **Zorunlu surec:** Her yeni mobil web surumunde (`vX.Y.Z`) Android yayinina cikmadan once bu fallback dosya da ayni yeni surumle degistirilmelidir.
- Aksi durumda oyuncu internetsiz acilista eski oyunu gorur.

## Son Web Payload Notu (v2.96.2)
- Android shell degismedi; bu tur yeni native AAB gerektirmez.
- Shell'in actigi mobil HTML payload'unda geri tusu ayirici cizgisi tum menu ekranlarina yayildi.
- Mobil ana menuden `Kurallar` butonu kaldirildi; Android kullanicisi da bu sade menu akisini gorur.

## Kurumsal Marka Renkleri

Bu iki renk oyunun tÃƒÂ¼m platformlarÃ„Â±ndaki (web, mobil, Android) kimliÃ„Å¸ini temsil eder. Splash screen, ikonlar, native UI ÃƒÂ¶Ã„Å¸eleri tasarlanÃ„Â±rken bu renklerden sapÃ„Â±lmamalÃ„Â±dÃ„Â±r.

| Renk | Hex | KullanÃ„Â±m |
|---|---|---|
| **Neon Pembe** | `#ff4fbf` | P1 rengi, logo aksan, buton hover glow, kazanan efektleri, Romi imzasÃ„Â± rengi |
| **Neon Turkuaz** | `#35e6e6` | P2 / AI rengi, logo aksan, progress bar baÃ…Å¸langÃ„Â±cÃ„Â±, Toy imzasÃ„Â± rengi |

> Splash screen progress bar turkuazdan pembeye gradient yapar (`#35e6e6` Ã¢â€ â€™ `#ff4fbf`).  
> Logo metninde "Romi" pembe, "Toy" turkuaz ile yazÃ„Â±lÃ„Â±r.

## Tarihce
- **12 (v2.84.0)**: TestersCommunity kurulumu, beta yayini.
- **13 (v2.85.0)**: SÃƒÂ¼rÃƒÂ¼m eÃ…Å¸itlemesi ve kapalÃ„Â± test Alpha SÃƒÂ¼rÃƒÂ¼mÃƒÂ¼ (Local).
- **14 (v2.86.0)**: Performans iyileÃ…Å¸tirmeleri (Hardware acceleration zorlamasÃ„Â±, Chrome standartlarÃ„Â±), sinematik intro geÃƒÂ§iÃ…Å¸i (Splash screen silinip anÃ„Â±nda baÃ…Å¸lama), Adaptive icon dÃƒÂ¼zeltmesi (inset = 24dp) and Orbitron fontunun START kutusuna native entegre edilmesi.
- **15 (v2.88.0)**: Lokalizasyon ve Karakter OnarÃ„Â±mÃ„Â±. "Ad" deÃ„Å¸iÃ…Å¸ikliÃ„Å¸i ve global encoding tamiri sonrasÃ„Â± tÃƒÂ¼m platformlar v2.88'de senkronize edildi.
- **16 (v2.88.1)**: Adaptive icon inset revizesi (8dp -> 12dp) ve logo ÃƒÂ¶lÃƒÂ§eklendirme iyileÃ…Å¸tirmesi.
- **17 (v2.88.2)**: Resilience & Smart Caching. "No internet" hatalarÃ„Â±na karÃ…Å¸Ã„Â± direnÃƒÂ§li yÃƒÂ¼kleme mantÃ„Â±Ã„Å¸Ã„Â±, offline cache desteÃ„Å¸i ve GoDaddy/WordPress iÃƒÂ§in timestamp tabanlÃ„Â± cache-busting entegrasyonu.
- **18 (v2.88.3)**: Yeni Modern Logo Entegrasyonu. Uygulama simgesi ve Splash screen logosu favicon dizinindeki yeni tasarÃ„Â±mla (512x512) tamamen yenilendi.
- **19 (v2.88.4)**: 21 Dilde YerelleÃ…Å¸tirme. Shell ÃƒÂ¼zerindeki yÃƒÂ¼kleme metinleri (Title/Subtitle) 21 farklÃ„Â± dilde yerelleÃ…Å¸tirildi. Cihaz dili desteklenmeyen dillerde otomatik olarak Ã„Â°ngilizce'ye dÃƒÂ¶ner.
- **20 (v2.88.5)**: Ã„Â°kon Ã„Â°nce Ayar & Fragman Ses dÃƒÂ¼zeltmesi. Adaptive icon inset 12dpÃ¢â€ â€™14dp (SNAKE yazÃ„Â±sÃ„Â± kesilmesi giderildi). START'a basÃ„Â±ldÃ„Â±Ã„Å¸Ã„Â±nda intro video sesinin arka planda devam etme hatasÃ„Â± dÃƒÂ¼zeltildi.
- **21 (v2.89.0)**: Boost Modu Ãƒâ€¡arpÃ„Â±Ã…Å¸ma MantÃ„Â±Ã„Å¸Ã„Â± & Ã„Â°kon KÃƒÂ¼ÃƒÂ§ÃƒÂ¼ltme. Yakut yemi (boost) etkisindeyken rakibin kafasÃ„Â±ndan geÃƒÂ§ebilme ÃƒÂ¶zelliÃ„Å¸i eklendi (ÃƒÂ¶lÃƒÂ¼m engellendi). Uygulama ikonu gÃƒÂ¼venli alan (inset) 14dp'den 15dp'ye ÃƒÂ§Ã„Â±karÃ„Â±larak logo daha da kÃƒÂ¼ÃƒÂ§ÃƒÂ¼ltÃƒÂ¼ldÃƒÂ¼. PC ve Mobil SÃƒÂ¼rÃƒÂ¼mleri v2.89'da senkronize edildi.
- **22 (v2.90.0)**: Google Play Oyun Hizmetleri (BaÃ…Å¸arÃ„Â±mlar/Achievements) entegrasyonu.
- **23 (v2.90.1)**: PGS Sidekick entegrasyonu ve SÃƒÂ¼rÃƒÂ¼m kodu ÃƒÂ§akÃ„Â±Ã…Å¸ma onarÃ„Â±mÃ„Â±.
- **24 (v2.90.2)**: Direct File URL geÃƒÂ§iÃ…Å¸i. Uygulama artÃ„Â±k `/mobile` yÃƒÂ¶nlendirmesi yerine doÃ„Å¸rudan `wp-content/uploads/game-mobile/index.html` dosyasÃ„Â±nÃ„Â± ÃƒÂ§ekiyor. Bu sayede sunucu tarafÃ„Â±ndaki gelecek yÃƒÂ¶nlendirme planlarÃ„Â± (Android web -> Google Play) ile uygulamanÃ„Â±n ÃƒÂ§akÃ„Â±Ã…Å¸masÃ„Â± ÃƒÂ¶nlenmiÃ…Å¸ oldu.
- **26 (v2.90.3)**: Android Uygulama KÃ„Â±sayollarÃ„Â± (App Shortcuts) sonrasÃ„Â±nda tÃƒÂ¼m platformlarÃ„Â±n v2.91 SÃƒÂ¼rÃƒÂ¼mÃƒÂ¼nde senkronize edilmesi ve Play Store SÃƒÂ¼rÃƒÂ¼m kodunun 26'ya ÃƒÂ§Ã„Â±karÃ„Â±lmasÃ„Â±. Android altyapÃ„Â± SÃƒÂ¼rÃƒÂ¼mÃƒÂ¼ 2.90.3 olarak mÃƒÂ¼hÃƒÂ¼rlendi.
- **27 (v2.92.0)**: Google AdSense H5 Games Ads (Beta) uyumluluk gÃƒÂ¼ncellemesi. Zorunlu `preroll` reklam ÃƒÂ§aÃ„Å¸rÃ„Â±sÃ„Â± ve `data-ad-frequency-hint="30s"` parametresi tÃƒÂ¼m platformlara (Mobil + PC) eklendi. TÃƒÂ¼m platformlar v2.92.0'da senkronize edildi.
- **28 (v2.93.0)**: Branded Loading Splash Screen. Oyunun aÃƒÂ§Ã„Â±lÃ„Â±Ã…Å¸Ã„Â±ndaki siyah ekran (blank screen) sorununu ÃƒÂ§ÃƒÂ¶zen, logolu ve turkuaz-pembe gradient dolum ÃƒÂ§ubuÃ„Å¸una sahip yeni bir aÃƒÂ§Ã„Â±lÃ„Â±Ã…Å¸ ekranÃ„Â± eklendi. Loading bar, AdSense reklamÃ„Â± yÃƒÂ¼klenene kadar %85'e kadar dolar, reklam bitince %100'e tamamlanÃ„Â±p fade-out ile kapanÃ„Â±r. 21 dil desteÃ„Å¸i ve 8 saniyelik timeout sistemi entegre edildi.
- **29 (v2.93.6)**: Android App Shortcuts Yeniden TasarÃ„Â±mÃ„Â±. `checkShortcuts()` grid hatasÃ„Â± dÃƒÂ¼zeltildi (hÃƒÂ¼creler kare deÃ„Å¸ildi Ã¢â€ â€™ yÃ„Â±lan X/Y ekseninde farklÃ„Â± mesafe ilerliyor). Eski 2 kÃ„Â±sayol (`1p_fast`, `2p_fast`) kaldÃ„Â±rÃ„Â±lÃ„Â±p 3 yeni kÃ„Â±sayol tanÃ„Â±mlandÃ„Â±: `normal_1p` (Normal 1P solo), `fc_2p` (HÃ„Â±zlÃ„Â± RekabetÃƒÂ§i 2P), `fc_1p_ai` (HÃ„Â±zlÃ„Â± RekabetÃƒÂ§i 1P vs AI). `shortcuts.xml` ve 21 dil `strings.xml` gÃƒÂ¼ncellendi. TÃƒÂ¼m kÃ„Â±sayollarda varsayÃ„Â±lan: duvar yok, orta hÃ„Â±z. Ã„Â°mzalÃ„Â± AAB: `app/build/outputs/bundle/release/app-release.aab`.
- **31 (v2.94.6)**: Splash Screen ve Lokalizasyon OnarÃ„Â±mÃ„Â±.
    - **Splash Screen:** YÃƒÂ¼kleme ekranÃ„Â± 3 saniyelik, cubic ease-in animasyonlu yeni bir mantÃ„Â±Ã„Å¸a geÃƒÂ§irildi.
    - **Lokalizasyon:** 18 dildeki `strings.xml` dosyalarÃ„Â±ndaki UTF-8 kodlama hatalarÃ„Â± (TÃƒÂ¼rkÃƒÂ§e karakter bozulmalarÃ„Â± vb.) tamamen giderildi.
    - **Shortcut Fix:** Mobil HTML katmanÃ„Â±ndaki kÃ„Â±sayol parametre silme hatasÃ„Â± giderilerek Android kÃ„Â±sayollarÃ„Â±nÃ„Â±n kalÃ„Â±cÃ„Â±lÃ„Â±Ã„Å¸Ã„Â± saÃ„Å¸landÃ„Â±.
    - **Build:** `versionCode 31` ve `versionName 2.94.6` ile AAB mÃƒÂ¼hÃƒÂ¼rlendi.
- **34 (v2.95.7)**: Native Vibration Fix. Samsung A51 ve diger bazi Android cihazlarda WebView kaynakli calismayan titreÃ…Å¸im sorunu, `window.Android.triggerVibration` yerel kÃƒÂ¶prÃƒÂ¼sÃƒÂ¼ ÃƒÂ¼zerinden tamamen giderildi. `hapticVibrate` fonksiyonu artik ÃƒÂ¶ncelikle native kÃƒÂ¶prÃƒÂ¼yÃƒÂ¼ dener. Release notes ve maÃƒÂ°aza metinleri guncellendi.
- **35 (v2.95.8)**: Android 12+ System Splash Screen uyumlulugu saglandi. `androidx.core:core-splashscreen` entegre edilerek `SplashActivity` oncesi olusan "siyah ekran icinde yuvarlak ikon" hatasi giderildi. Arka plansiz yeni WEBP logo ve `surface_dark` arka plani kullanilarak sistem ekranindan WebView ekranina kusursuz (seamless) gecis yapilandirildi. Ek olarak web tarafli AdSense cooldown degerleri optimize edildi.
- **35 (v2.95.9)**: Self Area 51 modunda 1 Oyuncu (1P) secildiginde otomatik olarak AI Snake'in aktif edilmesi saglandi ve aradaki AI Snake acilis secimi (Evet/Hayir) menusu kaldirildi. Bu sayede bu moda ozel akis hizlandirildi.
- **36 (v2.96.0)**: Self Area 51 dengeleri iyilestirildi. Yesil yem +1/-1 etkisine ve 15s relocation suresine cekildi. PC'de UI bar ve sayilar buyutuldu, baslangic pozisyonlari simetrik hale getirildi. Kazanma animasyonu ve raunt gecislerindeki matris bozulma hatalari giderildi.Surum tÃƒÂ¼m platformlarda esitlendi.
- **37 (v2.97.5)**: Web payload guncellemesi. KÃ„Â±rmÃ„Â±zÃ„Â± yem (heart/ruby) kaynaklÃ„Â± render bug'Ã„Â± ve Beast Mode performans optimizasyonlarÃ„Â± yapÃ„Â±ldÃ„Â±. Native shell kodunda deÃ„Å¸iÃ…Å¸iklik gerekmedi.
- **38 (v2.98.5)**: Rate Us ÃƒÂ¶zelliÃ„Å¸i. `GameJavascriptBridge`'e `requestReview()` metodu, `MainActivity`'e Google Play In-App Review API entegrasyonu eklendi. `play:review-ktx:2.0.2` baÃ„Å¸Ã„Â±mlÃ„Â±lÃ„Â±Ã„Å¸Ã„Â± eklendi. Web tarafÃ„Â±nda ana menÃƒÂ¼ye Android'e ÃƒÂ¶zel "Ã¢Â­  Bize Puan Ver!" butonu eklendi (21 dil). Yeni AAB gereklidir.
- **50 (v2.99.4)**: Ã‡evrimiÃ§i mod senkronizasyonu ve hareket akÄ±cÄ±lÄ±ÄŸÄ± (interpolation) iyileÅŸtirmesi. Soket Ã¼zerinden yeni tur baÅŸlangÄ±cÄ±ndaki yanÄ±p sÃ¶nme (blinking) animasyon hatasÄ± giderildi. Ã‡evrimdÄ±ÅŸÄ± fallback dosyasÄ± v2.99.4 sÃ¼rÃ¼mÃ¼ne eÅŸitlendi. `Release_Notes.md` gÃ¼ncellendi ve yeni signed AAB derlendi.
- **51 (v2.99.5)**: Ã‡evrimiÃ§i modlarÄ±n yerel modlarla tam senkronizasyonu (Normal modda +2 boÄŸum bÃ¼yÃ¼me ve kÄ±saltma iptali, Macera modunda engeller ve portallar, Area 51 modunda yarÄ± alan bÃ¶lÃ¼nmesi, yeÅŸil elmaslar, 51 boÄŸum kazanma ÅŸartÄ±). Manuel duraklatma (Pause) ve Ã¶zel oda (Room Code) sistemi eklendi. `mobile_offline_fallback.html` ve `Release_Notes.md` gÃ¼ncellendi. Yeni signed AAB derlendi.
- **52 (v3.00.2)**: Android 15 Edge-to-Edge uyumluluk gÃ¼ncellemesi yapÄ±ldÄ±. `MainActivity`, `SplashActivity` ve `SettingsActivity` sÄ±nÄ±flarÄ±na `enableEdgeToEdge()` entegre edildi. SÃ¼rÃ¼m numaralarÄ± HTML ve dokÃ¼manlarda gÃ¼ncellendi, `mobile_offline_fallback.html` senkronize edildi ve yeni signed AAB derlendi.
- **54 (v3.1.9)**: "Çevrimiçi Oyna" seçeneğinde arka planda hızlı 2 saniyelik sunucu uyanıklık testi (health check) eklendi. Sunucu aktifse geçiş reklamı (interstitial) bypass edilerek doğrudan lobiye geçiş sağlandı; uykudaysa uyanma süresi reklam ile maskelendi. versionName "v3.1.9" yapıldı, versionCode 54 olarak korundu.
- **54 (v3.1.8)**: Mobil dikey ekranlarda yılanın ve yemlerin %25 daha büyük görünmesi için varsayılan grid sütun sayısı 24'e, satır sayısı 36'ya düşürüldü. Çevrimdışı yerel oyun hızları (EASY: 0.75, NORMAL: 0.85, FAST: 1.05) olarak yavaşlatıldı ve çevrimiçi matchmaking hızı sunucuyla uyumlu şekilde 0.85x yapıldı. versionName "v3.1.8" yapıldı, versionCode 54 olarak korundu.
- **54 (v3.1.7)**: Android WebView performansını artırmak için yılan glow ve galibiyet metni gölge efektleri WebView içinde devre dışı bırakıldı. Tema değiştiğinde önbelleğe alınmış ızgara kanvasının güncellenmeme hatası ve çevrimiçi mod kenarlık strokeStyle CSS değişkeni çözümleme hatası giderildi. Tüm platformlar v3.1.7'ye yükseltildi, versionCode 54 yapıldı.
- **53 (v3.1.6)**: Android WebView render performans optimizasyonları yapıldı (donanım katmanı önbelleği devre dışı bırakıldı, Safe Browsing kapatıldı, DPR 1.35x ile sınırlandırıldı, ızgara çizimi offscreen canvas ile önbelleklendi ve titreşim filtreleme eklendi). Tüm platformlar v3.1.6'ya yükseltildi.
- **53 (v3.1.5)**: Çok oyunculu modda tekrar oynama (rematch) akışı senkronize edildi: oyuncu "Tekrar Oyna" butonuna bastığında hemen gönderilen rematchIntent ile diğer oyuncuda yılan rengine göre parlayan notice gösterilmesi, geçiş reklamı bittiğinde rematchReady gönderimi ile iki oyuncunun da ad bitimi beklenip oyunun başlatılması, reklamı erken biten oyuncuya waiting ekranı ve spinner gösterilmesi sağlandı. `build.gradle.kts` içindeki `versionCode` 53 korunarak `versionName` "v3.1.5" olarak güncellendi. Çevrimdışı fallback dosyası v3.1.5 sürümüyle eşitlendi.
- **53 (v3.1.4)**: PC istemcisinde sunucu uyandırma zamanlayıcı sızıntısı giderildi (iptal ve temizlik adımlarında timer sıfırlanıyor). PC socket bağlantı hatalarında anlık abort engellenerek 3 kez otomatik yeniden deneme sağlandı ve yinelenen soket dinleyicileri temizlendi. `build.gradle.kts` içindeki `versionCode` 53 korunarak `versionName` "v3.1.4" olarak güncellendi. Çevrimdışı fallback dosyası v3.1.4 sürümüyle eşitlendi.
- **53 (v3.1.3)**: Raund galibiyetlerinde (final olmayan galibiyetlerde) galibiyet metninin (örn. "P1" veya "AI") harf ve rakamlarının farklı renklerde görünmesi hatası giderildi. Harf ve rakam segmentleri kazanan yılanın segmentlerine atanarak tek renk olarak birleştirildi. `build.gradle.kts` içindeki `versionCode` 53 korunarak `versionName` "v3.1.3" olarak güncellendi. Çevrimdışı fallback dosyası v3.1.3 sürümüyle eşitlendi.
- **53 (v3.1.2)**: Çevrimiçi oyun modlarında sunucu kaynaklı hata mesajları için hem Mobil hem de PC tarafında yerelleştirilmiş dil eşlemeleri entegre edilerek dil kaçağı giderildi. PC istemcisine soket bağlantısı kesildiğinde otomatik yeniden bağlantı denemeleri (`reconnectOnlineGame`) entegre edildi ve soket koptuğunda anında oyundan çıkılması engellendi. PC tarafında soket olay yöneticileri (`setupSocketEvents`) genel düzeye taşınarak arkadaş odalarında da ağ kopmalarının algılanması sağlandı. `build.gradle.kts` içindeki `versionCode` 53 korunarak `versionName` "v3.1.2" olarak güncellendi. Çevrimdışı fallback dosyası v3.1.2 sürümüyle eşitlendi.
- **53 (v3.1.1)**: Çevrimiçi oyun arayüzündeki kilitlenme ve ekran donma sorunları giderildi. Rakip ayrıldığında arayüzün temizlenmesi sağlandı. Socket.io bağlantı kopmalarına karşı hata yakalama ve otomatik yönlendirme eklendi. Lobi ve aktif oyundaki takılmaları gidermek için 3 saniyelik istemci tarafı güvenlik zaman aşımı zamanlayıcısı entegre edildi. `build.gradle.kts` içindeki `versionCode` 53 korunarak `versionName` "v3.1.1" olarak güncellendi. Çevrimdışı fallback dosyası v3.1.1 sürümüyle eşitlendi.
- **53 (v3.1.09)**: Çevrimiçi rastgele eşleşme ("Hızlı Rekabetçi") modunda hız çarpanı 1.00x (Normal) seviyesine çekilerek kontrol konforu artırıldı. Android `versionCode` 53, `versionName` "v3.1.09" olarak yapılandırıldı. Çevrimdışı fallback dosyası güncellendi.
- **61 (v3.1.08)**: Android ve PC için yeni platform köprüleri ve geçiş reklamı (interstitial) mantığı eklendi. Mobil sürümde pause menüsünden ana menüye dönülürken offline modda %30 ihtimalle geçiş reklamı gösterilme mantığı eklendi. PC sürümüne ana menüye "Android'de Oyna" butonu eklenerek Play Store bağlantısı entegre edildi ve hover durumunda yeşil Android gradyanı uygulandı. `build.gradle.kts` dosyası `versionCode` 61, `versionName` "v3.1.08" olarak yükseltildi.
- **60 (v3.1.07)**: Çevrimiçi oyun arayüzü (ONLINE_STRINGS) için yeni dil çevirileri (Hollandaca/nl, Yunanca/el, Çekçe/cs) eklendi ve PC sürümü senkronize edildi. `build.gradle.kts` dosyası `versionCode` 60, `versionName` "v3.1.07" olarak yükseltildi.
- **59 (v3.1.06)**: Android platformuna özel entegre Başarımlar (Achievements) arayüzü ve motoru eklendi. Ana menüye 🏅 emojili Başarımlar butonu yerleştirildi ve 15 adet başarımın kazanılabilmesi hem çevrimdışı hem de çevrimiçi modlar için etkinleştirildi. `build.gradle.kts` dosyası `versionCode` 59, `versionName` "v3.1.06" olarak yükseltildi.
- **58 (v3.1.05)**: Çevrimiçi (online) maçlarda oyuncu yılan renkleri varsayılan Pembe ve Turkuaz yerine 8 renkten rastgele seçilip oda kodu (room code) ile senkronize edildi. `build.gradle.kts` dosyası `versionCode` 58, `versionName` "v3.1.05" olarak yükseltildi.
- **57 (v3.1.04)**: Giriş yükleme ekranı (splash screen) süresi tüm platformlarda (PC, Mobil ve Android çevrimdışı fallback) 3 saniyeden 2 saniyeye indirilerek oyuna giriş hızı artırıldı. `build.gradle.kts` dosyası `versionCode` 57, `versionName` "v3.1.04" olarak yükseltildi.
- **56 (v3.1.03)**: Mobil çevrimiçi sunucu bağlantı akışı optimize edildi. Render sunucusu arka planda uyanırken, bekleme süresini kapatmak üzere geçiş reklamı (interstitial) gösterilmesi sağlandı. PC sürümünde de bu reklamlı akış kodlanarak sürüm senkronizasyonu sağlandı. `build.gradle.kts` dosyası `versionCode` 56, `versionName` "v3.1.03" olarak yükseltildi.
- **55 (v3.1.02)**: Oyuncu gösterge paneli (HUD) maksimum genişliği 94px'ten 80px'e (çift paneller için 188px'ten 160px'e) düşürülerek yön tuşlarının dokunma alanları genişletildi. Self Area 51 modundaki gösterge metni ("13/51") hafifçe yukarı taşındı. `build.gradle.kts` dosyası `versionCode` 55, `versionName` "v3.1.02" olarak yükseltildi.
- **54 (v3.1.01)**: Çevrimiçi oyun duraklatma ekranının tasarımı, eşleşme arama ekranının glassmorphism ve neon stiline uygun olarak baştan aşağı yenilendi. PC sürümünde online duraklatma arayüzü yeni cam panel ve neon border animasyonu ile modernleştirildi; Mobil ve Android fallback sürümlerine yanıp sönen pause ikonları ve iyileştirilmiş timer tasarımı eklendi. `build.gradle.kts` dosyası `versionCode` 54, `versionName` "v3.1.01" olarak yükseltildi.
- **53 (v3.1.00)**: Mobil, PC ve Android offline fallback HTML dosyaları v3.1.00 sürümüne güncellendi. Yem yeme dalgalanma efekti revize edilerek matris kare hücre dalgalanması eklendi. `build.gradle.kts` içindeki `versionCode` 53, `versionName` "v3.1.00" olarak güncellendi.
- **52 (v3.0.08)**: Mobil ve PC HTML dosyaları v3.0.08 sürümüne yükseltildi. v3.0.07 ile gelen tüm çevrimiçi yerelleştirme (21 dil), tarayıcı confirm() yerine entegre edilen glassmorphism onay pencereleri ve eşleşme ekranındaki düzenlemeler korundu. Mobil grid boyutu 30x45'e düşürülerek yılan segmentleri ve yemler büyütüldü; win glyph ve spawn offsetleri dinamikleştirildi. Çevrimiçi oyunlar için gösterge paneli (HUD) genişliği sınırlandırılarak (maks 188px) yerel boyutlarla eşitlendi, böylece yönlendirme butonları dokunma alanları genişletildi. Mobil Hızlı Rekabetçi (rastgele eşleşme) modunda yılan hızı mobil kontrolüne uygun olarak 1.10x çarpanına çekilerek dengelendi. Ayrıca pause menüsünden ana menüye dönerken ortaya çıkan pause balonlarının açık kalması/yeni oyunda fırlamış gelmesi bug'ı event bubbling engellenerek çözüldü. Çevrimdışı fallback HTML dosyası güncel v3.0.08 kopyasıyla güncellendi.

## Neden Bu Yapi Secildi
Ã„Â°lk hedef, oyunu Android uygulamasina tasirken sadece bir browser gibi calisan dusuk degerli bir paket olusturmamakti. Bu nedenle shell su prensiplerle kuruldu:

- Oyun icerigi web tarafindan beslenir; boylece HTML/JS oyun guncellendiginde Android shell yeni icerigi otomatik gosterir.
- Native splash, loading, offline ekran, ayarlar, vibration ve guvenlik katmanlari eklenir.
- Kullaniciya uygulama gibi hissedilir; ama oyun mantigi tek kaynaktan surdurulur.

Bu model sayesinde:
- oyun guncellemeleri hizli cikar,
- reklam geliri web tarafindaki H5 yapida kalir,
- Android shell sadece "tasiyici" degil, native deger katan bir katman olur.

## Web Oyun Revalidation Notu (v2.94.1)
- Android uygulamasi canli web HTML'ini cektigi icin son web deploy'un gorunmesi `index.html` cache davranisina baglidir.
- `v2.94.1` ile hem PC hem mobil oyun HTML'ine `no-cache / must-revalidate` meta sinyalleri ve istemci tarafli surum kontrol akisi eklendi.
- Oyun acilisinda, WebView tekrar gorunur oldugunda ve ana menuye donuldugunde uzaktaki HTML versiyonu sessizce kontrol edilir.
- Daha yeni surum bulunursa sadece guvenli durumda (aktif mac yokken, reklam akisi calismiyorken, ana menudeyken) cache-busting query ile temiz yenileme yapilir.
- `localStorage` temizlenmez; dil, tema, ses, highscore ve oyuncu isimleri korunur.
- Bu degisiklik web katmaninda yapildigi icin Android shell kodu degismediyse yeni AAB yayini zorunlu degildir.

## Ã„Â°lk Prompttaki Hedeflerin Ozeti
Android projesi asagidaki isteklerle kuruldu:

1. Fullscreen, immersive, performansli WebView
2. Native splash screen
3. Native loading overlay
4. Native offline/no-internet ekran
5. JavaScript <-> Native bridge
6. Native vibration
7. Android back button mantigi
8. Native settings ekrani
9. Guvenli domain politikasi
10. Android Studio icin acilabilir Kotlin projesi

Bu maddelerin tamami icin temel iskelet atildi ve sonraki turlarda UX ayarlari yapildi.

## Genel Mimari

### Oyun Kaynagi
- Uygulama local HTML degil, dogrudan `https://2playersnake.com/wp-content/uploads/game-mobile/index.html` yukler.
- Sebep: mobil oyunun guncel surumu web tarafinda tutuluyor ve reklam geliri de bu katmanda kaliyor.
- Sonuc: HTML oyun deploy edildiginde Android uygulama da yeni icerigi gosterir.

### Native Shell Mantigi
- Android shell oyunu tam ekran WebView icinde acar.
- Native katman sadece sunlari yonetir:
  - acilis deneyimi
  - offline deneyimi
  - guvenli navigation
  - settings
  - vibration bridge
  - Android back / exit UX

### Guncelleme Mantigi
- Sadece oyun HTML/JS/CSS degisirse:
  - Android app'i yeniden paketlemek gerekmez.
  - Siteye yeni build yuklemek yeterlidir.
- Native Android katmani degisirse:
  - yeni APK/AAB almak gerekir.

## Proje Klasorleri ve Onemli Dosyalar

### Ana Android Dosyalari
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\java\com\twoplayersnake\app\ui\MainActivity.kt`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\java\com\twoplayersnake\app\ui\SplashActivity.kt`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\java\com\twoplayersnake\app\ui\SettingsActivity.kt`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\java\com\twoplayersnake\app\bridge\GameJavascriptBridge.kt`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\java\com\twoplayersnake\app\web\GameWebViewClient.kt`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\java\com\twoplayersnake\app\web\JavascriptBridgeinjector.kt`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\java\com\twoplayersnake\app\web\TrustedWebOrigin.kt`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\res\layout\activity_main.xml`
- `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\AndroidManifest.xml`

### Varliklar
- Native logo asset:
  `C:\Users\Toygun\Desktop\2 Player Snake\Android\app\src\main\res\drawable-nodpi\logo_2playersnake.png`

### Workspace icindeki ilgili Oyun Dosyasi
- `C:\Users\Toygun\Desktop\AI Games\2 Player Snake\Ana Dosya\Mobile\Beta\v2\2 Player Snake Mobile v2.62.html`

Android shell su an bu dosyayi localden acmaz; ama oyun icindeki davranislarin referans kaynagi budur.

## WebView Kurulumu

### Aktif Kurallar
- JavaScript acik
- DOM storage acik
- Media playback user gesture zorunlulugu kapali
- Hardware acceleration aktif
- Scrollbar kapali
- Overscroll kapali
- Zoom kapali
- Long press kapali
- Mixed content kapali
- Uygulama immersive/fullscreen kullanir

### Guvenlik Mantigi
- Top-level navigation sadece guvenilen route'larda kabul edilir.
- Ana guvenilen sayfa `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`
- WordPress upload altindaki oyun yolu da guvenli sayilir.
- Diger top-level dis linkler cihaz tarayicisinda acilir.
- JS bridge sadece trusted page icin anlamli kabul edilir.

## Splash Screen
- Uygulama acilisinda native splash gosterilir.
- Logo merkezde fade/scale hissiyle sunulur.
- AmaÃƒÂ§, "oyun aciliyor" yerine "uygulama aciliyor" hissi vermektir.
- Splash'ten sonra `MainActivity` icindeki WebView ekranina gecilir.

## Loading Overlay
- WebView yuklenirken native loading overlay gorunur.
- Overlay icinde:
  - buyuk logo
  - baslik ve alt metin
  - linear progress indicator
  - yuzde bilgisi
- `onPageFinished` benzeri noktada overlay fade-out ile kapanir.

## Offline Mod
- internet yoksa oyun sayfasi acilmaz.
- Native offline ekran acilir.
- Retry butonu vardir.
- Connectivity listener internet geldigi anda sayfayi tekrar yukleyebilir.

Bu, Play Store icin ve kullanici deneyimi icin onemli native degerlerden biridir.

## JS Bridge ve Native Event Sistemi
Android tarafinda `Android` isimli bridge nesnesi oyuna expose edilir.

Hedeflenen event ailesi:
- `window.Android.onEatFood()`
- `window.Android.onGameStart()`
- `window.Android.onGameOver()`

Native taraf davranis:
- yem yeme -> kisa vibration
- carpismaya yakin ya da oyun sonu -> daha guclu vibration

Bridge guvenlik notlari:
- Bridge mantigi sadece trusted domain icin anlamli sayilir.
- `JavascriptBridgeinjector` sayfaya bootstrap script ve gerekli native helper kodlarini enjekte eder.

## Native Vibration
- Kisa vibration: yemek gibi hafif event'ler
- Orta vibration: game over / collision gibi sert event'ler
- Kullanici ayarlardan vibration'i kapatabilir

Bu ayar native `SettingsActivity` icinde saklanir ve sonra JS tarafina publish edilir.

## Native Settings Ekrani
Play Store icin uygulamaya saf WebView disinda native deger kazandiran ana parcalardan biri budur.

Su anki ayarlar:
- Vibration on/off
- Sound on/off

Ses ayari su anda native tarafta saklanir ve JS tarafina publish edilir; gelecekte web oyunun ses sistemiyle daha dogrudan bag kurulabilir.

## Navigation ve UX

### Android Back Button
- WebView geri gidebiliyorsa `goBack()`
- Geri gidilecek history yoksa native exit dialog

### Exit Dialog
- `Cancel`
- `Exit`
- `Open Settings`

Bu dialog sonraki turlarda native settings butonunu oyun ustunden kaldirdigimiz icin daha da onemli hale geldi.

### Pull-to-refresh
- Kullanilmiyor
- Cunku oyun akisini bozabilir

### App Shortcuts (Uygulama Kisayollari)
v2.91.0 ile Android ana ekrandan simgeye uzun basildiginda cikan hizli erisim menusu eklendi. Bu yapi v2.93.6 ve v2.94.5'te guncellenerek eski kisayollar kaldirildi ve yeni 3'lu set aktif hale getirildi.

**Teknik Yapi:**
- `res/xml/shortcuts.xml`: Statik kisayollari tanimlar (`normal_1p`, `fc_2p`, `fc_1p_ai`).
- `intent` icindeki `extra` verisi: `shortcut = normal_1p`, `fc_2p` veya `fc_1p_ai` degerini MainActivity'ye tasir.
- `MainActivity.kt`: intent'i yakalar, `shortcut` parametresini ayiklar ve WebView URL'sine uygun query parametresi olarak ekler.
- `strings.xml`: Tum dil etiketlerini tutar.
- `refreshLauncherShortcuts()`: Uygulama acilisinda dinamik kisayollari temizleyip guncel 3 kisayolu yeniden yazar; boylece launcher cache'i eski aksiyonlari daha kolay birakir.

**Davranis:**
- Uygulama kapaliyken: `onCreate` intent'i yakalar.
- Uygulama arkaplandayken: `onNewintent` intent'i yakalar ve WebView'i yeni parametreyle tazeler.
- Yeni Android build yuklenmeden cihazdaki eski launcher aksiyonlari degismeyebilir; bu durum WordPress yuklemesiyle degil, yeni APK/AAB kurulumu ile cozulur.

### Scroll ve Touch
- WebView icinde gereksiz scroll davranislari kapatildi
- Haptic/long-press gibi davranislar minimize edildi

## Native Settings Butonuyla ilgili Alinan Kararlar
Ã„Â°lk Android kabugunda oyun ekraninin ustune binen native bir `Settings` butonu vardi. Bu iki probleme yol acti:

1. Oyun UI'sinin ustune biniyordu
2. Mobil oyunun ust P2 panelini oldugundan daha kucuk ve sikisik gosteriyordu

Son durumda:
- Oyun ustundeki native settings butonu tamamen kaldirildi
- Ayarlara erisim exit dialog icinden veriliyor

Bu karar, oyunun kendi mobil UI'sini korumak icin alindi.

## Viewport ve Ust Kontrol Bar Sorunu
Android tarafinda en buyuk gÃƒÂ¶rsel sorunlardan biri ust `P2` kontrol barinin tarayicidaki kadar yukariya dayanmamasi ve daha ince gorunmesiydi.

### Sorunun Kaynagi
Bu sorun iki katmandan geldi:

1. WebView viewport davranisi
2. Mobil HTML icindeki `safe-area` CSS mantigi

### Android Shell Tarafinda Yapilan Duzeltmeler
`MainActivity.kt` icinde su ayarlar duzeltildi:
- `loadWithOverviewMode = false`
- `useWideViewPort = false`

Bu degisiklik, WebView'in oyunu gereksiz bicimde "zoom out" gostermesini engelledi.

### Mobil Kaynak Tarafinda Yapilan Duzeltmeler
Mobil HTML'de:
- kontrol barlarina `safe-area` hesabi daha dogru sekilde uygulandi
- `P2` barinda tum satira `padding-top` vermek yerine, sadece merkez panel bu inset'i alacak hale getirildi

Bu sayede:
- sol/saÃ„Å¸ tus bloklari yukariya tam dayanir
- merkezdeki notch-duyarli panel ezilmez

### Android Uygulamada Aninda Gorulebilsin Diye
Sadece site deploy'unu beklememek icin `JavascriptBridgeinjector.kt` icinde trusted sayfaya kucuk bir CSS override enjekte edildi.

Bu override:
- `#p2-controls { padding-top: 0 }`
- `.p2-panel { padding-top: calc(2px + var(--safe-area-top)) }`

mantigini app icinde de uygular.
230. **v2.74 & v2.75 WebView Performans NotlarÃ„Â±:**
    - `v2.74` ile gelen `ResizeObserver` desteÃ„Å¸i, Android cihazlarda ekran dÃƒÂ¶ndÃƒÂ¼rme veya split-screen (bÃƒÂ¶lÃƒÂ¼nmÃƒÂ¼Ã…Å¸ ekran) modlarÃ„Â±nda oyunun anÃ„Â±nda doÃ„Å¸ru boyuta gelmesini garantiler.
    - `v2.75` ile eklenen GPU hÃ„Â±zlandÃ„Â±rma ÃƒÂ¶zellikleri (`translate3d`, `will-change`), Android WebView ÃƒÂ¼zerindeki "Glass/Blur" (backdrop-filter) kaynaklÃ„Â± animasyon takÃ„Â±lmalarÃ„Â±nÃ„Â± minimize eder. Android kullanÃ„Â±cÃ„Â±larÃ„Â± iÃƒÂ§in ÃƒÂ§ok daha akÃ„Â±cÃ„Â± bir UI geÃƒÂ§iÃ…Å¸i saÃ„Å¸lar.
    - Panellerin ilk aÃƒÂ§Ã„Â±lÃ„Â±Ã…Å¸ta gizli gelmesi (static `hud-hidden` class), uygulamanÃ„Â±n aÃƒÂ§Ã„Â±lÃ„Â±Ã…Å¸ hÃ„Â±zÃ„Â±nÃ„Â± ve gÃƒÂ¶rsel kalitesini artÃ„Â±rÃ„Â±r.

## Logo Kararlari

### Native Logo
Android native asset yeni logoya cekildi:
- `2 Player Snake Logo v3 no bg.png`

Bu dosya `drawable-nodpi/logo_2playersnake.png` olarak kullanilir.

### Web icindeki Oyun Logosuyla iliskisi
Android uygulama, oyun logosunu WebView icinde dogrudan native asset'ten degil, web oyunun gÃƒÂ¶sterdiÃ„Å¸i kaynaktan alir.

Bu nedenle:
- native splash logosu degisince Android shell hemen degisir
- oyun icindeki ana menu logosu degissin diye web oyunun ilgili HTML kaynagi da guncellenmelidir
- v2.75 ile gelen yeni `AppIcons` (GÃƒÂ¶rsel/AppIcons) projenin `res/mipmap` katmanlarÃ„Â±na tÃƒÂ¼m yoÃ„Å¸unluklarda (hdpi'dan xxxhdpi'ya) entegre edilmiÃ…Å¸tir. ArtÃ„Â±k uygulama Android home screen'de yeni logoyla gÃƒÂ¶rÃƒÂ¼nÃƒÂ¼r.
230. **v2.76 - Sinematik YÃƒÂ¼klenme EkranÃ„Â± ve Ã„Â°nteraktif GiriÃ…Å¸:**
    - `intro.mp4` arka plan videosu (`res/raw`) entegre edildi.
    - Video, "Center Crop" mantÃ„Â±Ã„Å¸Ã„Â±yla ekranÃ„Â± tam kaplayacak Ã…Å¸ekilde ve sesli olarak oynatÃ„Â±lÃ„Â±r.
    - YÃƒÂ¼klenme ÃƒÂ§ubuÃ„Å¸u ve yÃƒÂ¼zde bilgisi video ÃƒÂ¼zerinde canlÃ„Â± olarak ilerlemeye devam eder.
    - Oyun %100 yÃƒÂ¼klendiÃ„Å¸inde yÃƒÂ¼kleme gÃƒÂ¶stergeleri yerini yanÃ„Â±p sÃƒÂ¶nen (flashing) kalÃ„Â±n bir **START** butonuna bÃ„Â±rakÃ„Â±r.
    - KullanÃ„Â±cÃ„Â± START'a bastÃ„Â±Ã„Å¸Ã„Â± an video durdurulur ve oyun alanÃ„Â± (ana menÃƒÂ¼) anÃ„Â±nda aÃƒÂ§Ã„Â±lÃ„Â±r. Bu sayede giriÃ…Å¸ sÃƒÂ¼reci tamamen oyuncu kontrolÃƒÂ¼ne bÃ„Â±rakÃ„Â±lmÃ„Â±Ã…Å¸tÃ„Â±r.
231. **v2.77 - GeliÃ…Å¸miÃ…Å¸ Tam Ekran Video Ãƒâ€“lÃƒÂ§eklendirme:**
    - YÃƒÂ¼klenme ekranÃ„Â±ndaki video ÃƒÂ¶lÃƒÂ§eklendirme matematiÃ„Å¸i gÃƒÂ¼ncellendi.
    - ArtÃ„Â±k her tÃƒÂ¼rlÃƒÂ¼ ekran oranÃ„Â±nda (farklÃ„Â± boyuttaki telefonlar) video hiÃƒÂ§bir kenarda boÃ…Å¸luk bÃ„Â±rakmadan ekranÃ„Â± tamamen mÃƒÂ¼hÃƒÂ¼rleyerek "Tam Ekran" deneyimi sunar.
    - Video pikselleri cihazÃ„Â±n view port'una tam oturacak Ã…Å¸ekilde scale edilir.
232. **v2.78 - Adaptive Icon TaÃ…Å¸Ã„Â±ma (Overflow) dÃƒÂ¼zeltmesi:**
    - Uygulama simgesinin kenarlardan kesilmesi (cropping) sorunu giderildi.
    - Logoyu gÃƒÂ¼venli bÃƒÂ¶lge (Safe Zone) iÃƒÂ§inde tutan `ic_launcher_foreground_inset.xml` katmanÃ„Â± oluÃ…Å¸turuldu.
    - **v2.79 - Google AdMob Entegrasyonu (H5 Mirroring):**
        - Google AdMob SDK'sÃ„Â± projeye dahil edildi.
        - **H5 Ayna MantÃ„Â±Ã„Å¸Ã„Â± (Mirroring):** Oyunun mevcut H5 reklam ÃƒÂ§aÃ„Å¸rÃ„Â±larÃ„Â± (AdSense `adBreak`/`adConfig`) Android shell tarafÃ„Â±ndan yakalanarak otomatik olarak Native AdMob reklamlarÃ„Â±na dÃƒÂ¶nÃƒÂ¼Ã…Å¸tÃƒÂ¼rÃƒÂ¼lÃƒÂ¼r.
        - Oyun dosyalarÃ„Â±nda hiÃƒÂ§bir kod deÃ„Å¸iÃ…Å¸ikliÃ„Å¸i gerektirmeden profesyonel mobil reklam gelir modeli eklendi.
        - **ÃƒÅ“retim (Production) ID Entegrasyonu:** GerÃƒÂ§ek AdMob App ID ve Reklam Birimi ID'leri (GeÃƒÂ§iÃ…Å¸ ve Ãƒâ€“dÃƒÂ¼llÃƒÂ¼) projeye baÃ…Å¸arÃ„Â±yla iÃ…Å¸lendi. Uygulama artÃ„Â±k para kazanmaya hazÃ„Â±r durumdadÃ„Â±r.
        - Reklam sonrasÃ„Â± oyunun otomatik devam etmesini saÃ„Å¸layan callback (shim) mekanizmasÃ„Â± kuruldu.
    - **v2.80 - Tam Ekran Immersion (Siyah Bar KaldÃ„Â±rma):**
        - Mobil/Android WebView iÃƒÂ§in siyah barlar tamamen kaldÃ„Â±rÃ„Â±ldÃ„Â±.
        - **Dinamik Kare Grid:** Ekran yÃƒÂ¼ksekliÃ„Å¸ine gÃƒÂ¶re hÃƒÂ¼creleri bozmadan kare tutan opsiyonel dikey geniÃ…Å¸leme (Option A) uygulandÃ„Â±.
        - **Safe Area (Notch) KorumasÃ„Â±:** Oyun gridi ÃƒÂ§entiÃ„Å¸e kadar gitse de, yem ve yÃ„Â±lan kafasÃ„Â±nÃ„Â±n ÃƒÂ§entik altÃ„Â±nda kalmasÃ„Â± JS seviyesinde engellendi.
        - **(Hotfix v2.80.1):** `isPlaying` ReferenceError dÃƒÂ¼zeltildi, UI animasyonlarÃ„Â± ve Pause Bubble taÃ…Å¸Ã„Â±ma sorunlarÃ„Â± giderildi.
    - **v2.81 - AI HÃ„Â±z Yeniden Dengelenmesi:**
        - AI yÃ„Â±lanÃ„Â± hÃ„Â±zÃ„Â± yeniden dengelendi (Easy: 40%, Normal: 55%, Fast: 80%, Extreme: 90%). DÃƒÂ¼Ã…Å¸ÃƒÂ¼k zorluk seviyeleri daha eriÃ…Å¸ilebilir hale getirildi; proje genelinde SÃƒÂ¼rÃƒÂ¼m senkronizasyonu saÃ„Å¸landÃ„Â±.
    - **v2.82 - AI zorluk sistemi rebalance ve Android SÃƒÂ¼rÃƒÂ¼m yÃƒÂ¼kseltme.**
        - **Rebalance:** AI hÃ„Â±zlarÃ„Â± Easy %40, Orta %60, Zor %80 olarak gÃƒÂ¼ncellendi.
        - **Renaming:** "Normal" zorluk seviyesinin adÃ„Â± "Orta" (TR) ve "Medium" (EN) olarak deÃ„Å¸iÃ…Å¸tirildi.
        - **ExtremeRemoval:** "Extreme" seÃƒÂ§eneÃ„Å¸i 1P vs AI zorluk seÃƒÂ§imi menÃƒÂ¼sÃƒÂ¼nden kaldÃ„Â±rÃ„Â±ldÃ„Â±.
        - **Build Bump:** Android uygulamasÃ„Â± v2.82.0 (versionCode 9) SÃƒÂ¼rÃƒÂ¼mÃƒÂ¼ne yÃƒÂ¼kseltildi.
        - **PC Sync:** PC tarafÃ„Â±nda AI titreme (jitter) sorunu giderildi ve menÃƒÂ¼ler mobil ile eÃ…Å¸itlendi.
    - **v2.84 - SÃƒÂ¼rÃƒÂ¼m Senkronizasyonu:**
        - **Build Bump:** TÃƒÂ¼m platformlar aktif bir kod deÃ„Å¸iÃ…Å¸ikliÃ„Å¸i yapÃ„Â±lmadan v2.84 SÃƒÂ¼rÃƒÂ¼mÃƒÂ¼ne eÃ…Å¸itlendi (SÃƒÂ¼rÃƒÂ¼m takibini Android'de senkron tutmak iÃƒÂ§in).
    - **v2.85 - Lokalizasyon dÃƒÂ¼zeltmesi ve Senkronizasyon:**
        - **Fix:** Mobil cihazlarda isim giriÃ…Å¸i yapÃ„Â±lmadÃ„Â±Ã„Å¸Ã„Â±nda varsayÃ„Â±lan `P1/P2` isimlerinin, yapay zekanÃ„Â±n ise `AI KazandÃ„Â±!` Ã…Å¸eklinde yerelleÃ…Å¸tirilmiÃ…Å¸ dosyadan doÃ„Å¸ru alÃ„Â±nmasÃ„Â± saÃ„Å¸landÃ„Â±. PC iÃƒÂ§inde yanlÃ„Â±Ã…Å¸ kalan versiyon metni (`v2.84`) dÃƒÂ¼zeltilerek SÃƒÂ¼rÃƒÂ¼m senkronizasyonu `v2.85` seviyesine ÃƒÂ§ekildi.

Bu nedenle mobil ve PC HTML referanslari da yeni logo URL'sine cekildi.

## Android Studio ve Calisma Akisi

### Onerilen Android Studio
- `Android Studio Panda 2 stable`

### Neden Stable
- Sync ve Gradle tarafinda daha az surpriz
- Ã„Â°lk APK/AAB alma sureci daha guvenli
- Canary/preview risklerinden kaciniyoruz

### Test Akisi
1. Android Studio ile projeyi ac
2. Emulatorde veya gercek cihazda `Run`
3. Web tarafinda oyun guncellendiginde tekrar uygulamayi acip test et

### Guncelleme Akisi
- HTML/JS/CSS degisti -> siteye deploy et -> Android app otomatik yeni icerigi gosterir
- Native shell degisti -> yeni APK/AAB gerekir

## Bilinen Pratik Notlar

### Gradle Wrapper
Bu ortamda `gradle` kurulu olmadigi icin wrapper otomatik uretilemedi.

Bu nedenle projede ilk acilista:
- Android Studio sync yapmasi gerekir
- wrapper veya gradle konfiguru Android Studio tarafinda toparlanir

### Ã„Â°lk Derleme Hatasi
Bir noktada `MainActivity.kt` icinde `webViewClient = null` satiri Kotlin tip hatasi veriyordu.
Bu satir kaldirilarak derleme engeli temizlendi.

### Warning'ler
Asagidaki warning'ler goruldu:
- redundant qualifier
- `databaseEnabled` deprecated

Bunlar calistirmayi engelleyen kritik blocker degildi.

## Play Store Acisindan Katki Veren Native Unsurlar
Bu shell'in salt browser wrapper gibi gorunmemesi icin su native unsurlar bilerek eklendi:

- native splash
- native loading UI
- native offline/retry UI
- native settings
- native vibration
- native back/exit dialog
- guvenli domain yonetimi

Bu katmanlar uygulamanin "gercek uygulama" hissini guclendirir.

## Gelecekte Eklenebilecek Native Katkilar
Ã„Â°leride gerekirse su alanlar buyutulebilir:
- local achievements veya Play Games entegrasyonu
- native share sheet
- native push / reminders
- install referrer veya kampanya analitigi
- app update prompt
- rating prompt

## Android Tarafinda Calisan Yapay Zeka Icin Kurallar
- Android shell kaynak dizini `C:\Users\Toygun\Desktop\2 Player Snake\Android` olarak kabul edilmelidir.
- Oyun mantigi Android'de degil, web oyunda yasadigi icin once problem web mi native mi ayrimi yapilmalidir.
- Mobil UI bozuk gorunuyorsa hemen shell'i suclama; once `viewport`, `safe-area`, `vh/dvh`, `padding` ve WebView zoom ayarlari kontrol edilmelidir.
- Oyun ustune native UI bindirmemek birincil ilkedir.
- Native ekleme gerekiyorsa oyun alanina bindirmek yerine:
  - exit dialog
  - alt sheet
  - ayri activity
  - ya da dis shell alani
  tercih edilmelidir.
- Trusted domain kurallari gevsetilmeden degisiklik yapilmamalidir.
- **Dinamik SÃƒÂ¼rÃƒÂ¼mleme ve Yeni Dosya OluÃ…Å¸turma:** KullanÃ„Â±cÃ„Â± her "gÃƒÂ¼ncelle", "yeni sÃƒÂ¼rÃƒÂ¼mÃƒÂ¼ gÃƒÂ¼ncelle" veya benzeri bir geliÃ…Å¸tirme isteÃ„Å¸inde bulunduÃ„Å¸unda, mevcut referans SÃƒÂ¼rÃƒÂ¼m numarasÃ„Â± (ÃƒÂ¶rneÃ„Å¸in v2.70) otomatik olarak bir kademe artÃ„Â±rÃ„Â±lmalÃ„Â± (v2.71) ve yapÃ„Â±lan deÃ„Å¸iÃ…Å¸iklikler bu yeni SÃƒÂ¼rÃƒÂ¼m numarasÃ„Â±na sahip **yeni dosyalar** ÃƒÂ¼zerinden iÃ…Å¸letilmelidir. HTML iÃƒÂ§erisindeki `VERSION` sabiti ve `<title>` etiketi de buna gÃƒÂ¶re gÃƒÂ¼ncellenmelidir. Her zaman yeni bir dosya oluÃ…Å¸turulmasÃ„Â± zorunludur.
- **Merkezi SÃƒÂ¼rÃƒÂ¼m NotlarÃ„Â±:** Her yeni AAB oluÃ…Å¸turulduÃ„Å¸unda veya ana SÃƒÂ¼rÃƒÂ¼m gÃƒÂ¼ncellendiÃ„Å¸inde, `MD Files/Release_Notes.md` dosyasÃ„Â±na yeni SÃƒÂ¼rÃƒÂ¼m notlarÃ„Â± eklenmelidir. Notlar projenin desteklediÃ„Å¸i 21 dilde ve `<en-US>...</en-US>` Tag formatÃ„Â±nda yazÃ„Â±lmalÃ„Â±dÃ„Â±r.
- **MaÃ„Å¸aza Metinleri:** Play Store ÃƒÂ¼zerindeki Ad, KÃ„Â±sa AÃƒÂ§Ã„Â±klama ve Tam AÃƒÂ§Ã„Â±klama metinleri `MD Files/Store_Listing.md` dosyasÃ„Â±nda 21 dilde tutulur. Bu metinlerde deÃ„Å¸iÃ…Å¸iklik yapÃ„Â±ldÃ„Â±Ã„Å¸Ã„Â±nda tÃƒÂ¼m dillerde gÃƒÂ¼ncellenmelidir.
- **Dinamik NetleÃ…Å¸tirme KuralÃ„Â±:** Yapay zeka, kullanÃ„Â±cÃ„Â±dan gelen her gÃƒÂ¼ncelleme veya yeni ÃƒÂ¶zellik talebinde, uygulamaya (kod yazÃ„Â±mÃ„Â±na) geÃƒÂ§meden ÃƒÂ¶nce aklÃ„Â±ndaki tÃƒÂ¼m sorularÃ„Â± kullanÃ„Â±cÃ„Â±ya sormalÃ„Â± ve iÃ…Å¸leyiÃ…Å¸i netleÃ…Å¸tirmelidir. Kod yazÃ„Â±mÃ„Â±na ancak kullanÃ„Â±cÃ„Â±dan onay veya yanÃ„Â±t alÃ„Â±ndÃ„Â±ktan sonra baÃ…Å¸lanmalÃ„Â±dÃ„Â±r.

## Son Ozet
Bugun Android tarafinda ortaya cikan final tablo su:

- Kotlin tabanli hibrit Android Studio projesi kuruldu
- Oyun kaynagi remote `https://2playersnake.com/wp-content/uploads/game-mobile/index.html` olarak sabitlendi
- Native splash, loading, offline, bridge, settings, vibration ve guvenlik katmani eklendi
- Native settings butonu oyun ustunden kaldirildi
- Back/exit UX native sekilde tamamlandi
- WebView viewport davranisi iyilestirildi
- Ust `P2` kontrol barinin Android'de sikismasi hem kaynak HTML hem app injector tarafinda duzeltildi
- Native logo yeni marka gorseline guncellendi
- Mobil ve PC HTML referanslari ayni logo ailesine cekildi

Bu belge bundan sonraki Android calismalarinda baz referans olarak kullanilmalidir.

## Oyun Guncellemeleri - Surum Notu Takibi

Android shell, oyun icerigini `https://2playersnake.com/wp-content/uploads/game-mobile/index.html` adresinden uzaktan yukler. Bu nedenle HTML/JS tarafindaki degisiklikler (asagidakiler dahil) Android uygulamasina otomatik yansir; ancak giris URL'si degisirse native shell de ayrica guncellenmelidir.

### v2.94.2 - Mobil Reklam Ses istegi (Web Tarafi)
- Mobil web oyununda `match_start` ve `between_rounds` interstitial reklamlar artik `sound: 'off'` istegiyle tetiklenir.
- AmaÃƒÂ§, mobil tarayici ve WebView benzeri ortamlarda sesli autoplay izin penceresi nedeniyle reklam akisinin dusmesini azaltmaktir.
- Rewarded continue akisi bu turda degistirilmemistir.
- Shell Kotlin kodunda degisiklik yoksa yeni AAB/APK alma zorunlulugu yoktur; WordPress'teki mobil HTML guncellemesi Android uygulamaya otomatik yansir.

### v2.94.3 - Menu Alt Yazi Temizligi (Web Tarafi)
- Mobil web menulerindeki secim ekranlarinda gorunen `pickOne` / `Birini sec` alt satirlari kaldirildi.
- Bu degisiklik Android shell kodunu etkilemez; WebView icindeki guncel mobil HTML otomatik yansir.

### v2.94.4 - Mobil Menu Dokunma Pulse Efekti (Web Tarafi)
- Mobil menudeki banner butonlarina dokunuldugunda kisa sureli turkuaz-pembe pulse/glow hissi eklendi.
- Bu degisiklik saf web UI katmanindadir; Android shell tarafinda yeni native kod gerektirmez.

### v2.94.5 - Android Shortcut Senkronu
- Android shell `versionCode` ve `versionName` guncellendi.
- `MainActivity` acilisinda launcher shortcut listesi native olarak yeniden yazdirilir.
- Amac, cihazda eski kalan `1 Oyuncu Baslat / 2 Oyuncu Baslat / Profil Secin` tipindeki eski shortcut listesini yeni 3'lu duzene itmek:
  - `Normal: 1 Oyuncu`
  - `Hizli Rekabetci: 2 Oyuncu`
  - `Hizli Rekabetci: 1P vs. AI`
- Bu degisiklik icin yeni APK/AAB alip uygulamayi cihazda guncellemek gerekir; sadece WordPress HTML yuklemek yeterli degildir.

### v2.84 - Macera Modu Tam Portu (Mobil -> Otomatik Yansir)
- **[YENÃ„Â°]** Macera moduna PC'deki **Tetromino Barrier sistemi** tam olarak tasindi:
  - Her round baÃ…Å¸Ã„Â±nda artan sayÃ„Â±da (5Ã¢â€ â€™10Ã¢â€ â€™15Ã¢â€ â€™20Ã¢â€ â€™25) engel blok izgaraya eklenir.
  - Blok hÃƒÂ¼cresine giren yÃ„Â±lan o roundu kaybeder.
- **[YENÃ„Â°]** Macera moduna PC'deki **Portal sistemi** tam olarak tasindi:
  - Her round baÃ…Å¸Ã„Â±nda 2 mor parÃ„Â±ltÃ„Â±lÃ„Â± portal belirir.
  - Bir portalden girilince diÃ„Å¸erinden ÃƒÂ§Ã„Â±kÃ„Â±lÃ„Â±r.
  - Portaller 15 saniyede bir rastgele yeniden konumlanÃ„Â±r.
- Android `versionCode` bu oyun guncellemesinde degismis olabilir; Play Store AAB yuklemesi gerekiyorsa `app/build.gradle.kts` icindeki `versionCode` bir arttirilmalidir.

### v2.95.1 - Android Shortcut Fresh Launch Fix (2026-04-22)
- Sorun: Android app icon long-press shortcut ile acilista bazen eski web HTML cache'i yuklenebiliyordu. Bu da eski skor karti/isim davranisi ve grid gorunum farki gibi eski bug'lari geri gosterebiliyordu.
- Duzeltme:
  - `app/build.gradle.kts` icindeki `GAME_URL` debug/release icin shell bazli tek bir remote entry olarak sabitlendi.
  - `MainActivity.kt` icinde `loadGame()` dogrudan `buildGameUrl()` kullanacak sekilde guncellendi.
  - `buildGameUrl()` su query parametrelerini ekler:
    - `app=android`
    - `app_ver=<versionName>`
    - `app_code=<versionCode>`
    - `__ts=<timestamp>` (sadece online durumda top-level HTML cache-bust)
    - `shortcut=<normal_1p|fc_2p|fc_1p_ai>` (varsa)
- Etki:
  - Shortcut acilisi guncel web kodunu daha guvenli sekilde alir.
  - Mod secimi dogrudan dogru kisayol akisina gider.
  - Eski cache kaynakli "yanlis surum acildi" riski ciddi sekilde azalir.

### Son Bilinen Paket Ciktisi (AAB)
- Derleme komutu: `.\gradlew.bat bundleRelease`
- Son bilinen durum: onceki local testte `BUILD SUCCESSFUL`
- Cikti dosyasi:
  - `C:\Users\Toygun\Desktop\AI Games\2 Player Snake\Ana Dosya\Android\app\build\outputs\bundle\release\app-release.aab`

### v2.95.1 Paketleme Notu (2026-04-22)
- Bu turda Android paketleme isini gelistirici manuel alir.
- Kod ve dokumantasyon hazirdir; release bundle ihtiyacinda su komut kullanilir:
  - `.\gradlew.bat bundleRelease`
- Web gameplay degisiklikleri (PC/mobil HTML) yine WordPress kaynagi uzerinden alinmaya devam eder.

### v2.95.2 Notu (Android Shell Etkisi)
- v2.95.2 degisikligi web gameplay katmaninda (`PC/Mobile HTML`) beast carpisma kurali guncellemesidir.
- Android native shell tarafinda yeni Kotlin/WebView degisikligi gerekmez.
- Android uygulamada bu davranisi gormek icin guncel mobil HTML'in yayinlanmasi yeterlidir.

### v2.95.3 - Android Shortcut Landing Notu
- Bu turdaki davranis degisikligi native Kotlin tarafinda degil, mobil web HTML tarafinda yapildi.
- Android launcher shortcuts hala ayni `shortcut` degerlerini gonderir:
  - `normal_1p`
  - `fc_2p`
  - `fc_1p_ai`
- Ancak mobil `checkShortcuts()` artik bu parametreleri dogrudan maÃƒÂ§i baslatmak icin kullanmaz.
- Yeni davranis:
  - preset secimleri otomatik uygular
  - son olarak `Ad & Renk` ekranini acar
  - maci kullanici `Baslat` demeden baslatmaz
- Sonuc:
  - Mobil web tarafindaki preset menu mantigi dogru calisir.
  - Ancak Android shell hala `/mobile` wrapper'ini aciyorsa gercek cihaz sonucu bozulabilir.
  - Bu nedenle native `GAME_URL` duzeltmesi ayri bir tamamlayici adim olarak gereklidir.

### v2.95.3 - Android Shortcut Landing Duzeltme Notu
- Sonraki testte kok neden netlesti:
  - `https://2playersnake.com/mobile?shortcut=...` acilisi wrapper uzerinden gittigi icin shortcut query parametresi gercek oyun HTML'ine guvenilir sekilde ulasmiyordu.
  - `https://2playersnake.com/wp-content/uploads/game-mobile/index.html?shortcut=...` ise dogrudan dogru menu presetine iniyordu.
- Bu nedenle native shell tarafi da guncellendi:
  - `app/build.gradle.kts` icindeki `GAME_URL` debug/release icin dogrudan
    `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`
    yapildi.
  - Android proje surumu sonraki native paket icin `versionName 2.95.3` / `versionCode 33` olarak hizalandi.
  - `TrustedWebOrigin.kt` icindeki `ENTRY_URL` ayni yola eslendi.
- Guncel durum:
  - Sadece web HTML yuklemek shortcut davranisini duzeltmez.
- Bu duzeltmenin Android cihazda calismasi icin yeni APK/AAB alinmasi gerekir.

### v2.97.4 - AdMob Senkronu + Yeni AAB
- Android native shell tarafinda AdMob App ID su degerde dogrulandi:
  - `ca-app-pub-4114535776207741~8941104521`
- Oyun yukleme URL'i dogrudan game entry olarak korunuyor:
  - `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`
- Yeni upload alinabilmesi icin Android surumu arttirildi:
  - `versionCode = 37`
  - `versionName = "2.97.4"`
- Yeni release bundle olusturuldu:
  - `C:\Users\Toygun\Desktop\AI Games\2 Player Snake\Ana Dosya\Android\app\build\outputs\bundle\release\app-release.aab`

### Not
- Bu AAB; AdMob tarafindaki guncel app kimligiyle uyumlu yeni paket olarak kullanilabilir.
- Mobil oyun icerik guncellemeleri yine WordPress'teki `game-mobile/index.html` dosyasindan otomatik alinmaya devam eder.

## Google Play Games on PC Destegi (GPGPC) - Durum Ozeti
- GPGPC destegi aktif.
- Android shell artik cihaz tipine gore iki ayri web entry URL secer:
  - Mobil/telefon: `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`
  - Google Play Games on PC: `https://2playersnake.com/wp-content/uploads/game/index.html`
- Bu secim native katmanda `MainActivity.kt` icindeki `isRunningOnPlayGamesPc()` + `resolveGameBaseUrl()` akisiyla yapilir.
- URL'e `app_device` gibi query parametreleri eklenir; web katmani buna gore davranis ayari yapabilir.

### Isleyis Mantigi (Onemli)
1. Oyun kodu hala webden cekilir (single source of truth).
2. Native shell sadece platform secimi + guvenlik + bridge + lifecycle yonetir.
3. Web tarafinda oyun guncellenirse, Android/GPGPC istemcisi yeni icerigi yeniden yuklemede gorur.
4. Native routing/lifecycle degisirse yeni AAB gerekir.

### Gelecek AI Icin Kural
- Mobil ve GPGPC URL'lerini tek degere sabitleme.
- `GAME_URL_MOBILE` ve `GAME_URL_PC` ayrimini koru.
- GPGPC gorunum/olceklendirme regression testi yapmadan release alma.
- Detayli rehber: `MD Files/AI_Guide_GPGPC.md`





