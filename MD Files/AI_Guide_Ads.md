# 2 Player Snake - Reklam Mantigi Teknik Rehberi

Bu belge, oyundaki reklam akisinin guncel davranisini ozetler. Web tarafinda reklamlar Google AdSense H5 Games Ads ile, Android shell icinde ise native koordine edilen bir kopru ile calisir.

Referans yerel web kaynağı: `v3.5.8` (native sürümler: iOS Build 46 / Android Code 71)

## Çevrimiçi Hükmen Galibiyet (Forfeit) Reklam Entegrasyonu — v3.5.8 (2026-09-30)

- **Hükmen Galibiyette Geçiş Reklamı (Interstitial Monetization):**
  - Çevrimiçi maçlarda rakip ayrıldığında (15s grace period bittiğinde) `gameOver (reason: 'forfeit')` tetiklenir.
  - Önceki sürümlerde istatistik ekranı doğrudan açıldığı için bu kritik zafer anında reklam çalışmıyordu ve gelir kaybı oluşuyordu.
  - `v3.5.8` ile hükmen galibiyet kesinleştiğinde zafer kutlamasının ardından istatistik ekranı açılmadan hemen önce `AdManager.maybeShowGameOverAd` geçiş reklamı tetiklenir.
  - İstatistik ekranındaki "Tekrar Oyna" butonu, oyuncuyu çevrimdışı moda düşürmek yerine doğrudan yeni bir çevrimiçi eşleşme aramaya (`startMatchmaking()`) yönlendirir.
  - Otomatik test sonucu: **130/130 başarılı**.

## Güncel Beast Başlangıç Dengeleme İyileştirmesi — v3.5.6 (2026-09-30)

- **Oyuncu Odaklı Beast Başlangıcı (Yem Patlamasız / Ruby Burst Yok):**
  - v3.5.5'te eklenen "BEAST MODUYLA BAŞLA" ödüllü video özelliği, başlangıçta `spawnRubyBurstFoods()` çağırarak sahaya 12 normal yem + 1 safir yem saçıyordu.
  - Özellikle `1P vs AI` modunda bu durum, AI yılanının başlangıçta etraftaki yemleri anında yutarak orantısız büyümesine ve reklam izleyen oyuncuya karşı haksız avantaj kazanmasına yol açıyordu.
  - **v3.5.6 Çözümü:**
    - Geri sayım bitimindeki `countdown` bloğundan `spawnRubyBurstFoods()` ve `redBulkEndTime` kaldırıldı.
    - Beast etkisi **yalnızca Player 1 yılanına** verilir: 8 saniye (`BEAST_MODE_DURATION_MS = 8000`) boyunca 1.45x hız, engellerden ve gövdelerden geçebilme dokunulmazlığı, RGB aura ve kalp SFX (`SFX.heart()`).
    - Matriste fazladan yem oluşmaz, standart başlangıç yem düzeni korunur. AI yılanının avantaj sağlaması engellendi.
    - Oyun esnasında yakut kalp yemi doğal olarak yendiğinde `spawnRubyBurstFoods()` eskisi gibi normal çalışmaya devam eder.
    - Süre bitiminde `beastOwner` ve güç durumu PC/Mobile döngülerinde temizlenir.
- **Tüm Dosyalarda Eşitlik:**
  - `Mobile v3.5.6`, `PC v3.5.6`, `Android offline fallback` ve `iOS offline fallback` dosyaları bayt bayt eşitlendi. Otomatik test sonucu: **125/125 başarılı**.

## Önceki Ödüllü Başlangıç ve Canlanma Koruması — v3.5.5 (2026-09-30)

- **1 Kişilik Modlarda "BEAST MODUYLA BAŞLA" Ödüllü Video Butonu:**
  - Quick Setup (Hızlı Kurulum) menüsünde, 1 Kişilik modlarda (1P Klasik Solo, 1P vs AI, Macera, Self Area 51) standart "BAŞLA" butonunun hemen altına yerleştirildi.
  - **Tasarım:** Kırmızı-Turuncu gradyan (`linear-gradient(135deg, #ff1744 0%, #ff5722 50%, #ff9100 100%)`), video kamera ikonu (`<i class="fa-solid fa-video"></i>`), üstte "BEAST MODUYLA BAŞLA", altta "(Reklam)" veya VIP kullanıcılar için "(VIP / Ücretsiz)" alt başlığı.
  - **Dinamik Görünürlük:** 2P seçildiğinde buton otomatik olarak gizlenir (`display: none`), 1P'ye dönüldüğünde tekrar görünür.
  - **8 Saniyelik Beast Başlangıcı:** Reklam tamamlandığında (veya VIP ise doğrudan) maç başlar. Başlangıçtaki 3-2-1 geri sayımı bittiği anda oyuncunun yılanı tam **8 saniye** (`BEAST_MODE_DURATION_MS = 8000;`) boyunca Beast Modu (hız artışı, RGB aura efekti, dokunulmazlık, ruby burst yem saçılımı, kalp SFX) kazanır. Yalnızca 1. round başında devreye girer.
