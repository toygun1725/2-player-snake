# 2 Player Snake - PC Surumu Yapay Zeka Rehberi

Bu belge, PC surumunde calisacak yapay zekalar icin guncel teknik referanstir. PC surumu de mobil gibi tek HTML dosyada yasamalidir; CSS, JS, i18n, canvas cizimi, reklam mantigi ve sentetik sesler ayni dosyada tutulur.

### Referans Surum
- Aktif referans surum: `v3.3.7`
- Temel referans dosya: `2 Player Snake PC v3.3.7.html`
- Kaynak/yayin durumu: v3.3.7 mobil ve PC kaynak dosyalari olusturuldu. WhatsApp/web oda davetleri icin `window.joinOnlineRoom` eklendi.
- Dosya yapisi: oyun mantigi, HUD, popup'lar, ceviriler and sesler tek HTML icindedir.
- Tasarim dili: neon cyberpunk, koyu mavi arka plan, pembe ve turkuaz glow, camimsi HUD panelleri.

## Son Guncelleme (v3.3.7)
- **v3.3.7**: Web/Online Oda Katılım Köprüsü ve Sürüm Senkronizasyonu.
  - **Oda Katılım Köprüsü:** PC oyununa `window.joinOnlineRoom(roomCode, gameStyleName)` fonksiyonu eklendi; dış bağlantılardan odaya bağlanma yeteneği sağlandı.
  - **Surum Senkronu:** `2 Player Snake PC v3.3.7.html` olarak yeni referans dosyası oluşturuldu; başlık ve `VERSION = 'v3.3.7'` sabiti güncellendi.

## Onceki Guncelleme (v3.3.6)
- **v3.3.6**: Patreon Destek Sisteminin Kaldirilmasi, "iPhone'da Oyna" Butonu ve Surum Senkronizasyonu.
  - **iPhone'da Oyna Butonu:** Ana Menü'de "Android'te Oyna" butonunun hemen uzerine `menuPlayOnIphone` butonu eklendi. Tıklandığında App Store bağlantısına (`https://apps.apple.com/us/app/2-player-snake/id6811546748`) gider.
  - **Tasarım & Hover Stili:** `.btn.btn-iphone-play` butonu menüdeki cam panel tasarımını korur; hover durumunda canlı iOS elektrik mavisi gradyanı (`linear-gradient(135deg, #0071e3 0%, #00c6ff 100%)`) alır.
  - **21 Dilde Çeviri:** `playOnIphone` anahtarı 21 dilin tamamında (`tr`, `en`, `fr`, `it`, `es`, `de`, `zh`, `hi`, `pl`, `pt`, `ar`, `ru`, `id`, `ja`, `ko`, `vi`, `th`, `tl`, `nl`, `el`, `cs`) sözlüğe eklendi.
  - **Patreon Kaldirildi:** Ayarlar > Gelistiriciler (Developers) modalinda yer alan Patreon bagis ve destek bolumu 21 dilde tamamen temizlendi.
  - **CSS Temizligi:** `.btn-patreon`, `.btn-patreon i`, `.btn-patreon:active` stilleri ile hover sweep efekt secicileri (`.btn-patreon::after`, `.btn-patreon:hover::after`) kaldirildi.
  - **Surum Senkronu:** `2 Player Snake PC v3.3.6.html` olarak yeni referans dosyasi olusturuldu; `VERSION = 'v3.3.6'` sabiti guncellendi.

## Onceki Guncelleme (v3.3.5)
- **v3.3.5**: Mobil Android WebView menu gecisi duzeltmesiyle surum paritesi.
  - PC oyun mantigi ve goruntusu degismedi.
  - PC kaynak dosyasi `v3.3.5` olarak olusturuldu; `VERSION` sabiti guncellendi.

## Son Guncelleme (v3.3.4)
- **v3.3.4**: PC yerel/online oyun alani parite duzeltmesi.
  - **Neden:** Yerel PC oyunu `64x36` grid kullanirken online odalar ortak sunucuda `30x18` ile kuruluyordu. PC istemcisi online `gameInit` grid degerlerini kullandigi icin yilan segmentleri ve oyun alani gerektiginden buyuk gorunuyordu.
  - **Cozum:** `server.js` PC icin hem matchmaking hem ozel odada `64x36` gonderir. PC istemcisi bu degerleri zaten dogrudan kullandigindan ek render degisikligi gerekmedi.
  - **Mobil Ayrimi:** Mobil odalar `24` sutunlu dinamik satir pazarligini korur; mobil olcegi etkilenmez.
  - **Dogrulama:** Yerel Socket.IO testinde PC matchmaking ve ozel oda `64x36`, mobil matchmaking `24x29` sonucunu verdi.

## Son Guncelleme (v3.3.3)
- **v3.3.3**: PC guvenlik ve kod temizligi surumu.
  - **Oyuncu Adi Guvenligi:** Oyuncu adlari; renk secimi, tur kazanan anonsu, mac sonu istatistikleri, online kazanan banner'i ve yuksek skor listesinde HTML olarak escape edilir.
  - **Renk Cache Duzenlemesi:** `hexToRgba()` yalniz sabit RGB ayrisimini cache'ler. Animasyonlara ait degisen alpha degerleri cache anahtari olmadigi icin Map'in surekli buyumesi engellenir.
  - **Kod Temizligi:** Kullanilmayan `buildFoodRulesSection()` ve golgede kalan ilk `eatFoodIfAny()` tanimi kaldirildi; etkin yem mantigi korunur.
  - **Ortak Online Sunucu:** `server.js` adi normalize eder ve 12 Unicode karakterle sinirlar. Mobil/PC matchmaking ve ozel oda akislari ile PC `requestDash` olayi yerel Socket.IO entegrasyon testinde basariyla calisti.
  - **Dagitim Notu:** Canli ortamda bu korumanin kullanilmasi icin `server.js` yuklenmeli ve Node sureci yeniden baslatilmalidir.
  - **Dogrulama:** PC v3.3.3 inline JavaScript, oyuncu adi escape ve renk cache kontrolleri; `server.js` syntax ve isim-normalizasyon kontrolleri basariyla tamamlandi.

## Son Guncelleme (v3.3.2)
- **v3.3.2**: Cloud Save & GPG PC Klavye Uyum sürümü.
  - **Bulut Kaydı (Cloud Save) Tetikleyicisi:** PC HTML dosyasındaki `addHighScore()` güncellendi. Yeni bir yüksek skor kaydedildiğinde `Android.notifyHighScore()` aracılığıyla Android shell tarafına güncel skor listesi `pc` platform parametresiyle iletilir.
  - **Bulut Kaydı Yükleme İşleyicisi:** Sayfa yüklendikten sonra Android native'den gelen bulut verisini (`pcScores`) karşılayan `window.onCloudSaveLoaded` fonksiyonu eklendi. Buluttan gelen PC skorları yerel localStorage skorlarıyla birleştirilerek en yüksek 10 skor korunur.
  - **Klavye Eşleştirmesi:** PC HTML dosyasındaki yerleşik klavye dinleyicisi (`keydown/keyup` olayları) aynen korundu. Android shell katmanına eklenen `dispatchKeyEvent` override'ı sayesinde GPG PC ortamında klavye girdilerinin yutulmadan WebView'e ulaşması ve bu dinleyiciyi tetiklemesi sağlandı.
  - **Sürüm Güncellemesi:** HTML başlığı, yorum satırları ve `VERSION` sabitleri `v3.3.2` olarak güncellendi.
  - PC sürümünde reklam davranışı olarak Google AdSense H5 Games Ads akışı aynen korunmaktadır.

## Son Guncelleme (v3.3.1)
- **v3.3.1**: Sürüm senkronizasyonu güncellemesi.
  - **Sürüm Senkronu:** Mobil sürüm ve Android shell sürüm v3.3.1 güncellemeleri sonrasında PC sürümüyle kod sürüm senkronizasyonu sağlandı. Title, yorum satırları ve `VERSION` sabitleri `v3.3.1` olarak güncellendi.
  - PC sürümünde reklam davranışı olarak Google AdSense H5 Games Ads akışı aynen korunmaktadır.

## Son Guncelleme (v3.3.0)
- **v3.3.0**: Sürüm senkronizasyonu güncellemesi.
  - **Sürüm Senkronu:** Mobil sürümde yapılan v3.3.0 Premium / RevenueCat entegrasyonu sonrasında PC sürümüyle kod sürüm senkronizasyonu sağlandı. Title, yorum satırları ve `VERSION` sabitleri `v3.3.0` olarak güncellendi.
  - PC sürümünde reklam davranışı olarak Google AdSense H5 Games Ads akışı aynen korunmaktadır.

## Son Guncelleme (v3.2.4)
- **v3.2.4**: PC sürümü v3.2.4 olarak güncellendi ve sürüm senkronizasyonu sağlandı.
  - **Sürüm Senkronu:** Title, yorum satırları ve `VERSION` sabitleri `v3.2.4` olarak güncellendi.

## Son Guncelleme (v3.2.3)
- **v3.2.3**: Oyun sonu istatistiklerinde sadeleşmeye gidildi, oyun içi arayüz güncellendi ve yerel mod hatası giderildi.
  - **İstatistik Güncellemesi:** Oyun sonu ekranında "Toplam Yenilen Yem" satırı kaldırıldı. Oyuncu kutularındaki "Yenen Yem" ibaresi "Yılan Uzunluğu" olarak değiştirildi ve maç boyunca ulaşılan maksimum yılan uzunluğu gösterilecek şekilde güncellendi.
  - **Oyun İçi Arayüz (2P Modu):** 2 Oyuncu (2P) modunda üst kısımdaki `P1 YEM / P2 YEM` sayaçları yılan uzunluğunu anlık olarak gösterecek şekilde güncellendi.
  - **Yerel Oyun "Tekrar Oyna" Hatası Giderildi:** Yerel oyunda "Tekrar Oyna" butonuna basıldığında sunucu bağlantısı aranması hatası düzeltildi; doğrudan yerel oyun sıfırlaması (`softReset(true)`) yapılması sağlandı.
  - **Sürüm Senkronu:** Title, yorum satırları ve `VERSION` sabitleri `v3.2.3` olarak güncellendi.
  - **Doğrulama:** PC v3.2.3 inline JavaScript `node --check` ile doğrulandı.

