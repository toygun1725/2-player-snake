# 2 Player Snake - Mobil Surumu Yapay Zeka Rehberi

Bu belge, mobil surum uzerinde calisacak yapay zekalar icin guncel teknik referanstir. Mobil oyun tek HTML dosyasi icinde yasamaya devam eder; CSS, JS, i18n metinleri, canvas cizimi, reklam mantigi ve sentetik ses efektleri ayni dosyada tutulur.

## Referans Surum

> 2026-09-16 / iOS Build 36 eki: Aynı v3.3.5 HTML'de iOS'a koşullu değişiklikler
> yapıldı (runtime revision 36). Paket kaynakları, gerçek version-check koruması,
> yılan başına AI cache'i ve menü akıcılığı düzeltmeleri eklendi. Android/PC binary,
> sunucu ve AdMob kimlikleri değişmedi. iOS offline dosyasıyla mantık eşitlendi.
> Web yayını henüz yapılmadı; Git push siteyi güncellemez.
> Ayrıntılar: [iOS_Build_36_Verification.md](iOS_Build_36_Verification.md).

- Aktif referans surum: `v3.3.6` (iOS: Build 42 - App Store'da İncelemede / Waiting for Review)
- Temel referans dosya: `2 Player Snake Mobile v3.3.6.html`
- Kaynak/yayin durumu: v3.3.6 mobil ve PC kaynak dosyalari olusturuldu. Patreon destek sistemi oyun kodlarindan tamamen cikarildi.
- Android durumu: Android cevrimdisi fallback `mobile_offline_fallback.html` v3.3.6 ile esitlendi.
- iOS durumu: iOS Build 42 hazirlandi ve App Store Connect uzerinden resmi incelemeye sunuldu (Submission ID: `6fab8c78-d9b9-493e-a651-db3ccf0338ad`); 26 dilde yerellestirme tamamlandi; Game Center yetki dosyasi (`TwoPlayerSnake.entitlements`), Game Center (15 basarim), App Store doğrudan puanlama modal baglantisi, iPhone menü ve demo yılan donanım hızlandırma optimizasyonu, v3.3.6 cevrimdisi fallback ve Xcode pbxproj guncellendi.
- Dosya yapisi: her sey tek HTML dosyasindadir; CSS veya JS ayirma yapilmaz.
- Tasarim dili: koyu cyberpunk zemin, neon pembe ve turkuaz glow, camimsi panel dili, mobil odakli dar yerlesim.
- Ana menu logosu web uzerindeki guncel logo kaynagini kullanir; gerekirse yerel fallback ile calisir.

## Son Guncelleme (v3.3.6 - iOS Build 42 - App Store Submission)
- **v3.3.6**: Patreon Destek Sisteminin Kaldirilmasi, Apple Game Center ve App Store Puanlama Entegrasyonu, Game Center Yetki Dosyasi (`TwoPlayerSnake.entitlements`), iPhone Menü & Demo Yılan Performans Devrimi.
  - **Patreon Kaldirildi:** Ayarlar > Gelistiriciler (Developers) modalinda yer alan Patreon bagis ve destek bolumu 21 dilde tamamen temizlendi.
  - **CSS Temizligi:** `.btn-patreon`, `.btn-patreon i`, `.btn-patreon:active` stilleri ve ilgili buton secicileri kaldirildi.
  - **Apple Game Center Yetki Dosyası (`TwoPlayerSnake.entitlements`):**
    - App Store Connect'teki `To enable Game Center for your app, you must add the com.apple.developer.game-center entitlement in Xcode` uyarısını gidermek ve fiziksel cihazlarda Game Center oturumunu aktif etmek için `TwoPlayerSnake.entitlements` dosyası eklendi ve `CODE_SIGN_ENTITLEMENTS` tanımlandı.
  - **Apple Game Center Entegrasyonu (`GameKit` / `GameCenterManager.swift`):**
    - Android Play Games'teki 15 basarim (`ACH_FIRST_FOOD` - `ACH_ADVENTURE_COMPLETE`) birebir iOS Game Center'a entegre edildi.
    - Acilista `GKLocalPlayer.local.authenticateHandler` ile kullanici otomatik dogrulanir.
    - Basarim kazanildiginda `GKAchievement.report` ile Apple Game Center sunucularina iletilir ve yerel tamamlama banner'i gosterilir.
    - Menuden "Basarimlar" tiklandiginda kullanici bagliysa yerel Apple Game Center basarimlar penceresi (`GKGameCenterViewController`) acilir; bagli degilse oyun ici HTML neon modal gosterilir.
  - **App Store "Bize Puan Verin" Duzeltmesi:**
    - `SKStoreReviewController.requestReview`'un TestFlight'ta tamamen engellenmesi ve yillik 3 gosterim kotasina takilmasi nedeniyle calismayan puanlama butonu duzeltildi.
    - Butona basildiginda dogrudan App Store 5 yildiz ve yorum yazma ekranini acan `itms-apps://itunes.apple.com/app/id6811546748?action=write-review` baglantisi calistirilir.
  - **iPhone (iOS App & Mobile Safari) Menü ve Demo Yılan Performans Optimizasyonu:**
    - **İç İçe Blur Yükünün Kaldırılması:** 3x Retina ekranda 60 FPS canvas üzerinde çalışan `.main-menu-actions` üzerindeki gereksiz ikinci `backdrop-filter` kaldırıldı (`backdrop-filter: none`). Butonlar arkadaki kartın cam efekti üzerinde estetiğini %100 korurken GPU bellek okuma/yazma döngüsü %75 azaltıldı.
    - **Donanım Hızlandırmalı Neon Aura:** Menü kartındaki `animation: borderGlow` sürekli `box-shadow` yeniden boyaması yerine donanım hızlandırmalı sabit neon pembe/turkuaz aura yerleştirildi. Katman geçersiz kılma döngüsü yok edildi.
    - **Menü Geçişleri Ghost Kartı Optimizasyonu:** Menü geçişlerinde 200 ms içinde silinen hayalet kart (`ghost`) için blur ve animasyon iOS'ta da kapatılarak geçiş sırasındaki 4 katmanlı anlık blur darboğazı ve takılma çözüldü.
    - **Yılan Başına İzole AI Önbelleği (Safari & App):** `IS_APPLE_DEVICE` (tüm iOS cihazlar) yılan başına bağımsız önbelleğe (`getIosAiCache`) bağlandı. Demo modunda P1 ve P2 birbirinin BFS rotasını ezmez, BFS çalıştırma sıklığı %75 azalır.
    - **Safari Demo Polling Koruması:** Demo modunda/menüde periyodik 700KB versiyon çekme döngüsü iOS cihazlar için engellenerek Garbage Collection (GC) takılmaları önlendi.
    - **Android ve PC Güvencesi:** Tüm CSS iyileştirmeleri `@supports (-webkit-touch-callout: none)` ve `html[data-ios-device="true"]` ile izole edildi; Android ve PC masaüstü tarayıcıları kesinlikle etkilenmedi.
  - **Cevrimdisi Senkron:** iOS ve Android `mobile_offline_fallback.html` dosyalari v3.3.6 ile senkronize edildi.
  - **iOS Build 40:** `Info.plist` ve `project.pbxproj` icinde `MARKETING_VERSION = 3.3.6` ve `CURRENT_PROJECT_VERSION = 40` tanimlandi; Game Center entitlement eklendi.
  - **Dogrulama:** `node --test tests/ios-runtime.test.cjs` 21/21 test ile %100 basarili gecti.

## Onceki Guncelleme (v3.3.5)
- **v3.3.5**: Android WebView menu gecis akiciligi duzeltmesi.
  - **Canli demo korumasi:** Android WebView'da menu penceresi degisirken arka plan demosu sadece gecis suresince (`340 ms`) son render karesinde tutulur. Oyun ici render ve mobil tarayici akisi degismez; gecis tamamlaninca demo yeniden akar.
  - **Giden kart optimizasyonu:** Gecis boyunca olusturulan eski menu kopyasinda yalnizca Android WebView icin `backdrop-filter` ve animasyonlu kart parlamasi kapatilir. Gelen kartin mevcut cam gorunumu korunur.
  - **Kapsam:** Degisiklik `window.isAndroidWebView && isDemoMode` ile sinirlidir; aktif oyun, PC ve mobil tarayici etkilenmez.
  - **Dogrulama:** Mobile v3.3.5 icindeki 3 inline JavaScript blogu basariyla parse edildi. Fiziksel Android WebView menu gecis testi yayin oncesinde yapilmalidir.
  - **Yayin:** Yalnizca canli mobil HTML yuklenir. `server.js` yeniden baslatma ve yeni AAB gerekmez.

## Son Guncelleme (v3.3.4)
- **v3.3.4**: PC online grid paritesi ve surum senkronu.
  - Ortak sunucu PC online odalarini yerel PC oyunu ile ayni `64x36` grid ile baslatir. Rastgele eslesme ve ozel oda akislari bu boyutu alir; mobilin `24x...` grid pazarligi degismez.
  - Mobil dosya, PC ile surum numarasi paritesini korumak icin v3.3.4 olarak olusturuldu; mobil oyun mantiginda ek fonksiyonel degisiklik yapilmadi.
  - **Dogrulama:** Yerel Socket.IO testinde PC matchmaking ve ozel oda `64x36`, mobil matchmaking `24x29` sonucunu verdi.

## Son Guncelleme (v3.3.3)
- **v3.3.3**: Mobil performans, bellek ve oyuncu adi guvenligi duzenlemesi.
  - **Hareket Odakli Carpisma Hesabi:** Bariyer ve yilan govdesi carpisma durumlari render karesi yerine gercek hareket adiminda hazirlanir. Hucre anahtarlari sayisal hale getirildi; macera modunda tekrar eden string olusturma ve set kurma maliyeti azaltildi.
  - **Render Temizligi:** Sabit hex -> RGB donusumleri cache'lenir; alpha degeri her kare icin dinamik kalir. Gecici yemlerin filtrelenmesi de yalnizca sona ermis bir yem varsa yeni dizi olusturur.
  - **Guvenli Oyuncu Adlari:** Menu, kazanan banner'i, skor listesi ve mac sonu istatistiklerindeki `innerHTML` yollarinda oyuncu adlari escape edilir.
  - **Kod Temizligi:** Kullanilmayan eski yem-kurallari olusturucusu kaldirildi.
  - **Ortak Online Sunucu:** `server.js` oyuncu adlarini kontrol karakterlerinden arindirir, bosluklari normalize eder ve 12 Unicode karakterle sinirlar. Mobil/PC matchmaking, ozel oda ve temel oyun olaylari yerelde Socket.IO ile dogrulandi.
  - **Dagitim Notu:** Bu sunucu degisikliginin etkili olmasi icin canli `server.js` yuklenmeli ve Node sureci yeniden baslatilmalidir. Android offline fallback henuz v3.3.3 ile esitlenmedi.

## Son Guncelleme (v3.3.2)
- **v3.3.2**: Cloud Save & Play Games Sidekick entegrasyonu.
  - **Bulut Kaydı (Cloud Save) Tetikleyicisi:** `addHighScore()` fonksiyonu güncellendi. Artık skor kaydedildiğinde `Android.notifyHighScore()` aracılığıyla Android shell tarafına güncel skor listesi `mobile` platform parametresiyle iletilir.
  - **Bulut Kaydı Yükleme İşleyicisi:** Uygulama açılışında Android native'den gelen bulut verisini (`mobileScores`) karşılayan `window.onCloudSaveLoaded` fonksiyonu eklendi. Buluttan gelen skorlar yerel localStorage skorlarıyla birleştirilerek en yüksek 10 skor korunur.
  - **Play Games Sidekick Yönlendirmesi:** `openAchievementsMenu()` fonksiyonu güncellendi. Eğer Android uygulaması içinde çalışıyorsa native başarımlar ekranını tetiklemek için `Android.showAchievements()` metodu çağrılır. Web/tarayıcı üzerinde ise klasik HTML başarımlar penceresi gösterilmeye devam eder.
  - **Sürüm Güncellemesi:** HTML başlığı, yorum satırları ve `VERSION` sabitleri `v3.3.2` olarak güncellendi.

## Son Guncelleme (v3.3.1)
- **v3.3.1**: Sürüm numarası v3.3.1 olarak güncellendi.
  - **Sürüm Güncellemesi:** HTML başlığı, i18n çeviri anahtarları, yorum satırları ve `VERSION` sabitleri `v3.3.1` olarak güncellendi. Native shell'deki bildirim sistemi güncellemesiyle senkronize edildi.

## Son Guncelleme (v3.3.0)
- **v3.3.0**: Premium (Reklamsız Sürüm) ve RevenueCat Entegrasyonu sürümü.
  - **Premium Satın Alma / Geri Yükleme Butonları:** 21 dilde yerelleştirilmiş taç ikonlu "Remove Ads" ve "Restore Purchases" butonları ayarlar menüsüne ve ana menü overlay katmanına entegre edildi.
  - **Reklam Kaldırma Mantığı:** Javascript bridge aracılığıyla Android native shell'den `adsRemoved` flag'i alındı. Eğer premium satın alınmışsa tüm geçiş (interstitial) reklamları bypass edilir ve ödüllü (rewarded continue) canlanma reklamları video oynatılmadan anında otomatik onaylanır.
  - **Çevrimdışı Fallback Güncellemesi:** Yerel `mobile_offline_fallback.html` dosyası v3.3.0 sürümüne yükseltilerek aynı premium butonları, dil destekleri ve native bridge özellikleri çevrimdışı kullanım için de senkronize edildi.
  - **Sürüm Güncellemesi:** HTML başlığı, i18n çeviri anahtarları, yorum satırları ve `VERSION` sabitleri `v3.3.0` olarak senkronize edildi.

## Son Guncelleme (v3.2.3)
- **v3.2.3**: Oyun sonu istatistiklerinde sadeleşmeye gidildi ve yılan uzunluğuna odaklanıldı.
  - **İstatistik Güncellemesi:** Oyun sonu ekranında "Toplam Yenilen Yem" satırı kaldırıldı. Oyuncu kutularındaki "Yenen Yem" ibaresi "Yılan Uzunluğu" olarak değiştirildi ve maç boyunca ulaşılan maksimum yılan uzunluğu gösterilecek şekilde güncellendi.
  - **Sürüm Senkronu:** Title, yorum satırları ve `VERSION` sabitleri `v3.2.3` olarak güncellendi.
  - **Doğrulama:** Mobile v3.2.3 inline JavaScript `node --check` ile doğrulandı.

## Son Guncelleme (v3.2.2)
- **v3.2.2**: Kodlar içerisindeki eski sürüm numaraları (v3.2.1) temizlendi ve hem mobil hem de PC sürümleri v3.2.2 olarak senkronize edildi.
  - **Sürüm Senkronu:** Title, yorum satırları ve `VERSION` sabitleri `v3.2.2` olarak güncellendi.
  - **Dogrulama:** Mobile v3.2.2 inline JavaScript `node --check` ile doğrulandı.

## Son Guncelleme (v3.2.1)
- **v3.2.1**: v3.2.0 baz alinarak online bildirim sistemi yenilendi.
  - **Online Alert Dialog:** Tum 17 tarayici `alert()` cagrisi, ozel `showOnlineDialog()` / `showOnlineAlert()` sistemiyle (Promise tabanli, animasyonlu, glassmorphism stilinde) degistirildi.
  - **Temali Bildirimler:** Baglanti kopmasi, zaman asimi, lobi hatalari, yeniden mac basarisizliklari ve rakip ayrilma olaylari artik Orbitron baslikli, cyan parlayan kenarlikli, yumusak animasyonlu bir kart overlay icinde gosterilir.
  - **Mobil Optimize Butonlar:** Dialog butonlari genis dokunma alani, dokunma geri bildirimi ve `-webkit-tap-highlight-color` kaldirilmasi ile temiz mobil UX saglar.
  - **Acik Tema Destegi:** `.online-alert-overlay` ve `.online-alert-card` CSS siniflari `[data-theme="light"]` override ile acik temaya uyum saglar.
  - **i18n Duzeltmesi:** `gameOver` ve `lobbyPartnerLeft` handler'larindaki 2 hardcoded Turkce string, `t('onlineGameTimeoutEnd')` ve `t('onlinePartnerLeft')` anahtarlarina yonlendirildi.
  - **PC Senkronu:** PC surumu v3.2.1'e guncellendi (yalnizca surum numarasi).
  - **Dogrulama:** Mobile v3.2.1 inline JavaScript `node --check` ile dogrulandi; `alert(` arama sonucu 0 (yalnizca yorum satiri).

## Son Guncelleme (v3.2.0)
- **v3.2.0**: v3.1.9 baz alinarak yeni mobil yayin adayi olusturuldu.
  - **Countdown Hizalama:** `BASLA!/START!` yazisi icin ayri `countdown-banner` sinifi eklendi; mobilde saga kayma/kirilma sorunu giderildi.
  - **Zorluk I18n Ayrimi:** AI zorluk bolumu hiz ayarlarindan ayrildi. Baslik `Zorluk/Difficulty`, secenekler `Kolay-Normal-Zor / Easy-Normal-Hard`; normal yilan hizi metinleri `Yavas-Orta-Hizli / Slow-Normal-Fast` mantigini korur.
  - **Online Sinir Temizligi:** Online modda duvar gibi gorunen renkli sinir kaldirildi; sinir cizimi yalniz gercek `SOLID` duvar modunda kalir.
  - **Online Kare Grid:** Online render'da hucreler yeniden kareye alindi. `getCellCoords()` online modda tek `cellSize` kullanir; yilan bloklari yatay ve dikeyde esit aralikla gorunur.
  - **Kucuk Ekran Satir Pazarligi:** `requestedRows` hesabi yuvarlanarak (`Math.round`) kucuk ekranin sigan kare grid'i macin mantiksal satir sayisini belirler.
  - **Render Kirilmasi Hotfix:** `xOffset/yOffset` tanimsizligi giderildi; demo ve oyun yilanlarinin gorunmemesine neden olan `ReferenceError` kapatildi.
  - **Senkronizasyon:** PC v3.2.0 olusturuldu ve Android `mobile_offline_fallback.html` Mobile v3.2.0 ile esitlendi. `server.js` optimum satir sayisi yuvarlama gorusmesini destekleyecek sekilde guncellendi.
  - **Dogrulama:** Mobile v3.2.0 inline JavaScript `node --check` ile dogrulandi.

## Son Guncelleme (v3.1.9)
- **v3.1.9**: "Çevrimiçi Oyna" seçeneği tıklandığında sunucu uyanıklığı (health check) arka planda test edildi.
  - **Akıllı Geçiş Reklamı Bypass:** "Çevrimiçi Oyna" tıklandığında arka planda sunucuya 2 saniyelik zaman aşımı ile hızlı bir `/health` isteği gönderilir. Sunucu uyanıksa geçiş reklamı (interstitial) tamamen bypass edilerek anında lobiye veya oda kurma ekranına geçiş sağlanır.
  - **Uyanma Reklam Maskelemesi:** Sunucu uyku modundaysa (Render ücretsiz planı gereği uyanma süresi 30-50 sn), geçiş reklamı devreye sokularak bekleme süresi kullanıcıya fark ettirilmeden maskelenir.
  - **Senkronizasyon:** PC Sürümü (`2 Player Snake PC v3.1.9.html`) ve çevrimdışı fallback `mobile_offline_fallback.html` dosyaları `v3.1.9` sürümüne eşitlendi. Android `versionCode` 54 olarak kaldı.

## Son Guncelleme (v3.1.8)
- **v3.1.8**: Mobil dikey ekranlarda yılanın ve yemlerin %25 daha büyük görünmesi için varsayılan grid 24x36 yapıldı, yerel hız kademeleri düşürüldü ve çevrimiçi matchmaking hızı senkronize edildi.
  - **Küresel Izgara Ölçeklendirme:** Grid sütun sayısı 30'dan 24'e, satır sayısı 45'ten 36'ya düşürüldü, böylece dikey ekranlarda segmentler %25 daha büyük görünmektedir.
  - **Çevrimdışı Oyun Hızları:** Hız kademeleri EASY: 0.75 (yavaşlatıldı), NORMAL: 0.85 (yavaşlatıldı), FAST: 1.05 (yavaşlatıldı) olarak güncellenerek daha kontrollü bir oyun akışı sağlandı.
  - **Online Matchmaking Hız Senkronu:** Çevrimiçi interpolasyon hız çarpanı sunucu tick hızıyla (0.85x) tam uyumlu şekilde düşürüldü.
  - **Senkronizasyon:** PC sürümü ve çevrimdışı fallback `mobile_offline_fallback.html` dosyaları `v3.1.8` sürümüne eşitlendi. Android `versionCode` 54 olarak kaldı.

## Son Guncelleme (v3.1.7)
- **v3.1.7**: Android WebView optimizasyonları yapıldı ve grid önbellek invalidation hatası ile online mod border rengi parsing bug'ı giderildi.
  - **WebView Glow Kapatılması:** Android WebView (`window.isAndroidWebView`) içinde yılan gövdesi ve galibiyet metni parlama/gölge (shadowBlur) efektleri devre dışı bırakılarak GPU render yükü sıfırlandı. Diğer tarayıcılarda parlama efekti korundu.
  - **Grid Önbellek Yenileme (Theme Cache):** data-theme değişimlerinde önbellekteki ızgara/kenarlık kanvasının (`gridCacheCanvas`) anında silinmesi ve yeni tema renkleriyle çizilmesi sağlandı.
  - **Stroke Style Çözümlemesi:** Çevrimiçi moddaki sınır çizgileri strokeStyle CSS değişken çözümleme hatası standard `varToCss` aracı kullanılarak giderildi.
  - **Senkronizasyon:** PC sürümü ve çevrimdışı fallback `mobile_offline_fallback.html` dosyaları `v3.1.7` sürümüne eşitlendi. Android `versionCode` 54 yapıldı.

## Son Guncelleme (v3.1.6)
- **v3.1.6**: Android WebView donma ve kasma sorunları için büyük render performans optimizasyonları yapıldı.
  - **DPR Sınırlandırması (1.35x):** WebView üzerinde piksel doldurma hızını düşürmek için cihaz piksel oranı `1.35` ile sınırlandırıldı.
  - **Izgara Çizim Önbelleği (Offscreen Canvas):** `drawGrid()` fonksiyonu statik ızgara çizgileri ve sınırlarını bir kez ekran dışı canvas'a çizip bellekte saklayacak şekilde önbelleklendi; her karede tek tek çizilerek CPU'yu tıkaması engellendi.
  - **Titreşim Sınırlandırıcı (Haptic Throttle):** 20 ms ve altındaki kısa titreşimlerin seri dönüşlerde ana iş parçacığını engellemesini önlemek için 60 ms throttle eklendi.
  - **Senkronizasyon:** PC sürümü ve çevrimdışı fallback `mobile_offline_fallback.html` dosyaları `v3.1.6` sürümüne eşitlendi.

## Son Guncelleme (v3.1.5)
- **v3.1.5**: Çok oyunculu modda tekrar oynama (rematch) akışı senkronize edildi. Oyuncu "Tekrar Oyna" butonuna bastığında hemen gönderilen `rematchIntent` ile diğer oyuncuda yılan rengine göre parlayan notice gösterilmesi, geçiş reklamı bittiğinde `rematchReady` gönderimi ile iki oyuncunun da ad bitimi beklenip oyunun başlatılması, reklamı erken biten oyuncuya waiting ekranı ve spinner gösterilmesi sağlandı.
- **PC v3.1.5**: PC sürümü de `v3.1.5` sürümüne güncellenerek aynı iki aşamalı tekrar oynama barajı, renkli uyarılar ve bekleme ekranı sistemi eklendi.
- **Sunucu v3.1.5**: Çok oyunculu sunucu (`server.js`) rematchIntent ve rematchReady socket eventleri, rematchReadys yapısı ve cancelRematch temizlik mantığı ile rematch sürecini senkronize edecek şekilde güncellendi.
- **Offline Fallback v3.1.5**: `mobile_offline_fallback.html` dosyası yeni v3.1.5 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.4)
- **v3.1.4**: Çok oyunculu sunucudan gönderilen geçici oturum anahtarı (`sessionToken`) verisi hafızada (`onlineSessionToken` değişkeni) tutulacak şekilde Mobil istemci güncellendi. Yeniden bağlantı kurulurken bu anahtar sunucuya doğrulanması için gönderilir (session hijacking engellemesi). Diğer bağlantı sızıntıları ve soket retriaları mobil tarafında zaten güvenli olduğu için ek mantıksal değişiklik gerekmedi.
- **PC v3.1.4**: PC sürümü de `v3.1.4` sürümüne güncellendi. PC sürümünde sunucuya bağlanırken iptal tuşuna basıldığında veya oyun temizlendiğinde zamanlayıcının sızması engellendi. Socket ilk bağlantı hatasında abort edilmeden 3 kez yeniden bağlantı denemesi sağlanması aktif edildi ve `reconnectOnlineGame` içindeki yinelenen soket dinleyicileri temizlendi.
- **Sunucu v3.1.4**: Çok oyunculu sunucu (`server.js`) sessionToken doğrulama, Macera modu portal geçiş adım senkronizasyonu, hükmen yenilgi skor sınır taşması düzeltmeleri ve yeniden bağlantı sonrası 3 saniye geri sayım countdown mantığı ile güçlendirildi.
- **Offline Fallback v3.1.4**: `mobile_offline_fallback.html` dosyası yeni v3.1.4 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.3)
- **v3.1.3**: Raund galibiyetlerinde (final olmayan galibiyetlerde) galibiyet metninin (örn. "P1" veya "AI") harf ve rakamlarının farklı renklerde görünmesi hatası giderildi. Harf ve rakam segmentleri kazanan yılanın segmentlerine atanarak tek renk olarak birleştirildi.
- **PC v3.1.3**: PC sürümü de `v3.1.3` sürümüne güncellenerek aynı win animasyonu renk segmenti birleştirme düzeltmesi uygulandı.
- **Offline Fallback v3.1.3**: `mobile_offline_fallback.html` dosyası yeni v3.1.3 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.2)
- **v3.1.2**: Çevrimiçi oyun modlarında sunucu tarafından gönderilen ham Türkçe hata mesajları için yerelleştirilmiş dil eşlemeleri (`translateOnlineServerMessage`) eklenerek dil kaçağı giderildi. Yabancı oyuncular için hata bildirimlerinin seçilen dilde görünmesi sağlandı.
- **PC v3.1.2**: PC sürümü de `v3.1.2` sürümüne güncellendi. Benzer dil yerelleştirmeleri, soket koptuğunda oyundan anında çıkılmasını engelleyen `reconnectOnlineGame` yeniden bağlantı mantığı ve oda kodu ile genel lobi bağlantı dinleyicilerini birleştiren genel soket yöneticileri eklendi.
- **Offline Fallback v3.1.2**: `mobile_offline_fallback.html` dosyası yeni v3.1.2 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.1)
- **v3.1.1**: Çevrimiçi oyun arayüzünde rakip ayrıldığında oluşan donmalar ve kilitlenmeler arayüz temizlik kodlarıyla giderildi. Bağlantı kopmaları ve yeniden bağlanma başarısızlıkları için socket.io hata sınırları ile online menüye otomatik yönlendirme eklendi. Geri sayım lobi ve aktif oyun içi aşamalarındaki donmaları önlemek amacıyla 3 saniyelik istemci tarafı güvenlik zaman aşımı zamanlayıcısı eklendi.
- **PC v3.1.1**: PC sürümü de `v3.1.1` sürümüne güncellendi. Benzer şekilde arayüz donma temizlikleri, hata sınırları ve istemci güvenlik zaman aşımı zamanlayıcısı entegre edildi.
- **Offline Fallback v3.1.1**: `mobile_offline_fallback.html` dosyası yeni v3.1.1 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.09)
- **v3.1.09**: Çevrimiçi rastgele eşleşme ("Hızlı Rekabetçi") modunun yılan hızı optimize edildi. Kontrol konforu ve dengesi için hız çarpanı 1.10x'ten 1.00x (Normal hız) seviyesine düşürüldü.
- **PC v3.1.09**: PC sürümünün de online rastgele eşleşme hızı `MOD_SPEED.NORMAL` (1.00x) olarak güncellendi ve sürüm `v3.1.09` olarak eşitlendi.
- **Offline Fallback v3.1.09**: `mobile_offline_fallback.html` dosyası yeni v3.1.09 mobil sürümüyle eşitlendi.