- **Ödüllü Canlanma 3-2-1 Geri Sayım Koruması (`startRewardedResumeCountdown`):**
  - Maç içinde ödüllü reklam izlenerek canlanıldığında (`restoreRewardSnapshot`), oyunun eskisi gibi aniden başlayarak ani çarpışmalara ve kaza ölümlerine yol açması engellendi.
  - Reklam penceresi kapatıldıktan sonra oyun başlamadan önce ekranda **3-2-1 ve BAŞLA** geri sayımı oynatılır.
  - Geri sayım boyunca geçen milisaniyeler aktif round süresine (`roundTimerEnd`), güçlendirme sürelerine (`bulkFoodEndTime`, `redBulkEndTime`, `slowEnd`, `flashColorEnd`, `sapphireTeleportEnd`) ve yem/yılan zaman damgalarına eklenerek haksız süre kaybı önlenir.
- **21 Dilde Tam Yerelleştirme:**
  - `startWithBeast`, `startWithBeastAd`, `startWithBeastVip` anahtarları 21 dilde (tr, en, de, fr, es, it, zh, hi, pl, pt-BR, ar, ru, id, ja, ko, vi, th, tl, nl, el, cs) eksiksiz çevrildi.
- **Tüm Dosyalarda Eşitlik:**
  - `Mobile v3.5.5`, `PC v3.5.5`, `Android offline fallback` ve `iOS offline fallback` dosyaları bayt bayt eşitlendi. Otomatik test sonucu: **123/123 başarılı**.

## Önceki Reklam ve Gelir Optimizasyonu Notu — v3.5.4 (2026-09-30)

- **30 Saniye Küresel Cooldown (`cooldownMs: 30000`):**
  - Reklam arası minimum küresel bekleme süresi 45 saniyeden 30 saniyeye indirildi. Böylece oyuncuyu boğmadan daha dinamik ve gelir dostu bir gösterim frekansı elde edildi.
- **Ödüllü Reklam (Rewarded Video) Global Cooldown Engelinden Muaf:**
  - `canOfferRewardedContinue()` içindeki `!this.isGlobalCooldownActive()` kısıtlaması kaldırıldı. Oyuncu kendi isteğiyle ödüllü video izlemek istediğinde (opt-in) küresel bekleme süresine takılmaz. Reklam izlendiğinde `recordAdShown('reward')` ile son reklam zamanı güncellenir ve hemen ardından geçiş reklamı çıkması önlenir.
- **Solo (Klasik 1P) Moduna Ödüllü Canlanma Desteği:**
  - Önceden sadece `1P vs AI` modunda olan ödüllü devam özelliği, Klasik Solo 1P moduna da entegre edildi (`maybeInterceptSoloLoss`). Oyuncu yandığında 5 saniyelik geri sayımla canlanma popup'ı açılır. Reklam izlendiğinde 5 adım geriden ve 3 saniyelik koruma süresiyle oyuna kaldığı skordan devam eder (maç başına 1 kez).
- **Maç Sonu Reklam Akışı & Buton Temizliği:**
  - Kupa ve maç sonu istatistikleri açılmadan hemen önce `maybeShowGameOverAd` (`match_end`) ile geçiş reklamı devreye girer. İstatistik ekranındaki "Ana Menü" ve "Tekrar Oyna" butonlarındaki araya giren reklamlar (`menu_after_stats`, `replay_after_stats`) tamamen kaldırıldı; oyuncu butonlara bastığında beklemeden, anında tepki alır.
