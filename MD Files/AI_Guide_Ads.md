# 2 Player Snake - Reklam Mantigi Teknik Rehberi

Bu belge, oyundaki reklam akisinin guncel davranisini ozetler. Web tarafinda reklamlar Google AdSense H5 Games Ads ile, Android shell icinde ise native koordine edilen bir kopru ile calisir.

Referans surum: `v3.3.2`

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

AdMob eslestirme notu (iOS shell - v3.3.5):
- App ID: `ca-app-pub-4114535776207741~3769407896`
- Interstitial ID: `ca-app-pub-4114535776207741/6012427858`
- Rewarded ID: `ca-app-pub-4114535776207741/7193260548`
- ATT İzin Metni: `Bu izin, oyun deneyiminizi geliştirmek ve size uygun kişiselleştirilmiş reklamlar sunmak için kullanılır.`

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
- Kosul: Genelde `roundCount % 3 === 0` oldugunda ve cooldown uygun oldugunda
- Amac: Round aralarinda interstitial gostermek

`v2.94.2` itibariyle:
- Mobil browser tarafinda `between_rounds` reklami bilerek `sound: 'off'` ile istenir
- Bu, iOS Safari benzeri ortamlarda "Video will play with sound" popup surtunmesini azaltmak icin yapildi

### 3. Match End / Game Over

- Tetikleyici: `maybeShowGameOverAd()`
- Amac: Belirli mac tamamlama dongulerinde reklam gostermek
- Koruma: Rewarded continue beklemedeyse veya bu macta start reklami oynadiysa bu akis atlanabilir

Bu turda ses stratejisi degismemistir.

### 4. Match Restart

- Tetikleyici: `maybeShowRestartAdThenRestart()`
- Amac: Yeniden baslatma akisinda interstitial gostermek
- Koruma: SDK hazir olmali, aktif reklam olmamali, cooldown musait olmali

Bu turda ses stratejisi degismemistir.

### 5. Rewarded Continue

- Tetikleyici: `requestRewardedContinue()`
- Kullanildigi yer: Ozellikle `1P vs AI` kayip akisi
- Amac: Kullanici reklam izleyerek devam hakki alir
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

- Interstitial reklamlar cooldown'a tabidir
- Rewarded continue kullanici talebi oldugu icin ayri ele alinir
- Her basarili reklam gosteriminde `lastAdShownAt` guncellenir

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