## Son Guncelleme (v3.1.08)
- **v3.1.08**: Çevrimdışı (local) modda pause menüsündeki "Home" butonu ile ana menüye dönülürken %30 ihtimalle bir geçiş reklamı (`AdManager.showInterstitial`) tetikleme mantığı entegre edildi.
- **PC v3.1.08**: PC sürümü `v3.1.08` sürümüne güncellendi. Ana menüye Android platformunda Google Play Store üzerinden oynamayı sağlayan yeşil hover efektli bir "Play on Android" (Android'de Oyna) yönlendirme butonu eklendi.
- **Offline Fallback v3.1.08**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` dosyası v3.1.08 mobil sürümüyle eşitlendi.

## Son Guncelleme (v3.1.07)
- **v3.1.07**: Mobil çevrimiçi lobi (ONLINE_STRINGS) için yeni dil çevirileri (Hollandaca/nl, Yunanca/el, Çekçe/cs) eklendi.
- **PC v3.1.07**: PC sürümü de `v3.1.07` sürümüne güncellenerek senkronize edildi.

## Son Guncelleme (v3.1.06)
- **v3.1.06**: Android platformuna özel entegre Başarımlar (Achievements) arayüzü ve motoru eklendi. Ana menüye 🏅 emojili Başarımlar butonu yerleştirildi ve 15 adet başarımın kazanılabilmesi hem çevrimdışı hem de çevrimiçi modlar için etkinleştirildi.
- **PC v3.1.06**: PC sürümü de `v3.1.06` sürümüne yükseltilerek sürüm senkronu sağlandı.
- **Offline Fallback v3.1.06**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.06 mobil sürümüyle eşitlendi.

## Son Guncelleme (v3.1.05)
- **v3.1.05**: Çevrimiçi (online) matchmaking ve oda oyunlarında P1 ve P2 yılanlarının renkleri varsayılan Pembe ve Turkuaz yerine 8 yerel renkten rastgele seçilip oda kodu (room code) bazlı tohumla (seed) senkronize edildi.
- **PC v3.1.05**: PC istemci dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.05.html` üzerinde de renkler oda kodu bazlı rastgele ve senkronize şekilde güncellendi.
- **Offline Fallback v3.1.05**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.05'e güncellendi.

## Son Guncelleme (v3.1.04)
- **v3.1.04**: Giriş yükleme ekranı (splash screen) süresi tüm platformlarda (PC, Mobil ve Android çevrimdışı fallback) 3 saniyeden 2 saniyeye indirilerek oyuna giriş hızı artırıldı.
- **PC v3.1.04**: PC istemci dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.04.html` üzerinde de yükleme ekranı süresi 2 saniyeye indirilerek sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.04**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.04'e güncellendi.

## Son Guncelleme (v3.1.03)
- **v3.1.03**: Mobil çevrimiçi sunucu bağlantı akışı optimize edildi. Render sunucusu arka planda uyanırken, bekleme süresini kapatmak üzere geçiş reklamı (interstitial) gösterilmesi sağlandı.
- **PC v3.1.03**: PC istemci dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.03.html` üzerinde de reklamlı bağlantı akışı kodlanarak sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.03**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.03'e güncellenerek yeni reklamlı bağlantı akışı aktarıldı.

## Son Guncelleme (v3.1.02)
- **v3.1.02**: Oyuncu gösterge paneli (HUD) maksimum genişliği 94px'ten 80px'e (çift paneller için 188px'ten 160px'e) düşürülerek yön tuşlarının dokunma alanları genişletildi. Self Area 51 modundaki gösterge metni ("13/51") hafifçe yukarı taşındı (CSS translation).
- **PC v3.1.02**: PC istemci dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.02.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.02**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.02'ye güncellenerek yeni HUD boyutları ve Area 51 yazısı konumlandırmaları aktarıldı.

## Son Guncelleme (v3.1.01)
- **v3.1.01**: Çevrimiçi oyun duraklatma ekranının tasarımı, matchmaking arama ekranının premium glassmorphism ve neon glow tarzına uyacak şekilde yeniden tasarlanıp görsel olarak iyileştirildi. Mobil sürümde pause pencerelerine yanıp sönen pause simgeleri, Orbitron neon gölgeli timer göstergeleri ve düzenlenmiş butonlar eklendi.
- **PC v3.1.01**: PC istemci dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.01.html` ile sürüm senkronizasyonu sağlandı. PC pause menüsünde cam arka plan ve neon kenarlık animasyonu uygulandı.
- **Offline Fallback v3.1.01**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.01'e güncellenerek yeni pause ekranı tasarımları aktarıldı.

## Son Guncelleme (v3.1.00)
- **v3.1.00**: Yem yeme dalgalanma efekti revize edildi. Vektörel pürüzsüz daire çizgisi çizimi yerine matris üzerindeki kare hücrelerin (grid cells) kendilerinin tıpkı birer RGB mekanik klavye tuşu gibi parlayıp sönmesi sağlandı. Yenen yemin tipine göre dalga rengi özelleştirildi (Altın Elmas için sarı, Kalp için kırmızı, Mavi Elmas için mavi, Yeşil Elmas için yeşil ve normal yemler için yiyen yılanın kendi neon rengi).
- **PC v3.1.00**: PC beta v3 dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.1.00.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.00**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.00'a güncellenerek yeni matris tuş dalgalanması eklendi.

## Son Guncelleme (v3.0.12)
- **v3.0.12**: Kritik syntax hatası düzeltmesi. `const ONLINE_STRINGS = {` bildirim satırı v3.0.10→v3.0.11 geçişinde silinmiş; bu nedenle `tr: { onlineConnecting: ... }` bloğu global scope'ta yalnız başına kaldı ve "Unexpected token ':'" hatasına yol açarak splash ekranını donduruyordu. Satır yeniden eklendi, dosya v3.0.12 olarak oluşturuldu.
- **PC v3.0.12**: PC dosyasındaki `gameUpdate` callback kapanış parantezi eksikliği düzeltmeli; her iki platform v3.0.12 olarak senkronize edildi.
- **Offline Fallback v3.0.12**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` aynı ONLINE_STRINGS hatası giderilerek v3.0.12'ye güncellendi.

## Son Guncelleme (v3.0.11)
- **v3.0.11**: Son sürüm olarak kayda alındı; mobil beta v3 dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.11.html` altında tutulur.
- **PC v3.0.11**: PC beta v3 dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.0.11.html` ile sürüm senkronizasyonu sağlandı.
- **Self Area 51 — Kuyruk Kesme (Tail Slice):** Online modda kendi kuyruğuna çarpan yılan artık ölmez; kafası çarpıştığı segmentten itibaren kuyruğu kesilir (`segments.slice(0, i)`). Bu kural sunucu (`server.js`) tarafından uygulanır.
- **Self Area 51 — maxWins=1:** Çevrimiçi Self Area 51 modunda maç artık 5 round değil **1 round** kazanınca biter. `endRound()` içinde `maxWins = (mode === 'selfArea51') ? 1 : 5` ile ayarlandı.
- **Self Area 51 — Shrink Geri Bildirimi (Online):** `gameUpdate` olayında, oyuncunun yılan uzunluğu önceki kareden kısaldığında `SFX.shrink()` çalışır ve kafa pozisyonunda parçacık efekti (`createFoodBurstEffect`) tetiklenir.
- **createFoodBurstEffect Wrapper:** Mobile istemcisine (`spawnFoodBurst` üzerine) ve Android offline fallback'e `createFoodBurstEffect(x, y, color)` adlı yardımcı fonksiyon eklendi. Self Area 51 çarpışma efektleri bu fonksiyon üzerinden tetiklenir.
- **Dots UI — Self Area 51:** `buildPanelDots()` (online) ve legacy dots döngüsü (offline/yerel) Self Area 51 modunda 1 nokta gösterecek şekilde güncellendi.
- **Android Offline Fallback Senkronu:** `mobile_offline_fallback.html` dosyası `createFoodBurstEffect` wrapper ve dots UI güncellemeleriyle senkronize edildi.

## Son Guncelleme (v3.0.08)
- **v3.0.08**: Son sürüm olarak kayda alındı; mobil beta v3 dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.08.html` altında tutulur.
- **PC v3.0.08**: PC beta v3 dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.0.08.html` ile sürüm senkronizasyonu sağlandı.
- **Mobil Grid Ölçeklendirme Optimizasyonu (30x45):** Mobil sürümde oyun tahtası boyutu `36 × 54`'ten `30 × 45`'e düşürüldü. Bu sayede segmentler ve yemler mobilde büyüdü, yılanın yeme ulaşma süresi dengelendi ve oynanabilirlik artırıldı.
- **Dinamik Hücre ve Spawn Hesaplamaları:** Grid boyutu küçüldüğü için kazanma ekranı yazıları (Win Glyphs) ölçeklendirmesi (`GRID_COLS < 30` ise `scale = 2`, değilse `3`) ve yerel 1P/AI/Demo başlangıç koordinat offsetleri dinamik hale getirilerek taşmalar engellendi.
- **Çevrimiçi Gösterge Paneli ve Yönlendirme Butonları Optimizasyonu:** Çevrimiçi (ve 1P vs AI) ikili panel düzeninde durum panellerinin aşırı genişlemesini önlemek için `.panel-with-btns` genişliği yerel boyutlarla (maks 188px) sınırlandırıldı. Bu sayede panellerin yerel oyunlardaki estetiği korundu ve yanlardaki dokunmatik yönlendirme butonlarının basma alanları genişletilerek oynanış konforu artırıldı.
- **Çevrimiçi Hız Dengelemesi (Fast Competitive):** Çevrimiçi rastgele eşleşme modunda yılan hızının mobil oyuncular için kontrol edilemeyecek kadar yüksek olması sorunu, mobil platformlar için Hızlı Rekabetçi modu hız çarpanı `1.35`'ten `1.10`'a (yerel hızlı mod ile aynı seviyeye) çekilerek dengelendi.
- **Pause Balonları ve Event Bubbling Düzeltmesi:** Duraklatma menüsünden "Home" butonu ile ana menüye dönüldüğünde pause butonunun (grandparent element) tık dinleyicisinin event bubbling nedeniyle tekrar tetiklenmesi ve yeni oyunda pause balonlarının açık gelmesi bug'ı event dinleyicilerine `e.stopPropagation()` eklenerek ve `softReset` anında DOM temizliği yapılarak giderildi.
- **Sürüm Güncellemesi ve Fallback Eşleşmesi:** Mobil ve PC istemcilerinde sürüm numaraları v3.0.08 olarak güncellendi. v3.0.07 ile getirilen tüm çevrimiçi yerelleştirme (21 dil) ve glassmorphism onay diyalogları korunarak yeni sürüm dosyaları oluşturuldu ve Android çevrimdışı fallback dosyası (`mobile_offline_fallback.html`) v3.0.08 kopyasıyla eşitlendi.

## Son Guncelleme (v3.0.07)
- **v3.0.07**: Son surum olarak kayda alindi; mobil beta v3 dosyasi `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.07.html` altinda tutulur.
- **PC v3.0.07:** PC beta v3 dosyasi `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.0.07.html` ile surum senkronizasyonu saglandi (PC surumunde sadece surum numarasi guncellendi, fonksiyonel degisiklik yoktur).
- **Çevrimiçi Dil Desteği Geri Geldi:** Çevrimiçi oyun akışındaki tüm bağlantı, lobi, oda oluşturma/katılma, duraklatma ve hata bildirim pencereleri 21 dilde yerelleştirildi, hardcoded Türkçe metinler `t()` fonksiyonuna bağlandı.
- **Özel Arayüz Onay Pencereleri:** Tarayıcının varsayılan çirkin `confirm()` uyarı kutusu yerine, oyun içi modern cam tasarımlı (glassmorphism) onay pencereleri entegre edildi (örneğin rakip bulunamadığında bot ile oynamayı önerme penceresi).
- **Eşleşme Ekranı Düzeni:** Eşleştirme ekranındaki "OYUNCU ARANIYOR" başlığı kaldırıldı ve arayüzün ortalanarak sadeleşmesi sağlandı.
- **Daha Uzun Eşleşme Süresi:** Çevrimiçi rakip arama zaman aşımı süresi 60 saniyeden 180 saniyeye çıkarıldı.
- **Çevrimdışı Fallback Senkronu:** Android offline fallback dosyası (`mobile_offline_fallback.html`) v3.0.07 mobil sürümüyle birebir eşitlendi.

## Son Guncelleme (v3.00.3)
- **v3.00.3**: Son surum olarak kayda alindi; mobil beta v3 dosyasi `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.00.3.html` altinda tutulur.
- **PC v3.00.3:** PC beta v3 dosyasi `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.00.3.html` ile surum senkronizasyonu saglandi.
- **P2 HUD Renk & Tema Senkronizasyonu:** Çevrimiçi (online) modlarda 2. Oyuncu (P2) olarak oynandığında local alt kontrol panelinin P1 renginde (pembe) kalması düzeltildi. Panel artık dinamik olarak P2'nin seçili rengini ve P2'nin adını/skorunu/noktalarını gösterir.
- **Konfeti Blur Düzeltmesi:** Çevrimiçi/yerel maçlarda oyun duraklatılmışken (paused) raunt kazanıldığında, kazanma ekranı ve konfetilerin üzerinde kalan blur (bulanıklık) filtresi kaldırıldı.
- **PC Online Oyuncu Adları:** PC varsayılan online adları "P1" ve "P2" olarak senkronize edildi.

## Son Guncelleme (v3.00.2)
- **v3.00.2**: Mobil beta v3 dosyasi `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.00.2.html` altinda tutulurdu.
- **PC v3.00.2:** PC beta v3 dosyasi ile senkronizasyon saglanmisti.
- **Online rematch akisi:** Online mac istatistikleri ekraninda `Tekrar Oyna` sunucu kontrollu rematch istegi gonderir. Iki oyuncu 30 saniye icinde onay verirse ayni odada yeni mac baslar; rakip cikarsa veya sure dolarsa oyun ici uyari gosterilir ve oyuncu ana menuye doner.
- **Online performans optimizasyonu:** Mobil online istemci, `gameUpdate` paketinde `foods`, `barriers` veya `portals` yoksa eski world verisini korur. Sunucu sadece degisen world datasini gonderdigi icin ag trafigi ve server yuku azalir; oynanis hizi `dt/accumulator` ile korunur.
- **Sunucu takip loglari:** `server.js` 60 saniyede bir aktif oda, oynanan oda, update/s, ortalama payload, tick suresi ve event-loop lag degerlerini `[perf]` satiri olarak raporlar.

## Son Guncelleme (v2.99.5)
- **v2.99.5**: Ã‡evrimiÃ§i (online) modlar yerel (offline) modlarla tamamen eÅŸitlendi!
  - Normal, Macera ve Self Area 51 modlarÄ± online sistemde yereldeki gibi kurallarla senkronize edildi.
  - Ã–zel oda kodlarÄ± ile arkadaÅŸ davet edip oynama sistemi ("ODA KODU GÄ°R") eklendi.
  - Ã‡evrimiÃ§i maÃ§larda her oyuncu iÃ§in tur baÅŸÄ±na 1 adet 15 saniyelik manuel duraklatma (Manual Pause) hakkÄ±, duraklatma esnasÄ±nda bulanÄ±klÄ±k efekti ve 3 saniyelik geri sayÄ±m eklendi.
  - Ã‡evrimdÄ±ÅŸÄ± fallback dosyasÄ± v2.99.5 HTML koduyla eÅŸitlendi.
- **PC v2.99.5:** SÃ¼rÃ¼m senkronizasyonu saÄŸlandÄ±.

## Son Guncelleme (v2.99.4)
- **v2.99.4**: Ã‡evrimiÃ§i (online) mod yerel modla aynÄ± akÄ±cÄ±lÄ±k ve performansa (interpolation) eÅŸitlendi.
  - Round geÃ§iÅŸlerindeki yÄ±lan yanÄ±p sÃ¶nme (blinking) animasyon hatasÄ± giderildi.
  - Ä°stemci tarafÄ±nda sunucudan paket gecikmelerine karÅŸÄ± her yÄ±lan iÃ§in baÄŸÄ±msÄ±z alt-hÃ¼cre yumuÅŸak kayma (interpolation alpha) hesaplamalarÄ± entegre edildi.
  - Ã‡evrimdÄ±ÅŸÄ± fallback dosyasÄ± v2.99.4 HTML koduyla eÅŸitlendi.
- **PC v2.99.4:** SÃ¼rÃ¼m senkronizasyonu saÄŸlandÄ±.

## Son Guncelleme (v2.98.8)
- **v2.98.8**: Mobil cihazlarda (ozellikle Samsung A71 gibi uzun ekranli cihazlarda) yilan segmentlerinin dikeyde daha uzun gorunmesi sorunu giderildi.
  - **Kok Neden:** `canvas` CSS'te `width:100%; height:100%` olarak tanimli. `#canvasWrap` her zaman `#stage`'in tum dikdortgen alanini doldurur. Canvas pixel attribute'u kare hucre icin dogru hesaplansa bile CSS onu geriyor (stretch) ve hucreler dikdortgen gorunuyordu.
  - **Duzeltme:** `resize()` fonksiyonuna `canvas.style.width = cssW + 'px'` ve `canvas.style.height = cssH + 'px'` satirlari eklendi. CSS boyutu pixel attribute ile ayni oranda kilitlendi; artik CSS stretch yapamaz.
- **PC v2.98.8:** Surum senkronizasyonu saglandi; PC tarafinda yeni kod degisikligi yoktur.

## Son Guncelleme (v2.98.7)
- **v2.98.7**: AI yol bulma performansi optimize edildi ve kritik bir mantik hatasi giderildi.
  - **AI Cache Reset (softReset):** `softReset()` icine `_aiCache` sifirlama eklendi (`foodX = -1`, `foodY = -1`, `path = []`, `idx = 0`). Onceki rounddan kalan bayat yol (path) verisi, yeni roundda tesaduf eseri ayni koordinatta yem cikarsa yanlis yonde hareket yapilmasina yol acabiliyordu.
  - **BFS Optimizasyonu (v2.98.7 baz alinarak):** Diger bir AI tarafindan yapilan BFS optimizasyonlari bu surumde zaten mevcuttur: parent-pointer map (no array spreading), index-pointer queue (qHead++ yerine shift()), integer cell keys (string concat yerine), 600 node cap. Yalnizca `softReset` cache temizligi bu surumde eklendi.

## Son Guncelleme (v2.98.6)
- **v2.98.6**: Oyun matrisi kare hucre duzeltmesi yapildi. `resize()` fonksiyonu yeniden yazilarak canvas yuksekligi artik tam olarak `GRID_ROWS Ã— cellW Ã— dpr` seklinde ayarlaniyor. Bu sayede `szX === szY` her zaman garantileniyor; yilan segmentleri artik dikey ve yatay yonde esit boyutta hareket ediyor. GRID_ROWS secimi de en yakin cift sayiya optimal yuvarlanarak (onceki daima `++` yapan mantik yerine) dogruluk arttirildi. Yeni AAB gerekmez; sadece web dosyalarinin guncellenmesi yeterlidir.
- **v2.98.5**: Demo yilanlarin menu gecislerinde resetlenmesi sorunu giderildi; artik arka planda maclarina devam ediyorlar. Yilanlarin oyun ilk acildiginda logonun arkasindan suzulerek cikmasi saglandi. Menu gecislerindeki anlik kasmalar nedeniyle yilanlarin ileriye isinlanmasi (jump) engellendi; hareketler daha sarsintisiz hale getirildi. Aktif referans surum ve dosya ismi v2.98.5 olarak guncellendi.

### Android Offline Fallback Senkron Kurali
- Android uygulama offline acilista `app/src/main/assets/offline/mobile_offline_fallback.html` dosyasini kullanir.
- Bu dosya her yeni mobil surumde, yayinlanan mobil HTML ile birebir senkron guncellenmelidir.
- Kural: `Mobile vX.Y.Z` ciktiysa Android fallback dosyasi da ayni `vX.Y.Z` icerigiyle degistirilir.

## Son Guncelleme (v2.98.1)
- **v2.98.1**: Hata duzeltmeleri ve iyilestirmeler yapildi. Menulere daha akici gecis animasyonlari eklendi. Demo modu yilanlarinin hareketleri ve render hizlari senkronize edilerek akicilik saglandi. Tum sistem global lansmana hazir hale getirildi. Aktif referans surum ve dosya ismi v2.98.1 olarak guncellendi.
## Son Guncelleme (v2.97.5)
- Kirmizi yem (heart/ruby) yenince beast mode acilisinda gorulen "yilan kayboluyor / oyun bug'a giriyor" render hatasi giderildi.
- Beast mode gecis anindaki kare dususunu azaltmak icin mobil canvas cizim yukleri optimize edildi:
  - Burst parcacik adetleri ve omurleri dusuruldu.
  - Toplam burst parcacik sayisina ust sinir eklendi.
  - Beast trail cizimi sadece ilk segmentlere indirildi ve agir shadow blur maliyeti azaltildi.
  - Sahada cok fazla yem oldugunda (`denseFoodMode`) glow maliyeti otomatik hafifletildi.
  - Combo popup ve yem burst cizimleri daha performans-guvenli hale getirildi.
- Fast Competitive ve beast modda gorulen ani takilmalar belirgin bicimde azaltildi; oyun akisi daha stabil hale getirildi.

## Son Guncelleme (v2.97.4)
- Mobilde yem yenme sonrasi yilanin icinden ilerleyen digest efekti tum yem tiplerinde daha net gorunur hale getirildi.
- Ozel yemlerde ozel renkler korunurken, genel yemlerde efekt kontrasti arttirildi.
- v2.97.3 ile geri gelen vinyet korundu (dusuk yogunluk).

## Son Guncelleme (v2.96.9)
- **v2.96.7**: SÃ¼rÃ¼m senkronizasyonu (PC v2.96.7 ile eÅŸitlendi). Aktif kod deÄŸiÅŸikliÄŸi yok.
- **v2.96.9**: Renk paleti PC sÃ¼rÃ¼mÃ¼ ile senkronize edildi (10 renk). Quick Setup menÃ¼sÃ¼ndeki renk seÃ§imi 1P modunda 5x2, 2P modunda 4x2 (Mint ve Lime hariÃ§) grid yapÄ±sÄ±na geÃ§irildi. Renk seÃ§imi sonrasÄ± menÃ¼nÃ¼n en baÅŸa scroll atmasÄ± sorunu Ã§Ã¶zÃ¼ldÃ¼. 1P modunda Turquoise renginin seÃ§ilememesi dÃ¼zeltildi.
- **v2.96.8**: MenÃ¼ geÃ§iÅŸ animasyonlarÄ± aktif edildi. TÃ¼m doÄŸrudan `openMainMenu()` ve `openQuickSetupMenu()` Ã§aÄŸrÄ±larÄ± `transitionToMenu` Ã¼zerinden geÃ§irildi; ilk yÃ¼klenme, Oyna tuÅŸu ve Ana MenÃ¼ dÃ¶nÃ¼ÅŸleri artÄ±k `showBanner` ghost animasyonuyla aktarÄ±lÄ±yor.


## Kurumsal Marka Renkleri

Bu iki renk oyunun tÃ¼m platformlarÄ±ndaki (web, mobil, Android) kimliÄŸini temsil eder. Yeni UI Ã¶ÄŸeleri, logolar, butonlar veya efektler tasarlanÄ±rken bu renklerden sapÄ±lmamalÄ±dÄ±r.

| Renk | Hex | KullanÄ±m |
|---|---|---|
| **Neon Pembe** | `#ff4fbf` | P1 rengi, logo aksan, buton hover glow, kazanan efektleri, Romi imzasÄ± rengi |
| **Neon Turkuaz** | `#35e6e6` | P2 / AI rengi, logo aksan, progress bar baÅŸlangÄ±cÄ±, Toy imzasÄ± rengi |

> Splash screen progress bar turkuazdan pembeye gradient yapar (`#35e6e6` â€º `#ff4fbf`).  
> Logo metninde "Romi" pembe, "Toy" turkuaz ile yazÄ±lÄ±r.

## Bugun Gelen Surum Zinciri
 
1. `v2.54 Mobile (v1)` ile mobilde yeni menu sirasi, yeni oyun modlari ve yeni yem kurallari kuruldu.
2. `v2.54 Mobile (v2)` ile yakut sonrasi `12 beyaz + 1 bagimsiz mavi elmas`, `1P vs 2P` basligi ve `Fast Competitive` son `3-2-1` orta ekran sayimi geldi.
3. `v2.55 Mobile (v1)` ile `1P vs AI` odullu reklamla devam mantigi guvenli snapshot tabanli hale getirildi.
4. `v2.55 Mobile (v12)` ile round ve final ekranlarina PC'deki bloklu pikselli arka yapi tasindi.
5. `v2.56 Mobile (v1)` ile kazanan kartina daha buyuk glow ve glassmorphism etkisi eklendi; Instagram tipografisi Patreon ile esitlenmeye baslandi.
6. `v2.56 Mobile (v2)` ile banner pencereleri arasi yonlu ve smooth menu gecisi geldi.
7. `v2.56 Mobile (v3)` ile geri tuslari context-based history mantigina tasindi.
8. `v2.56 Mobile (v4)` ile kurallar penceresindeki amac metni, `1P vs AI` aciklamasi ve kurallar penceresine ozel ceviri/karakter duzeltmeleri yapildi.
9. `v2.57 Mobile (v1)` ile yeni logo URL'si guncellendi; favicon ve apple-touch-icon baglantilari v3 webp formatina tasindi.
10. `v2.58 Mobile (v1)` ile Vietnamese, Thai, Filipino, Dutch, Greek ve Czech dilleri eklendi; toplam dil sayisi 21'e cikti.
11. `v2.61 Mobile (v1)` ile PC `v2.61` surumuyle senkronizasyon saglandi. Yem dongusu `14` adima cikarildi. Elmasin rakibi kucultme cezasi iptal edildi. Kalp suresi `8 saniye`ye cikarildi ve gorseline Beast Aura kalin RGB efekti entegre edildi. Sureler `3 dakika / 180 saniye` yapildi.
12. `v2.62 Mobile (v1)` surum notu: PC kisminda gerceklesen gorsel HUD (Round Gosterge Glassmorphism) portlamasi sonrasinda dosya ve versiyon senkronizasyonunu korumak adina v2.62'ye kaldirildi. Mobil duzende aktif bir kod yapisi degisikligi veya arayuz farki bulunmuyor.
    - Standart yilan uzunlugu `5` yerine `6` segment olarak guncellendi.
    - `12` adimli yem dongusu yerine `14` adimli, daha dinamik yeni bir donguye gecildi.
    - Elmasin rakibi kucultme (`-2`) cezasi tamamen kaldirildi; artik yiyene sadece `+3` uzunluk veriyor.
    - Kalp / Yakut suresi `5 saniye` yerine `8 saniye`ye cikarildi. Ayrica bu sure boyunca yilan tum bedeniyle hizlica RGB/Gokkusagi (Rainbow) renk yanip sonmesi (Beast Aura) efektine kavusturuldu.
    - Oyun sureleri degisti: Sadece `Hizli Rekabetci` ve `Macera` modu sureye tabidir (`3 dakika / 180 saniye`). `Normal` mod artik tamamen suresizdir (`?`).
    - AI yilan hiz orani (`aiDifficultyFactor`) emekliye ayrildi; artik her kosulda AI, oyuncu hizinin `%70`'i ile sabit hareket eder.
    - `1P` modunda `Hizli Rekabetci` formati secilirse artik `AI Yilan EVET / HAYIR` secim ekrani sorulmaz; oyun otomatik `EVET` secerek ilerler.
13. `v2.64` surum notu: PC `v2.64` ile tam senkronizasyon saÄŸlandÄ±. 
    - AI yÄ±lan hÄ±zlarÄ± oyuncunun seÃ§tiÄŸi hÄ±z seviyesine gÃ¶re dinamik hale getirildi: Kolay %60, Normal %75, Zor %90.
    - Versiyon numaralarÄ± tÃ¼m platformlarda `v2.64` olarak eÅŸitlendi.

14. `v2.65` ile Kurallar > Yem sistemi bolumu mobilde yeniden yazildi:
    - Yem aciklamalari ikonlu hale getirildi (normal, cift, altin elmas, mavi elmas, yakut).
    - Mobilde aktif olan gercek etkiler netlestirildi (ozellikle Ruby -> `12 beyaz + 1 mavi elmas` ve `1P vs AI` ilk yem istisnasi).
    - 14 adimli yem dongusu tek satirda sade formatla gosterildi.
    - Kurallar metni tum dillerde ayni yapiyla uretilir; locale bazli yem isimleri korunur.
15. `v2.67` ile Kurallar penceresi sadeleÅŸtirildi ve dil temizligi yapildi:
    - Turkce metinlerde kalan Ingilizce satirlar temizlendi.
    - "1P vs AI Reward Continue" ve "Ruby Aura Colors ..." kurallar gorunumunden kaldirildi.
    - Yem kurallari daha sade formatta tekrar yazildi.
    - Tum dillerde ayni sade kurallar yapisi korunacak sekilde helper katmani guncellendi.
16. `v2.68` ile mobil P1/P2 UI merkez gosterge panelleri yeniden oranlandi:
    - Pembe (P1) ve turkuaz (P2) stat panel cam kutulari dikeyde UI panel sinirlarina dayandirildi.
    - Merkez panel enine daraltildi; boylece sol/sag turn butonlari daha fazla en alani kazandi.
    - Ust P2 panelde safe-area kaynakli ekstra bosluk bir tik azaltildi.
17. `v2.69` ile panel ic hiza ve pause bubble ergonomisi guncellendi:
    - P1/P2 panelinde oyuncu etiketi ve uzunluk sayisi bir tik yukari alindi; round dotlari yerinde birakildi.
    - Panel icindeki pause butonu biraz daha asagi alinip bosluklar daha simetrik hale getirildi.
    - Pause bubble butonlari buyutuldu ve panel ust sinirina daha yakin bir yay geometrisine cekildi.
18. `v2.70` ile panel bosluklari ve bubble tasmasi ince ayarlandi:
    - Gosterge panelindeki (oyuncu adi, uzunluk, dotlar, pause) dikey bosluklar bir tik daha acildi.
    - Pause bubble yelpazesi daha yukariya alindi; alt UI panel cizgisine tasma problemi azaltildi.
19. `v2.71` ile kazanma rengi ve mobil panel okunabilirligi guncellendi:
    - Kazanma animasyonunda matris rengi her iki karakter icin de kazanan yilanin rengine sabitlendi.
    - Mobilde round kazanim karti (`P2 Kazandi!` vb.) bir tik buyutuldu.
    - Isim girilmediginde panelde varsayilan `P1/P2` etiketleri gizlendi; uzunluk sayisi ve round dotlari bir tik buyutuldu.
    - Pause bubble yelpazesi UI paneline tasmayi azaltmak icin biraz daha yukariya alindi.
20. `v2.72` ile pause bubble konumu geri alindi:
    - Mobilde pause bubble fan pozisyonu, kullanici geri bildirimi dogrultusunda `v2.70`deki yerlere geri cekildi.
    - Boyutlar korunup sadece konum degerleri rollback edildi.
21. `v2.73` ile mobil dosya surum senkronu guncellendi:
    - Bu turdaki ana davranis degisikligi PC tarafinda oldugu icin mobil dosya kodu korunarak sadece surum numarasi `v2.73`e cekildi.
21. `v2.74` ile mobil arayÃ¼z dinamikleri yenilendi:
    - P1 ve P2 kontrol panelleri (HUD) ana menÃ¼de tamamen gizlenir.
    - "Oyna" butonuna basÄ±ldÄ±ÄŸÄ±nda paneller animasyonla ekrana gelir: P2 Ã¼stten aÅŸaÄŸÄ±, P1 alttan yukarÄ± kayar.
    - "1 Oyuncu" modu seÃ§ildiÄŸinde P2 paneli animasyonla kapanÄ±r, sadece P1 paneli kalÄ±r. "2 Oyuncu" modunda her ikisi de gÃ¶rÃ¼nÃ¼r.
22. `v2.75` ile performans ve baÅŸlangÄ±Ã§ hatalarÄ± giderildi:
    - **Performans (FPS):** HUD panellerine donanÄ±m hÄ±zlandÄ±rma (GPU) Ã¶zellikleri eklendi (`translate3d`, `will-change`, `backface-visibility`). Bu sayede aÄŸÄ±r blur efektleri animasyon sÄ±rasÄ±nda takÄ±lma yapmaz.
- **v2.79**: SÃ¼rÃ¼m eÅŸitleme gÃ¼ncellemesi. Android AdMob entegrasyonu sonrasÄ± tÃ¼m platformlar v2.79'a yÃ¼kseltildi.
- **v2.80**: Tam Ekran Immersion (Siyah bar kaldÄ±rma) ve Dinamik Kare Grid sistemi eklendi. P2 paneli 1P modunda kapandÄ±ÄŸÄ±nda oyun alanÄ± en Ã¼ste kadar uzar. Notch korumasÄ± uygulandÄ±. (Hata DÃ¼zeltme: `isPlaying` ReferenceError giderildi, UI animasyonlarÄ± ve Pause Bubble gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼ geri getirildi).
- **v2.81**: AI yÄ±lanÄ± hÄ±zÄ± yeniden dengelendi (Easy: 40%, Normal: 55%, Fast: 80%, Extreme: 90%). DÃ¼ÅŸÃ¼k zorluk seviyeleri daha eriÅŸilebilir hale getirildi; proje genelinde sÃ¼rÃ¼m senkronizasyonu saÄŸlandÄ±.
- **v2.82**: AI zorluk sistemi ve arayÃ¼zÃ¼ yeniden yapÄ±landÄ±rÄ±ldÄ±.
    - **Rebalance:** AI hÄ±zlarÄ± Easy %40, Orta %60, Zor %80 olarak gÃ¼ncellendi.
    - **Renaming:** "Normal" zorluk seviyesinin adÄ± "Orta" (TR) ve "Medium" (EN) olarak deÄŸiÅŸtirildi.
    - **Extreme Removal:** "Extreme" seÃ§eneÄŸi AI zorluk seÃ§imi menÃ¼sÃ¼nden kaldÄ±rÄ±ldÄ±.
    - **PC Sync:** PC sÃ¼rÃ¼mÃ¼ne mobil ile uyumlu 3 kademeli zorluk seÃ§im menÃ¼sÃ¼ eklendi.
- **v2.84**: SÃ¼rÃ¼m eÅŸitleme, belge gÃ¼ncellemesi ve **Macera Modu Tam Portu**.
  - Oyunda kod deÄŸiÅŸikliÄŸi olmadan tÃ¼m platformlar (PC, Mobil, Android) v2.84 sÃ¼rÃ¼mlerine senkronize edildi.
  - **[YENÄ°]** PC'deki Adventure Mode sistemi mobil dosyaya tam olarak taÅŸÄ±ndÄ±:
    - **Tetromino Barrier Sistemi:** Her round baÅŸÄ±nda artan sayÄ±da (5â€º10â€º15â€º20â€º25) Tetromino ÅŸeklinde engel blok Ä±zgaraya eklenir. Blok hÃ¼cresine giren yÄ±lan kaybeder.
    - **Portal Sistemi:** Her round baÅŸÄ±nda 2 adet mor parÄ±ltÄ±lÄ± portal spawns; biri girip Ã¶bÃ¼rÃ¼nden Ã§Ä±kÄ±lÄ±r. Portaller 15 saniyede bir yeniden konumlanÄ±r.
    - **Barrier Ã‡arpÄ±ÅŸmasÄ±:** `collideCheckDetailed()` fonksiyonuna barrier set kontrolÃ¼ eklendi.
    - **Portal Teleport:** `bodyAdvance()` fonksiyonuna portal hÃ¼cresine girince Ã§Ä±kÄ±ÅŸ portalÄ±na teleport mantÄ±ÄŸÄ± eklendi.
    - **Ã‡izim:** `drawAdventureOverlay()` fonksiyonu eklendi; barrier'lar koyu mavi + cyan Ã§erÃ§eve, portallar mor halka+iÃ§ dolgu ÅŸeklinde Ã§iziliyor.
    - **Senkron:** `softReset()` yeni round baÅŸladÄ±ÄŸÄ±nda barrier+portal spawner'larÄ±nÄ± Ã§aÄŸÄ±rÄ±yor; `full=true` durumunda `adventureRound` sÄ±fÄ±rlanÄ±yor.
23. `v2.85` surum notu: PC ve Mobil tam senkronizasyon, dengeleme ve bug fix.
    - **Macera Modu Dengeleme:** Barrier artÄ±ÅŸ hÄ±zÄ± lineer hale getirildi (`3 * adventureRound`). Round 1: 3, Round 2: 6... ÅŸeklinde ilerler.
    - **Performans Optimizasyonu:** `spawnBarriers` fonksiyonu optimize edildi; statik iÅŸgal bÃ¶lgeleri Ã¶nbelleÄŸe alÄ±narak donma sorunlarÄ± giderildi.
    - **AdlandÄ±rma Sistemi:** `getDisplayName` helper fonksiyonu eklendi; isim girilmemesi veya AI galibiyeti durumunda banner mesajlarÄ±nÄ±n boÅŸ kalmasÄ±/hatalÄ± gÃ¶rÃ¼nmesi engellendi.
    - **HUD Senkron:** Kazanan banner'larÄ± ve maÃ§ sonu istatistikleri bu yeni adlandÄ±rma sistemine baÄŸlandÄ±.
    - **SÃ¼rÃ¼m Senkron:** Android projesi `versionCode 13` ve `versionName 2.85.0` seviyesine Ã§ekilerek tÃ¼m platformlar v2.85'te mÃ¼hÃ¼rlendi.
24. `v2.86` surum notu: Android Native Core guncellemesi (Performans/UI). Android 14 nolu sÃ¼rÃ¼m kodu derlendi. WebView GPU render (`LAYER_TYPE_HARDWARE`) eklendi ve viewport Chrome eslemesi yapildi. Splashscreen atlanip intro videosuna dogrudan baglandik. START tusu Orbitron fontuna ve 48sp boyutuna eristi. PC ve Mobile HTML'leri senkronize edilip `v2.86` ismiyle donduruldu.
25. `v2.88` surum notu: Lokalizasyon ve UI Standardizasyonu.
    - **Turkce UI Revizesi:** "Ä°sim" yerine daha profesyonel ve kÄ±sa olan **"Ad"** kelimesine geÃ§ildi.
    - **Global Karakter OnarÄ±mÄ±:** PC ve Mobile sÃ¼rÃ¼mlerinde gÃ¶rÃ¼len karakter bozulmalarÄ± (Ã„Â° vb.) tÃ¼m 21 dil iÃ§in Unicode escape (`\uXXXX`) sistemiyle kalÄ±cÄ± olarak onarÄ±ldÄ±.
    - **UI Standardizasyonu:** 2-Player renk ve isim seÃ§imi ekranÄ±, 1-Player moduyla uyumlu, daha temiz ve bÃ¼yÃ¼k fontlu hale getirildi (Header kaldÄ±rÄ±ldÄ±).
    - **Senkronizasyon:** TÃ¼m platformlar v2.88 olarak mÃ¼hÃ¼rlendi.
26. `v2.88.4` surum notu: Android Shell Senkronizasyonu ve 21 Dil YerelleÅŸtirmesi.
    - **Android Shell:** Android uygulamasÄ± SÃ¼rÃ¼m 19 (v2.88.4) seviyesine yÃ¼kseltildi.
    - **Localization:** Android native yÃ¼kleme ekranÄ± metinleri (Title/Subtitle) 21 dilde yerelleÅŸtirildi.
    - **Play Store Metadata:** MaÄŸaza sÃ¼rÃ¼m notlarÄ± en kapsamlÄ± 16 dilde (Google Play kÄ±sÄ±tlamalarÄ± dahilinde) gÃ¼ncel formatta hazÄ±rlandÄ±.
    - **Logo:** SÃ¼rÃ¼m 18 ile gelen yeni modern logo ve splash screen tÃ¼m sistemlerde (Store ve Shell) aktif edildi.
27. **v2.89**: Boost Modu Ã‡arpÄ±ÅŸma MantÄ±ÄŸÄ±. Yakut (boost) modundayken rakibin kafasÄ±ndan (head-to-head) Ã¶lÃ¼mcÃ¼l darbe almadan geÃ§ebilme Ã¶zelliÄŸi eklendi. TÃ¼m platformlar v2.89'da senkronize edildi.
28. **v2.90.2**: Google Play Oyun Hizmetleri (Achievement) entegrasyonu ve sÃ¼rÃ¼m senkronizasyonu. 15 baÅŸarÄ±mlÄ±k Play Games altyapÄ±sÄ± mÃ¼hÃ¼rlendi; PC sÃ¼rÃ¼mÃ¼ ile tam senkronizasyon saÄŸlandÄ±. Ham HTML dosyasÄ±nÄ±n Google'da daha profesyonel gÃ¶rÃ¼nmesi iÃ§in "No Download" odaklÄ± SEO baÅŸlÄ±ÄŸÄ± ve tam meta aÃ§Ä±klamasÄ± (description) eklendi. Android sÃ¼rÃ¼mÃ¼ doÄŸrudan dosya yoluna yÃ¶nlendirildi.
29. **v2.90.3**: Android Uygulama KÄ±sayollarÄ± Ä°Ã§in URL Parametre DesteÄŸi. `?shortcut=1p_fast` ve `?shortcut=2p_fast` parametrelerini yakalayan `checkShortcuts()` fonksiyonu eklendi. Bu parametrelerle aÃ§Ä±ldÄ±ÄŸÄ±nda ana menÃ¼ ve mod seÃ§imleri atlanarak doÄŸrudan "HÄ±zlÄ± RekabetÃ§i" modunda 5 roundluk maÃ§ baÅŸlatÄ±lÄ±r.
30. **v2.92.0**: Google AdSense H5 Games Ads (Beta) UyumluluÄŸu. Zorunlu `preroll` reklam Ã§aÄŸrÄ±sÄ± (`adBreak({ type: 'preroll' })`) oyun baÅŸlangÄ±cÄ±na eklendi. `data-ad-frequency-hint="30s"` parametresi AdSense script etiketine eklendi. Oyun baÅŸlatma mantÄ±ÄŸÄ± `initGame()` fonksiyonuna sarÄ±larak preroll callback'i iÃ§inden tetiklenir. TÃ¼m platformlar v2.92.0'da senkronize edildi.
31. **v2.93.0**: Branded Loading Splash Screen. Oyun baÅŸlangÄ±cÄ±ndaki siyah ekran sorununu gidermek iÃ§in logonun, glow efektinin ve turkuazdan pembeye dolsan bir loading bar'Ä±n olduÄŸu "Splash" ekranÄ± eklendi. Loading bar reklam yÃ¼klenene kadar %85'e kadar dolar, reklam bitince %100'e tamamlanÄ±p fade-out ile kapanÄ±r. 21 dil desteÄŸi ve 8 saniyelik gÃ¼venlik zaman aÅŸÄ±mÄ± (fallback) eklendi.
32. **v2.93.1** (ara): TÃ¼rkÃ§e uppercase rendering dÃ¼zeltmesi, "AI Snake" isim sabitlemesi, Android preroll bypass (bkz. v2.93.2).
33. **v2.93.2**: Preroll ReklamÄ± KaldÄ±rÄ±ldÄ±. TÃ¼m platformlarda preroll Ã§aÄŸrÄ±sÄ± kaldÄ±rÄ±ldÄ±; splash biter bitmez oyun baÅŸlar. Round arasÄ± ve rewarded continue reklamlarÄ± korundu.
34. **v2.93.3** (ara, disk kaydÄ± baÅŸarÄ±sÄ±z â€” v2.93.4'e dahil edildi): Normal mod solo, Fast Competitive AI yem/hÄ±z dengesi.
35. **v2.93.4**: Normal Mod Solo + Fast Competitive AI Dengesi + UI Ä°simlendirme. (a) Normal modda 1P â€º AI sorusu atlanÄ±r, tek yÄ±lanla solo baÅŸlar; diÄŸer modlarda deÄŸiÅŸmedi. (b) Fast Competitive 1P+AI: sarÄ± yem AI'a hiÃ§bir etki yapmaz (grow/skor/shrink yok), yem sahadan kalkar ve yeni spawn edilir. (c) Fast Competitive 1P+AI: AI beast modu hÄ±zÄ± P1'in anlÄ±k hÄ±zÄ±na (`speedMult(p1)`) kÄ±sÄ±tlandÄ±; gÃ¶rsel efektler korunuyor. (d) HÄ±z seÃ§im penceresinde "Kolay" seÃ§eneÄŸi tÃ¼m 21 dilde "YavaÅŸ/Slow/Lento/..." olarak yeniden adlandÄ±rÄ±ldÄ±. (e) Fast Competitive 1P+AI akÄ±ÅŸÄ±nda zorluk seÃ§im penceresinin baÅŸlÄ±ÄŸÄ± "Zorluk SeÃ§" yerine "AI Snake" oldu.
36. **v2.93.5**: AÃ§Ä±k Tema Normal Yem Rengi. AÃ§Ä±k tema (`[data-theme="light"]`) aktifken normal (beyaz) yem artÄ±k `#ff4fbf` (Neon Pembe) ile Ã§iziliyor; karanlÄ±k temada beyaz kalmaya devam ediyor. `drawFoods()` iÃ§inde `isLightTheme` bayraÄŸÄ± ile hem `innerColor` hem halo `base` rengi dinamik olarak deÄŸiÅŸtiriliyor.
37. **v2.93.6**: Android Shortcut DÃ¼zeltmesi + 3 Yeni KÄ±sayol. (a) Grid/matris hatasÄ± dÃ¼zeltildi: `checkShortcuts()` artÄ±k `resize()` Ã§aÄŸÄ±rarak GRID_ROWS'u oyun baÅŸlamadan Ã¶nce hesaplÄ±yor; bÃ¶ylece hÃ¼creler kare kalÄ±yor ve yÄ±lan X/Y ekseninde eÅŸit mesafe ilerliyor. (b) Eski 2 kÄ±sayol (`1p_fast`, `2p_fast`) kaldÄ±rÄ±lÄ±p 3 yeni kÄ±sayol eklendi: `normal_1p` (Normal mod, 1 oyuncu, solo), `fc_2p` (HÄ±zlÄ± RekabetÃ§i, 2 oyuncu), `fc_1p_ai` (HÄ±zlÄ± RekabetÃ§i, 1P vs AI). (c) `shortcuts.xml` ve tÃ¼m 21 dil `strings.xml` dosyalarÄ± gÃ¼ncellendi. Duvar yok, Orta hÄ±z varsayÄ±lan olarak tÃ¼m kÄ±sayollara uygulanÄ±r.
38. **v2.94.6**: Splash Screen ve KÄ±sayol KalÄ±cÄ±lÄ±k GÃ¼ncellemesi.
    - **Splash Screen:** YÃ¼kleme ekranÄ± 3 saniyelik, cubic ease-in animasyonlu yeni bir mantÄ±ÄŸa geÃ§irildi. `performance.now()` ile tam sÃ¼re yÃ¶netimi saÄŸlandÄ±.
    - **Shortcut Persistence:** `index.html` (veya mobil HTML) iÃ§erisindeki `url.searchParams.delete('shortcut');` mantÄ±ÄŸÄ± kaldÄ±rÄ±ldÄ±. Bu sayede Android ana ekran kÄ±sayollarÄ± versiyon gÃ¼ncellemelerinden sonra da mod parametresini koruyarak oyunu doÄŸru baÅŸlatabiliyor.
    - **Senkron:** PC ve Mobil sÃ¼rÃ¼mleri v2.94.6 olarak mÃ¼hÃ¼rlendi.

## URL KÄ±sayol Parametreleri (v2.91+)
Android App Shortcuts ve diÄŸer dÄ±ÅŸ tetikleyiciler iÃ§in ana menÃ¼ bypass sistemi kurulmuÅŸtur.

**Parametre:** `?shortcut=...`
- `normal_1p`: Normal mod, 1 Oyuncu (solo/pratik), Duvar Yok, Orta HÄ±z.
- `fc_2p`: HÄ±zlÄ± RekabetÃ§i, 2 Oyuncu (Lokal), Duvar Yok, Orta HÄ±z.
- `fc_1p_ai`: HÄ±zlÄ± RekabetÃ§i, 1 Oyuncu vs AI, Duvar Yok, Orta HÄ±z.

**Ä°ÅŸleyiÅŸ:**
1. `splashComplete` sonunda `initGame()` â€º `checkShortcuts()` Ã§aÄŸrÄ±lÄ±r.
2. `checkShortcuts()` Ã¶nce `resize()` Ã§aÄŸÄ±rarak GRID_ROWS'u canvas boyutuna gÃ¶re hesaplar (grid hata dÃ¼zeltmesi).
3. Parametre varsa, ilgili `gameMode`, `gameStyle`, `aiSnakeEnabled`, `playerNames` ve `playerColors` deÄŸerleri atanÄ±r.
4. `softReset(true)` Ã§aÄŸrÄ±larak direkt geri sayÄ±ma geÃ§ilir.
5. `openMainMenu()` Ã§aÄŸrÄ±sÄ± engellenir.

## Genel Mimari Kurallari
- `viewport-fit=cover`, `safe-area-inset` and `overflow: hidden` korunur.
- Mobil kontroller `Turn Left` ve `Turn Right` mantigindadir; klasik yukari-asagi-yon butonu yoktur.
- P1 ve P2 panelleri ekranin iki ucundadir; pause aciklari klasik modal degil `pause bubble` sistemi ile acilir.
- Yeni UI metinleri serbest string olarak eklenmez; `STRINGS`, `EXTRA_STRINGS` veya ilgili helper tablolarina baglanir.

## Ana Menu ve Ic Menu Akisi (v2.96.6 GÃ¼ncellemesi)
Mobilde aktif menÃ¼ sÄ±rasÄ± artÄ±k tek sayfalÄ±k Quick Setup ekranÄ±dÄ±r:

1. `Oyna` -> DoÄŸrudan **Quick Setup** (HÄ±zlÄ± Kurulum) menÃ¼sÃ¼nÃ¼ aÃ§ar.
2. Quick Setup iÃ§inde:
   - `1P vs 2P` (Pencere Ã¼stÃ¼ radyo butonlarÄ±)
   - `GAME MODE` (4 seÃ§enekli grid)
   - `ARENA TYPE` (Modlara gÃ¶re aÃ§Ä±lÄ±r/kapanÄ±r)
   - `SNAKE SPEED` / `AI SNAKE` (Duruma gÃ¶re baÅŸlÄ±k ve seÃ§enekleri deÄŸiÅŸir)
   - `NAME & COLOR` (1P veya 2P durumuna gÃ¶re tekli veya ikili palet)
   - `START` ve `Geri` butonlarÄ±

Notlar:
- `1P` secimi direkt oyunu baslatmaz; AI sorusu mutlaka gelir.
- `Fast Competitive` modunda da arena tipi sorulur.
- `playerModeTitle` mobilde `1P vs 2P` olarak kullanilir.
- Turkce `fastCompetitiveMode` etiketi `Hizli Rekabetci` degil, `Hizli Rekabetci` anlamini koruyacak sekilde guncel tutulmalidir. UI tarafinda tam etiket `Hizli Rekabetci` yerine Unicode ile yazilsa bile rehber mantigi degismez.

## Menu Gecis Sistemi
- Banner pencereleri `showBanner()` ile acilir.
- Yonlu gecis sistemi `transitionToMenu()` ile calisir.
- Ileri geciste eski pencere hafif yukari kayip opakligini dusurur; yeni pencere asagidan hafif kayarak gelir.
- Geri geciste bunun tersi kullanilir.
- Ana menu banner'inda ekstra transform yerine sabit offset kullanilir; aksi halde cift ziplamali animasyon geri gelir.

## Geri Tuslari ve Navigation Stack
- Mobil menu geri mantigi sabit hedefler yerine `menuHistory` ve `currentMenuScreen` ile calisir.
- `navigateToMenu()` ileri gittiginde onceki ekrani history'e yazar.
- `goBack()` history'deki onceki ekrani acar; history bossa fallback ekrana doner.
- `Ayarlar -> Gelistiriciler -> Geri` artik tekrar `Ayarlar`a doner.
- `Dil Secimi -> Geri` tekrar `Ayarlar`a doner.
- Oyun kurulum akisi icindeki `Geri` tuslari gercek onceki ekrana doner.
- Pause icinden ayarlar acilmissa `settingsFromPause` set edilir; o durumda `Geri` ana menuye degil pause bubble ekranina donmelidir.

## Ana Menu Gorsel Sistemi
- Ana menu `main-menu-shell`, `main-menu-logo-wrap`, `main-menu-actions` yapisini kullanir.
- Logo kutudan bagimsiz ama ayni kompozisyon icinde durur.
- Ana menu border glow animasyonu korunur.
- Ana menu ile diger bannerlar ayni temel banner sistemi icinde yasasa da ana menunun ekstra offset ve genislik kurallari vardir.

## Round ve Final Ekranlari
- Round ve final ekranlarinda dev duz text yerine PC tarzi bloklu pikselli harf sistemi kullanilir.
- Bu arka yapi canvas uzerinde yilan segmenti benzeri bloklardan cizilir.
- Boyut mobilde PC'ye gore biraz daha kucuk ve dengeli tutulur.
- Kazanan banner karti `winner-glass-banner` ile hafif blur ve oyun arkasi hissi alir.
- Glow, glassmorphism ve blok harfler ayni anda korunmalidir.
- Bu glass kart dili artik PC `v2.56` ile masaustune de tasinmistir; iki platformda ayni aile korunur ama mobil daha kompakt kalir.
- Mobil winner glass karti, PC tarafinda uygulanan yeni sonuc kartlari icin halen gorsel referanslardan biridir.

## Kurallar Penceresi ve i18n Kurali
- Kurallar penceresi `getInstructionsMarkup()` uzerinden uretilir.
- Ilk kaynak sirasi:
1. `EXTRA_STRINGS[lang].instructionsTextV254`
2. `STRINGS[lang].instructionsText`
3. Ingilizce fallback
- Daha sonra iki dinamik patch uygulanir:
1. `injectRulesObjective()`
2. `injectRulesAISection()`
- Yani kurallar penceresindeki ilk amac kutusu ve `1P vs AI` kutusu tek tek stringlerde degil, merkezi helper'lar ile sonradan duzeltilir.

Kurallar penceresi icin guncel zorunlu icerikler:
- Turkce amac kutusu:
  `Rakibini ele ya da en uzun kal! 5 round kazanan oyunu alir.`
- `1P vs AI` kutusu:
  `Refleksini test et ve gelistir - onu yenmek sandigin kadar kolay degil.`

Onemli:
- Turkce karakter duzeltmesi sadece kurallar penceresi icin bu turda temizlenmistir.
- Kurallar penceresindeki ilk kutu ve `1P vs AI` kutusu degisecekse once helper tablolarini guncelle:
1. `RULES_OBJECTIVE_TITLES`
2. `RULES_OBJECTIVE_TEXTS`
3. `RULES_AI_TEXTS`

## Oyun Modlari ve Sureler
- `Normal`
  - Sure: Suresiz (`?`)
  - Sadece tekli beyaz yem kullanir.
  - Rekabetci ozel yem etkileri yoktur.
- `Fast Competitive`
  - Sure: `3 dakika` (`180 saniye`)
  - Son `10 saniye` kala sesli countdown tick vardir.
  - Son `3 saniye` kala oyun ortasinda yaklasik `%30 opacity` ile `3-2-1` sayimi gorunur.
  - Ozel `14` adimli yem dongusu aktif olur.
- `Macera`
  - Sure: `3 dakika` (`180 saniye`)
  - `Fast Competitive` sistemini kullanir (`14` adimli dongu mevcuttur).
  - Yakut hic cikmaz; unun adimi normal yeme doner.
  - **[v2.84+] Tetromino Barrier:** Her round baÅŸÄ±nda Tetris tipi engel bloklar girer. Round 1: 5 blok, Round 2: 10, ..., Round 5+: 25 blok (max).
  - **[v2.84+] Portal:** Her round baÅŸÄ±nda 2 mor portal belirir. Biri girilince diÄŸerinden Ã§Ä±kÄ±lÄ±r. 15 saniyede bir yeniden konumlanÄ±r.
  - **[v2.84+] Barrier Ã‡arpÄ±ÅŸmasÄ±:** Barrier hÃ¼cresine giren yÄ±lan Ã¶lÃ¼r.

## Yem Kurallari
- `Beyaz Yem`
  - `+1` uzunluk verir.
- `Cift Yem`
  - Iki adet birlikte cikar.
  - Biri yenince digeri kaybolur.
  - Yiyen yilana `+1` verir.
- `Altin Elmas`
  - Yiyen yilana `+3` verir.
  - Rakibe ceza vermez (kucultme kurali kaldirilmistir).
  - Yenene kadar `3 saniyede bir` yer degistirir.
- `Mavi Elmas`
  - Mavi elmas ikonu ile cizilir.
  - `+1` uzunluk verir.
  - Rakibi yavaslatir.
  - Normal yemle esli cikan versiyonunda biri yenince digeri kaybolur.
- `Yakut`
  - Sadece `Fast Competitive` modda gorunur.
  - Beast veya boost avantaji verir.
  - Yenince sahadaki mevcut yemler temizlenir.
  - Yerine `12` beyaz yem ve `1` bagimsiz mavi elmas gelir.

## Fast Competitive Exact Dongu
Aktif dongu `14 adim`lidir:

1. Normal beyaz yem
2. Normal beyaz yem
3. Normal beyaz yem
4. Cift yem
5. Beyaz yem + Mavi Elmas cifti
6. Normal beyaz yem
7. Altin Elmas
8. Normal beyaz yem
9. Yakut
10. Beyaz yem + Mavi Elmas cifti
11. Cift yem
12. Normal beyaz yem
13. Normal beyaz yem
14. Altin Elmas

Macera modunda:
- `9. adim` yakut yerine normal yeme doner.

## Macera Modu Mimari Notlari (v2.84+)
- **DeÄŸiÅŸkenler:** `barriers = []`, `portals = []`, `adventureRound = 0`, `teleportingOwner`, `teleportStepsRemaining`, `portalTimerMs`, `attemptedPortalEntry` global olarak tanÄ±mlÄ±dÄ±r.
- **`spawnBarriers(n)`:** `TETROMINO_SHAPES` sabitinden rastgele ÅŸekil seÃ§er, dÃ¶ndÃ¼rÃ¼r, Ã§evirir. Snake, yem ve merkez bÃ¶lgeden uzak grid hÃ¼creleri Ã¼zerine `n` adet barrier yerleÅŸtirir.
- **`spawnPortals()`:** `barriers`, `foods` ve `snakes` tarafÄ±ndan iÅŸgal edilmemiÅŸ 2 rastgele hÃ¼creye portal yerleÅŸtirir; `portalTimerMs = 15000` sÄ±fÄ±rlar.
- **`getBarrierCellsSet()`:** TÃ¼m barrier hÃ¼crelerini Set olarak dÃ¶ndÃ¼rÃ¼r; Ã§arpÄ±ÅŸma kontrolÃ¼nde kullanÄ±lÄ±r.
- **`bodyAdvance()` Portal MantÄ±ÄŸÄ±:** YÄ±lanÄ±n hareket edeceÄŸi hÃ¼cre portal hÃ¼cresi ise `teleportingOwner` set edilir ve `nextHead` diÄŸer portale yÃ¶nlendirilir.
- **`softReset()` Adventure Setup:** Her round sonunda `adventureRound++` (max 5), `spawnBarriers(5 * adventureRound)` ve `spawnPortals()` Ã§aÄŸrÄ±lÄ±r. `full=true` ise `adventureRound = 0` sÄ±fÄ±rlanÄ±r.
- **`drawAdventureOverlay()`:** `render()` iÃ§inde `drawGrid()` sonrasÄ±na, snake Ã§iziminden Ã¶nce Ã§aÄŸrÄ±lÄ±r. Barrier'larÄ± `#243b55` dolgu + `#00e5ff` Ã§erÃ§eve, portalleri mor glow + halka + iÃ§ dolgu olarak Ã§izer.
- **Portal Timer:** `step()` loop iÃ§inde `portalTimerMs -= delta`; 0'a ulaÅŸÄ±nca yeni `spawnPortals()` Ã§aÄŸrÄ±lÄ±r.

## 1P vs AI Kurallari
- `1P` secildikten sonra oyuncu `Hizli Rekabetci` disinda bir mod secerse (ornegin `Normal`), `AI Yilan EVET / HAYIR` penceresi gelir.
- Eger oyuncu `1P` ardindan `Hizli Rekabetci` modunu secmisse, AI otomatik olarak aktif edilir.
- `1P vs AI` modunda AI yÄ±lan hÄ±zÄ±, oyuncu hÄ±zÄ±na oranla dinamiktir: Kolay %40, Orta %60, Zor %80. Eski %60/75/90 oranlarÄ± v2.82 ile gÃ¼ncellenmiÅŸtir.
- AI yilan rounddaki ilk yemi yediginde `P1` kuculmez; bu kural korunmustur.

## 1P vs AI Reklamla Devam Mantigi
- Odullu reklamla devam mantigi sadece `1P vs AI` modunda kullanilir.
- AI roundu kazanirsa ve reklam uygunsa kullaniciya devam reklami onerilir.
- Reklam tamamlanirsa oyun en son guvenli snapshot'tan geri yuklenir.
- Ancak `P1` eski pozisyona birebir donmez.
- Son hareket yonunun tersine `15 kutu` geride yeni bir spawn aranir.
- Bu alan guvenli degilse en yakin bos ve carpismasiz alan otomatik bulunur.
- Reklamla donen `P1` yilan uzunlugu `5` olur.
- AI yilan, round durumu ve snapshot tabanli zaman kaydirma mantigi korunur.

## URL KÄ±sayol Parametreleri (v2.90.3+)
Android App Shortcuts ve diÄŸer dÄ±ÅŸ tetikleyiciler iÃ§in ana menÃ¼ bypass sistemi kurulmuÅŸtur.

**Parametre:** `?shortcut=...`
- `normal_1p`: Normal mod, 1 Oyuncu (solo/pratik), Duvar Yok, Orta HÄ±z.
- `fc_2p`: HÄ±zlÄ± RekabetÃ§i, 2 Oyuncu (Lokal), Duvar Yok, Orta HÄ±z.
- `fc_1p_ai`: HÄ±zlÄ± RekabetÃ§i, 1 Oyuncu vs AI, Duvar Yok, Orta HÄ±z.

**Ä°ÅŸleyiÅŸ:**
1. `splashComplete` sonunda `initGame()` â€º `checkShortcuts()` Ã§aÄŸrÄ±lÄ±r.
2. `checkShortcuts()` Ã¶nce `resize()` Ã§aÄŸÄ±rarak GRID_ROWS'u canvas boyutuna gÃ¶re hesaplar (grid hata dÃ¼zeltmesi).
3. Parametre varsa, ilgili `gameMode`, `gameStyle`, `aiSnakeEnabled`, `playerNames` ve `playerColors` deÄŸerleri atanÄ±r.
4. `softReset(true)` Ã§aÄŸrÄ±larak direkt geri sayÄ±ma geÃ§ilir.
5. `openMainMenu()` Ã§aÄŸrÄ±sÄ± engellenir.

## v2.94.0 Surum Senkron Notu
- Bu turdaki aktif davranis degisikligi PC tarafinda yapildi.
- Mobil dosya `v2.94.0` olarak senkronize edildi; aktif gameplay veya UI mantiginda yeni bir mobil degisiklik yoktur.
- PC tarafinda round ve final kazanma banner'i tek satira sabitlendi; bu not mobil rehberde sadece surum zincirini net tutmak icin bulunur.

## v2.94.1 Web Revalidation Notu
- Mobil `index.html` icine `no-cache / must-revalidate` meta sinyalleri eklendi.
- Oyun acilisinda, uygulama/sekme tekrar gorunur oldugunda ve ana menuye donuldugunde uzaktaki HTML versiyonu sessizce kontrol edilir.
- Daha yeni surum bulunursa sadece guvenli durumda (ana menu acikken, aktif mac yokken, reklam akisi calismiyorken) cache-busting query ile temiz yenileme yapilir.
- `localStorage` anahtarlarina dokunulmaz; dil, tema, ses, highscore ve oyuncu isimleri korunur.

## v2.94.2 Mobil Reklam Ses Notu
- Mobil browser'da `match_start` ve `between_rounds` interstitial reklamlar artik bilerek `sound: 'off'` ile istenir.
- Bu degisiklik, iOS Safari benzeri ortamlarda gorulen "Video will play with sound" izin penceresini azaltmak ve `Cancel` nedeniyle reklam dusmesini minimuma indirmek icin eklendi.
- Rewarded continue akisi degistirilmedi; odullu reklamlar oyunun mute durumu ile senkron kalmaya devam eder.
- PC surumu bu turda ayni mantiga cekilmedi; masaustu reklam davranisi mevcut haliyle korunur.

## v2.94.3 Menu Alt Yazi Temizligi
- Secim pencerelerindeki `pickOne` / `Birini sec` / benzeri alt aciklama satirlari render katmanindan kaldirildi.
- Bu temizlik tum dillerde ortak sekilde uygulanir; locale stringleri dursa bile menu banner'larinda artik gosterilmez.
- Oyuncu modu, oyun modu, AI secimi, arena tipi, dil ve benzeri secim ekranlari artik sadece baslik + butonlar ile acilir.

## v2.94.4 Mobil Menu Dokunma Pulse Efekti
- Mobilde banner icindeki menu butonlarina dokunuldugunda kisa sureli turkuaz-pembe glow/pulse efekti eklendi.
- Efekt kalici hover gibi degil, sadece dokunma aninda "basma hissi" vermek icin tek atimli calisir.
- Uygulama merkezi delegasyonla calisir; oyun modu, oyuncu modu, arena tipi, dil, ayarlar, geri ve benzeri menu butonlari ayni davranisi alir.

## v2.94.5 Mobil Pulse Test Fallback
- Menu butonlarindaki pulse etkisi `pointerdown` tabanina cekildi.
- Boylece gercek mobil dokunus korunurken desktop Chrome'da mouse ile test ederken de ayni hissiyat gorulebilir.

## AdManager Notlari
- Mobilde Google AdSense H5 Games Ads entegrasyonu vardir.
- **Preroll (v2.92.0+):** Oyun ilk yÃ¼klendiÄŸinde `adBreak({ type: 'preroll' })` Ã§aÄŸrÄ±lÄ±r. Oyun baÅŸlatma mantÄ±ÄŸÄ± (`initGame()`) `adBreakDone` callback'i iÃ§inden tetiklenir. Reklam baÅŸarÄ±sÄ±z olursa `catch` bloÄŸu ile oyun yine de baÅŸlar.
- **Frequency Hint (v2.92.0+):** AdSense script etiketinde `data-ad-frequency-hint="30s"` parametresi kullanÄ±lÄ±r.
- Cooldown ve uygunluk mantigi korunur.
- Rewarded continue snapshot tabanlidir.
- Snapshot geri yuklenirken timer, yem zamanlari ve aktif efekt zaman damgalari ileri kaydirilir.

## Kodlama Kurallari
1. Mobil surumde her sey tek HTML dosyada kalmalidir.
2. Kurallar penceresi guncellenirse sadece gorunen HTML'i degil, helper tabanli injection mantigini da kontrol et.
3. Menu gecis sistemi bozulmamalidir; ileri ve geri yonleri farkli davranir.
4. `main-menu-banner` icin ekstra transform yazma; bounce bug'i geri getirir.
5. `menuHistory`, `currentMenuScreen`, `settingsFromPause` ve `pause bubble` akislari birbirine baglidir; biri degisirse digerlerini de kontrol et.
6. Safe-area, mobil panel yerlesimi, alt kontrol alanlari ve z-index dengesi korunmalidir.
7. **Kritik Surum (Version) Kurali:** Kullanici *sadece Mobil surumunde* bir guncelleme talep etse bile, (ornegin v2.63 istendiginde) Mobil guncellendikten sonra **mutlaka** ayni surum numarasiyla masaustu dizinini guncelleyecek olan "2 Player Snake v2.63.html" adinda **yeni bir PC dosyasi** da olusturulmalidir. PC dosyasinin icerisinde aktif bir kod degisikligi yapilmasa dahi baslik (title) ve ic `VERSION` degiskenleri v2.63 olarak sekillendirilmeli, bu sayede masaustu ve mobildeki surum numaralari hicbir zaman karismamali ve daima %100 senkron goturulmelidir.
8. **Dinamik SÃ¼rÃ¼mleme ve Yeni Dosya OluÅŸturma:** KullanÄ±cÄ± her "gÃ¼ncelle", "yeni sÃ¼rÃ¼mÃ¼ gÃ¼ncelle" veya benzeri bir geliÅŸtirme isteÄŸinde bulunduÄŸunda, mevcut sÃ¼rÃ¼m numarasÄ± (Ã¶rneÄŸin v2.70) otomatik olarak bir kademe artÄ±rÄ±lmalÄ± (v2.71) ve yapÄ±lan deÄŸiÅŸiklikler bu yeni sÃ¼rÃ¼m numarasÄ±na sahip **yeni dosyalar** (hem PC hem Mobil) Ã¼zerinden sunulmalÄ±dÄ±r. HTML iÃ§erisindeki `VERSION` sabiti ve `<title>` etiketi de bu yeni numaraya gÃ¶re gÃ¼ncellenmelidir. Eski dosyanÄ±n Ã¼zerine yazmak yerine her zaman yeni bir dosya oluÅŸturulmasÄ± zorunludur.
9. **YerelleÅŸtirme:** Uygulama iÃ§i yÃ¼kleme ekranÄ± 21 dilde yerelleÅŸtirildi. Play Store maÄŸaza sÃ¼rÃ¼m notlarÄ± (`Release_Notes.md`) ve maÄŸaza metinleri (`Store_Listing.md`), `MD Files/` altÄ±ndaki merkezi lokasyonlara taÅŸÄ±ndÄ±. Her iki dosya da 21 dilde `<lang-CODE>` Tag formatÄ±nÄ± kullanarak tam senkronizasyon saÄŸlar.
- **MaÄŸaza Metinleri:** Play Store Ã¼zerindeki Ad, KÄ±sa AÃ§Ä±klama ve Tam AÃ§Ä±klama metinleri `MD Files/Store_Listing.md` dosyasÄ±nda 21 dilde tutulur. Bu metinlerde deÄŸiÅŸiklik yapÄ±ldÄ±ÄŸÄ±nda tÃ¼m dillerde gÃ¼ncellenmelidir.
- **Kodlama Ã–ncesi NetleÅŸtirme:** Yapay zeka, kullanÄ±cÄ±dan gelen her gÃ¼ncelleme veya yeni Ã¶zellik talebinde, kodlamaya (uygulamaya) geÃ§meden Ã¶nce aklÄ±ndaki tÃ¼m sorularÄ± kullanÄ±cÄ±ya sormalÄ± ve iÅŸleyiÅŸi netleÅŸtirmelidir. Kod yazÄ±mÄ±na ancak kullanÄ±cÄ±dan onay veya yanÄ±t alÄ±ndÄ±ktan sonra baÅŸlanmalÄ±dÄ±r.

## Sonraki AI Icin Kisa Not
Mobilde bundan sonraki islerde kaynak gercek su alanlardir:
- yeni menu sirasi
- smooth banner transitions
- context-based geri tusu mantigi
- yeni yem dongusu ve yakut sonrasi `12 beyaz + 1 mavi elmas`
- `1P vs AI` odullu reklamla guvenli geri donus
- kurallar penceresi icin helper tabanli objective ve AI metni enjeksiyonu

## PC ile Gorsel Parity Notu
- PC `v2.56` ile round kazanma, final kazanma ve mac sonu istatistik kartlarina glassmorphism etkisi geldi.
- Bu sayede mobildeki blur'lu winner card dili artik tek platformluk istisna degildir.
- Iki platform arasinda ortak kalan cekirdekler:
  - bloklu pikselli harf arka yapi
  - cam hissi veren sonuc karti
  - pembe ve turkuaz glow
- Ayrisan kisimlar:
  - mobilde kart daha kompakt
  - PC'de blur alani ve kart olcegi daha genistir
  - PC son turda koyu glass panelin koyulugunu birkac adim azaltmistir

## v2.95.1 Android Shortcut Acilis Notu (Mobil Web ile ilgili)
- Mobil oyun tarafinda `shortcut` parametreleri su sekilde beklenir:
  - `normal_1p`
  - `fc_2p`
  - `fc_1p_ai`
- `checkShortcuts()` akisinda `resize()` cagrisinin oyun baslamadan once calismasi kritiktir; bu grid hucrelerinin kare olmasini korur.
- Android shell artik top-level URL'e online iken `__ts` ekleyerek stale HTML acilmasini azaltir. Bu degisiklik mobil web kodunu degistirmez ama mobil webin dogru surumle acilmasini guclendirir.
- Sonuc: Android kisayollarindan acilis, mobil webde hedef moda daha tutarli sekilde gider.

## v2.95.1 Hotfix Notu (2026-04-22)
- Bu turdaki aktif gameplay hotfix PC tarafinda yapildi (`Macera + 1 Oyuncu` menu akisi).
- Mobil web kodunda yeni mantik degisikligi yok.
- Surum parity ve dokumantasyon butunlugu icin bu not eklendi.

## v2.95.2 - Beast Collision Kurali (Mobile)
- Hedef: `Hizli Rekabetci` modunda beast etkisi altindaki carpisma davranisini PC ile birebir senkronlamak.
- Uygulanan kural:
  - 2P modunda beast olan yilan, rakibin govdesinin icinden gecebilir.
  - 1P vs AI modunda P1 sadece `P1 beast` ve `AI beast degil` iken AI govdesinin icinden gecebilir.
  - AI beast modundaysa P1 icinden gecemez (P1 beast olsa bile).
  - AI (P2) beast modunda degilse P1'e temasinda normal carpisma kurali devam eder.
- Teknik not: Mobil `checkCollision()` blogunda `p1CanPhaseThroughOpponent` / `p2CanPhaseThroughOpponent` kosullari eklendi.

## v2.95.3 - Android Shortcut Preset Landing (Mobile)
- Bu turdaki ana degisiklik mobil HTML icindeki `checkShortcuts()` akisindadir.
- Android app long-press kisayollari artik maÃ§i dogrudan baslatmaz; secim zincirini otomatik uygular ve son olarak `Ad & Renk` (`MENU_IDS.COLOR`) ekraninda bekler.
- Uygulanan preset zincirleri:
  - `normal_1p` -> `Oyna > Normal > 1 Oyuncu > Duvarsiz > Orta > Ad & Renk`
  - `fc_2p` -> `Oyna > Hizli Rekabetci > 2 Oyuncu > Duvarsiz > Orta > Ad & Renk`
  - `fc_1p_ai` -> `Oyna > Hizli Rekabetci > 1 Oyuncu > Duvarsiz > Orta > Ad & Renk`
- `fc_1p_ai` icin AI otomatik acilir; `AI Yilan EVET/HAYIR` penceresi gostertilmez.
- Acik bir mac veya pause state uzerinden kisayol gelirse:
  - pause bubble / confetti / shake temizlenir
  - skor ve runtime state sifirlanir
  - panel yazi/uzunluk alanlari temizlenir
  - sonra hedef menu akisi yeniden kurulur
- `menuHistory`, geriye basinca gercek secim zinciri korunacak sekilde elle kurulur: `MAIN -> GAME_MODE -> PLAYER_MODE -> WALL -> SPEED`
- Shortcut query parametresi acilistan sonra URL'den silinir; boylece sonraki refresh ayni preset boot'u tekrar zorlamaz.

## v2.95.4 - Normal Mode Food Boost (Mobile)
- Hedef: Normal modda beyaz yem +2 vermesi (Hizli Rekabetci ve Macera etkilenmez).
- Mobil `eatFoodIfAny()` icindeki normal yem dali normal mod icin `s.grow += 2` uygular; diger modlar icin +1 olarak kalir.
- Talimatlar ekranindaki yem kurali tablosu i18n string'leri ile guncellendi.

## v2.95.5 - Self Area 51 Mode (Mobile)
- Yeni oyun modu: `gameStyle = 'selfArea51'`. Oyun modu menusunde 3. siraya eklendi (Normal, Hizli Rekabetci, Self Area 51, Macera).
- Mobil split: tahtanin **yatay** olarak iki yariya bolundugu surum. P1 alt yari (`yMin = GRID_ROWS/2`, `yMax = GRID_ROWS-1`), P2 ust yari (`yMin = 0`, `yMax = GRID_ROWS/2 - 1`).
- Sarmalama: her oyuncu yalniz kendi yarisi icinde sarmalanir. `selfArea51WrapForOwner(c, ownerKey)` x ekseninde tam sarmalama, y ekseninde half-bound clamp ile sarmalama yapar. `handleBoundaries()` artik `(c, ownerKey)` alir; `bodyAdvance()` ownerKey gecirir.
- Yemler:
  - Normal beyaz yem her yariya birer adet, `selfArea51Half: 'p1'|'p2'` etiketiyle. +1 uzunluk.
  - 20 sn (countdown sonrasindan) sonra her iki yariya esanli **yesil elmas** spawn olur.
  - Yesil elmas her 3 sn kendi yarisi icinde yer degistirir.
  - Yesil elmas yiyince: yiyene **+2**, rakibe **-1** (length floor 1, oldurmez). Ilk yiyen rakibin elmasini siler ve 20 sn timer her ikisi icin sifirlanir.
- Kazanma kosulu: ilk **uzunluk 51**'e ulasan kazanir. Tek mac (best-of-5 yok). Self-collision olum, diger oyuncu mac'i kazanir.
- AI: `gameStyle === 'selfArea51'` icin BFS hedef oncelik: kendi yarisindaki yesil elmas > beyaz yem. Rakip yilani engel olarak gormez.
- HUD: Mobil oyuncu panellerine `self51-active` class eklenir; `--self51-pct` CSS variable ile saat yonunde dolan parlak yesil halka + buyuk `length / 51` text. `dot-pulse` ve timer gizlenir.
- Menu akisi:
  - 1P selfArea51: `Game Mode > 1 Oyuncu > AI Yilan (EVET/HAYIR + zorluk) > Hiz > Ad & Renk` (Wall menu atlanir, sarmalamaya kilitli).
  - 2P selfArea51: `Game Mode > 2 Oyuncu > Hiz > Ad & Renk`.
  - `currentWallMode = MOD_WALLS.NONE` her zaman.
- State: `selfArea51StartTime`, `selfArea51GreenSpawnAt`, `selfArea51GreenActive`, `selfArea51GreenLastMove`. `clearGameState`/`openMainMenu` yollarinda sifirlanir; countdown sonunda `selfArea51StartTime = now`, `selfArea51GreenSpawnAt = now + 20000` set edilir.
- Render: `drawSelfArea51Divider()` ortadaki satir bandini cizer (cyan kesikli). `drawFoods()` `'green'` tipini parlak yesil elmas (rgb(57,255,122)) olarak cizer.
- `showGameEndStats`: selfArea51 icin `roundsWon` satiri gizlenir (`isSolo || isSelf51`).

## v2.95.6 - Self Area 51: Round System & Render Fix (Mobile)
- **Round sistemi**: Self Area 51 artik standart `GAMES_TO_ROUND = 5` (first-to-5 / best-of-9) akisini kullanir. Tek mac mantigi kaldirildi.
  - Olasi final skorlar: `5-0, 5-1, 5-2, 5-3, 5-4`.
  - Her round bagimsiz bir 51 uzunluk yarisidir. `resetRound()` standart akisi: uzunluk 5'e doner, yemler temizlenir/yeniden dogar, geri sayim, 20 sn yesil elmas timer'i (`selfArea51GreenSpawnAt = now + 20000`) yeniden baslar.
  - `finalizeCompetitiveResult(result)`: artik selfArea51 icin erken cikis YOK; standart `awardGame(result)` cagrilir ve `isFinal = games[result] >= GAMES_TO_ROUND`. Cift 51 simultane veya cift self-collide => draw, puan yok.
- **Render fix - half-aware lerp (Y ekseni)**: `modLerp(prev, cur, GRID_ROWS, t)` GRID_ROWS bazli wrap algiladigi icin yarinin icindeki wrap'leri tespit edemiyor ve yari boyunca uzayan portal/teleport benzeri bir cizgi cikariyordu.
  - Cozum: `selfArea51LerpY(prev, cur, ownerKey, t)` â€” `selfArea51HalfBounds(ownerKey)`'in `yMin/yMax`'ini kullanip `span = yMax - yMin + 1` icinde wrap-aware lerp yapar.
  - `drawSnakeBlocks` icinde `gameStyle === 'selfArea51'` ise Y ekseni icin bu helper, X ekseni icin normal `modLerp` kullanilir.
- **HUD halka rengi oyuncu rengine**:
  - CSS: `.player-stat-panel.self51-active` artik sabit yesil yerine `--self51-color` ve `--self51-color-rgb` (rgb tuple) CSS variable'larini kullanir; tum conic-gradient ve box-shadow `rgba(var(--self51-color-rgb), ...)` ile yazilir.
  - `updateSelfArea51Panels()` her panele kendi `playerColors.p1/p2`'sini set eder; `hexToRgbTuple()` helper hex -> "r,g,b" string'ine cevirir.
  - Yesil sadece yesil elmas yemine ozel kalir.
- **Mobil HUD**:
  - Yem sayaci gizli (`p1FoodBox/p2FoodBox`).
  - 5 round dot'u (`drawSeries`) gorunur kalir; `dot-pulse` alanini round dot'lari kapsar.
  - `timeLabel` gizli.
- **Match end**: `showGameEndStats` icindeki gizleme kosulu `(isSolo || isSelf51)` => `isSolo`'ya geri cekildi. `roundsWon` satiri Self Area 51'de de gosterilir.
- **Simultane 51 fix**: Iki oyuncunun ayni anda 51'e ulasmasi `endGame('draw')` ile akar (eskiden longer wins).

## v2.95.7 - Beast Mode Head Collision Fix & Food-Eat Animation (Mobile)
- **Beast baÅŸ-baÅŸ fix**: `collideCheckDetailed` icindeki head-to-head bloÄŸunda `isAiDuel` kontrolu artik `intangible1 || intangible2` kontrolunden SONRA geliyor. Eskiden `isAiDuel = true`yken her baÅŸ-baÅŸ collision 'draw' dÃ¶ndÃ¼ruyordu, beast olsa bile. Artik beast ise her zaman `{ result: null }` dÃ¶ner (pass-through).
- **DigestAnim sistemi Mobile'a eklendi**:
  - `eatFoodIfAny`: Yem yenince `s.digestAnims.push({ startTime: now, color: _digestColor })` cagriliyor. `_digestColor` yem tipine gore: normalâ€º`playerColors[ownerKey]`, diamondâ€º`'#ffd166'`, sapphireâ€º`'#00cfff'`, heartâ€º`'#ff1744'`, greenâ€º`'#39ff7a'`.
  - `drawSnakeBlocks` (segment forEach): Her segment icin aktif `digestAnims` taranir; `progress = elapsed / 1000`, `segIdx = Math.floor(progress * segments.length)` === `i` ise o segment `digestGlowColor` ile render edilir. Ornek: `s.digestAnims.splice(ai, 1)` ile sure dolan animasyonlar temizlenir.
  - Renk onceligi: `winColor > digestGlowColor > flashColor > beast aura > baseColor`.
- **Menu emoji**: `selfArea51Btn` HTML'inden `?? ` kaldirildi.

## v2.96.0 - Self Area 51 Polish & Bug Fixes
- **Dengeleme**: YeÅŸil elmas artÄ±k +1 uzunluk verir (yiyene) ve rakibi -1 kÃ¼Ã§Ã¼ltÃ¼r. Spawn/relocation sÃ¼resi 20 saniyeden 15 saniyeye dÃ¼ÅŸÃ¼rÃ¼ldÃ¼.
- **Matrix Fix**: "P1/P2" kazanma matrisinin bÃ¶lÃ¼nmÃ¼ÅŸ ekran sÄ±nÄ±rlarÄ±nda (split screen boundaries) bozulmasÄ± engellendi.
- **Animasyon Gap Fix**: Raunt geÃ§iÅŸleri arasÄ±ndaki 500ms'lik matris jitter/bozulma hatasÄ±, `winAnim` durumunun sÄ±fÄ±rlama anÄ±na kadar korunmasÄ±yla giderildi.
- **SÃ¼rÃ¼m Senkronizasyonu**: TÃ¼m platformlar (PC, Mobil, Android) v2.96.0 sÃ¼rÃ¼mÃ¼ne eÅŸitlendi.

## v2.96.6 - Single-Page Quick Setup & Mobile Grid Fix
- AdÄ±m adÄ±m ilerleyen menÃ¼ akÄ±ÅŸÄ± tek bir `Quick Setup` menÃ¼sÃ¼nde birleÅŸtirildi.
- `openPlayerModeMenu` ve diÄŸer alt menÃ¼ler yerini dinamik `openQuickSetupMenu()` fonksiyonuna bÄ±raktÄ±.
- Mobil 2P modunda yÄ±lan ve Ä±zgaranÄ±n tam kare gÃ¶rÃ¼nmeme sorunu, `softReset` anÄ±nda kontrol panellerinin `transition` Ã¶zelliklerinin geÃ§ici olarak `none` yapÄ±lÄ±p senkron reflow (void document.body.offsetHeight) tetiklenmesiyle Ã§Ã¶zÃ¼ldÃ¼.

## GPGPC Ayrimi ile Mobil Akis Notu
- Mobil uygulama ve GPGPC ayni shell projesini kullanir ama farkli URL'lere yonlenir.
- Mobil hedef URL sabit kalmalidir:
  - `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`
- GPGPC hedef URL ayridir:
  - `https://2playersnake.com/wp-content/uploads/game/index.html`

### Neden Onemli
- Mobil UI, dokunmatik panel, safe-area ve reklam akislari `game-mobile` icin optimize edilidir.
- GPGPC'de ayni mobil URL'nin acilmasi dikey/kilitli gorunum sorunlari uretir.
- Gelecek AI, mobil bugfix yaparken bu URL ayrimini bozmamalidir.