- **Round Arası Reklamlar Tek Sayılı Roundlarda (1-3-5...):**
  - Kural `roundCount > 0 && roundCount % 2 !== 0 && !this.isGlobalCooldownActive()` olarak güncellendi. Oyun 5 galibiyette (`GAMES_TO_ROUND = 5`) bittiği için ilk maçta 1. round biter bitmez ilk reklam gösterilir; ardından 3. ve 5. round sonlarında 30s cooldown dolmuşsa gösterilir. 5. roundda maç biterse maç sonu reklamı çalışır ve aradaki süre 30s'den fazla olduğu için çakışma yaşanmaz.
- **Tüm Dosyalarda Eşitlik:**
  - `Mobile v3.5.4`, `PC v3.5.4`, `Android offline fallback` ve `iOS offline fallback` dosyaları bayt bayt eşitlendi. Otomatik test sonucu: **121/121 başarılı**.

## Önceki Reklam Notu — v3.5.3 (2026-09-28)

- **Maç Başı Reklam Optimizasyonu (%50 Yapay Atlama Kaldırıldı):**
  - `maybeShowStartAdThenStart()` içindeki yapay `Math.random() >= 0.50` filtresi kaldırıldı. Artık 45 saniyelik küresel cooldown dolmuşsa maç başı geçiş reklamı gösterim fırsatı boşa harcanmaz.
  - **Cold-Start Koruması:** Oyuncunun oyunu ilk açtığı anda hemen reklamla karşılaşmaması için ilk maç reklamsız başlar (`sessionStartedMatchCount <= 1`). 2. maçtan itibaren cooldown uygun olduğunda reklam gösterilir.
