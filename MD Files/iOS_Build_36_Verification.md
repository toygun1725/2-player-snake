# iOS Build 36 — uygulama ve doğrulama kaydı

Güncelleme: 2026-09-16. Marketing version `3.3.5`, build `36`, HTML runtime revision `36`.

## Dağıtım durumu

- Kod ve yerel otomatik testler hazır. macOS WebKit kontrolü geçti.
  `ios-v3.3.5-b36` etiketi `a701279` commit'inden gönderildi; **TestFlight yüklemesi henüz doğrulanmadı**.
- Canlı mobil HTML'in web sitesine yüklenmesi henüz yapılmadı. Git push bu yayını yapmaz.
- App Store incelemesindeki paketi seçme/değiştirme veya incelemeyi iptal etme işlemi yapılmadı.
- `scratch/` önceki kullanıcı dosyasıdır; bu çalışmanın commit'ine alınmaz.

## Yapılanlar

1. iOS bridge'in blur, gölge, opaklık ve animasyon kapatan override'ları kaldırıldı.
   Safe-area ve kontrol yerleşimi korunur. iOS menü geçişindeki Android'e ait
   340 ms demo dondurması ve outgoing-card efekt kapatma kuralı ayrıldı.
2. Asıl closure içindeki `checkForFreshVersion` / `scheduleVersionCheck` iOS'ta erken döner.
   Önceki Build 35 `window.*` stub'ları closure-local fonksiyonlara etki etmiyordu.
3. Fontlar, Font Awesome ikonları, logo ve Socket.IO 4.7.5 istemcisi paket içindedir.
   `bootstrapScript()` fontları data-URL CSS, Socket.IO'yu WKUserScript olarak aktarır;
   logo whitelist'li `WKURLSchemeHandler` ile yüklenir. Offline Socket.IO stub'ı korunur.
   Font yükleme bekleyişinin üst sınırı 2 saniyedir; sonsuz açılış bekleyişi yaratmaz.
4. Demo/AI yol önbelleği iOS'ta yılan nesnesi başına `WeakMap` ile ayrıldı.
   Grid, oyun modu, duvar, beklenen baş konumu ve sıradaki engel kontrol edilir.
   Reset cache'i temizler; render interpolasyonu [0,1] aralığıyla sınırlıdır.
5. Native START, ağ ilerlemesi %100 olunca değil `initGame` sonundaki `gameReady`
   mesajıyla açılır. Eski uzak HTML için `didFinish` uyumluluğu korunur.
   Rastgele 2.5 s offline geçişi yerine 15 s remote-ready sınırı kullanılır.
  Kesin bağlantı kaybında offline'a doğrudan geçilir; yerel açılış hatasında 10 s sonra
   tekrar-dene ekranı vardır. Navigasyon kimliği eski iptal yanıtlarını ayırır.
   Sunucu `max-age=2678400` (31 gün) döndürdüğünden HTML isteği
   `.reloadRevalidatingCacheData` ile her açılışta sunucuda yeniden doğrulanır.
6. Reklam SDK çağrıları ve retry'ları main queue'da, gecikmeli/asenkron yürür.
   Native sunum bekleyişi 7.5 s, JS emniyeti 8.5 s; gerçek reklam açılınca her iki
   başlangıç zamanlayıcısı iptal olur. Ödül yalnızca kazanım callback'iyle verilir
   (mevcut premium ayrıcalığı korunur). Geç/tekrarlanan callback'ler tüketilir.
   Canlı AdMob kimlikleri ve RevenueCat ürünleri değiştirilmedi.
7. Mevcut oyun döngüsünde ilk 120 s kesintisiz görünür oturumu kapsayan özet sayaçlar:
   frame süreleri, >50 ms kareler, AI süresi, BFS/cache sayıları. Ek rAF/polling yok.
   `[GameReady]` ve `[GamePerformance]` logları tanı içindir; dışarı telemetri gönderilmez.
8. CI'ye JavaScript regresyon testleri ve gerçek macOS WKWebView kaynak/başlangıç
   smoke testi eklendi. TestFlight build'i bu kontrol geçmeden çalışmaz.
   Fastlane'in sertifika kotası dolunca eski Apple sertifikasını otomatik silen
   davranışı kaldırıldı; bu işlem ayrıca kullanıcı kararı gerektirir.

## Doğrulananlar

- `node --test tests/ios-runtime.test.cjs`: **16/16 PASS**.
- İki HTML'in tüm inline script'leri parse edildi; AI kodları eşit.
- Sabit, kontrollü iki-yılan senaryosunda 4 tur / 8 hareket için BFS çağrısı:
  legacy ortak cache 8, ayrı iOS cache 2, cache hit 6. Bu bir cihaz FPS ölçümü değildir.