## Son Guncelleme (v3.2.2)
- **v3.2.2**: Kodlar içerisindeki eski sürüm numaraları (v3.2.1) temizlendi ve hem mobil hem de PC sürümleri v3.2.2 olarak senkronize edildi.
  - **Sürüm Senkronu:** Title, yorum satırları ve `VERSION` sabitleri `v3.2.2` olarak güncellendi.
  - **Dogrulama:** PC v3.2.2 inline JavaScript `node --check` ile doğrulandı.

## Son Guncelleme (v3.2.1)
- **v3.2.1**: Yalnizca surum numarasi senkronu; fonksiyonel degisiklik yok.
  - PC zaten `showOnlineAlert()` / `showOnlineDialog()` sistemine sahipti; bu guncelleme Mobile tarafinda yapilan iyilestirmenin numara eslesmesidir.
  - Title, yorum ve `VERSION` sabiti `v3.2.1` olarak guncellendi.
  - **Dogrulama:** PC v3.2.1 inline JavaScript `node --check` ile dogrulandi.

## Son Guncelleme (v3.2.0)
- **v3.2.0**: v3.1.9 baz alinarak PC surumu Mobile v3.2.0 ile senkronize edildi.
  - **Zorluk I18n Ayrimi:** AI zorluk bolumu hiz metinlerinden ayrildi. `Zorluk/Difficulty` basligi ve `Kolay-Normal-Zor / Easy-Normal-Hard` secenekleri eklendi; normal hiz metinleri kendi baglaminda korunur.
  - **Countdown Hizalama Senkronu:** `countdown-banner` sinifi PC tarafina da eklendi; countdown/start banner davranisi Mobile ile ayni hale getirildi.
  - **Surum Senkronizasyonu:** Title/comment/`VERSION` alanlari `v3.2.0` olarak guncellendi.
  - **Server Durumu:** `server.js` optimum satir sayisi yuvarlama gorusmesini (Math.round) destekleyecek sekilde guncellendi ve Render.com'a deploy edildi.
  - **Dogrulama:** PC v3.2.0 inline JavaScript `node --check` ile dogrulandi.

## Son Guncelleme (v3.1.9)
- **v3.1.9**: PC sürümüne sunucu uyanıklığı (health check) kontrol mekanizması entegre edildi.
  - **Akıllı Geçiş Ekranı Bypass:** "Çevrimiçi Oyna" tıklandığında arka planda sunucuya 2 saniyelik zaman aşımı ile hızlı bir `/health` isteği gönderilir. Sunucu uyanıksa geçiş reklamı tamamen bypass edilerek doğrudan oda kurma/katılma veya lobi ekranına geçiş sağlanır.
  - **Uyanma Reklam Maskelemesi:** Sunucu uyku modundaysa geçiş reklamı (interstitial) devreye sokularak Render sunucusunun uyanma süresi kullanıcıya fark ettirilmeden arka planda beklenir.
  - **Senkronizasyon:** PC sürümü, Mobil sürümü (`2 Player Snake Mobile v3.1.9.html`) ve çevrimdışı fallback `mobile_offline_fallback.html` dosyaları `v3.1.9` sürümüne eşitlendi.

## Son Guncelleme (v3.1.8)
- **v3.1.8**: PC sürümü `v3.1.8` sürümüne güncellendi.
  - **Hız Kademe Güncellemeleri:** Yerel hız kademeleri EASY: 0.75, NORMAL: 0.85, FAST: 1.05 olarak güncellendi, oyunun hızı daha dengeli hale getirildi.
  - **Matchmaking Hız Senkronu:** Çevrimiçi matchmaking modundaki client interpolasyon hızı sunucu tick hızıyla (0.85x) tam senkronize olacak şekilde güncellendi.
  - **Senkronizasyon:** PC sürümü, Mobil sürümü ve çevrimdışı fallback dosyaları ile tam uyumlu şekilde v3.1.8'e yükseltildi.

## Son Guncelleme (v3.1.7)
- **v3.1.7**: PC sürümü `v3.1.7` sürümüne güncellendi.
  - **Dinamik Tema Izgara Önbelleği (Theme Cache Invalidation):** data-theme değiştiğinde (light/dark tema geçişlerinde) cached grid ve sınır çizgileri kanvasının (`gridCacheCanvas`) anında invalidation/silinme işlemine tabi tutulması ve yeni tema renkleriyle çizilmesi sağlandı.
  - **Stroke Style Çözümlemesi:** Çevrimiçi moddaki sınır çizgileri strokeStyle CSS değişken çözümleme hatası standard `varToCss` aracı kullanılarak giderildi.
  - **Senkronizasyon:** PC sürümü, Mobil sürümü ve çevrimdışı fallback dosyaları ile tam uyumlu şekilde v3.1.7'ye yükseltildi.

## Son Guncelleme (v3.1.6)
- **v3.1.6**: PC sürümü `v3.1.6` sürümüne güncellendi.
  - **Izgara Çizim Önbelleği (Offscreen Canvas):** Izgara çizgilerinin çizim maliyetini düşürmek amacıyla `drawGrid()` fonksiyonuna ekran dışı canvas cache yapısı eklendi.
  - **Senkronizasyon:** Title ve `VERSION` sabitleri Mobil ile tam uyumlu şekilde v3.1.6'ya yükseltildi.

## Son Guncelleme (v3.1.5)
- **v3.1.5**: Çok oyunculu modda tekrar oynama (rematch) akışı senkronize edildi. Oyuncu "Tekrar Oyna" butonuna bastığında hemen gönderilen `rematchIntent` ile diğer oyuncuda yılan rengine göre parlayan notice gösterilmesi, geçiş reklamı bittiğinde `rematchReady` gönderimi ile iki oyuncunun da ad bitimi beklenip oyunun başlatılması, reklamı erken biten oyuncuya waiting ekranı ve spinner gösterilmesi sağlandı.
- **Mobil v3.1.5**: Mobil sürüm de `v3.1.5` sürümüne güncellenerek aynı iki aşamalı tekrar oynama barajı, renkli uyarılar ve bekleme ekranı sistemi eklendi.
- **Sunucu v3.1.5**: Çok oyunculu sunucu (`server.js`) rematchIntent ve rematchReady socket eventleri, rematchReadys yapısı ve cancelRematch temizlik mantığı ile rematch sürecini senkronize edecek şekilde güncellendi.
- **Offline Fallback v3.1.5**: `mobile_offline_fallback.html` dosyası yeni v3.1.5 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.4)
- **v3.1.4**: PC istemcisinde sunucuya bağlanırken iptal tuşuna basıldığında veya oyun temizlendiğinde bağlantı zaman aşımı zamanlayıcısının (`connectionTimeoutTimer`) temizlenmemesi hatası (timer sızıntısı) giderildi. Ayrıca, ilk bağlantı hatası durumunda otomatik yeniden deneme adımlarını (3 deneme) kesintiye uğratan anlık hata iptali giderildi (`connect_error` sadece hata yazar hale getirildi) ve `reconnectOnlineGame` fonksiyonu içindeki yinelenen soket dinleyicileri kaldırıldı. Çok oyunculu sunucudan gönderilen geçici oturum anahtarı (`sessionToken`) verisi hafızada (`onlineSessionToken` değişkeni) tutularak yeniden bağlantıda doğrulama için gönderilme akışı (session hijacking engellemesi) kodlandı.
- **Mobil v3.1.4**: Mobil sürüm de `v3.1.4` sürümüne güncellendi. Mobil istemci, bağlantı zaman aşımı zamanlayıcısını ve soket olaylarını zaten güvenli bir şekilde yönettiği için mantıksal bir değişiklik yapılmadı, sadece sessionToken saklama ve gönderme mantığı eklendi.
- **Sunucu v3.1.4**: Çok oyunculu sunucu (`server.js`) sessionToken doğrulama, Macera modu portal geçiş adım senkronizasyonu, hükmen yenilgi skor sınır taşması düzeltmeleri ve yeniden bağlantı sonrası 3 saniye geri sayım countdown mantığı ile güçlendirildi.
- **Offline Fallback v3.1.4**: `mobile_offline_fallback.html` dosyası yeni v3.1.4 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.3)
- **v3.1.3**: Raund galibiyetlerinde (final olmayan galibiyetlerde) galibiyet metninin (örn. "P1" veya "AI") harf ve rakamlarının farklı renklerde görünmesi hatası giderildi. Harf ve rakam segmentleri kazanan yılanın segmentlerine atanarak tek renk olarak birleştirildi.
- **Mobil v3.1.3**: Mobil sürüm de `v3.1.3` sürümüne güncellenerek aynı win animasyonu renk segmenti birleştirme düzeltmesi uygulandı.
- **Offline Fallback v3.1.3**: `mobile_offline_fallback.html` dosyası yeni v3.1.3 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.2)
- **v3.1.2**: Çevrimiçi oyun modlarında sunucu tarafından gönderilen ham Türkçe hata mesajları için yerelleştirilmiş dil eşlemeleri (`translateOnlineServerMessage`) güncellenerek dil kaçağı giderildi. Soket bağlantısı kesildiğinde anında oyundan atılma problemini çözmek için `reconnectOnlineGame` yeniden bağlantı mantığı eklendi. Ayrıca soket koptuğunda durumu algılayan dinleyiciler genel `setupSocketEvents` fonksiyonuna taşınarak özel arkadaş odalarında da çalışması sağlandı.
- **Mobil v3.1.2**: Mobil sürüm de `v3.1.2` sürümüne güncellendi. Benzer dil yerelleştirmeleri mobil istemci tarafında da kodlandı.
- **Offline Fallback v3.1.2**: `mobile_offline_fallback.html` dosyası yeni v3.1.2 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.1)
- **v3.1.1**: Çevrimiçi oyun arayüzünde rakip oyuncu ayrıldığında oluşan donmalar ve kilitlenmeler arayüz temizlik kodlarıyla giderildi. Bağlantı kopmaları ve yeniden bağlanma başarısızlıkları için socket.io hata sınırları ile online menüye otomatik yönlendirme eklendi. Geri sayım lobi ve aktif oyun içi aşamalarındaki donmaları önlemek amacıyla 3 saniyelik istemci tarafı güvenlik zaman aşımı zamanlayıcısı eklendi.
- **Mobil v3.1.1**: Mobil sürüm de `v3.1.1` sürümüne güncellendi. Benzer şekilde arayüz donma temizlikleri, hata sınırları ve istemci güvenlik zaman aşımı zamanlayıcısı entegre edildi.
- **Offline Fallback v3.1.1**: `mobile_offline_fallback.html` dosyası yeni v3.1.1 mobil HTML sürümüyle eşitlendi.