- **Round Arası Reklam Sıklığı (Her 2 Round'da Bir):**
  - Round arası geçiş reklamı kuralı `roundCount > 0 && roundCount % 2 === 0 && !this.isGlobalCooldownActive()` olarak güncellendi. Snake'te 5 galibiyetlik maçlarda oyuncunun 3 round beklemeden erken çıkması halinde oluşan 0 reklam riski önlendi. 2. ve 4. round sonlarında 45s cooldown uygunsa geçiş reklamı gösterilir.
- **Pause Menüsü Geçiş Reklamı Kaldırıldı:**
  - Pause menüsünden Ana Menü'ye dönüşte bulunan %30'luk rastgele geçiş reklamı (`pause_exit_home`) tamamen kaldırıldı. Oyuncunun acil duraklatma ve menüye dönüş deneyimi reklamsız ve sürtünmesiz hale getirildi.
- **45 Saniye Global Ad Cooldown Korundu:**
  - `cooldownMs: 45000` kuralı hem maç başı, hem round arası hem de oyun sonu reklamları için geçerliliğini sürdürür, art arda spam reklam oluşmasını engeller.
- **Android Native Köprüsü Emniyeti ve 'start' Reklam Desteği (`android_bridge_bootstrap.js`):**
  - Android köprüsündeki `adsbygoogle.push` filtresine eksik olan `'start'` ad tipi eklendi (`start || next || reward || browse`). Böylece maç başı reklamları Android WebView'da sessizce kaybolmaz.
  - iOS köprüsünde bulunan **8.5 saniyelik JS emniyet zamanlayıcısı (`safetyTimer`)** Android köprüsüne entegre edildi. Native AdMob yanıt vermese veya takılsa bile oyun 8.5s sonra otomatik başlatılır ve `AdManager.adInProgress` kilitli kalmaz.
- **Tüm Dosyalarda Eşitlik:**
  - `Mobile v3.5.3`, `PC v3.5.3`, `Android offline fallback` ve `iOS offline fallback` dosyaları bayt bayt eşitlendi. Otomatik test sonucu: **120/120 başarılı**.

## Önceki çeviri notu — v3.5.2 (2026-09-28)

- v3.5.2 WordPress’te canlıdır (2026-09-28 kullanıcı bildirimi). 546 ekranlık yerel dil kabulü reklam bekleme metnini kapsar; canlı reklam SDK kabulü anlamına gelmez. Yükleme sonrası cihaz kontrolleri [doğrulama kaydında](v3.5.2_Localization_Verification.md#wordpress-yüklemesi-ve-son-cihaz-kabulü) listelenir.
- Rakibin reklamını bitirmesini bekleme metni Mobile/PC üzerinde 21 dilde tamamlandı. Önceden yalnız Türkçe ve İngilizce karşılığı bulunuyordu.
- Reklam gösterimi, sıklığı, native köprüler ve gelir yapılandırması değişmedi. Yerel kabul aracı canlı reklam çağrısı yapmaz.
- Ayrıntılar: v3.5.2_Localization_Verification.md. Önceki callback korumaları ve bunların regresyon testleri korunur.

## Önceki web yaşam döngüsü notu — v3.5.1 (2026-09-27)

- Reklam sıklığı, reklam türleri, premium davranışı ve native reklam köprüleri değiştirilmedi.
- Reklam tamamlanma callback'leri oluşturuldukları maç/round akışına bağlandı. Oyuncu bu sırada ana menüye döner veya yeni maç başlatırsa eski callback yeni ekranı, banner'ı ya da oyun durumunu değiştiremez.
- Mobile ve PC yaşam döngüsü regresyonları `tests/ui-lifecycle.test.cjs` içinde doğrulanır. Toplam otomatik sonuç **70/70 başarılıdır**.
- Native paket numaraları değişmedi; canlı reklam ortamı, AAB/IPA ve mağaza dağıtımı bu çalışmada test edilmedi.

## Güncel Reklam Notu — v3.4.9 (2026-09-27)

- **45 Saniye Global Ad Cooldown (`cooldownMs: 45000`):**
  - AdMob gelir optimizasyonu için küresel reklam bekleme süresi 90 saniyeden 45 saniyeye dengelendi. Bu değişiklik sonrasında reklam gösterim sıklığı ve AdMob geliri hissedilir şekilde arttı.
- **Web Audio Reklam Sonrası Ses Kurtarma Motoru (`forceRebuildAudio` & `_adJustFinished`):**
  - Tam ekran AdMob geçiş ve ödüllü reklam gösterimlerinin ardından iOS WebKit ve Android WebView'da ses oturumunun askıda kalması ve oyunun sessiz devam etmesi sorunu çözüldü.
  - Reklam tamamlandığında (`afterAd`, `adBreakDone`, `onNativeAdDone`, `adViewed`, `adDismissed`) `window._adJustFinished = true` bayrağı aktifleşir.
  - Kullanıcı oyuna döndükten sonraki ilk ekrana dokunuşunda (gesture call-stack içinde) eski `AudioContext` kapatılır, sıfırdan yeni bir context başlatılır ve 1-örnekli mikro priming ile ses donanımı canlandırılır.
- **Tüm Dosyalarda Eşitlik:**
  - `Mobile v3.4.9`, `PC v3.4.9`, `Android offline fallback` ve `iOS offline fallback` dosyalarının tamamında reklam akışı ve ses kurtarma motoru tam uyumlu olarak çalışmaktadır.

## Güncel iOS eki — Build 36 (2026-09-16)

Native iOS AdMob App ID/interstitial/rewarded kimlikleri aşağıdakiyle aynıdır; değiştirilmedi.
Web AdSense ve Android reklam birimleri de değişmedi. iOS'ta web H5 SDK yüklemesi
baypas edilip çağrılar native AdMob'a iletilmeye devam eder; reklamlar kapatılmadı.

- Native sunum başlangıç sınırı 7.5 s, JS fallback 8.5 s; gerçek sunum başlayınca
  başlangıç zamanlayıcıları iptal edilir. Uzun ödüllü videonun ortasında maç başlatılmaz.
- Timeout/no-fill ödül kazandırmaz; premium'un mevcut ödül ayrıcalığı korunur.
- Her callback bir kez tüketilir; eski/geç yanıt yeni reklamı bitiremez.
- SDK/retry işlemleri main queue'da asenkron yürür. Offline fallback ağ reklamı istemez.
- Mock reklam testleri geçti; gerçek iPhone AdMob/ATT testi henüz yapılmadı.
- Ayrıntılı durum: [iOS_Build_36_Verification.md](iOS_Build_36_Verification.md).

Son online akis notu (v3.0.08):
- Mobil sürümdeki tüm çevrimiçi oyun akışı i18n sistemine geçirilmiş, dil seçimi desteği eklenmiş ve tarayıcı confirm() kutusu yerine oyun içi özel glassmorphism diyalog sistemi getirilmiştir. Reklamların tetiklenme noktaları, AdSense / AdMob akışları ve cooldown süreleri aynı şekilde korunmaktadır. Sürüm v3.0.08'e yükseltilerek istemciler güncellenmiştir.

Son online akis notu (v3.00.3):
- Çevrimiçi ve yerel maçlarda reklam/duraklatma sonrası kazanımlardaki konfeti veya kutlama ekranı üzerinde kalan blur filtresi giderildi.
- HUD/reklam etkileşimleri ve diğer AdManager cooldown, tetikleme mantıkları korunmaktadır.

Son online akis notu (v3.00.2):
- Online istatistik ekraninda `Tekrar Oyna` ve `Ana Menu` secimleri reklam akisi tamamlandiktan sonra islenir. Online replay artik local `softReset(true)` yerine sunucu kontrollu `requestRematch` akisini kullanir.
- Bir oyuncu rematch beklerken digeri cikarsa veya 30 saniye icinde onay vermezse oyun ici uyari gosterilir; bu durum ek reklam tetiklememelidir.
- Server performans optimizasyonlari reklam mantigini degistirmez: `server.js` tick/payload yuku hafifletildi, istemci reklam tetikleme noktasi ayni kaldi.

AdMob eslestirme notu (Android shell):
- App ID: `ca-app-pub-4114535776207741~8941104521`
- app-ads.txt URL: `https://2playersnake.com/app-ads.txt`
- app-ads.txt satiri: `google.com, pub-4114535776207741, DIRECT, f08c47fec0942fa0`

AdMob eslestirme notu (iOS shell - v3.4.2 / Build 46, Runtime v3.4.6):
- App ID: `ca-app-pub-4114535776207741~3769407896`
- Interstitial ID: `ca-app-pub-4114535776207741/6012427858`
- Rewarded ID: `ca-app-pub-4114535776207741/7193260548`
- Apple ID: `6811546748`
- Canlı App Store URL: `https://apps.apple.com/app/id6811546748`
- AdMob Mağaza Eşleştirmesi: ✅ Tamamlandı (AdMob > Uygulama Ayarları > App Store `6811546748` başarıyla bağlandı)
- AdMob Mağaza Doğrulama Durumu: ⏳ **Hazırlanıyor / İnceleme sürüyor** (18 Eylül 2026'da doğrulama gönderildi; 2-3 gün sürecek Google incelemesi bekleniyor).
- Reklam Birimleri: 2 adet birim (Geçiş ve Ödüllü) etkin olarak tanımlı.
- app-ads.txt: `https://2playersnake.com/app-ads.txt` kök dizine yüklendi (`google.com, pub-4114535776207741, DIRECT, f08c47fec0942fa0`), AdMob taraması bekleniyor.
- ads.txt (Web): `https://2playersnake.com/ads.txt` kök dizine yüklendi ve Google AdSense tarafından ONAYLANDI (Hazır, 2026-09-17).
- ATT İzin Metni: `Bu izin, oyun deneyiminizi geliştirmek ve size uygun kişiselleştirilmiş reklamlar sunmak için kullanılır.`

Build 30 iOS köprü notu (TestFlight'a henüz yüklenmedi):
- Web sayfası `adBreak` fonksiyonunu sonradan değiştirse dahi `start`, `next`, `reward` ve `browse` türleri native köprüden geçirilir.
- `start` türü, Oyna ve Ana Menü dönüşlerindeki reklam akışında kullanılır. iOS köprüsünün bu türü yok sayması `AdManager.adInProgress` durumunu açık bırakıp oyunun başlamamasına neden olabiliyordu; eşleme düzeltilmiştir.
- İnternetsiz yerel fallback sayfasında native reklam çağrısı gösterilmez; callback'ler güvenli biçimde tamamlanır ve oyun kilitlenmez.


---

## Platform Mimarisi

| Platform | Reklam Sistemi | Not |
|---|---|---|
| Web (PC + Mobil) | Google AdSense H5 Games Ads (Beta) | `adBreak()` ve `adConfig()` cagrilari ayni HTML dosyasindan yonetilir |
| Android (APK) | Native bridge + Web oyun mantigi | Web oyundaki reklam cagrilari Android tarafinda native katmana yonlendirilebilir |
| iOS (IPA) | Native Google Mobile Ads + ATT | Swift AdManager ve bridge ile tam ekran ve ödüllü reklam entegrasyonu |

---

## Ana AdManager Durumu

Temel kontrol alanlari:

| Alan | Gorev |
|---|---|
| `cooldownMs` | Reklamlar arasi global bekleme suresi |
| `startAdChance` | Mac basi reklam olasiligi |
| `snapshotDepth` | Rewarded continue icin saklanan snapshot sayisi |
| `adInProgress` | O anda aktif reklam var mi |
| `mandatoryAdShownThisMatch` | Bu macta zorunlu reklam oynatildi mi |
| `startAdShownThisMatch` | Start reklami bu macta gosterildi mi |
| `rewardedUsedThisMatch` | Bu macta odullu devam kullanildi mi |
| `rewardedPendingLoss` | Rewarded continue bekleyen olum durumu |

---

## Reklam Turleri

### 1. Match Start

- Tetikleyici: `maybeShowStartAdThenStart()`
- Amac: Mac baslangicinda interstitial gostermek
- Koruma: SDK yoksa, reklam aktifse veya ilk mac cold-start korumasina takiliyorsa oyun direkt baslar

`v2.94.2` itibariyle:
- Mobil browser tarafinda `match_start` reklami bilerek `sound: 'off'` ile istenir
- PC davranisi degistirilmemistir

### 2. Between Rounds

- Tetikleyici: `maybeShowBetweenRoundsAd()`
- Kosul: `roundCount > 0 && roundCount % 2 !== 0 && !this.isGlobalCooldownActive()` (Tek sayılı roundlar: 1, 3, 5...)
- Amac: Round aralarinda interstitial gostermek. Snake maçları 5 galibiyette (`GAMES_TO_ROUND = 5`) bittiği için ilk maçta 1. round biter bitmez ilk reklam gösterilir; ardından 3. ve 5. round sonlarında 30s cooldown uygunsa gösterilir.

`v2.94.2` itibariyle:
- Mobil browser tarafinda `between_rounds` reklami bilerek `sound: 'off'` ile istenir
- Bu, iOS Safari benzeri ortamlarda "Video will play with sound" popup surtunmesini azaltmak icin yapildi

### 3. Match End / Game Over

- Tetikleyici: `maybeShowGameOverAd()`
- Amac: Maç bittiğinde, kupa ve oyun sonu istatistik penceresi (`showGameEndStats`) açılmadan hemen önce geçiş reklamı (`match_end`) oynatılır.
- İstatistik Ekranı Butonları: "Ana Menü" ve "Tekrar Oyna" butonlarındaki araya giren reklamlar (`menu_after_stats`, `replay_after_stats`) v3.5.4 ile tamamen kaldırılmıştır; butonlar oyuncuya beklemesiz, anında tepki verir.
- Koruma: Rewarded continue beklemedeyse bu akis atlanabilir.

Bu turda ses stratejisi degismemistir.

### 4. Match Restart

- Tetikleyici: `maybeShowRestartAdThenRestart()`
- Amac: Yeniden baslatma akisinda interstitial gostermek
- Koruma: SDK hazir olmali, aktif reklam olmamali, cooldown musait olmali

Bu turda ses stratejisi degismemistir.

### 5. Rewarded Continue

- Tetikleyici: `requestRewardedContinue()`
- Kullanildigi yer: `1P vs AI` ve `1P Klasik Solo` kayip akislari (`maybeInterceptSoloLoss` ve `maybeInterceptLoss`)
- Amac: Kullanici ödüllü video reklam izleyerek 5 adım geriden ve 3 saniye dokunulmazlıkla oyuna kaldığı yerden devam eder (maç başına 1 kez)
- Muafiyet: Ödüllü reklamlar küresel 30 saniye cooldown sınırından tamamen muaftır (`canOfferRewardedContinue` cooldown kontrol etmez). Reklam izlendiğinde `recordAdShown('reward')` ile son reklam zamanı güncellenir ve hemen ardından geçiş reklamı çıkması önlenir.
- Snapshot sistemi ile oyun durumu geri yuklenir

`v2.94.2` notu:
- Rewarded continue reklamlarinda mevcut ses senkronu korunur
- Yani odullu reklamlar oyunun mute durumuna gore normal `syncAdSoundConfig()` davranisi ile calisir

---

## Ses Senkronizasyonu

Standart davranis:
- Oyun muted ise `adConfig({ sound: 'off' })`
- Oyun muted degilse `adConfig({ sound: 'on' })`

Mobil web istisnasi (`v2.94.2`):
- `match_start`
- `between_rounds`

Bu iki reklam tipi mobil browser tarafinda zorunlu olarak `sound: 'off'` ister.

Neden:
- Mobil Safari ve benzeri tarayicilarda sesli autoplay izin popup'ini azaltmak
- Kullanici `Cancel` dediginde reklam dusmesini ve gelirin kacmasini azaltmak

Neler degismedi:
- PC tarafi
- Rewarded continue
- Oyuncu ayarlari / localStorage

---

## Cooldown Mantigi

- Interstitial reklamlar global 30 saniye (`cooldownMs: 30000`) bekleme kuralına tabidir (oyuncu deneyimini korurken reklam gelirini maksimize eden güncel optimum denge).
- `showInterstitial()` merkezi kapısında `isGlobalCooldownActive()` denetimi zorunludur; süre dolmadan hiçbir geçiş reklamı gösterilemez (spam ve art arda gösterim önlenir).
- Rewarded continue kullanici talebi (opt-in) oldugu icin global cooldown'dan tamamen muaftır (oyuncunun can hakkı almasını engellemez).
- Her basarili reklam gosteriminde `lastAdShownAt` guncellenir.

---

## Gecmis Notlari

| Surum | Degisiklik |
|---|---|
| `v2.92.0` | Preroll akisi eklendi |
| `v2.93.2` | Preroll tum platformlarda kaldirildi |
| `v2.94.1` | HTML revalidation ve guvenli yenileme mantigi eklendi |
| `v2.94.2` | Mobil browser'da `match_start` ve `between_rounds` reklamlari sessiz istenecek sekilde guncellendi |
| `v3.3.0` | RevenueCat entegrasyonu ile reklamsız premium sürüm seçeneği eklendi. |
| `v3.3.1` | Premium akışı aynen korundu, yerel hatırlatıcı bildirimler entegre edildi. |
| `v3.3.2` | Premium durumu (adsRemoved) ve yüksek skorlar Cloud Save ile yedeklenir. Premium reklam bypass akışı aynen korunur. |
| `v3.4.2` | Global ad cooldown 45 saniyeye (`cooldownMs: 45000`) optimize edildi; `showInterstitial` merkezi koruması korunarak hem gelir kurtarıldı hem de ardı ardına reklam çıkması engellendi. |
| `v3.4.6` | Altın Oran Hız Kalibrasyonu (`MOD_SPEED.NORMAL = 0.75`, `EASY = 0.60`, `FAST = 0.95`, `EXTREME = 1.50`) ve PC-Mobil hız eşitlemesi yapıldı. Reklam kapısı (45s cooldown, startAdChance, rewarded continue) ve RevenueCat bypass kuralları tam korundu. |
| `v3.4.7` | Online Çok Oyunculu Hız Kalibrasyonu (server.js baz hız 93.9 ms, Dash 64.7 ms, bot fallback NORMAL) yapıldı. Reklam kapısı (45s cooldown, startAdChance, rewarded continue) ve RevenueCat bypass kuralları tam korundu. |
| `v3.4.8` | Oyun sonu buton düzeni (solda Ana Menü, sağda Tekrar Oyna) güncellendi, Paylaş butonu kaldırıldı. Reklam kapısı (menu_after_stats, replay_after_stats interstitial, 45s cooldown, rewarded continue) ve RevenueCat bypass kuralları tam korundu. |
| `v3.5.3` | Maç başı %50 yapay atlama kaldırıldı, cold-start koruması eklendi. Round arası reklamlar her 2 round'da bir (`roundCount % 2 === 0`) gösterilecek şekilde ayarlandı. Pause menüsünden Ana Menü'ye dönüşteki reklam kaldırıldı. Android köprüsüne `'start'` ad tipi ve 8.5s güvenlik zamanlayıcısı eklendi. |
| `v3.5.4` | Küresel reklam bekleme süresi 30 saniyeye indirildi (`cooldownMs: 30000`). Ödüllü reklam global cooldown'dan tamamen muaf tutuldu. Solo (1P Klasik) moda ödüllü canlanma entegre edildi. Maç sonu istatistik penceresi öncesine `match_end` reklamı eklendi; butonlardan araya giren reklamlar kaldırıldı. Round arası reklamlar 1-3-5 tek sayılı roundlara çekildi. |

---

## Operasyon Notu

WordPress'e yeni HTML yukleyip cache flush yaptiktan sonra:
- Mobil web oyun yeni reklam ses davranisini bir sonraki temiz yuklemede alir
- Android shell degismediyse yeni AAB almak gerekmez
- Reklam davranisi sadece web HTML guncellemesiyle degisir

---

## v2.95.1 Android Shortcut + Cache-Bust Notu

- Android shell URL olusumuna `__ts` query parametresi eklendi (online durumda).
- Bu degisiklik reklam stratejisini degistirmez; sadece stale top-level HTML acilmasini azaltir.
- Reklam acisindan etkisi:
  - Daha guncel HTML yuklenmesi sayesinde ad akislari (start / between-rounds / rewarded) beklenen surumle daha tutarli calisir.
  - Shortcut ile acilista eski oyun kodundan kaynakli reklam akisi sapmasi riski azalir.

## v2.95.1 Hotfix Durumu (2026-04-22)
- Bu turdaki gameplay hotfix (`PC Macera + 1 Oyuncu` menu akis duzeltmesi) reklam katmanina yeni bir kural eklemez.
- Mevcut start / between-rounds / restart / rewarded akislari aynen korunur.
- Android paketinin alinmasi manuel olabilir; reklam davranisi acisindan ek bir konfig gerekmemektedir.

## v2.95.2 Notu (Reklam Katmani)
- `Beast collision` guncellemesi gameplay carpisma kurallarina aittir.
- AdManager akisi, cooldown, start/between-rounds/rewarded kurallari bu surumde degismemistir.

## v2.95.3 Notu (Reklam Katmani)
- Android shortcut landing guncellemesi reklam frekansi veya reklam turu mantigini degistirmez.
- Degisen sey sadece shortcut ile acilis aninda maÃƒÂ§a dogrudan girmek yerine `Ad & Renk` ekranina inis yapilmasidir.
- Bu nedenle:
  - start ad
  - between-rounds ad
  - restart / rewarded akislari
  bu turda yeni bir kurala baglanmamistir.

## v2.98.5 Notu (Reklam Katmani)
- Bu turdaki degisiklikler gameplay render/perf odaklidir (kirmizi yem + beast mode performans iyilestirmeleri).
- Reklam tetikleme kurallari, cooldown stratejisi ve reklam turlerinde yeni bir degisiklik yoktur.
- Android tarafinda App ID / ad unit / app-ads.txt eslestirme notlari aynen gecerlidir.

## GPGPC Reklam Isleyisi Notu
- Google Play Games on PC surumunde de oyun web payload'dan akar (PC URL).
- Bu nedenle reklam davranisinin ana kaynagi yine web katmanidir.
- Android shell yalnizca host/kapsayici oldugu icin reklam tetik kurallari webde degistirilir.

### Operasyonel Kural
1. Reklam kurali degisecekse once ilgili web HTML (PC veya mobile) guncellenir.
2. Native shell degismediyse yeni AAB zorunlu degildir.
3. Native URL routing, bridge veya lifecycle degisirse AAB gerekir.

---

## v3.3.1 Premium (Reklamsız Sürüm) Davranışı

`v3.3.0` sürümüyle birlikte oyuna RevenueCat tabanlı reklamları kaldırma (premium) yeteneği entegre edilmiştir. Bu durum aktif olduğunda reklam akışları şu şekilde çalışır:

1. **Geçiş (Interstitial) Reklamları Bypass:**
   - `match_start`, `between_rounds`, `match_restart` ve `game_over` durumlarında tetiklenen tüm adBreak / interstitial reklam istekleri doğrudan atlanır (`adBreakDone` veya ilgili callback anında tetiklenir). Oyun kesintisiz akar.

2. **Ödüllü (Rewarded Continue) Canlanma:**
   - Normal kullanıcılar reklam izleyerek canlanabilirken, premium kullanıcılardan video izlemesi istenmez.
   - Ödüllü reklam isteği native veya web katmanında algılandığı anda `beforeReward` / `onUserEarnedReward` mantığı otomatik olarak onay verir. Kullanıcı canlanma butonuna tıkladığı anda hiçbir reklam beklemeden oyuna kaldığı yerden anında devam eder.

3. **Köprü Durum Senkronizasyonu:**
   - Uygulama her açılışında `MainActivity` RevenueCat üzerinden en son lisans durumunu sorgular.
   - Durum `adsRemoved = true` ise, bu bilgi WebView'e `window.dispatchNativeSettings` aracılığıyla aktarılır. WebView tarafında `adsRemoved` flag'i true olur ve UI'daki taç ikonlu "Remove Ads" butonları otomatik gizlenir.