- Eksik/geç/tekrarlanan reklam callback'i; ödülsüz timeout; uzun sunum;
  offline/premium davranışı ve cache engel/konum/mod geçersizleştirme testleri geçti.
- Yerel Chromium önizlemesi (native reklam yanıtı mock): 1P ve 2P başlatma,
  pause → ana menü dönüşü çalıştı. Font/logo görünümü kontrol edildi.
- Offline fixture'da da yerel maç açılışı ve pause → ana menü dönüşü doğrulandı.
- macOS WebKit: [Runtime Checks #3](https://github.com/toygun1725/2-player-snake/actions/runs/35061279989)
  PASS (`a701279`). HTTPS-origin ve file-offline senaryolarının ikisinde de
  `revision=36`, `logo=true`, `fonts=true`, `socket=true`, `menu=true`, `blurRetained=true`.
  Bu test iPhone/GPU testi değil, gerçek WebKit kaynak/başlangıç doğrulamasıdır.

## Henüz doğrulanmayanlar / kabul testi

- Xcode archive/TestFlight yükleme sonucu aşağıda güncellenecek.
- Fiziksel iPhone üzerinde FPS/uzun kareler, ATT izinli/reddedilmiş oturum,
  gerçek AdMob sunum/kapatma, satın alma geri yükleme ve iki cihaz online maç.
- Wi-Fi, hücresel, uçak modu ve yavaş ağda 3'er soğuk açılış; 2 dakika menü demosu;
  her ağ durumunda en az 10 Oyna → pause → ana menü turu.
- Uçak modunda logo/font/ikon; offline→online uyarısında iki seçeneğin çalışması;
  arka plana alma/geri dönme; 1P/2P, Normal/Macera/Self Area 51.
- Orijinal cam görünümü korunmalı. Kullanıcı cihaz testi olmadan “60 FPS çözüldü” denmez.

### CI sırasında yakalanan ve düzeltilen uyumsuzluk

İlk iki macOS WebKit denemesinde HTTPS kökenli sayfa, custom-scheme logo yüklemesine
izin verdi fakat aktif script/CSS kaynaklarını yüklemedi (16 JS testi yine geçti).
Bu nedenle fontlar data-URL CSS'e, Socket.IO native WKUserScript'e alındı. ATS/CORS
güvenliği gevşetilmedi ve sayfanın HTTPS origin/localStorage alanı değiştirilmedi.
Teknik bağlam: [WebKit mixed-content kaydı](https://bugs.webkit.org/show_bug.cgi?id=154916).

### İlk TestFlight denemesinde imzalama engeli

[Run #36](https://github.com/toygun1725/2-player-snake/actions/runs/35061421678)
runtime kontrollerini geçti, fakat imzalama anahtarı cache'te yok ve Apple dağıtım
sertifika kotası dolu olduğu için archive/yükleme başlamadan durdu. IPA üretilmedi.
Hiçbir Apple sertifikası iptal edilmedi. Build 35'in başarılı run'ında mevcut
`iOS-Distribution-Certificate-p12` artifact'i (run `35006468857`, artifact `10412062574`)
bulundu. CI yalnızca P12 yoksa bu mevcut identity'yi indirir; cache anahtarı v2'ye alındı.
Kalıcı kullanım için aynı P12'nin GitHub `DISTRIBUTION_CERTIFICATE` secret'ına güvenli
biçimde kaydedilmesi önerilir; artifact saklama süresi dolabilir. Private key/parola
repo veya sohbet içine yazılmamalıdır.

## Web yayını ve rollback

Kaynak: `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.3.5.html`.
Hedef: `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`.
Sunucu/PC/Android binary değişmedi; Node sunucusunu yeniden başlatmak gerekmez.
Canlı HTML eski kalırsa Build 36'nın native/offline düzeltmeleri gelir, fakat internetli
oyun yeni closure/cache/kaynak yönlendirme düzeltmelerini kullanmaz. Yükleme yöntemi
kullanıcıdan bekleniyor; parola veya private key sohbet içine yazılmamalı.

Kaynak baseline `6115a50` / önceki TestFlight Build 35. Sorun halinde kullanıcı TestFlight'ta
Build 35'e dönebilir. Web dosyası ayrıca önceki yedeğinden geri alınmalıdır;
native sürüm düşürmek web dosyasını geri almaz. Tag'ler taşınmaz, başarısız paket yeni
commit/build ile düzeltilir. App Store incelemesindeki binary değişmese de paylaşılan
uzak HTML'in yayımlanması eski iOS build'lerinin web içeriğini etkileyebilir.