## Son Guncelleme (v3.1.09)
- **v3.1.09**: Çevrimiçi rastgele eşleşme ("Hızlı Rekabetçi") modunun yılan hızı optimize edildi. Kontrol konforu ve dengesi için hız çarpanı `MOD_SPEED.FAST`'ten `MOD_SPEED.NORMAL` (1.00x) seviyesine düşürüldü.
- **Mobil v3.1.09**: Mobil sürümün de online rastgele eşleşme hızı 1.00x olarak güncellendi ve sürüm `v3.1.09` olarak eşitlendi.
- **Offline Fallback v3.1.09**: `mobile_offline_fallback.html` dosyası yeni v3.1.09 mobil sürümüyle eşitlendi.

## Son Guncelleme (v3.1.08)
- **v3.1.08**: PC sürümü `v3.1.08` sürümüne güncellendi. Ana menüye Android platformunda Google Play Store üzerinden oynamayı sağlayan yeşil hover efektli bir "Play on Android" (Android'de Oyna) yönlendirme butonu eklendi ve tüm dillere "playOnAndroid" çevirileri dahil edildi.
- **Mobil v3.1.08**: Mobil istemci dosyası `2 Player Snake Mobile v3.1.08.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.08**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` dosyası v3.1.08 mobil sürümüyle eşitlendi.

## Son Guncelleme (v3.1.07)
- **v3.1.07**: Çevrimiçi oyun arayüzü (ONLINE_STRINGS) için yeni dil çevirileri (Hollandaca/nl, Yunanca/el, Çekçe/cs) eklendi ve PC sürümü bu sürüm numarasıyla senkronize edildi.
- **Mobil v3.1.07**: Mobil istemci dosyası `2 Player Snake Mobile v3.1.07.html` ile sürüm senkronizasyonu sağlandı.

## Son Guncelleme (v3.1.06)
- **v3.1.06**: PC sürümünün başlık (title) ve `VERSION` sabitleri `v3.1.06` sürümüne yükseltilerek Mobil sürümle senkronize edildi.
- **Mobil v3.1.06**: Mobil istemci dosyası `2 Player Snake Mobile v3.1.06.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.06**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.06 mobil sürümüyle eşitlendi.

## Son Guncelleme (v3.1.05)
- **v3.1.05**: Çevrimiçi (online) matchmaking ve oda oyunlarında P1 and P2 yılanlarının renkleri varsayılan Pembe ve Turkuaz yerine 8 yerel renkten rastgele seçilip oda kodu (room code) bazlı tohumla (seed) senkronize edildi. PC sürümünde de bu renk senkronizasyon akışı kodlanarak v3.1.05 sürümüne yükseltildi.
- **Mobil v3.1.05**: Mobil istemci dosyası `2 Player Snake Mobile v3.1.05.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.05**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.05'e güncellendi.

## Son Guncelleme (v3.1.04)
- **v3.1.04**: Yükleme ekranı (splash screen) süresi tüm platformlarda (PC, Mobil ve Android çevrimdışı fallback) 3 saniyeden 2 saniyeye indirilerek oyuna giriş hızı artırıldı. PC sürümünde de bu yükleme süresi 2 saniyeye indirilerek v3.1.04 sürümüne yükseltildi.
- **Mobil v3.1.04**: Mobil istemci dosyası `2 Player Snake Mobile v3.1.04.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.04**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.04'e güncellendi.

## Son Guncelleme (v3.1.03)
- **v3.1.03**: Çevrimiçi sunucu bağlantı akışı optimize edilerek Render sunucusu arka planda uyanırken geçiş reklamı (interstitial) gösterilmesi sağlandı. PC sürümünde de bu reklamlı bağlantı akışı kodlanarak v3.1.03 sürümüne yükseltildi.
- **Mobil v3.1.03**: Mobil istemci dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.03.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.03**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.03'e güncellenerek yeni reklamlı bağlantı akışı aktarıldı.

## Son Guncelleme (v3.1.02)
- **v3.1.02**: Mobil ve Android offline fallback istemcileri v3.1.02 sürümüne yükseltilerek oyuncu gösterge paneli (HUD) maksimum genişliği 94px'ten 80px'e (çift paneller için 188px'ten 160px'e) düşürülüp yön tuşlarının dokunma alanları genişletildi. Self Area 51 modundaki gösterge metni ("13/51") hafifçe yukarı taşındı. PC sürümünde kod değişikliği yapılmadan sürüm senkronizasyonu sağlandı.
- **Mobil v3.1.02**: Mobil istemci dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.02.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.02**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.02'ye güncellenerek yeni HUD boyutları ve Area 51 yazısı konumlandırmaları aktarıldı.

## Son Guncelleme (v3.1.01)
- **v3.1.01**: Çevrimiçi oyun duraklatma ekranının tasarımı, matchmaking arama ekranının premium glassmorphism ve neon glow tarzına uyacak şekilde yeniden tasarlanıp görsel olarak iyileştirildi. PC sürümünde online pause overlay arayüzü yeni cam panel ve neon border animasyonu (`borderGlow`) ile modernleştirildi; breathing pause simgesi, Orbitron neon gölgeli timer göstergesi ve düzenlenmiş butonlar eklendi.
- **Mobil v3.1.01**: Mobil istemci dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.01.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.01**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.01'e güncellenerek yeni pause ekranı tasarımları aktarıldı.

## Son Guncelleme (v3.1.00)
- **v3.1.00**: Yem yeme dalgalanma efekti revize edildi. Vektörel pürüzsüz daire çizgisi çizimi yerine matris üzerindeki kare hücrelerin (grid cells) kendilerinin tıpkı birer RGB mekanik klavye tuşu gibi parlayıp sönmesi sağlandı. Yenen yemin tipine göre dalga rengi özelleştirildi (Altın Elmas için sarı, Kalp için kırmızı, Mavi Elmas için mavi, Yeşil Elmas için yeşil ve normal yemler için yiyen yılanın kendi neon rengi).
- **Mobil v3.1.00**: Mobil beta v3 dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.1.00.html` ile sürüm senkronizasyonu sağlandı.
- **Offline Fallback v3.1.00**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da v3.1.00'a güncellenerek yeni matris tuş dalgalanması eklendi.

## Son Guncelleme (v3.0.12)
- **v3.0.12**: Kritik syntax hatası düzeltmesi. `gameUpdate` socket callback'i içindeki Self Area 51 shrink feedback bloğu eklenirken iki adet kapanış parantezi (`}`) eksik bırakıldığı için splash ekranında yükleme donuyordu. Parantezler tamamlandı, dosya yeniden oluşturuldu.
- **Mobil v3.0.12**: Mobil beta v3 dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.12.html` ile sürüm senkronizasyonu sağlandı. Mobilde `const ONLINE_STRINGS = {` tanım satırının silinmesinden kaynaklanan syntax hatası da aynı turda düzeltildi.
- **Offline Fallback v3.0.12**: `Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html` da aynı ONLINE_STRINGS hatası giderilerek v3.0.12'ye güncellendi.

## Son Guncelleme (v3.0.08)
- **v3.0.08**: Son sürüm olarak kayda alındı; PC beta v3 dosyası `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.0.08.html` altında tutulur. PC sürümünde sadece sürüm numarası ve title güncellenerek versiyon senkronizasyonu sağlanmıştır.
- **Mobil v3.0.08**: Mobil beta v3 dosyası `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.08.html` ile sürüm senkronizasyonu sağlanmıştır.

## Son Guncelleme (v3.0.07)
- **v3.0.07**: Son surum olarak kayda alindi; PC beta v3 dosyasi `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.0.07.html` altinda tutulur. PC surumunde sadece surum numarası ve title guncellenerek versiyon senkronizasyonu saglanmıştır.
- **Mobil v3.0.07:** Mobil beta v3 dosyasi `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.0.07.html` ile surum senkronizasyonu saglanmis, mobildeki tum online dil eksiklikleri ve in-game dialog yenilemeleri tamamlanmistir.

## Son Guncelleme (v3.00.3)
- **v3.00.3**: Son surum olarak kayda alindi; PC beta v3 dosyasi `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.00.3.html` altinda tutulur.
- **Mobil v3.00.3:** Mobil beta v3 dosyasi `Ana Dosya/Mobile/Beta/v3/2 Player Snake Mobile v3.00.3.html` ile surum senkronizasyonu saglandi.
- **PC Online Oyuncu Adları:** PC varsayılan online adları "PC Oyuncusu" yerine "P1" ve "P2" olarak senkronize edildi.
- **Mobil P2 HUD Renk & Tema Senkronizasyonu:** Çevrimiçi (online) modlarda 2. Oyuncu (P2) olarak oynandığında local alt kontrol panelinin P1 renginde (pembe) kalması düzeltildi. Panel artık dinamik olarak P2'nin seçili rengini ve P2'nin adını/skorunu/noktalarını gösterir.
- **Konfeti Blur Düzeltmesi:** Çevrimiçi/yerel maçlarda oyun duraklatılmışken (paused) raunt kazanıldığında, kazanma ekranı ve konfetilerin üzerinde kalan blur (bulanıklık) filtresi kaldırıldı.

## Son Guncelleme (v3.00.2)
- **v3.00.2**: PC beta v3 dosyasi `Ana Dosya/PC/Beta/v3/2 Player Snake PC v3.00.2.html` altinda tutulurdu.
- **Mobil v3.00.2:** Mobil beta v3 dosyasi ile surum senkronizasyonu saglanmisti.
- **Online rematch akisi:** Online mac istatistikleri ekraninda `Tekrar Oyna` artik local reset yapmaz; sunucuya `requestRematch` gonderir. Iki oyuncu 30 saniye icinde onay verirse skorlar ve roundlar sifirlanip ayni odada yeni mac baslar. Rakip ana menuye donerse veya sure dolarsa oyun ici uyari verilir.
- **Online performans optimizasyonu:** `Ana Dosya/Server/Mobile/server.js` icinde server tick araligi `25ms` olarak ayarlandi; hareket hizi `dt/accumulator` ile korundu. `foods`, `barriers` ve `portals` verileri artik her `gameUpdate` paketinde degil, yalnizca degistiginde gonderilir. PC Adventure bariyerleri icin `barriersVersion`/delta payload mantigi kullanilir.
- **Sunucu takip loglari:** Server 60 saniyede bir `[perf] rooms=... playing=... updates/s=... avgPayload=... avgTick=... maxTick=... maxLag=...` seklinde hafif performans logu basar.

## Son Guncelleme (v2.99.5)
- **v2.99.5**: Ã‡evrimiÃ§i modlarÄ±n PC ve mobil parity'si kapsamÄ±nda sÃ¼rÃ¼m numaralarÄ± eÅŸitlendi ve tÃ¼m platformlar v2.99.5 olarak gÃ¼ncellendi.

## Son Guncelleme (v2.99.4)
- **v2.99.4**: SÃ¼rÃ¼m senkronizasyonu. Mobil sÃ¼rÃ¼mdeki Ã§evrimiÃ§i mod yumuÅŸaklÄ±k ve stabilite gÃ¼ncellemesi sonrasÄ± PC sÃ¼rÃ¼mÃ¼ de sÃ¼rÃ¼m numarasÄ± eÅŸitlenerek gÃ¼ncellendi (aktif kod deÄŸiÅŸikliÄŸi yoktur).

## Son Guncelleme (v2.98.8)
- **v2.98.8**: Surum senkronizasyonu. Mobil surumde kare hucre (canvas stretch) duzeltmesi yapildi; PC tarafi kod degisikligi olmadan senkron surum numarasiyla guncellendi.
  - Mobil detay: `resize()` icine `canvas.style.width/height` inline set eklendi; uzun ekranli cihazlarda (Samsung A71 vb.) yilan segmentlerinin dikeyde genis gorunmesi engellendi.

## Son Guncelleme (v2.98.7)
- **v2.98.7**: AI yol bulma performansi ve menu navigasyon hatalari giderildi.
  - **AI Cache Reset:** `clearGameState()` icine `_aiCache` sifirlama eklendi. Onceki rounddan kalan bayat cache verisi yeni roundda yanlis yonde hareket yapilmasini onliyor.
  - **Menu Blank-Screen Fix:** `showBanner()` fonksiyonundaki `void banner.offsetWidth` reflow hilesi `requestAnimationFrame` ile degistirildi. Tarayici bazen reflow'u optimize edip atliyordu; bu durum menulerin bos (sadece arkaplan gorunur) gelmesine yol aciyordu. rAF ile .show class'i kesinlikle bir sonraki frame'e erteleniyor.
  - **Highscore Geri Donus Duzeltmesi:** `openHighscore()` icindeki `inGame` kontrolu `&& !isDemoMode` ile guncellendi. Demo mod `currentSpeedMode = 'NORMAL'` set ettigi icin geri donus yanliÅŸ 'in-game' akisina giriyordu; bu duzeltme ile Yuksek Skorlar'dan geri basilinca artik ana menu aciliyor.
  - **Settings Geri Donus Duzeltmesi:** `goBack()` fonksiyonu, geri dÃ¶nÃ¼lecek yer `openMainMenu` ise `menuHistory` stack'ine gÃ¼venmek yerine doÄŸrudan `openMainMenu(false)` Ã§aÄŸÄ±racak ÅŸekilde gÃ¼ncellendi. Ayarlar ve diger alt menÃ¼lerden geri basilinca artik her zaman temiz ana menu geliyor.

## Son Guncelleme (v2.98.6)
- **v2.98.6**: Oyun matrisi kare hucre duzeltmesi yapildi. `resize()` fonksiyonu yeniden yazilarak canvas boyutu artik tam olarak `GRID_COLS Ã— cellSize Ã— dpr` x `GRID_ROWS Ã— cellSize Ã— dpr` seklinde hesaplaniyor; `cellSize = Math.min(r.width/GRID_COLS, r.height/GRID_ROWS)`. Bu sayede `cw === ch` her zaman garantileniyor; pencere yatay veya dikey yonde herhangi bir orana cekildigi durumlarda bile yilan segmentleri kare olmaya devam ediyor. Yeni AAB gerekmez; sadece web dosyasinin guncellenmesi yeterlidir.
- **v2.98.5**: Demo yilanlarin menu gecislerinde resetlenmesi sorunu giderildi; artik arka planda maclarina devam ediyorlar. Yilanlarin oyun ilk acildiginda logonun arkasindan suzulerek cikmasi saglandi. Menu gecislerindeki anlik kasmalar nedeniyle yilanlarin ileriye isinlanmasi (jump) engellendi; hareketler daha sarsintisiz hale getirildi. Aktif referans surum ve dosya ismi v2.98.5 olarak guncellendi.


- Bu turda PC dosyasi surum senkronu icin `v2.98.5` seviyesine cekildi.
- Kirmizi yem (beast mode) kaynakli mobil odakli render/perf bugfix calismalari kayda alindi; PC tarafinda yeni gameplay degisikligi uygulanmadi.
- Round/final akislari ve mevcut konfeti davranisi parity kontrolu icin stabil referans olarak korunuyor.

## Son Guncelleme (v2.97.4)
- PC dosyasi bu turda surum senkronu icin `v2.97.4` seviyesine alindi.
- Oyun mantiginda ek degisiklik yapilmadi; mobildeki yem-efekti iyilestirmesiyle versiyon parity korundu.

## Son Guncelleme (v2.96.9)
- **v2.96.7 / v2.96.8 / v2.96.9**: Mobil sÃ¼rÃ¼mdeki kÃ¶klÃ¼ gÃ¼ncellemeler (Guide menÃ¼sÃ¼, Animasyonlar, Renk senkronizasyonu) ile uyumluluk iÃ§in sadece sÃ¼rÃ¼m numarasÄ± senkronlandÄ±.
- **v2.96.6 (Ã–nceki)**: Tek SayfalÄ± MenÃ¼ (Quick Setup)**: Mobil ile eÅŸ zamanlÄ± olarak PC'de de Ã§ok adÄ±mlÄ± menÃ¼ zinciri yerine "Quick Setup" arayÃ¼zÃ¼ne geÃ§ildi.
- Oyuncular oyuna baÅŸlamak iÃ§in artÄ±k 5 farklÄ± ekrandan geÃ§mek yerine her ÅŸeyi tek panelden ayarlayabiliyor.
- PC ekranÄ± yatay dÃ¼zende iki sÃ¼tuna (Sol: Game Mode, SaÄŸ: Options) bÃ¶lÃ¼nerek masaÃ¼stÃ¼ ergonomisi optimize edildi.
- Renk seÃ§iminde yaÅŸanan tam ekran (banner) yenileme/titreme sorunu "Partial DOM Update" mantÄ±ÄŸÄ±yla (sadece deÄŸiÅŸen kÄ±smÄ± gÃ¼ncelleyen rendering) Ã§Ã¶zÃ¼ldÃ¼.

## Kurumsal Marka Renkleri

Bu iki renk oyunun tÃ¼m platformlarÄ±ndaki (web, mobil, Android) kimliÄŸini temsil eder. Yeni UI Ã¶ÄŸeleri, logolar, butonlar veya efektler tasarlanÄ±rken bu renklerden sapÄ±lmamalÄ±dÄ±r.

| Renk | Hex | KullanÄ±m |
|---|---|---|
| **Neon Pembe** | `#ff4fbf` | P1 rengi, logo aksan, buton hover glow, kazanan efektleri, Romi imzasÄ± rengi |
| **Neon Turkuaz** | `#35e6e6` | P2 / AI rengi, logo aksan, progress bar baÅŸlangÄ±cÄ±, Toy imzasÄ± rengi |

> Splash screen progress bar turkuazdan pembeye gradient yapar (`#35e6e6` â€º `#ff4fbf`).  
> Logo metninde "Romi" pembe, "Toy" turkuaz ile yazÄ±lÄ±r.

## Bugun PC Tarafinda Gelen Ana Degisiklikler
1. Ana menu ve popup sistemleri logo merkezli daha buyuk PC browser yerlesimine cekildi.
2. Menu ve HUD butonlari mobildeki koyu mavi, ikon + ayirac + sola hizali metin duzenine yaklastirildi.
3. Genel hover sweep animasyonu buton sistemine yayildi; Instagram butonunun ozel hover'i korundu.
4. Tarayici dilini ilk acilista algilayan, kaydedilmis dil varsa onu koruyan bir baslangic mantigi eklendi.
5. Logo web sitesindeki gorseli kullanacak sekilde guncellendi; yerel fallback korundu.
6. Mobil parity'si olarak yeni menu sirasi, yeni yem kurallari ve `1P vs AI` reklamla devam mantigi PC'ye tasindi.
7. Kiran ara `v2.55` gecisi temiz tabandan tekrar kurularak blank-screen bug'i temizlendi.
8. `v2.56` ile round kazanma, final kazanma ve mac sonu istatistik kartlari mobilde sevilen glassmorphism diline yaklastirildi.
11. `v2.61` ile PC ve Mobil tam senkronizasyona girdi:
    - Standart yilan uzunlugu `5` yerine `6` segment oldu.
    - Hizli Rekabetci ve Macera modu sureleri `3 dakika` (`180 saniye`) yapildi. Normal mod ise tamamen limitsiz (`?`) birakildi.
    - Yem dongusu `12` adimdan `14` adima cikarildi.
    - Altin Elmasin rakibi kucultme cezasi iptal edildi; artik yiyene sadece ve net bir sekilde `+3` uzunluk veriyor.
    - `Yakut` (Kalp) gucu `5 saniye` yerine `8 saniye`ye cikarildi. Bu sure zarfinda yilanin tum bedeniyle hizlica RGB/Gokkusagi (Rainbow) renk degistirmesi (Beast Aura) devrede kalir.
    - AI zorluk kademeleri kalkti; artik her kosulda AI, oyuncu hizinin `%70`'i ile sabit hareket eder.
    - `1P` modunda `Hizli Rekabetci` format secilirse artik AI onay pencereleri sorulmadan otomatik secilir.
12. `v2.62` ile PC kazanma animasyonu ve alt arayuz tamamen modernize edildi:
    - Kazanma panelleri ve harf piksellerinin kalinligi-gap durumu mobildeki sikiliga ("Glass Block") getirildi. Win Glyph olcegi daha iyi okunmasi acisindan `scale = 3` yapildi.
    - Alt arayuzdeki (HUD) yuvarlak raunt gostergelerinin etrafina mobildeki premium hissi veren bulanik (blur), P1 ve P2 tematik cizgilerinde "Glassmorphism" paneller sarildi. Bos raunt gostergeleri siyaha kacan renk yerine seffaf cerceveli saydam cam gorunumune kavustu.
13. `v2.64` ile AI hÄ±z dengesi ve HUD iyileÅŸtirmeleri yapÄ±ldÄ±:
    - AI yÄ±lan hÄ±zlarÄ± oyuncunun seÃ§tiÄŸi zorluk seviyesine (Snake Speed) gÃ¶re dinamik hale getirildi. 
    - Kolay: oyuncu hÄ±zÄ±nÄ±n %60'Ä±, Normal: %75'i, Zor (HÄ±zlÄ±/Ekstrem): %90'Ä± olarak gÃ¼ncellendi.
    - PC sÃ¼rÃ¼mÃ¼nde sÃ¼resiz modlarda HUD altÄ±ndaki "infinity:nan" hatasÄ± giderildi, sembolÃ¼n kalÄ±cÄ±lÄ±ÄŸÄ± garanti altÄ±na alÄ±ndÄ±.

14. `v2.65` ile Kurallar > Yem sistemi bolumu gorsel ve icerik olarak yenilendi:
    - Yem listesi ikonlu hale getirildi (normal, cift, altin elmas, mavi elmas, yakut) ve oyun ici gorunume yaklastirildi.
    - Mevcut PC mekanikleri mode gore netlestirildi: Normal/Fast/Adventure farklari ayni kartta acik yazildi.
    - 14 adimli yem dongusu sade ve okunur tek satir formatina cekildi.
    - Kurallar metni tum dillerde ayni formatta calisacak sekilde guncellendi; yem adlari locale bazli kalir.
15. `v2.67` ile Kurallar penceresinde dil temizligi yapildi:
    - Turkce kurallar satirlarinda kalan Ingilizce ifadeler temizlendi.
    - "1P vs AI Reward Continue" ve "Ruby Aura Colors ..." kurallar gorunumunden kaldirildi.
    - Yem kurallari daha sade, hizli okunur formatta yeniden yazildi.
    - Tum diller ayni sade kurallar uretim akisina baglandi.
16. `v2.68` ile surum senkronizasyonu korundu:
    - Mobildeki UI panel oran guncellemesiyle paralel olarak PC dosyasi da `v2.68`e yukseltilip versiyon numarasi senkron tutuldu.
17. `v2.69` ile surum senkronizasyonu bir sonraki turda da korundu:
    - Mobilde panel ic hiza ve pause bubble ergonomisi guncellenirken PC dosyasi da `v2.69`a cekildi.
18. `v2.70` ile surum senkronizasyonu devam ettirildi:
    - Mobilde panel boslugu ve bubble tasma ince ayari yapilirken PC dosyasi da `v2.70`a cekildi.
19. `v2.71` ile kazanma animasyonu renk mantigi netlestirildi:
    - Win animasyonu aktifken matriste cizilen tum bloklar kazanan yilanin rengine zorlanir.
    - Sindirim/flash gibi gecici efektler win aninda kazanan rengi override etmez.
20. `v2.72` ile surum senkronizasyonu korundu:
    - Mobildeki pause bubble konum rollback'i uygulanirken PC dosyasi da `v2.72` surum numarasina cekildi.
21. `v2.73` ile website embed gorunumu icin HUD davranisi guncellendi:
    - Ana menu ve bilgi menulerinde (`Yuksek Skorlar`, `Kurallar`, `Ayarlar`, `Instagram` akisi) alt UI panel gizlenir.
    - UI panel sadece `Oyna` akisina girildiginde gorunur; ana menuye donuste tekrar kapanir.
    - HUD gecisi animasyonlu hale getirildi: acilis asagidan yukari, kapanis asagiya.
22. `v2.74` ile ekran bozulma hatasÄ± (distortion) giderildi:
    - `#stage` elementine `ResizeObserver` eklenerek HUD geÃ§iÅŸlerinde veya pencere boyutu deÄŸiÅŸimlerinde canvas Ã§Ã¶zÃ¼nÃ¼rlÃ¼ÄŸÃ¼nÃ¼n anÄ±nda gÃ¼ncellenmesi saÄŸlandÄ±.
    - Grid hÃ¼crelerinin kare yapÄ±sÄ± ve gÃ¶rÃ¼ntÃ¼ netliÄŸi (DPR senkronizasyonu) her koÅŸulda korunur hale getirildi.
23. - **v2.77**: SÃ¼rÃ¼m eÅŸitleme gÃ¼ncellemesi. TÃ¼m platformlar (PC, Mobil, Android) v2.77 sÃ¼rÃ¼mÃ¼ne Ã§ekildi.
- **v2.78**: SÃ¼rÃ¼m eÅŸitleme gÃ¼ncellemesi. Android icon fix sonrasÄ± tÃ¼m platformlar v2.78'e yÃ¼kseltildi.
- **v2.79**: SÃ¼rÃ¼m eÅŸitleme gÃ¼ncellemesi. Android AdMob entegrasyonu sonrasÄ± tÃ¼m platformlar v2.79'a yÃ¼kseltildi.
- **v2.80**: SÃ¼rÃ¼m eÅŸitleme gÃ¼ncellemesi. Mobil/Android iÃ§in Tam Ekran Immersion (Siyah bar kaldÄ±rma) ve Dinamik Kare Grid sistemi eklendi. P2 paneli 1P modunda kapandÄ±ÄŸÄ±nda oyun alanÄ± en Ã¼ste kadar uzar. (v2.80.1: Mobil iÃ§in animasyon ve hareket hatalarÄ± giderildi).
- **v2.81**: AI yÄ±lanÄ± hÄ±zÄ± yeniden dengelendi (Easy: 40%, Normal: 55%, Fast: 80%, Extreme: 90%). Proje genelinde sÃ¼rÃ¼m senkronizasyonu saÄŸlandÄ±.
- **v2.82**: AI zorluk sistemi ve PC performans iyileÅŸtirmesi.
    - **Rebalance:** AI hÄ±zlarÄ± Easy %40, Orta %60, Zor %80 olarak gÃ¼ncellendi.
    - **Renaming:** "Normal" zorluk seviyesinin adÄ± "Orta" (TR) ve "Medium" (EN) olarak deÄŸiÅŸtirildi.
    - **Extreme Removal:** "Extreme" seÃ§eneÄŸi 1P vs AI zorluk seÃ§imi menÃ¼sÃ¼nden kaldÄ±rÄ±ldÄ±.
    - **UI Sync:** Mobildeki 3 kademeli zorluk seÃ§im menÃ¼sÃ¼ PC'ye port edildi (BaÅŸlÄ±k: "Zorluk SeÃ§").
    - **Performance Fix:** AI yÄ±lan hareketinde oluÅŸan titreme (jitter), render interpolation (`alpha2`) deÄŸerinin `speedFactor` ile normalize edilmesiyle Ã§Ã¶zÃ¼ldÃ¼.
- **v2.84**: SÃ¼rÃ¼m eÅŸitleme ve belge gÃ¼ncellemesi. Oyunda kod deÄŸiÅŸikliÄŸi olmadan tÃ¼m platformlar (PC, Mobil, Android) v2.84 sÃ¼rÃ¼mlerine senkronize edildi.
- **v2.85**: Mobil ve PC'deki lokalizasyon metinleri (oyuncu isminin round sonu ekrana doÄŸru yansÄ±masÄ±) dÃ¼zeltildi. Ã‡eÅŸitli kÃ¼Ã§Ã¼k yazÄ±m ve versiyon hatalarÄ± giderildi. TÃ¼mÃ¼ v2.85 olarak senkronize edildi.
- **v2.86**: Android shell ile senkronizasyon Ã§alÄ±ÅŸmasÄ±. PC sÃ¼rÃ¼mÃ¼ v2.86 olarak mÃ¼hÃ¼rlendi.
- **v2.88**: Lokalizasyon ve Karakter OnarÄ±mÄ±.
    - **Turkce UI Revizesi:** "Ä°sim" yerine daha profesyonel ve kÄ±sa olan **"Ad"** kelimesine geÃ§ildi.
    - **Global Karakter OnarÄ±mÄ±:** PC sÃ¼rÃ¼mÃ¼nde gÃ¶rÃ¼len karakter bozulmalarÄ± (Ã„Â° vb.) tÃ¼m 21 dil iÃ§in Unicode escape (`\uXXXX`) sistemiyle kalÄ±cÄ± olarak onarÄ±ldÄ±.
    - **Senkronizasyon:** TÃ¼m platformlar v2.88 olarak mÃ¼hÃ¼rlendi.
- **v2.89**: Boost (Yakut) Ã‡arpÄ±ÅŸma MantÄ±ÄŸÄ±. Boost modundaki yÄ±lanÄ±n rakibin kafa hÃ¼cresinden geÃ§erek Ã¶lmemesi saÄŸlandÄ±. Mobile ile tam senkronizasyon v2.89 sÃ¼rÃ¼mÃ¼yle mÃ¼hÃ¼rlendi.
- **v2.90**: Google Play Oyun Hizmetleri (Achievement) entegrasyonu ve sÃ¼rÃ¼m senkronizasyonu. PC sÃ¼rÃ¼mÃ¼ mobil ile v2.90'da bir kez daha mÃ¼hÃ¼rlendi.
- **v2.92.0**: Google AdSense H5 Games Ads (Beta) UyumluluÄŸu. Zorunlu `preroll` reklam Ã§aÄŸrÄ±sÄ± (`adBreak({ type: 'preroll' })`) oyun baÅŸlangÄ±cÄ±na eklendi. `data-ad-frequency-hint="30s"` parametresi AdSense script etiketine eklendi. Oyun baÅŸlatma mantÄ±ÄŸÄ± `initGame()` fonksiyonuna sarÄ±larak preroll callback'i iÃ§inden tetiklenir. TÃ¼m platformlar v2.92.0'da senkronize edildi.
- **v2.93.0**: Branded Loading Splash Screen. Oyun baÅŸlangÄ±cÄ±ndaki siyah ekran sorununu gidermek iÃ§in logonun, glow efektinin ve turkuazdan pembeye dolan bir progress bar'Ä±n olduÄŸu "Splash" ekranÄ± eklendi. Preroll reklam sÃ¼recini gÃ¶rsel bir dolum Ã§ubuÄŸu ile maskeler. Reklam bitince (veya 8 saniyelik timeout dolunca) yumuÅŸak bir geÃ§iÅŸle (fade-out) ana menÃ¼ye aktarÄ±r. 21 dil yerelleÅŸtirmesi sisteme dahil edildi.
- **v2.93.1** (ara): TÃ¼rkÃ§e uppercase rendering dÃ¼zeltmesi, "AI Snake" isim sabitlemesi, Android preroll bypass (bkz. v2.93.2).
- **v2.93.2**: Preroll ReklamÄ± KaldÄ±rÄ±ldÄ±. TÃ¼m platformlarda preroll Ã§aÄŸrÄ±sÄ± kaldÄ±rÄ±ldÄ±; splash biter bitmez oyun baÅŸlar. Round arasÄ± ve rewarded continue reklamlarÄ± korundu.
- **v2.93.3** (ara, disk kaydÄ± baÅŸarÄ±sÄ±z â€” v2.93.4'e dahil edildi): Normal mod solo, Fast Competitive AI yem/hÄ±z dengesi.
- **v2.93.4**: Normal Mod Solo + Fast Competitive AI Dengesi + UI Ä°simlendirme. (a) Normal modda 1P â€º AI sorusu atlanÄ±r, tek yÄ±lanla solo baÅŸlar; diÄŸer modlarda deÄŸiÅŸmedi. (b) Fast Competitive 1P+AI: sarÄ± yem AI'a hiÃ§bir etki yapmaz. (c) Fast Competitive 1P+AI: AI beast modu hÄ±zÄ± P1'in anlÄ±k hÄ±zÄ±na kÄ±sÄ±tlandÄ±; gÃ¶rsel efektler korunuyor. (d) HÄ±z seÃ§im penceresinde "Kolay" â€º "YavaÅŸ/Slow/..." 21 dilde gÃ¼ncellendi. (e) Fast Competitive 1P+AI zorluk seÃ§im baÅŸlÄ±ÄŸÄ± "Zorluk SeÃ§" â€º "AI Snake" oldu.
- **v2.93.5**: AÃ§Ä±k Tema Normal Yem Rengi. AÃ§Ä±k tema (`[data-theme="light"]`) aktifken normal (beyaz) yem artÄ±k `#ff4fbf` (Neon Pembe) ile Ã§iziliyor; karanlÄ±k temada beyaz kalmaya devam ediyor. `drawFoods()` iÃ§inde `isLightTheme` bayraÄŸÄ± ile hem `innerColor` hem halo `base` rengi dinamik olarak deÄŸiÅŸtiriliyor.
- **v2.93.6**: SÃ¼rÃ¼m senkronizasyonu (Android shortcut dÃ¼zeltmeleri Mobile tarafÄ±nda yapÄ±ldÄ±). PC dosyasÄ± versiyon numarasÄ± gÃ¼ncellendi.

**v2.94.0**: Kazanan banner satir kirilmasi duzeltildi.
    - PC round kazanimi banner'inda metin artik tek satirda kalir.
    - `KAZANDI` kelimesi ikinci satira dusup karti dikeyde buyutmez.
    - Normal round banner ve glass winner banner ayni tek satir davranisina baglandi.
    - Mac sonu istatistik penceresi bu guncellemeden etkilenmedi.
**v2.94.1**: Ana HTML revalidation ve guvenli cache yenileme mantigi eklendi.
    - `index.html` seviyesinde `no-cache / must-revalidate` meta sinyalleri eklendi.
    - Oyun acilisinda, sekme geri odaga geldiginde ve ana menu yeniden acildiginda uzaktaki HTML versiyonu sessizce kontrol edilir.
    - Daha yeni surum bulunursa sadece guvenli durumda (oyun aktif degilken, ana menudeyken, reklam akisi yokken) cache-busting query ile temiz yenileme yapilir.
    - `localStorage` temizlenmez; dil, tema, ses, highscore ve oyuncu isimleri korunur.
**v2.94.2**: PC dosyasi yeni surum numarasina senkronize edildi.
    - Masaustu reklam ses davranisi bilincli olarak degistirilmedi.
    - Mobil browser'a ozel sessiz interstitial stratejisi sadece mobil dosyada uygulanir.
**v2.94.3**: Menu secim pencerelerindeki alt aciklama satirlari kaldirildi.
    - `pickOne` benzeri satirlar tum secim banner'larinin render akisindan cikarildi.
    - Oyun modu, oyuncu modu, AI secimi, arena tipi, dil ve benzeri secim ekranlari artik tek satir baslik + buton yapisiyla acilir.
**v2.94.4**: PC dosyasi yeni surum numarasina senkronize edildi.
    - Bu turdaki buton pulse hissi sadece mobil banner/menu butonlarina uygulandi.
    - Masaustu menu buton davranisi bilincli olarak degistirilmedi.
**v2.94.5**: Final kazanma animasyonundaki konfeti akisi yumusatildi.
    - Konfeti hareketi CSS piksel uzayina cekildi; cihaz DPR farklari yuzunden gereksiz buyuk alan ve sert sicrama olusmasi engellendi.
    - Frame delta, daha stabil ve akici gorunmesi icin yumusatildi ve sinirlandi.
    - Parca sayisi ve hiz dagilimi hafif optimize edilerek final sahnesindeki takilmalar azaltildi.
**v2.94.6**: Splash Screen Optimizasyonu.
    - YÃ¼kleme ekranÄ± 3 saniyelik, cubic ease-in animasyonlu yeni bir mantÄ±ÄŸa geÃ§irildi.
    - `performance.now()` ile tam sÃ¼re yÃ¶netimi saÄŸlanarak her cihazda aynÄ± akÄ±cÄ±lÄ±k hedeflendi.
    - PC sÃ¼rÃ¼mÃ¼ Mobil ve Android sÃ¼rÃ¼mleriyle v2.94.6 olarak senkronize edildi.

## Genel PC Yapisi
- P1 kontrolleri `W-A-S-D`, P2 kontrolleri yon tuslari ile calisir.
- Alt HUD paneli sabit kalir; orta popup pencereler bunun uzerine acilir.
- Menu yonetimi banner veya popup mantigiyla yapilir.
- PC popup boyutlari mobilde oldugundan daha buyuktur; browserdan oynanacagi varsayilir.

## Menu ve Popup Navigation
Aktif ana oyun akisi (v2.96.9 ile gÃ¼ncellendi):

1. `Oyna` butonuna basÄ±ldÄ±ÄŸÄ±nda doÄŸrudan `Quick Setup` (HÄ±zlÄ± Kurulum) arayÃ¼zÃ¼ aÃ§Ä±lÄ±r.
2. Quick Setup arayÃ¼zÃ¼ masaÃ¼stÃ¼ kullanÄ±m iÃ§in 2 sÃ¼tunludur:
   - **Screen 1 (Sol)**: Player Mode (1P/2P) ve Game Mode seÃ§imlerini iÃ§erir.
   - **Screen 2 (SaÄŸ)**: Arena Type, Speed/AI ayarlarÄ±, Ä°sim ve Renk paletlerini iÃ§erir. Start butonu buradadÄ±r.

PC menu navigation notlari:
- Menu history `menuHistory` stack'i ile tutulur.
- `navigateTo()` yeni popup'a giderken history'e yazar.
- `goBack()` onceki popup'a doner; history cok kisaysa ana menuye duser.
- Bu sistem menu akisini sabit `if` zincirlerinden daha guvenli sekilde yonetir.

## Ana Menu ve HUD Tasarim Dili
- Ana menu logo merkezlidir; buyuk baslik yerine logo kullanilir.
- Ana menu logosu once web sitesindeki uzaktan gorseli dener, olmazsa yerel fallback kullanir.
- Buton satirlari ikon + ayirac + sola hizali metin kompozisyonu ile kurulur.
- HUD tarafindaki `Ana Menu`, `Duraklat`, `Maci Sifirla`, `Ses`, `Dil` butonlari da ayni aileye dahildir.
- Popup panelleri browser ekraninda daha dengeli gorunsun diye buyutulmustur.

## Hover ve Buton Davranisi
- Genel buton hover'i sweep gecisli ve yumusak in/out davranislidir.
- Instagram butonunun ozel hover arka plani Instagram tonlarinda kalir.
- Genel turkuaz ve pembe hover, Instagram yaninda sonuk kalmayacak kadar canlandirilmistir.
- Ana menude ek olarak imleci hafif gecikmeyle takip eden bir hover katmani bulunur.

## Round, Final ve Game-End Glass Sistemi
- PC'de kazanan popup'i artik standart `banner.padded` gorunumu yerine `winner-glass-banner` ile acilir.
- Bu banner round ve final kazanma durumlarinda kullanilir.
- Stil bileÅŸenleri:
  - daha acik koyu glass gradient
  - blur + saturate
  - icte ince bir highlight katmani
  - pembe ve turkuaz glow'un daha yumusak masaustu versiyonu
- Mac sonu istatistik karti da ayni aileye tasinmistir; `game-end-overlay` hafif blur'lu, `game-end-card` yari seffaf cam panel gibi davranir.
- Kartlar bilerek tamamen opak degildir; oyun alani hafif hissedilir sekilde arkada kalir.
- Son ince ayarda koyu glass panelin alpha degerleri azaltildigi icin gorunum daha ferah tutulmustur.
- Light theme icin de ayri glass varyanti vardir; beyaz cam yuzey, yumusak cyan/pink glow ve daha hafif blur kullanir.

## Dil Baslangic Mantigi
- Kullanici daha once dil sectiyse kaydedilen dil korunur.
- Ilk acilista tarayici dili okunur.
- O dil oyunda desteklenmiyorsa `English`e duser.
- Bu secim daha sonra saklanir ve bir sonraki acilista korunur.

## Oyun Modlari ve Sureler
- `Normal`
  - Sure: Suresiz (`?`)
  - Sadece beyaz yem kullanir.
- `Fast Competitive`
  - Sure: `3 dakika` (`180 saniye`)
  - Ozel `14` adimli yem dongusu aktif olur.
  - Son `10 saniye` kala ses uyarisi calar.
  - Son `3 saniye` kala oyun ortasinda sayim gorunur.
- `Macera`
  - Sure: `3 dakika` (`180 saniye`)
  - Rekabetci yem mantigini kullanir.
  - Yakut cikmaz; onun adimi normal yeme doner.

## Yem Kurallari
- `Beyaz Yem`
  - `+1` uzunluk verir.
- `Cift Yem`
  - Iki adet birlikte cikar.
  - Biri yenince digeri kaybolur.
- `Altin Elmas`
  - `+3` uzunluk verir.
  - Yenene kadar `3 saniyede bir` yer degistirir. (Kucultme yetenegi kaldirildi)
- `Mavi Elmas`
  - `+1` uzunluk verir.
  - Rakibi yavaslatir.
  - Normal yemle esli versiyonunda biri yenince digeri kaybolur.
- `Yakut`
  - Sadece `Fast Competitive` modda cikar.
  - Yenince sahadaki mevcut yemleri temizler.
  - Yerine `12` beyaz yem ve `1` bagimsiz mavi elmas gelir.

## Fast Competitive Exact Dongu
PC'de mobil parity'si olarak aktif kabul edilen dongu:

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

## 1P vs AI Kurallari
- `1P` secimi sonrasinda oyuncu `Normal` modu secerse `AI Yilan EVET / HAYIR` penceresi gelir, ancak `Hizli Rekabetci` mod otomatik olarak AI acar.
- `1P vs AI` modunda AI yÄ±lan hÄ±zÄ±, oyuncu hÄ±zÄ±na oranla dinamiktir: Kolay %40, Orta %60, Zor %80. Eski %60/75/90 oranlarÄ± v2.82 ile gÃ¼ncellenmiÅŸtir.
- AI'nin rounddaki ilk yedigi yemde P1 kisalmama kurali korunur.

## 1P vs AI Reklamla Devam Mantigi
- Odullu reklamla devam mantigi sadece `1P vs AI` modunda kritik hale gelir.
- AI roundu kazanirsa ve reklam akisi uygunsa kullaniciya devam secenegi sunulur.
- Reklam tamamlanirsa oyun son guvenli snapshot'tan geri yuklenir.
- Ancak P1 eski konuma birebir donmez.
- Son hareket yonunun tersine `15 kutu` geriden spawn edilir.
- Bu alan guvenli degilse en yakin bos ve carpismasiz alan otomatik bulunur.
- Reklamla donen P1 uzunlugu `5` olur.
- Aktif round durumu, snapshot zaman kaydirma mantigi ve AI durumu korunur.

## Rules ve Localization Notlari
- PC kurallar penceresi `getInstructionsMarkup()` uzerinden uretilir.
- Yeni parity sistemleri geldikce kurallar metni de ayni turda guncellenmelidir.
- Dil tablosu, rewarded continue aciklamalari ve menu metinleri tek noktadan senkron tutulmalidir.
- `fastCompetitiveMode` Turkce etiketinin `Hizli Rekabetci` cizgisinde kalmasi beklenir.

## Store Listing Protokolu
- Play Store Ã¼zerindeki Ad, KÄ±sa AÃ§Ä±klama ve Tam AÃ§Ä±klama metinleri `MD Files/Store_Listing.md` dosyasÄ±nda 21 dilde tutulur.
- Bu metinlerde deÄŸiÅŸiklik yapÄ±ldÄ±ÄŸÄ±nda tÃ¼m dillerde gÃ¼ncellenmelidir.

## Ana Menu Logo ve Website Uyumu
- PC ana menu logosu website uzerindeki gorselle senkron calisacak sekilde ayarlanmistir.
- Uzak URL calismazsa yerel fallback kullanilir.
- Website embed senaryosunda logo kirik gorunmemesi icin bu davranis korunmalidir.

## Kazanim Animasyonu Notu
- PC round kazanimi ve final kazanimi animasyonu su anda gorsel referans kabul edilir.
- Ozellikle `P1` ve `P2` tarafindaki sonen, bloklu ve dengeli ekran PC'de daha olgun durumdadir.
- `v2.56` itibariyla bu bloklu arka yapi ustune gelen sonuc karti da glassmorphism hissi tasir.
- `v2.94.0` itibariyla kazanan banner metni tek satira kilitlidir; satir kirilmasi nedeniyle kart yuksekligi artik anlik olarak degismez.
- Yani referans sadece blok harf animasyonu degil, onun uzerindeki blur'lu sonuc panelidir.
- Mobilde benzer bir is yapilacaksa PC gorsel dili referans alinmalidir; PC'yi mobille geriye cekme.

## Kodlama Kurallari
1. PC surumunde de her sey tek HTML dosyada kalmalidir.
2. Yeni UI metinleri `STRINGS` veya ilgili ceviri katmanina baglanmalidir.
3. HUD alt panel oranlari korunmali, orta popup'lar bunun ustune yerlestirilmelidir.
4. Hover sistemini degistirirken genel sweep animasyonu ile Instagram ozel hover'ini birbirine karistirma.
5. Menu history, rewarded continue snapshot ve popup sizing birbirinden bagimsiz degildir; birini degistirince digerlerini de kontrol et.
6. Mobil parity islerinde sureleri otomatik esitleme; PC'nin kendi suresel dengesi artik farklidir.
7. **Kritik Surum (Version) Kurali:** Kullanici *sadece PC surumunde* bir guncelleme talep etse bile, (ornegin v2.63 istendiginde) PC guncellendikten sonra **mutlaka** ayni surum numarasiyla "2 Player Snake Mobile v2.63.html" adinda **yeni bir mobil dosya** da olusturulmalidir. Mobil dosyanin icerisinde aktif bir kod degisikligi yapilmasa dahi baslik (title) ve ic `VERSION` degiskenleri v2.63 olarak sekillendirilmeli, bu sayede masaustundeki surum numarari hicbir zaman karismamali ve daima %100 senkron goturulmelidir.
8. **Dinamik SÃ¼rÃ¼mleme ve Yeni Dosya OluÅŸturma:** KullanÄ±cÄ± her "gÃ¼ncelle", "yeni sÃ¼rÃ¼mÃ¼ gÃ¼ncelle" veya benzeri bir geliÅŸtirme isteÄŸinde bulunduÄŸunda, mevcut sÃ¼rÃ¼m numarasÄ± (Ã¶rneÄŸin v2.70) otomatik olarak bir kademe artÄ±rÄ±lmalÄ± (v2.71) ve yapÄ±lan deÄŸiÅŸiklikler bu yeni sÃ¼rÃ¼m numarasÄ±na sahip **yeni dosyalar** (hem PC hem Mobil) Ã¼zerinden sunulmalÄ±dÄ±r. HTML iÃ§erisindeki `VERSION` sabiti ve `<title>` etiketi de bu yeni numaraya gÃ¶re gÃ¼ncellenmelidir. Eski dosyanÄ±n Ã¼zerine yazmak yerine her zaman yeni bir dosya oluÅŸturulmasÄ± zorunludur.
9. **Merkezi SÃ¼rÃ¼m NotlarÄ±:** Her yeni AAB oluÅŸturulduÄŸunda veya ana sÃ¼rÃ¼m gÃ¼ncellendiÄŸinde, `MD Files/Release_Notes.md` dosyasÄ±na yeni sÃ¼rÃ¼m notlarÄ± eklenmelidir. Notlar projenin desteklediÄŸi 21 dilde ve `<en-US>...</en-US>` Tag formatÄ±nda yazÄ±lmalÄ±dÄ±r.
- **MaÄŸaza Metinleri:** Play Store Ã¼zerindeki Ad, KÄ±sa AÃ§Ä±klama ve Tam AÃ§Ä±klama metinleri `MD Files/Store_Listing.md` dosyasÄ±nda 21 dilde tutulur. Bu metinlerde deÄŸiÅŸiklik yapÄ±ldÄ±ÄŸÄ±nda tÃ¼m dillerde gÃ¼ncellenmelidir.
- **Kodlama Ã–ncesi NetleÅŸtirme:** Yapay zeka, kullanÄ±cÄ±dan gelen her gÃ¼ncelleme veya yeni Ã¶zellik talebinde, kodlamaya (uygulamaya) geÃ§meden Ã¶nce aklÄ±ndaki tÃ¼m sorularÄ± kullanÄ±cÄ±ya sormalÄ± ve iÅŸleyiÅŸi netleÅŸtirmelidir. Kod yazÄ±mÄ±na ancak kullanÄ±cÄ±dan onay veya yanÄ±t alÄ±ndÄ±ktan sonra baÅŸlanmalÄ±dÄ±r.

## Mobil ile Iliski
- Mobil ve PC artik ayni ana sistemleri paylasir:
  - yeni menu sirasi
  - yeni yem dongusu
  - `1P vs AI` odullu reklamla geri donus mantigi
- Ancak her iki platformun UI ritmi, popup olcegi ve bazi sure dengeleri birebir ayni olmak zorunda degildir.

## Sonraki AI Icin Kisa Not
PC tarafinda yeni bir parity veya refactor isi gelirse once bu rehberi, sonra mobil rehberi birlikte oku:
- [AI_Guide_Mobile.md](C:/Users/Toygun/Desktop/AI%20Games/2%20Player%20Snake/AI_Guide_Mobile.md)

Kaynak yorumlarken "mobilde boyleydi, PC'ye aynen gelir" varsayimi yapma. Ozellikle sureler, popup boyutu ve kazanim animasyonu PC'de artik bilincli olarak farklidir.

## v2.95.1 Notu (PC Tarafi Etki Durumu)
- Bu turdaki aktif degisiklik Android shell tarafinda yapildi (shortcut acilisi + cache-bust URL).
- PC web HTML gameplay mantiginda yeni bir kod degisikligi yok.
- Ancak surum parity geregi, Android ve mobil kaynakli "eski cache acildi" raporlari geldiginde once shell URL olusumunu kontrol et, sonra PC gameplay'e dokun.

## v2.95.1 Hotfix (2026-04-22) - Macera 1P Acilmama Duzeltmesi
- Sorun: PC'de `Oyna -> Macera -> 1 Oyuncu` akisinda menu ilerlemiyor, oyun baslamadan bos kaliyordu.
- Kok neden: `openAISnakeMenu()` icinde projede olmayan `navigateToMenu(MENU_IDS.SPEED, 'forward')` cagrisi kalmisti.
- Duzeltme: Akis mevcut menu yonlendirme sistemiyle uyumlu hale getirildi ve `navigateTo(openSpeedMenu)` kullanildi.
- Sonuc: Macera + 1 Oyuncu seciminden sonra hiz/zorluk menusu acilir ve oyun normal sekilde baslar.

## v2.95.2 - Beast Collision Kurali (PC)
- Hedef: `Hizli Rekabetci` modunda beast etkisi altindaki carpisma davranisini netlestirmek.
- Uygulanan kural:
  - 2P modunda beast olan yilan, rakibin govdesinin icinden gecebilir.
  - 1P vs AI modunda P1 sadece `P1 beast` ve `AI beast degil` iken AI govdesinin icinden gecebilir.
  - AI beast modundaysa P1 icinden gecemez (P1 beast olsa bile).
  - AI (P2) beast modunda degilse P1'e temasinda normal carpisma kurali devam eder.
- Teknik not: `checkCollision()` icinde `p1CanPhaseThroughOpponent` ve `p2CanPhaseThroughOpponent` karar katmani eklendi.

## v2.95.3 - Version Parity Notu (PC)
- Bu adimda PC gameplay mantigina yeni bir davranis eklenmedi.
- PC dosyasi release parity icin `v2.95.3` surum numarasina eslendi.
- Yeni dosya:
  - `Ana Dosya/PC/Beta/v2/2 Player Snake v2.95.3.html`
- Teknik olarak guncellenen kisimlar:
  - `<title>`
  - HTML version comment
  - header icindeki surum notu
  - `const VERSION`
- Android shortcut preset landing mantigi sadece mobil web tarafinda degistigi icin, bu turda PC'de ek menu / akÄ±ÅŸ degisikligi yoktur.

## v2.95.4 - Normal Mode Food Boost (PC)
- Hedef: Normal modda beyaz yem +2 vermesi (Hizli Rekabetci ve Macera etkilenmez).
- PC `eatFoodIfAny()` icindeki normal yem dali normal mod icin `s.grow += 2` uygular; diger modlar icin +1 olarak kalir.
- Talimatlar ekranindaki yem kurali tablosu i18n string'leri ile guncellendi.

## v2.95.5 - Self Area 51 Mode (PC)
- Yeni oyun modu: `gameStyle = 'selfArea51'`. Oyun modu menusunde 3. siraya eklendi (Normal, Hizli Rekabetci, Self Area 51, Macera).
- PC split: tahtanin **dikey** olarak iki yariya bolundugu surum. P1 sol yari (`xMin = 0`, `xMax = GRID_COLS/2 - 1`), P2 sag yari (`xMin = GRID_COLS/2`, `xMax = GRID_COLS-1`).
- Sarmalama: her oyuncu yalniz kendi yarisi icinde sarmalanir. `selfArea51WrapForOwner(c, ownerKey)` y ekseninde tam sarmalama, x ekseninde half-bound clamp ile sarmalama yapar. `handleBoundaries()` artik `(c, ownerKey)` alir.
- Yemler:
  - Normal beyaz yem her yariya birer adet, `selfArea51Half: 'p1'|'p2'` etiketiyle. +1 uzunluk.
  - 20 sn (countdown sonrasindan) sonra her iki yariya esanli **yesil elmas** spawn olur.
  - Yesil elmas her 3 sn kendi yarisi icinde yer degistirir.
  - Yesil elmas yiyince: yiyene **+2**, rakibe **-1** (length floor 1, oldurmez). Ilk yiyen rakibin elmasini siler ve 20 sn timer her ikisi icin sifirlanir.
- Kazanma kosulu: ilk **uzunluk 51**'e ulasan kazanir. Tek mac (best-of-5 yok). Self-collision olum, diger oyuncu mac'i kazanir.
- AI: `gameStyle === 'selfArea51'` icin BFS hedef oncelik: kendi yarisindaki yesil elmas > beyaz yem. Rakip yilani engel olarak gormez.
- HUD: PC oyuncu panellerine `self51-active` class eklenir; `--self51-pct` CSS variable ile saat yonunde dolan parlak yesil halka + buyuk `length / 51` text. `dot-pulse` ve timer gizlenir.
- Menu akisi:
  - 1P selfArea51: `Game Mode > 1 Oyuncu > AI Yilan (EVET/HAYIR + zorluk) > Hiz > Ad & Renk` (Wall menu atlanir, sarmalamaya kilitli).
  - 2P selfArea51: `Game Mode > 2 Oyuncu > Hiz > Ad & Renk`.
  - `currentWallMode = MOD_WALLS.NONE` her zaman.
- State: `selfArea51StartTime`, `selfArea51GreenSpawnAt`, `selfArea51GreenActive`, `selfArea51GreenLastMove`. `clearGameState`/`openMainMenu` yollarinda sifirlanir; countdown sonunda `selfArea51StartTime = now`, `selfArea51GreenSpawnAt = now + 20000` set edilir.
- Render: `drawSelfArea51Divider()` ortadaki sutun bandini cizer (cyan kesikli). `drawFoods()` `'green'` tipini parlak yesil elmas (rgb(57,255,122)) olarak cizer.
- `showGameEndStats`: selfArea51 icin `roundsWon` satiri gizlenir (`isSolo || isSelf51`).

## v2.95.6 - Self Area 51: Round System & Render Fix (PC)
- **Round sistemi**: Self Area 51 artik standart `GAMES_TO_ROUND = 5` (first-to-5 / best-of-9) akisini kullanir. Tek mac mantigi kaldirildi.
  - Olasi final skorlar: `5-0, 5-1, 5-2, 5-3, 5-4`.
  - Her round bagimsiz bir 51 uzunluk yarisidir. `resetRound()` standart akisi calisir: uzunluk 5'e doner, yemler temizlenir/yeniden dogar, geri sayim, 20 sn yesil elmas timer'i (`selfArea51GreenSpawnAt = now + 20000`) yeniden baslar.
  - `finalizeCompetitiveResult(result)`: artik selfArea51 icin erken cikis YOK. Standart `awardGame(result)` cagrilir; `isFinal = games[result] >= GAMES_TO_ROUND`. 51-51 simultane veya cift self-collide => draw, puan yok, `resetRound(3)`.
- **Render fix - half-aware lerp**: `modLerp(prev, cur, GRID_COLS, t)` GRID_COLS bazli wrap algiladigi icin yarinin icindeki wrap'leri tespit edemiyor ve yari boyunca uzayan portal/teleport benzeri bir cizgi cikariyordu.
  - Cozum: `selfArea51LerpX(prev, cur, ownerKey, t)` â€” `selfArea51HalfBounds(ownerKey)`'in `xMin/xMax`'ini kullanip `span = xMax - xMin + 1` icinde wrap-aware lerp yapar.
  - `drawSnakeBlocks` icinde `gameStyle === 'selfArea51'` ise X ekseni icin bu helper, Y ekseni icin normal `modLerp` kullanilir.
- **HUD**:
  - Yem sayaci (`p1FoodBox/p2FoodBox`) gizlenir (`display:none`).
  - Yerine `updateSelfArea51ProgressBars()` ile 0â€º51 boost-bar render edilir; renk `playerColors.p1/p2`. `length / 51` text gosterir.
  - 5 round dot'u (`drawSeries`) gorunur kalir; kazandikca soldan dolar.
  - `timeLabel` gizli.
- **Match end**: `showGameEndStats` icindeki gizleme kosulu `(isSolo || gameStyle === 'selfArea51')` => `isSolo`'ya geri cekildi. `roundsWon` satiri Self Area 51'de de gosterilir.

## v2.95.7 - Beast Mode Head Collision Fix & Food-Eat Animation (PC)
- **Beast baÅŸ-baÅŸ fix**: `collideCheckDetailed` icindeki head-to-head bloÄŸunda `isAiDuel` kontrolu artik `beast1 || beast2` kontrolunden SONRA geliyor. Eskiden `isAiDuel = true`yken her baÅŸ-baÅŸ collision 'draw' dÃ¶ndÃ¼ruyordu, beast olsa bile. Artik beast ise her zaman `{ result: null }` dÃ¶ner (pass-through); AI duel draw mantigi yalnizca beast yoksa devreye giriyor.
- **DigestAnim renk duzeltmesi**: `eatFoodIfAny` icinde normal yem rengi artik `playerColors[ownerKey]`; `gameStyle === 'adventure'`de `'#ffffff'` sabit kodlama kaldirildi. Boylece macera modunda da yem yeme dalgasi oyuncu renginde gorunur.

## v2.96.9 - Self Area 51 Polish & Bug Fixes
- **UI**: Self Area 51 progress bar boyutu (16px â€º 28px) ve yazi boyutu (11px â€º 15px) buyutuldu.
- **Dengeleme**: Yesil yem +2 yerine +1 buyutme saglar, rakibi yine -1 kucultur. Relocation suresi 20s'den 15s'ye dusuruldu.
- **Symmetric Spawning**: P1 ve P2 artik kenarlarda baslayip birbirlerine bakacak sekilde (head-to-head) spawn edilir.
- **Matrix Fix**: "P1/P2" win matrix'inin bÃ¶lÃ¼nmÃ¼ÅŸ ekran sÄ±nÄ±rlarÄ±nda bozulmasÄ± engellendi.
- **Animasyon Gap Fix**: Raunt geÃ§iÅŸlerindeki 500ms'lik matris bozulma/jitter hatasÄ± winAnim durumunun korunmasÄ±yla Ã§Ã¶zÃ¼ldÃ¼.
- **SÃ¼rÃ¼m Senkronizasyonu**: TÃ¼m platformlar (PC, Mobil, Android) v2.96.9 sÃ¼rÃ¼mÃ¼ne Ã§ekildi.

## v2.96.9 - Single-Page Quick Setup
- PC'de de mobille senkron olarak tek sayfalÄ± "Quick Setup" ekranÄ±na geÃ§ildi.
- PC'nin geniÅŸ ekran ergonomisi kullanÄ±larak menÃ¼ yatay 2 sÃ¼tuna bÃ¶lÃ¼ndÃ¼.
- `openPCSetupScreen1` ve `openPCSetupScreen2` render fonksiyonlarÄ± ile "Partial DOM Update" (kÄ±smi yenileme) mantÄ±ÄŸÄ± kuruldu; bÃ¶ylece 1P/2P veya renk seÃ§imlerinde ekran titremesi ortadan kaldÄ±rÄ±ldÄ±.

## Google Play Games on PC (GPGPC) Notu
- Artik PC deneyimi iki ayri yoldan acilabilir:
  - Website/browser: dogrudan PC web dosyasi
  - Google Play Games on PC: Android shell uzerinden, ama yine PC web dosyasini yukleyerek
- GPGPC tarafinda hedef URL:
  - `https://2playersnake.com/wp-content/uploads/game/index.html`
- Bu nedenle PC gameplay degisiklikleri once web dosyasina yazilir; GPGPC istemcisi de ayni kaynagi ceker.

### Pratik Sonuc
- "PC oyunu ayri native kod" degil; "PC web payload + Android shell routing" modelidir.
- UI/olceklendirme farki gorulurse once shell viewport/routing kontrol edilir, sonra web CSS breakpoints kontrol edilir.
- Detayli is akis rehberi: `MD Files/AI_Guide_GPGPC.md`




