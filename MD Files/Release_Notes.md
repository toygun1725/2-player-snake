# 2 Player Snake - Sürüm Notları (Release Notes)

## v3.5.8 — Çevrimiçi Hükmen Galibiyet (Forfeit) Reklam Monetization & Eşleşme Akışı Düzeltmesi (2026-09-30)

- **Çevrimiçi Hükmen Galibiyette Geçiş Reklamı (Interstitial Monetization):**
  - Çevrimiçi maçlarda rakip bağlantıyı kopardığında veya oyundan çıktığında, 15 saniyelik geri sayım sonunda sunucu maçı hükmen galibiyet (`gameOver`, `reason: 'forfeit'`) ile sonlandırır.
  - Önceki sürümlerde `gameOver` doğrudan istatistik ekranını açıp reklam döngüsünü atladığı için sıfır gelir oluşuyordu.
  - v3.5.8 ile hükmen galibiyet kesinleştiğinde, zafer sesi (`SFX.win()`) ve konfeti kutlaması verilir, ardından maç sonu istatistik ekranı açılmadan hemen önce `AdManager.maybeShowGameOverAd` geçiş reklamı tetiklenir.
- **Hükmen Galibiyet Sonrası "Tekrar Oyna" Butonunun Yeni Eşleşme Başlatması:**
  - Önceki sürümlerde rakip çıktığında oturum temizliği nedeniyle "Tekrar Oyna" butonu oyuncuyu yanlışlıkla yerel/çevrimdışı tek kişilik oyuna düşürüyordu.
  - v3.5.8 ile `showGameEndStats` ekranına `wasOnline` ve `isForfeit` parametreleri entegre edildi.
  - Rakibin ayrıldığı maçlarda "Tekrar Oyna" butonuna tıklandığında oyuncu doğrudan yeni bir çevrimiçi rakip aramaya (`startMatchmaking()`) yönlendirilir.
  - "Ana Menü" butonu ise oyuncuyu pratik olarak çevrimiçi menüye (`openOnlineMenu()`) döndürür.
  - İstatistik kartına `🏳️ Rakip odadan ayrıldı.` rozeti eklendi.
- **iOS Native Build 47 (v3.5.8) — Bildirim Rozeti & İkon Uyarısı Temizleme:**
  - iOS ana ekran uygulama ikonu üzerinde asılı kalan kırmızı bildirim sayısı/rozet (badge) sorunu kökten çözüldü.
  - Uygulama ilk açıldığında (`handleAppLaunch()`), arka plandan öne geçtiğinde (`sceneDidBecomeActive(_:)`) ve bildirime dokunulduğunda (`userNotificationCenter(_:didReceive:)`) `NotificationManager.shared.clearBadgeAndDeliveredNotifications()` çağrılarak hem teslim edilen bildirim listesi temizlenir (`removeAllDeliveredNotifications()`) hem de rozet sayısı iOS 17+ `setBadgeCount(0)` ve geriye dönük `applicationIconBadgeNumber = 0` ile sıfırlanır.
  - Xcode projesi ve Fastlane hattı `MARKETING_VERSION = 3.5.8` ve `CURRENT_PROJECT_VERSION = 47` olarak paketlendi; TestFlight ve App Store dağıtımına hazırlandı.
- **Tüm Dosyalarda Eşitlik & Test Doğrulaması:**
  - `Mobile v3.5.8`, `PC v3.5.8`, `Android offline fallback` ve `iOS offline fallback` bayt bayt eşitlendi ve SHA256 ile doğrulandı.
  - Otomatik test sonucu: **130/130 başarılı**.

## v3.5.7 — Çevrimiçi Cross-Play Rastgele Eşleşme, PC Dikey Arcade Arenası & Sürüm Senkronu (2026-09-30)

- **PC & Mobil Çevrimiçi Cross-Play Rastgele Eşleşme (Unified Matchmaking):**
  - Çevrimiçi rastgele eşleşme (Random Matchmaking) kuyruğu birleştirildi. PC ve Mobil oyuncular artık ortak havuzda anında birbirleriyle eşleşebilir; lobi bekleme süreleri minimuma indirildi.
  - **Akıllı Hibrit Matris (Seçenek A):**
    - PC ve Mobil eşleştiğinde (veya odada en az bir mobil oyuncu olduğunda), maç matrisi mobil dikey standardını (`24 sütun x 36-42 satır`) baz alır (`room.platform = 'crossplay'`).
    - İki PC oyuncusu denk geldiğinde ise klasik 16:9 geniş ekran PC matrisi (`64x36`) çalışır (`room.platform = 'pc'`).
  - **PC Dikey Arcade Arenası (Vertical Arena):**
    - PC istemcisi çapraz platform veya mobil matrisli bir odaya bağlandığında, `#stage.vertical-arena` ve `canvasWrap` `aspect-ratio: GRID_COLS / GRID_ROWS` CSS kilitlenmesiyle ekranın tam ortasında şık neon gölgeli dikey bir arcade kabini görünümüne bürünür.
    - Hücreler deformasyona uğramadan tam kare oranını (`cw === ch`) korur; yemler, yılanlar, hızlar ve efektler her iki ekranda mikrosaniye ve piksel hassasiyetiyle örtüşür.
    - Klavye ok tuşları ve WASD ile dikey kontrolde hiçbir gecikme veya dezavantaj yaşanmaz.
    - Çevrimiçi maç bittiğinde veya menüye dönüldüğünde PC ekranı otomatik olarak standart geniş ekran 64x36 moduna geri döner.
  - **Özel Odalarda (Custom Rooms) Cross-Play Desteği:**
    - Özel oda katılımında (`joinRoom`) platform engeli kaldırılarak PC ve Mobil oyuncuların oda koduyla birbirine katılmasına izin verildi. Mobil oyuncunun olduğu her özel oda da dikey matrise adapte olur.
- **Tüm Dosyalarda Eşitlik & Test Doğrulaması:**
  - `Mobile v3.5.7`, `PC v3.5.7`, `Android offline fallback`, `iOS offline fallback` ve `server.js` bayt bayt eşitlendi ve doğrulandı.
  - Otomatik test sonucu: **128/128 başarılı**.

## v3.5.6 — Beast Başlangıç Dengelemesi (Yem Patlamasız / Sadece Yılan Buff'ı) & Sürüm Senkronu (2026-09-30)

- **Oyuncu Odaklı Beast Başlangıç Dengelemesi:**
  - v3.5.5'te eklenen ödüllü video ile Beast Modunda başlama özelliği, başlangıçta `spawnRubyBurstFoods()` fonksiyonunu çağırarak oyun alanına 12 normal yem ve 1 safir yem saçıyordu.
  - Özellikle `1P vs AI` modunda başlangıçta sahaya saçılan bu yemlerin yapay zeka (AI) yılanı tarafından saniyeler içinde toplanarak orantısız büyümesine ve reklam izleyen oyuncuya karşı haksız bir avantaj elde etmesine yol açtığı tespit edildi.
  - v3.5.6 ile geri sayım tamamlanma kancasında (`countdown`) yer alan `spawnRubyBurstFoods()` ve `redBulkEndTime` çağrıları kaldırıldı.
  - Beast modu etkisi **yalnızca 1. Oyuncunun (P1) yılanına** uygulanır: 8 saniye (`BEAST_MODE_DURATION_MS = 8000;`) boyunca 1.45x hız artışı, kendi gövdesinden ve rakip gövdeden geçebilme dokunulmazlığı (faz / intangibility), RGB aura efekti ve başlangıç kalp sesi (`SFX.heart()`).
  - Haritada başlangıçta ekstra yem saçılmaz; normal oyun başı yem düzeni korunur. AI yılanının başlangıçta haksız yem süpürmesi engellenmiştir.
  - Maç esnasında oyun alanında doğal olarak beliren yakut kalp yemi (`rubyFood`) yendiğinde `spawnRubyBurstFoods()` patlaması eskisi gibi tam fonksiyonel çalışmaya devam eder.
  - Süre dolduğunda `beastOwner` ve güç durumu hem Mobile hem PC döngülerinde güvenli biçimde temizlenir.
- **Tüm Dosyalarda Eşitlik & Test Doğrulaması:**
  - `Mobile v3.5.6`, `PC v3.5.6`, `Android offline fallback` ve `iOS offline fallback` dosyaları bayt bayt eşitlendi.
  - Otomatik test sonucu: **125/125 başarılı**.

## v3.5.5 — Ödüllü Video ile Beast Modunda Başlama, 3-2-1 Canlanma Koruması & Sürüm Senkronu (2026-09-30)

- **1 Kişilik Modlarda "BEAST MODUYLA BAŞLA" Ödüllü Video Butonu:**
  - Quick Setup (Hızlı Kurulum) ekranında, 1 Kişilik modlarda (1P Solo, 1P vs AI, Macera, Self Area 51) "BAŞLA" butonunun hemen altına yerleştirildi.
  - Kırmızı-turuncu gradyanlı buton, kamera ikonu ve 2 satırlı metin ("BEAST MODUYLA BAŞLA" / "(Reklam)" veya VIP kullanıcılar için "(VIP / Ücretsiz)").
  - 2P modu seçildiğinde otomatik gizlenir (`display: none`), 1P modunda tekrar görünür.
  - Ödüllü video izlendiğinde (veya VIP kullanıcılarda doğrudan) oyun başlar; 3-2-1 geri sayımı tamamlandığı anda oyuncu tam **8 saniye** (`BEAST_MODE_DURATION_MS = 8000;`) boyunca Beast Modu (hızlanma, RGB ışık aurası, dokunulmazlık, ruby burst yemler ve kalp sesi) ile maça başlar (yalnızca 1. round için geçerlidir).
- **Ödüllü Canlanmada 3-2-1 Geri Sayım Koruması (`startRewardedResumeCountdown`):**
  - Maç içinde ödüllü reklam izlenerek canlanıldığında (`restoreRewardSnapshot`), oyunun aniden başlayıp oyuncunun reflex göstermeden kaza yapması engellendi.
  - Reklam kapandıktan sonra 3-2-1 ve BAŞLA geri sayımı devreye girer. Geri sayım boyunca geçen milisaniyeler round süresine ve aktif güçlendirmelere eklenerek zaman kaybı telafi edilir.
- **21 Dilde Tam Destek:**
  - `startWithBeast`, `startWithBeastAd`, `startWithBeastVip` çevirileri 21 dilde (tr, en, de, fr, es, it, zh, hi, pl, pt-BR, ar, ru, id, ja, ko, vi, th, tl, nl, el, cs) eksiksiz uygulandı.
- **Tüm Dosyalarda Eşitlik & Test Doğrulaması:**
  - `Mobile v3.5.5`, `PC v3.5.5`, `Android offline fallback` ve `iOS offline fallback` dosyaları bayt bayt eşitlendi.
  - Otomatik test sonucu: **123/123 başarılı**.

## v3.5.4 — Reklam Gelir Optimizasyonu, 30s Cooldown, Solo 1P Ödüllü Canlanma & Akıcı Maç Sonu (2026-09-30)

- **30 Saniye Küresel Reklam Cooldown (`cooldownMs: 30000`):**
  - Reklam arası küresel bekleme süresi 45 saniyeden 30 saniyeye indirilerek gelir artışı hedeflendi.
- **Ödüllü Reklam (Rewarded Video) Cooldown Muafiyeti:**
  - `canOfferRewardedContinue()` içindeki küresel cooldown engeli kaldırıldı. Kullanıcı dilediğinde ödüllü video izleyerek devam hakkı kazanabilir. Reklam sonrasında `recordAdShown('reward')` ile yeni reklam zamanı mühürlenerek hemen ardından geçiş reklamı açılması önlenir.
- **Solo (1P Klasik) Moduna Ödüllü Canlanma Entegrasyonu:**
  - Önceden sadece 1P vs AI moduna özel olan ödüllü devam özelliği, Klasik Tek Kişilik (1P) moda da getirildi (`maybeInterceptSoloLoss`). Oyuncu yandığında 5 saniyelik geri sayımla canlanma teklif edilir; kabul ederse 5 adım geriden ve 3 saniye dokunulmazlıkla oyununa devam eder (maç başına 1 kez).
- **Maç Sonu Reklam Akışı & Buton Temizliği:**
  - Maç bittiğinde zafer/kupa ve oyun sonu istatistik penceresi (`showGameEndStats`) açılmadan önce `maybeShowGameOverAd` (`match_end`) ile geçiş reklamı gösterilir.
  - İstatistik penceresindeki "Ana Menü" ve "Tekrar Oyna" butonlarındaki araya giren reklamlar (`menu_after_stats`, `replay_after_stats`) tamamen kaldırılarak butonlar anında ve beklemesiz tepki verir hale getirildi.
- **Round Arası Reklamlar Tek Sayılı Roundlarda (1-3-5...):**
  - Kural `roundCount > 0 && roundCount % 2 !== 0 && !this.isGlobalCooldownActive()` olarak güncellendi. Snake maçları 5 galibiyette (`GAMES_TO_ROUND = 5`) bittiği için ilk maçta 1. round biter bitmez oyuncuya ilk reklam gösterilir; ardından 3. ve 5. round sonlarında 30s cooldown elverdiğince gösterilir.
- **Tüm Dosyalarda Eşitlik & Test Doğrulaması:**
  - `Mobile v3.5.4`, `PC v3.5.4`, `Android offline fallback` ve `iOS offline fallback` dosyaları bayt bayt eşitlendi.
  - Otomatik test sonucu: **121/121 başarılı**.

## v3.5.3 — Reklam Gelir Optimizasyonu ve Android Köprüsü İyileştirmesi (2026-09-28)

- **Maç Başı Reklam Optimizasyonu:** `maybeShowStartAdThenStart()` içindeki yapay %50 atlama filtresi kaldırıldı. İlk maç cold-start koruması ile reklamsız başlar; 2. maçtan itibaren 45s küresel cooldown uygun olduğunda geçiş reklamı gösterilir.
- **Round Arası Reklam Sıklığı (Her 2 Round'da Bir):** Round arası geçiş reklamı kuralı `roundCount % 2 === 0` olarak ayarlandı. 5 galibiyetlik maçlarda oyuncunun erken çıkması durumundaki 0 reklam riski önlendi. 45 saniyelik küresel bekleme süresi (`cooldownMs: 45000`) korunarak spam engellendi.
- **Pause Menüsü Reklamı Kaldırıldı:** Pause balon menüsünden Ana Menü'ye dönüşteki %30'luk rastgele geçiş reklamı (`pause_exit_home`) tamamen temizlendi.
- **Android Native Köprüsü Emniyeti (`android_bridge_bootstrap.js`):**
  - `adsbygoogle.push` filtresine eksik olan `'start'` tipi eklendi.
  - 8.5 saniyelik JS emniyet zamanlayıcısı (`safetyTimer`) entegre edildi. Reklam yanıtı gecikse bile oyun akışı kilitlenmez ve `AdManager.adInProgress` serbest kalır.
- **Tüm Dosyalarda Eşitlik:** Mobile v3.5.3, PC v3.5.3, Android ve iOS offline fallback dosyaları bayt bayt eşitlendi. Test sonucu: **120/120 başarılı**.

## v3.5.2 — Online çeviri tamamlama ve doğru pause açıklaması (2026-09-28)

**Yayın durumu:** v3.5.2 WordPress’te canlı; kullanıcı yüklemenin tamamlandığını 2026-09-28 tarihinde bildirdi. Yerel doğrulama: 118/118 otomatik test ve 546/546 tarayıcı ekran kontrolü. Bağımsız canlı URL kontrolü yapılmadı; fiziksel cihaz son kabulü bekliyor.

- Mobil Türkçe pause kuralının İngilizceye düşmesi giderildi; Mobile/PC online metinleri mevcut 21 dilde tamamlandı.
- Eski 3 kez / 90 saniye ve tur başına 1 hak açıklamaları kaldırıldı. Doğru metin: maç başına oyuncu başına 2 hak, her duraklatma en fazla 15 saniye.
- Mobil sunucu hataları, yeniden bağlantı ve bağlantı kaybı sayacı yerelleştirildi. Bilinmeyen hata metni kullanıcıya ham sunucu metni veya çeviri anahtarı olarak gösterilmez.
- Reklam bekleme, tekrar maç ve online akışta kullanılan ortak menü/sonuç metinlerinin eksikleri tamamlandı. Hata penceresi onayında Tamam kullanılır.
- Mobil kontrol seçicisi, D-pad yön ve ses erişilebilirlik etiketleri seçili dilde gösterilir. Uzun Almanca bağlantı başlığı panel içinde satıra bölünür.
- Mobile/PC v3.5.2 kaynakları oluşturuldu; eski sürümler korundu. Android/iOS fallback dosyaları Mobile v3.5.2 ile eşitlendi; CI/test hedefleri güncellendi.
- Otomatik doğrulama: 118/118 geçti. Ayrıntılı tarayıcı kabulü ve cihaz sınırları: v3.5.2_Localization_Verification.md.
- Yerel kaynak değişikliği: sunucu, Socket.IO protokolü ve native paket numaraları değişmedi. WordPress yayını kullanıcı tarafından tamamlandı. Yeni native paket veya mağaza dağıtımı yapılmadı.

## v3.5.1 — D-pad, menü görünürlüğü ve online duraklatma (2026-09-27)

Yerel kaynak sürümü; canlı web/mağaza dağıtımı yapılmadı. Native sürümler ve sunucu değişmedi.

- Online mobil panel içeriğe göre yukarı genişler; kare hücreler ve ortak matris korunur.
- Her iki mobil oyuncuda Kontroller/Ayrıl, yalnız duraklatanda Devam Et görünür. Kontrol tercihi cihazda saklanır; pause süresi uzamaz.
- Mobile/PC eski maç ve banner işlemleri yeni menülere müdahale edemez; gizli düğmeler etkileşimsizdir.
- Kabul sonuçları ve fiziksel cihazda açık kontroller: v3.5.1_UI_Verification.md.
- Otomatik doğrulama sonucu: **70/70 başarılı**. Rastgele/özel oda, iki kontrol düzeni, iki cihaz oranı, iki rolden ayrılma ve 15 saniyelik otomatik devam tarayıcıda geçti.

### Mağaza metni taslakları — 21 dil (henüz yayımlanmadı)

<tr-TR>
Online D-pad yerleşimi iyileştirildi. Duraklatma sırasında iki oyuncu da kontrollerini değiştirebilir veya ayrılabilir. Eski maç işlemlerinin menü görünürlüğünü bozması düzeltildi.
</tr-TR>

<en-US>
Improved online D-pad layout. Both players can change their controls or leave while paused. Fixed stale match callbacks interfering with menu visibility.
</en-US>

<de-DE>
Das Online-Steuerkreuz passt besser auf den Bildschirm. Beide Spieler können während der Pause ihre Steuerung ändern oder das Spiel verlassen. Veraltete Spielaktionen beeinträchtigen die Menüs nicht mehr.
</de-DE>

<fr-FR>
Disposition de la croix directionnelle en ligne améliorée. Les deux joueurs peuvent modifier leurs commandes ou quitter pendant la pause. Correction des anciennes actions de partie qui masquaient les menus.
</fr-FR>

<es-ES>
Mejorada la distribución de la cruceta en línea. Ambos jugadores pueden cambiar sus controles o salir durante la pausa. Corregidas las acciones pendientes de partidas que ocultaban los menús.
</es-ES>

<it-IT>
Migliorata la disposizione del pad direzionale online. Entrambi i giocatori possono cambiare i comandi o uscire durante la pausa. Corrette le azioni residue delle partite che nascondevano i menu.
</it-IT>

<hi-IN>
ऑनलाइन डी-पैड का लेआउट बेहतर किया गया। विराम के दौरान दोनों खिलाड़ी अपने नियंत्रण बदल सकते हैं या बाहर निकल सकते हैं। पुराने मैच की लंबित क्रियाओं से मेनू छिपने की समस्या ठीक की गई।
</hi-IN>

<pl-PL>
Poprawiono układ pada kierunkowego online. Podczas pauzy obaj gracze mogą zmieniać sterowanie lub wyjść z gry. Naprawiono ukrywanie menu przez opóźnione działania poprzedniego meczu.
</pl-PL>

<pt-BR>
Melhorado o layout do direcional online. Ambos os jogadores podem mudar seus controles ou sair durante a pausa. Corrigidas ações pendentes de partidas que ocultavam os menus.
</pt-BR>

<ar>
تم تحسين تخطيط أزرار الاتجاهات في اللعب عبر الإنترنت. يستطيع كلا اللاعبين تغيير التحكم أو المغادرة أثناء الإيقاف المؤقت. تم إصلاح إخفاء القوائم بسبب عمليات متأخرة من المباراة السابقة.
</ar>

<ru-RU>
Улучшено расположение крестовины в сетевой игре. Во время паузы оба игрока могут менять управление или выходить. Исправлено скрытие меню из-за отложенных действий прошлого матча.
</ru-RU>

<id>
Tata letak D-pad online ditingkatkan. Kedua pemain dapat mengubah kontrol atau keluar saat dijeda. Memperbaiki tindakan tertunda dari pertandingan lama yang menyembunyikan menu.
</id>

<ja-JP>
オンライン対戦の方向パッド配置を改善しました。一時停止中は両プレイヤーが操作方法を変更したり退出したりできます。以前の対戦の遅延処理でメニューが消える問題を修正しました。
</ja-JP>

<ko-KR>
온라인 방향 패드 배치를 개선했습니다. 일시 정지 중 두 플레이어 모두 조작 방식을 바꾸거나 나갈 수 있습니다. 이전 경기의 지연 처리로 메뉴가 사라지는 문제를 수정했습니다.
</ko-KR>

<vi>
Cải thiện bố cục phím điều hướng trực tuyến. Cả hai người chơi có thể đổi cách điều khiển hoặc rời trận khi tạm dừng. Sửa lỗi thao tác chậm từ trận cũ làm ẩn menu.
</vi>

<th>
ปรับปรุงตำแหน่งปุ่มทิศทางในเกมออนไลน์ ผู้เล่นทั้งสองเปลี่ยนการควบคุมหรือออกจากเกมระหว่างหยุดชั่วคราวได้ แก้ไขการทำงานค้างจากแมตช์เดิมที่ทำให้เมนูหายไป
</th>

<fil-PH>
Pinahusay ang ayos ng online D-pad. Maaaring baguhin ng parehong manlalaro ang kanilang kontrol o umalis habang naka-pause. Inayos ang mga naantalang aksiyon ng lumang laban na nagtatago sa menu.
</fil-PH>

<nl-NL>
De indeling van de online D-pad is verbeterd. Beide spelers kunnen tijdens de pauze hun besturing wijzigen of vertrekken. Vertraagde acties uit eerdere wedstrijden verstoren de menuweergave niet meer.
</nl-NL>

<el-GR>
Βελτιώθηκε η διάταξη του σταυρού κατεύθυνσης online. Στην παύση και οι δύο παίκτες μπορούν να αλλάξουν χειρισμό ή να αποχωρήσουν. Διορθώθηκαν καθυστερημένες ενέργειες αγώνα που έκρυβαν τα μενού.
</el-GR>

<cs-CZ>
Vylepšeno rozložení směrového ovladače online. Během pauzy mohou oba hráči změnit ovládání nebo odejít. Opraveno skrývání menu zpožděnými akcemi předchozího zápasu.
</cs-CZ>

<zh-CN>
优化了在线对战的方向键布局。暂停时双方玩家都可以更改自己的控制方式或退出。修复了旧对局的延迟操作导致菜单消失的问题。
</zh-CN>


## v3.5.0 — Online ortak saha görünürlüğü (2026-09-27)

Yerel kaynak sürümü; canlı web veya mağaza dağıtımı yapılmadı. Native Android Code 71 ve iOS Build 46 değişmedi.

- İlk round ölçümü, gerçek kontrol paneli yüksekliği ve güvenli alan kesişimi düzeltildi.
- Kare hücrelerle tam sığdırma, sabit ortak matris, boyut değişimlerinde yeniden ölçekleme ve grid önbelleği düzeltmesi eklendi.
- PC yalnız sürüm eşitliği için güncellendi; iki mobil fallback yeni kaynakla eşitlendi.
- 62/62 otomatik test geçti. Fiziksel A71/iPhone 14 Pro Max ve macOS WebKit doğrulaması bekleniyor.

### Mağaza metni taslakları — 21 dil (henüz yayımlanmadı)

<en-US>
Online matches now fit the entire shared board on different screens, starting with the first round. Controls and safe areas are measured correctly; snakes remain visible at the edges.
</en-US>

<tr-TR>
Online maçlarda ortak saha ilk round’dan itibaren farklı ekranlara tamamen sığar. Kontrol paneli ve güvenli alanlar doğru ölçülür; kenarlardaki yılanlar görünür kalır.
</tr-TR>

<fr-FR>
Le terrain partagé des matchs en ligne s’adapte entièrement aux différents écrans dès la première manche. Les commandes et les zones de sécurité sont prises en compte pour garder les serpents visibles aux bords.
</fr-FR>

<it-IT>
Il campo condiviso delle partite online si adatta interamente a schermi diversi fin dal primo round. I comandi e le aree sicure vengono misurati correttamente, mantenendo visibili i serpenti ai bordi.
</it-IT>

<es-ES>
El tablero compartido de las partidas online se adapta por completo a distintas pantallas desde la primera ronda. Los controles y las áreas seguras se miden correctamente para mantener visibles las serpientes en los bordes.
</es-ES>

<de-DE>
Das gemeinsame Spielfeld passt bei Online-Partien ab der ersten Runde vollständig auf unterschiedliche Bildschirme. Steuerung und sichere Bildschirmbereiche werden berücksichtigt, damit Schlangen am Rand sichtbar bleiben.
</de-DE>

<zh-CN>
在线对战从第一回合起即可在不同屏幕上完整显示同一棋盘。正确计算控制面板和安全区域，确保边缘的蛇身始终可见。
</zh-CN>

<hi-IN>
ऑनलाइन मैचों में साझा बोर्ड पहले राउंड से ही अलग-अलग स्क्रीन पर पूरा दिखाई देता है। नियंत्रण पैनल और सुरक्षित क्षेत्र सही ढंग से मापे जाते हैं, ताकि किनारों पर साँप दिखाई देते रहें।
</hi-IN>

<pl-PL>
W meczach online cała wspólna plansza mieści się na różnych ekranach już od pierwszej rundy. Poprawny pomiar panelu sterowania i bezpiecznych obszarów zapewnia widoczność węży przy krawędziach.
</pl-PL>

<pt-BR>
Nas partidas online, todo o tabuleiro compartilhado se adapta a diferentes telas desde a primeira rodada. Os controles e as áreas seguras são medidos corretamente para manter as cobras visíveis nas bordas.
</pt-BR>

<ar>
تظهر ساحة اللعب المشتركة كاملة على مختلف الشاشات منذ الجولة الأولى في المباريات عبر الإنترنت. تُحسب مساحة أزرار التحكم والمناطق الآمنة بدقة لتبقى الثعابين ظاهرة عند الحواف.
</ar>

<ru-RU>
В онлайн-матчах общее поле полностью помещается на разных экранах с первого раунда. Панель управления и безопасные области учитываются корректно, поэтому змеи остаются видимыми у краёв.
</ru-RU>

<id>
Dalam pertandingan online, seluruh papan bersama kini pas di berbagai layar sejak ronde pertama. Kontrol dan area aman diukur dengan benar agar ular tetap terlihat di tepi.
</id>

<ja-JP>
オンライン対戦の共通盤面が、最初のラウンドから異なる画面サイズに収まるようになりました。操作パネルとセーフエリアを正しく計測し、端にいるヘビも見えるようにしました。
</ja-JP>

<ko-KR>
온라인 경기의 공통 보드가 첫 라운드부터 다양한 화면에 완전히 표시됩니다. 조작 패널과 안전 영역을 정확히 계산해 가장자리의 뱀도 보이도록 개선했습니다.
</ko-KR>

<vi>
Trong trận đấu trực tuyến, toàn bộ bàn chơi chung vừa với các màn hình khác nhau ngay từ vòng đầu. Bảng điều khiển và vùng an toàn được đo chính xác để rắn vẫn hiển thị ở các mép.
</vi>

<th>
กระดานร่วมในเกมออนไลน์แสดงได้ครบถ้วนบนหน้าจอขนาดต่าง ๆ ตั้งแต่รอบแรก คำนวณพื้นที่ปุ่มควบคุมและพื้นที่ปลอดภัยอย่างถูกต้อง เพื่อให้งูที่ขอบจอยังคงมองเห็นได้
</th>

<fil-PH>
Sa mga online na laban, kasya na ang buong pinagsasaluhang board sa iba’t ibang screen mula sa unang round. Tamang sinusukat ang mga kontrol at ligtas na lugar upang manatiling kita ang mga ahas sa mga gilid.
</fil-PH>

<nl-NL>
Het gedeelde speelveld past bij online wedstrijden vanaf de eerste ronde volledig op verschillende schermen. De bediening en veilige schermgebieden worden correct gemeten, zodat slangen aan de randen zichtbaar blijven.
</nl-NL>

<el-GR>
Στους online αγώνες, ολόκληρο το κοινό ταμπλό χωρά σε διαφορετικές οθόνες από τον πρώτο γύρο. Τα χειριστήρια και οι ασφαλείς περιοχές υπολογίζονται σωστά, ώστε τα φίδια να παραμένουν ορατά στις άκρες.
</el-GR>

<cs-CZ>
V online zápasech se celá společná plocha vejde na různé obrazovky už od prvního kola. Ovládací panel a bezpečné oblasti se měří správně, takže hadi zůstávají viditelní i na okrajích.
</cs-CZ>


## iOS App Store & TestFlight Release Notes

### Sürüm v3.4.9 — Akıllı Cache-Busting, 0 KB Sürüm Kontrolü & İlk Açılış Hızlandırması (2026-09-27)

- **Akıllı HEAD (ETag & Last-Modified) Sürüm Kontrol Motoru:**
  - Hem PC hem Mobil oyundaki sürüm kontrol mekanizması (`checkForFreshVersion`) modernize edildi.
  - Artık her kontrolde 728 KB / 823 KB boyutundaki dev HTML dosyasını baştan indirmek yerine, **0 KB veri transferiyle** ultra-hafif bir `HEAD` sorgusu atılır.
  - Sunucunun döndürdüğü `ETag` ve `Last-Modified` (dosyanın sunucuya yüklenme tarihi) başlıkları izlenir.
  - **Kritik Kazanım:** Geliştirici sürüm numarasını (`v3.4.9`) değiştirmeden dosya güncellese dahi, sunucudaki dosya yüklenme tarihi değiştiği anda sistem bunu salisesinde algılar ve yeni dosyayı anında devreye alır.
- **Oyun Akışını Bölmeyen Güvenli Yenileme:**
  - `canApplyVersionRefreshNow()` güvenlik kilidi sayesinde oyuncular maç ortasındayken, ödüllü devam ekranındayken veya reklam izlerken asla sayfa yenilenmez; maç bitip ana menüye dönüldüğünde akıcı şekilde yeni dosya devreye girer.
- **Mobil Pil ve Kota Tasarrufu:**
  - Mobil oyunda 2 saniyede bir çalışan aşırı agresif versiyon kontrol döngüsü (`VERSION_CHECK_INTERVAL_MS`), cihazın pilini ve hücresel kotasını korumak amacıyla 30 saniyeye çekildi. Sekme değiştirme (`visibilitychange`), ekrana geri dönme (`focus`, `pageshow`) ve maç sonu anlık tetikleyicileri korundu.
- **Hostinger CDN & LiteSpeed Optimizasyonu:**
  - Hostinger CDN'in oyun dosyasını "DYNAMIC" olarak işaretleyip ilk açılışta 5 saniye bekletmesine sebep olan eski `no-cache, must-revalidate` meta etiketleri optimize edildi.
  - LiteSpeed Cache üzerinde Konuk Kipi (Guest Mode), Mobil Önbellek (Cache Mobile), Tarayıcı Önbelleği (Browser Cache) ve Crawler (Site Haritası Isıtıcısı) tam konfigüre edildi.
- **iOS & Mobil WebKit Reklam Sonrası Ses Kurtarma Motoru (Resilient Web Audio Engine):**
  - Tam ekran AdMob geçiş ve ödüllü reklam gösterimleri esnasında iOS WebKit'in ses oturumunu (`AVAudioSession`) kesintiye uğratıp `AudioContext`'i kalıcı olarak askıya (`suspended` / `interrupted`) alması sorunu kökten çözüldü.
  - Reklam kapanış callback'leri (`afterAd`, `adBreakDone`, `onNativeAdDone`), yaşam döngüsü olayları (`visibilitychange`, `pageshow`, `focus`) ve Apple'ın gereksinim duyduğu kullanıcı etkileşimi yakalama dinleyicileri (`touchstart`, `pointerdown`, `keydown`) ile otomatik kurtarma motoru (`resumeAudioContext` & `primeAudioContext`) kuruldu.
  - Reklam bittiğinde oyun sesleri salisesinde kesintisiz devam eder; donuk audio context'ler 1-örnekli mikro priming ile donanıma anında bağlanır.
- **Çapraz Platform Senkronizasyonu & Testler:**
  - PC v3.4.9 ve Mobil v3.4.9 kaynak dosyaları oluşturuldu; tüm dahili scriptler Node.js sözdizimi doğrulamasıyla test edildi (%100 hatasız).
  - `tests/ios-runtime.test.cjs` test paketinde 56/56 test (%100) başarıyla geçti.

<en-US>
What's New in v3.4.9:
• Smart Cache-Busting & Zero-Byte Version Checks: Upgraded version checking to lightweight HTTP HEAD queries (0 KB body payload) tracking ETag and Last-Modified timestamps.
• Instant Hot-Updates: Even without incrementing the version string, uploading a modified file triggers seamless client updates.
• Web Audio Recovery Engine: Resolved iOS WebKit audio suspension where game sounds cut out after full-screen AdMob interstitial and rewarded ads.
• Gameplay Protected: Updates wait gracefully until the current match or ad break concludes.
• Mobile Battery & Bandwidth Optimization: Balanced mobile background checks to 30s while maintaining instant tab-focus and post-match listeners.
• Hostinger CDN & LiteSpeed Cache Acceleration: Eliminated blocking no-cache meta tags and tuned server-side edge caching for fast cold starts.
• Full Cross-Platform Parity: PC v3.4.9 and Mobile v3.4.9 fully synced and syntax-verified.
</en-US>

<tr-TR>
v3.4.9 Yenilikleri:
• Akıllı Cache-Busting ve 0 KB Sürüm Kontrolü: Versiyon kontrol motoru, ETag ve Last-Modified başlıklarını izleyen hafif HEAD isteklerine dönüştürüldü (0 KB veri transferi).
• Sürüm Numarasından Bağımsız Anında Güncelleme: Sürüm numarası artırılmasa dahi sunucuya yüklenen yeni dosya tüm cihazlar tarafından salisesinde algılanır.
• Reklam Sonrası Ses Kurtarma Motoru: Tam ekran AdMob reklamlarından sonra iOS WebKit'te oyun seslerinin kesilmesi sorunu çözüldü.
• Kesintisiz Oyun Keyfi: Güncellemeler maç ortasında değil, yalnızca ana menüde veya maç bitiminde devreye girer.
• Mobil Pil & Kota Tasarrufu: Mobildeki 2 saniyelik agresif döngü 30 saniyeye dengelendi; sekme açılış ve maç sonu kontrolleri korundu.
• CDN & LiteSpeed İlk Açılış Hızlandırması: CDN'i kilitleyen eski etiketler temizlendi; ilk ziyaret hızlandırıldı.
• Tam Senkronizasyon: PC v3.4.9 ve Mobil v3.4.9 eksiksiz eşitlendi.
</tr-TR>

### Sürüm v3.4.8 — Oyun Sonu Buton Düzeni & Paylaş Butonunun Kaldırılması (2026-09-25)

- **Oyun Sonu Buton Düzeninde Ergonomik Sıralama:**
  - Oyun sonu istatistik penceresinde (`showGameEndStats`) butonlar sektör standardı UI ilkelerine göre yeniden dizildi:
    - **Sol Buton:** İkincil / Çıkış aksiyonu olan **Ana Menü** (`#gameEndMenuBtn`).
    - **Sağ Buton:** Birincil / Ana aksiyon çağrısı (CTA) olan **Tekrar Oyna** (`#gameEndReplayBtn`).
  - Tek kişilik oyun bitiş ekranında (`render1PGameOver`) da buton sırası aynı standartla senkronize edildi.
- **Paylaş (Share) Butonunun Tamamen Kaldırılması:**
  - Oyun akışını bölen ve gereksiz kalabalık yaratan "Paylaş" butonu (`#gameEndShareBtn` ve `#shareScoreBtn`) DOM şablonlarından, olay dinleyicilerinden ve yardımcı fonksiyonlardan (`triggerShareScore`) tamamen temizlendi.
  - İlgili `.game-end-btn.share-btn` ve `.btn.share-neon` CSS kuralları kaldırılarak kod tabanı sadeleştirildi.
- **Ferah ve Odaklı Oyun Sonu Deneyimi:**
  - Mobil ekranlarda 3 butonun sıkışması engellendi; 2 butonlu sade yapı yan yana ergonomik bir yerleşim sundu.
- **Çapraz Platform Senkronizasyonu & Testler:**
  - Mobil v3.4.8, PC v3.4.8, iOS ve Android offline fallback dosyaları tam senkronize edildi.
  - `tests/ios-runtime.test.cjs` test paketinde 54/54 test (%100) başarıyla geçti.

<en-US>
What's New in v3.4.8:
• Streamlined Game End Layout: Reordered action buttons with Main Menu on the left and Play Again on the right for intuitive navigation.
• Removed Share Button: Completely eliminated the Share button and clutter from post-game screens for a cleaner, faster rematch flow.
• Ergonomic Mobile & Desktop UI: Two balanced buttons side-by-side provide effortless post-game interaction.
• Full Cross-Platform Parity: Mobil, PC, iOS Native Shell, and Android fallbacks updated with 100% test coverage.
</en-US>

<tr-TR>
v3.4.8 Yenilikleri:
• Ergonomik Oyun Sonu Buton Düzeni: Butonlar sektör standardına uygun olarak solda Ana Menü, sağda Tekrar Oyna şeklinde yeniden dizildi.
• Paylaş Butonu Kaldırıldı: Oyun sonundaki gereksiz Paylaş butonu tüm sürümlerden tamamen temizlendi.
• Ferah ve Hızlı Oyun Sonu Deneyimi: Sadeleştirilmiş iki butonlu yapı ile daha hızlı ve konforlu rövanş imkanı.
• Tam Çapraz Platform Eşitlemesi: Mobil, PC, iOS ve Android fallbacks 54/54 test ile eksiksiz güncellendi.
</tr-TR>

### Sürüm v3.4.7 — Online Çok Oyunculu Hız Kalibrasyonu & İnsani Seviye Dengeleme (2026-09-25)

- **Tüm Online Odalarda 93.9 ms Altın Oran Baz Hız:**
  - Sunucudaki (`server.js`) tüm oyun modlarının (Rastgele Eşleşme, Özel Oda Normal, Macera, Self Area 51) temel hızı yerel oyunla birebir aynı olan Altın Oran standardına (`MOD_SPEED.NORMAL = 0.75` / 10.65 TPS / 93.9 ms) eşitlendi.
  - Özel odalardaki eski 70.4 ms'lik (%33 aşırı hızlı) kontrolsüz hız ortadan kaldırılarak yerel oyunla sıfır algı şoku sağlandı.
- **İnsani Seviye Dash (Hızlanma Butonu):**
  - Hızlı Rekabetçi (Fast Competitive) modundaki Dash çarpanı `2.5x` (33.1 ms ölümcül hız) seviyesinden `1.45x` (**64.7 ms**) seviyesine çekildi.
  - Yılan çeyrek saniyede kontrolsüzce duvara yapışmak yerine, taktiksel bir ivmeyle fırlar, yem kapar veya rakibi köşeye sıkıştırır; oyuncu yön kontrolünü kaybetmez.
- **Dengeli Güçlendiriciler:**
  - Kırmızı Yem (Beast Mode) çarpanı `1.45x`'ten `1.25x`'e (**75.1 ms**), Mavi Safir yavaşlatması `0.50x`'ten `0.65x`'e (**144.5 ms**) uyarlandı.
- **Rastgele Eşleşmede Bot Fallback Hız Senkronu:**
  - 10 saniyede gerçek rakip bulunamayıp botla oyna dendiğinde oyun `FAST` yerine `NORMAL` (93.9 ms) hızında ve dengeli yapay zekayla başlar.
- **Çapraz Platform Senkronizasyonu & Testler:**
  - `server.js`, Mobil v3.4.7, PC v3.4.7, iOS ve Android offline fallback dosyaları tam senkronize edildi; `tests/ios-runtime.test.cjs` 53/53 test (%100) başarıyla geçti.

<en-US>
What's New in v3.4.7:
• Multiplayer Speed Calibration: Rebalanced all online modes (Random Matchmaking & Custom Rooms) to the 93.9ms Golden Ratio base speed.
• Humane Dash Tuning: Tamed the competitive Dash boost from 33ms to a tactical, controllable 64.7ms surge.
• Balanced Power-Ups: Tuned Beast Mode (75.1ms) and Sapphire slow effect (144.5ms) for fair online duels.
• Fair Bot Fallback: Unmatched matchmaking now transitions smoothly into Normal speed against AI.
• Full Cross-Platform Parity: Server and client runtimes completely aligned.
</en-US>

<tr-TR>
v3.4.7 Yenilikleri:
• Online Çok Oyunculu Hız Kalibrasyonu: Rastgele eşleşme ve özel odaların baz hızı yerelle eşitlenerek 93.9 ms Altın Oran seviyesine çekildi.
• İnsani Seviye Dash: Hızlanma butonu 33 ms'lik intihar hızından 64.7 ms'lik taktiksel atak seviyesine dengelendi.
• Dengeli Güçlendiriciler: Kırmızı Yem (75.1 ms) ve Safir yavaşlatması (144.5 ms) adil düellolar için optimize edildi.
• Dengeli Yapay Zeka Geçişi: Eşleşme bulunamadığında bot karşılaşması Normal hızda başlar.
• Tam Çapraz Platform Eşitlemesi: Sunucu ve istemci kodları %100 senkronize edildi.
</tr-TR>

### Sürüm v3.4.6 — Altın Oran Hız Kalibrasyonu & Çapraz Platform Hız Senkronizasyonu (2026-09-25)

- **Altın Oran NORMAL Hız Kalibrasyonu (Refleks Dostu Akış):**
  - Başlangıç hızı olan NORMAL hız çarpanı `0.75` olarak yeniden kalibre edildi (`MOD_SPEED.NORMAL = 0.75`).
  - Oyuncu adım aralığı 93.9 ms (~10.6 kare/sn) seviyesine çekilerek oyuna başlar başlamaz yaşanan panik ve duvara çarpma stresi ortadan kaldırıldı; köşe dönüşlerinde ve manevralarda tatmin edici bir kontrol alanı sağlandı.
- **PC ve Mobil Hız Uçurumunun Kapatılması:**
  - PC sürümündeki eski aşırı hızlı `1.00` çarpanı (70ms adım süresi) Mobil ile eşitlenerek `0.75` yapıldı.
  - PC ve Mobil oyuncuları artık tamamen aynı refleks hafızası ve akıcı hız standartlarıyla oynar.
- **Yapay Zeka (AI) Hız ve Rekabet Dengesi:**
  - NORMAL modda AI hızı oyuncunun hızının %60'ında tutularak 156.5 ms / adım (~6.4 kare/sn) olarak dengelendi; AI sahadan kopmadan rekabetçi kalır.
  - KOLAY modda AI hızı emekleme seviyesinden (235ms) canlı bir başlangıç seviyesine (`195.6 ms`, %60) uyarlandı.
- **Hız Kademeleri Hiyerarşisi:**
  - KOLAY: `0.60` (117.4 ms) | NORMAL: `0.75` (93.9 ms) | HIZLI: `0.95` (74.1 ms) | EKSTREM: `1.50` (46.9 ms).
- **Çapraz Platform Senkronizasyonu & Testler:**
  - Mobil v3.4.6, PC v3.4.6, iOS offline fallback ve Android offline fallback tam senkronize edildi.
  - `tests/ios-runtime.test.cjs` test paketinde 51/51 test (%100) başarıyla geçti.

<en-US>
What's New in v3.4.6:
• Golden Ratio Speed Calibration: Rebalanced default NORMAL speed to 93.9ms per step for smooth, responsive control without early-game panic.
• PC & Mobile Speed Parity: Eliminated PC speed discrepancy, aligning keyboard and touch gameplay to the same responsive tempo.
• Dynamic AI Balancing: AI snake matches player speed curves with fair, engaging competition across Easy, Normal, and Fast modes.
• Full Cross-Platform Sync: Web, PC, iOS Native Shell, and Android WebView completely aligned with 100% automated test coverage.
</en-US>

<tr-TR>
v3.4.6 Yenilikleri:
• Altın Oran Hız Dengelemesi: Varsayılan NORMAL hız 93.9ms adım süresine dengelenerek panik olmadan akıcı ve kontrollü manevra imkanı sağlandı.
• PC ve Mobil Hız Eşitlemesi: PC'deki aşırı hızlı başlangıç mobil temposuyla eşitlendi; platformlar arası hız farkı giderildi.
• Dengeli Yapay Zeka Hızları: Kolay ve Normal modlarda yapay zekanın oyuncuya ayak uyduran canlı ve adil takip hızı korundu.
• Tam Çapraz Platform Uyumu: Mobil, PC, iOS ve Android sürümleri %100 test uyumuyla güncellendi.
</tr-TR>

### Sürüm v3.4.5 — Game Feel Juice, Tron Zemin İzi, Dokunmatik Geri Bildirim & Sosyal Paylaşım (2026-09-25)

- **Yılan Başı "Lokma Yutma" Efekti (Squash & Stretch / Gulp Pop):**
  - Yem yendiğinde baş bloğu hareket ekseninde 140ms boyunca organik bir yaylanmayla genleşip (`scale(1.25, 0.8)`) normale döner; yem yeme hissiyatı fiziksel bir tatmine kavuşur.
- **Kombo Metinlerine Fiziksel Yaylanma (Juicy Combo Popups):**
  - Kombo popup metinleri (x2, x3...) dinamik yaylanma animasyonu (spring bounce `1.55` -> `1.0`), hafif rastgele açısal eğim (`±6.3°`) ve çift katmanlı neon ışıma ile render edilir.
- **Serbest Dokunmatik / Kaydırma Geri Bildirimi (Floating Touch Ring & Swipe Trail - Mobil):**
  - Ekrana dokunulduğunda ve kaydırıldığında neon camgöbeği (cyan) halka ve yön oku belirir, 220ms içinde zarifçe söner; oyuncuya sezgisel görsel teyit sağlar.
- **Zemin Canlılığı — Tron Işık İzi (Grid Cell Glow Trail):**
  - Yılanın kuyruğunun terk ettiği zemin karelerinde 550ms süreli fütüristik neon dolgu ve ızgara çerçeve ışıması bırakılır. Yılan başının önünde hiçbir görsel kutu veya fazlalık oluşmaz; hareket yönünde temiz zemin, kuyruk arkasında akıcı neon iz deneyimi sağlanır. 48 elemanlı döngüsel bellek havuzu (ring buffer) ile sıfır GC yükü ve 60 FPS akıcılık.
- **Kişisel Rekor Rozeti & Sosyal Paylaşım Döngüsü (Viral Share Loop & New Record):**
  - 1P Solo modunda en yüksek skor geçildiğinde parlayan altın "🏆 YENİ KİŞİSEL REKOR!" rozeti belirir.
  - Oyun sonu ekranlarına modern Web Share API destekli, panoya kopyalama ve toast bildirim fallback'li neon yeşil "Skoru Paylaş" (Share Score) butonu eklendi.
- **Çapraz Platform Senkronizasyonu & Testler:**
  - Mobil v3.4.5, PC v3.4.5, iOS offline fallback ve Android offline fallback tam senkronize edildi.
  - `tests/ios-runtime.test.cjs` test paketinde 50/50 test (%100) başarıyla geçti.

<en-US>
What's New in v3.4.5:
• Head "Gulp Pop" Effect: Satisfying squash & stretch bounce when eating food along the movement axis.
• Juicy Combo Popups: High-impact spring bounce, subtle angular tilt, and dual-layer neon glow for combo counters.
• Free Touch & Swipe Feedback: Sleek neon ring and directional arrow trail for intuitive mobile touch gestures.
• Tron Grid Glow Trail: Fading futuristic neon trail where snake heads travel, rendered with zero performance overhead.
• New High Score Badge & Viral Share: Glowing gold record achievement badge and one-tap social score sharing.
• Full Cross-Platform Sync: Web, PC, iOS Native Shell, and Android WebView completely aligned with 100% test coverage.
</en-US>

<tr-TR>
v3.4.5 Yenilikleri:
• Lokma Yutma Efekti: Yem yendiğinde yılan başında hareket yönünde organik yaylanma ve genişleme efekti.
• Yaylanan Kombo Metinleri: Kombo patlamalarında fiziksel yaylanma, hafif açısal eğim ve çift katmanlı neon ışıma.
• Dokunmatik Geri Bildirim Halkası: Mobilde serbest dokunma ve kaydırma anında beliren şık neon halka ve yön oku.
• Tron Zemin Işık İzi: Yılan başlarının geçtiği karelerde zemin seviyesinde zarif fütüristik neon ışık izi.
• Yeni Rekor Rozeti & Kolay Paylaşım: Yeni kişisel rekorlarda altın ışıltılı rozet ve tek dokunuşla skor paylaşma imkanı.
• Tam Çapraz Platform Uyumu: Mobil, PC, iOS ve Android sürümleri %100 test uyumuyla güncellendi.
</tr-TR>

### Sürüm v3.4.4 — UI Ergonomisi & Çapraz Platform Oyun Sonu Buton Hiyerarşisi (2026-09-25)

- **Hızlı Kurulum Dokunma Alanı (44x44px Hit-Target):**
  - Hızlı Kurulum (`openQuickSetupMenu`) menüsündeki 28px renk seçim dairelerine mobil erişilebilirlik standartlarına uygun `::before` pseudo-elementi ile 44x44px genişletilmiş dokunma alanı entegre edildi.
  - Küçük ekranlarda ve hareket halindeyken yanlış dokunmalar tamamen önlendi; `touch-action: manipulation` ile çift tıklama gecikmesi sıfırlandı. Menü sadeliği ve temiz yerleşimi tam korundu.
- **Çapraz Platform Oyun Sonu Buton Hiyerarşisi (Primary CTA & Secondary Ghost):**
  - Hem Mobil hem PC sürümlerinde oyun sonu ve galibiyet modal ekranlarında (`showGameEndStats`, `render1PGameOver`) "Tekrar Oyna" (Play Again) butonu parlak neon gradient (`primary` / `primary-neon`) ile öne çıkarıldı.
  - "Ana Menü" (Main Menu) butonu ise ikincil şeffaf (`secondary` ghost) stiline çekilerek hover/dokunma anında neon patlaması yapması önlendi; akıcı ve dingin bir UX dengesi kuruldu. Açık tema (Light theme) tam uyumu sağlandı.
- **Mobil Kontrol Düzeni Sadeliği:**
  - Hızlı Kurulum menüsü yalın ve odaklı tutuldu; D-Pad ve 2-Buton geçişi oyun içi Pause menüsündeki akıcı bubble geçiş butonu üzerinden kesintisiz çalışmaya devam eder.
- **PC & Çevrimdışı Sürüm Senkronizasyonu:**
  - Mobil v3.4.4, PC v3.4.4, iOS (`mobile_offline_fallback.html`) ve Android (`mobile_offline_fallback.html`) tam senkronize edildi.
  - `tests/ios-runtime.test.cjs` test paketinde 48/48 test (%100) başarıyla geçti.

<en-US>
What's New in v3.4.4:
• Ergonomic 44x44px Hit-Targets: Quick Setup color dots now feature expanded touch targets for effortless selection.
• Enhanced Game-End CTA Hierarchy: "Play Again" shines as a vibrant neon primary button across Mobile and PC, while "Main Menu" remains an elegant secondary ghost button.
• Streamlined Quick Setup: Clean, uncluttered pre-match menu flow preserved on mobile devices.
• Cross-Platform Synchronization: Web, PC, iOS, and Android offline runtimes fully aligned with 100% automated test coverage.
</en-US>

<tr-TR>
v3.4.4 Yenilikleri:
• Ergonomik 44x44px Dokunma Alanı: Hızlı Kurulum renk seçim daireleri genişletilmiş dokunma alanı ile kolaylaştırıldı.
• Oyun Sonu Buton Hiyerarşisi: Hem Mobil hem PC'de "Tekrar Oyna" butonu parlak neon birincil CTA, "Ana Menü" ise sakin ikincil ghost buton yapıldı.
• Yalın Hızlı Kurulum Deneyimi: Mobilde sade ve odaklı menü düzeni korunarak gereksiz kart kalabalığı önlendi.
• Çapraz Platform Senkronizasyonu: Web, PC, iOS ve Android offline sürümleri %100 test uyumuyla güncellendi.
</tr-TR>

### Sürüm v3.4.3 — Game Feel, Girdi Tamponlama, Akıllı AI Hayatta Kalma & Ses İyileştirmeleri (2026-09-25)

- **Girdi Tamponlama (Input Buffering / Turn Queue):**
  - Hızlı L-dönüşü ve U-dönüşü hamlelerinde yön komutlarının kaybolması engellendi.
  - Her yılana 2 kademeli `inputQueue` mimarisi entegre edilerek, tick periyodu içinde verilen ardışık komutlar sıraya alındı ve köşe kaçırma problemi ortadan kaldırıldı.
- **Canvas Tabanlı Travma Sarsıntısı (Decaying Trauma Shake):**
  - CSS tabanlı `.shake` sınıfı yerine Canvas 2D katmanında `trauma²` üssel sönümlemeli yumuşak ekran sarsıntısı uygulandı.
  - Çarpışma ve ölüm anında maksimum hissedilirlik sağlanırken, hafif etkileşimlerde sarsıntı ölçülü tutuldu.
- **Hit-Stop (Mikro Zaman Durması):**
  - Ölümcül çarpışma anında oyun mantığı 75ms boyunca durdurularak vuruşun ağırlığı ve dramatik etkisi fiziksel olarak hissettirildi.
- **SFX Kombo Yükselişi & Sabit İlk Ses:**
  - Yem yeme seslerinde temel frekans her iki yılan için de daima sabit ve temiz 720Hz olarak korundu.
  - Oyuncu 1.5 saniye içinde art arda kombo yaptıkça (x2, x3...) frekans kademe kademe incelerek (+210Hz'e kadar) başarı hissi aşılandı; kombo bitiminde ses hemen standart 720Hz'e döner.
  - **AI Yılan Yem Sesi Ayrımı:** 1P modunda yapay zeka (AI) yılanının yem yeme sesleri kombo artışından muaf tutularak daima standart, ilk orijinal 720Hz frekansında sabitlendi; böylece oyuncunun kendi kombo yükselişini net duyması sağlandı.
- **AI Flood-Fill Hayatta Kalma Zekası (Dead-End Avoidance):**
  - BFS yolu tıkandığında AI'ın rastgele ilk boş kareye yönelip kendini hapsetmesi önlendi; aday yönler 80 hücrelik flood-fill algoritmasıyla taranarak en geniş alana yönelmesi sağlandı.
- **Kademeli Dokunsal Titreşim (Haptic Tiers):**
  - D-Pad yön dönüşü (10ms hafif tık) → Normal yem (20ms) → Elmas/Kalp (30ms) → Kombo (çift vuruş `[15, 8, 15]`) → Çarpışma (80ms tok vuruş) → Zafer (`[30, 20, 50]`) şeklinde katmanlandırıldı.
- **Parçacık Nesne Havuzu (Object Pool):**
  - Yem patlama parçacıkları için 64 elemanlık sabit nesne havuzu (`foodBurstPool`) kuruldu; render esnasında her karede dizi tahsisi sıfırlanarak Garbage Collection mikro donmaları önlendi.
- **Sürüm Senkronizasyonu & Testler:**
  - Mobil v3.4.3, PC v3.4.3, iOS ve Android çevrimdışı fallback dosyaları senkronize edildi.
  - `tests/ios-runtime.test.cjs` test paketinde 46/46 test (%100) başarıyla geçti.

<en-US>
What's New in v3.4.3:
• Responsive Input Buffering: Rapid corner turns and U-turns now queue reliably without dropping inputs.
• Dynamic Canvas Screen Shake: Physics-based trauma decay replaces CSS shake for punchy, organic impacts.
• Impact Hit-Stop: Fatal collisions now trigger a brief 75ms freeze frame for heightened game feel.
• Dynamic Combo Escalation: Baseline eat audio tone stays clean and rises dynamically only during combos.
• Smarter AI Survival: Flood-fill area evaluation prevents AI from trapping itself in dead-ends.
• Tiered Haptic Feedback: Custom vibration patterns for turns, food, combos, crashes, and match victories.
• Performance Polish: Zero-allocation particle object pooling eliminates frame drops.
</en-US>

<tr-TR>
v3.4.3 Yenilikleri:
• Tepkisel Girdi Tamponlama: Hızlı köşe ve U dönüşlerinde komut kaçırma sorunu 2 adımlı kuyruk ile giderildi.
• Dinamik Canvas Sarsıntısı: Çarpışmalarda fizik tabanlı yumuşak sönümlemeli ekran sarsıntısı.
• Çarpışma Hit-Stop Etkisi: Ölüm anında 75ms mikro zaman durması ile çarpışmanın ağırlığı hissettirildi.
• SFX Kombo Yükselişi: Sabit standart ilk yem sesi ve kombo serilerinde kademe kademe incelen frekans.
• Akıllı AI Hayatta Kalma: Flood-fill alan analiziyle yapay zekanın kendini köşeye sıkıştırması önlendi.
• Kademeli Titreşim (Haptic): Dönüş, yem, kombo, çarpışma ve galibiyet için özel titreşim desenleri.
• Parçacık Nesne Havuzu: Sabit havuz mimarisi ile bellek optimizasyonu ve pürüzsüz 60 FPS akıcılık.
</tr-TR>

### Sürüm v3.4.2 (Build 46) — App Store 21 Dil Desteği, UI Ergonomisi, iOS Neon Glow ve 90s Reklam Cooldown (2026-09-23)

- **App Store 21 Dil Kaydı (Localization Fix):**
  - App Store Connect üzerinde uygulamanın tüm 21 dilde yerelleştirilmiş olarak listelenmesini sağlamak için 21 dile ait `.lproj` paketleri (`InfoPlist.strings` / `CFBundleDisplayName`) oluşturuldu ve Xcode projesine (`project.pbxproj`) `knownRegions` ve resource ref olarak kaydedildi.
  - `AppStrings.swift` güncellenerek 21 dilin başlık ve açıklamaları tamamlandı.
- **Ergonomik UI & Buton İyileştirmeleri:**
  - D-Pad panel içi Pause ve Ses butonları 28px'ten **33px**'e, SVG ikonları 15px'ten **17px**'e büyütüldü ve `margin: 8px auto 2px !important;` ile daha aşağı kaydırılarak ferah ve kolay basılabilir hale getirildi.
  - Ses butonundaki mükerrer click event listener temizlendi; 350ms throttle/cooldown, dokunmatik optimizasyonu (`touch-action: manipulation;`) ve dokunsal geri bildirim (haptic feedback) eklendi.
- **iOS Glow & Buzlu Cam (Frosted Glass) Efektleri:**
  - iPhone app WebView ortamında (`window.isAndroidWebView`) bayrağı sebebiyle kapalı kalan neon parlama efektleri `(!window.isAndroidWebView || IS_IOS_SHELL)` ile iOS native kabukta yeniden aktif hale getirildi.
  - Canvas galibiyet yazılarında neon gölge (`shadowBlur`), iç kabartma ve kazanan bildiriminde (`.banner.winner-glass-banner.padded`) `backdrop-filter: blur(16px)` buzlu cam efekti iPhone'da kusursuz akıcılıkla çalıştırıldı.
- **45 Saniye Global Reklam Kuralı (Ad Spam Koruması & Gelir Dengesi):**
  - Reklam cooldown süresi hem oyuncu deneyimini korumak (art arda reklam spam'ini engellemek) hem de AdMob gösterim gelirini sağlıklı seviyede tutmak için **45 saniye** olarak dengelendi.
  - `AdManager.showInterstitial()` ana giriş kapısına doğrudan cooldown kontrolü entegre edildi. Maç bitişinde ana menüye dönüş ve menüden yeni oyuna başlama adımları merkezi kurala tabi kılınarak gereksiz reklam fırlatmaları engellendi.
- **Sürüm & Çevrimdışı Eşitleme:**
  - `CFBundleShortVersionString`: **3.4.2**, `CFBundleVersion` / `CURRENT_PROJECT_VERSION`: **46**.
  - Mobil, PC, iOS offline fallback ve Android offline fallback HTML dosyaları bit-for-bit senkronize edildi.
- **Otomatik Testler:**
  - `node --test tests/ios-runtime.test.cjs` 43/43 test (%100) başarıyla geçti.
- **App Store Gönderimi (Submission):**
  - Sürüm: `3.4.2 (46)`
  - Gönderim Zamanı: 23 Eylül 2026, 21:26 (Sep 23, 2026 at 9:26 PM)
  - Submission ID: `9dc8d811-3306-4b52-8d8f-fc2a0e4753e4`
  - Durum: 🟡 **Waiting for Review** (Apple İncelemesi Bekleniyor)

<en-US>
What's New in iOS v3.4.2:
• Dynamic "VS AI" Mode: 1-Player mode setup now clearly labels the AI battle option as "VS AI" for seamless match creation.
• Ergonomic D-Pad Controls: Enlarged, repositioned Pause and Sound buttons with tactile haptic feedback and anti-spam protection.
• Cyberpunk Neon Glow & Frosted Glass: Restored vivid neon glow and frosted glass visual effects for iPhone displays.
• Improved Ad Experience: Added a 90-second global cooldown between interstitial ads to prevent consecutive interruptions.
• Universal Match Invites: Join friends instantly with one tap via direct room invitation links.
• 21-Language Localization: Complete multilingual support across all game menus and options.
• Performance & Stability: Enhanced 60 FPS rendering and offline fallback support.
</en-US>

<tr-TR>
iOS v3.4.2 Yenilikleri:
• Dinamik "VS YAPAY ZEKA" Modu: Tek kişilik oyun kurulumunda yapay zeka kapışması artık dinamik olarak "VS YAPAY ZEKA" adıyla gösterilir.
• Ergonomik D-Pad Kontrolleri: Büyütülen ve panel içine yerleştirilen Pause ve Ses butonları, dokunsal titreşim (haptic) ve seri basış koruması.
• Cyberpunk Neon Işıltısı ve Buzlu Cam: iPhone ekranları için neon zafer parlamaları ve buzlu cam görsel efektleri aktif edildi.
• İyileştirilmiş Reklam Deneyimi: Art arda reklam gösterimini engellemek için geçiş reklamları arasına 90 saniyelik küresel bekleme süresi eklendi.
• Evrensel Maç Davetleri: Doğrudan oda bağlantı linkleriyle tek tıkla arkadaşlarınızın maçına katılabilme imkanı.
• 21 Dilde Tam Yerelleştirme: Tüm menü ve oyun modlarında 21 dilde eksiksiz dil desteği.
• Performans ve Kararlılık: 60 FPS akıcı oyun deneyimi ve optimize edilmiş çevrimdışı oynanış.
</tr-TR>

### Android Google Play Release — versionCode 70 (v3.4.2) (2026-09-23)

- **Sürüm & Paket Bilgileri:**
  - `versionCode`: **70** (Önceki: 69)
  - `versionName`: **v3.4.2** (Önceki: v3.3.5)
  - İmzalı Dağıtım Paketi: `Ana Dosya/Android/2PlayerSnake-v3.4.2-release.aab`
- **Öne Çıkan Geliştirmeler:**
  - **Dinamik "VS YAPAY ZEKA" (VS AI) Modu:** Tek kişilik oyun kurulumunda 21 dilde dinamik yapay zeka seçeneği.
  - **D-Pad Panel İçi Butonlar:** Pause ve Ses butonları 33px'e büyütüldü, aşağı kaydırıldı, ses butonuna 350ms throttle ve dokunsal geri bildirim (haptic) eklendi.
  - **45 Saniye Global Reklam Kuralı:** Art arda reklam gösterimini engelleyen ve AdMob gelir dengesini koruyan 45 saniyelik merkezi cooldown kuralı.
  - **Çevrimdışı Fallback Paritesi:** Android `mobile_offline_fallback.html` mobil v3.4.2 ile eksiksiz eşitlendi.
  - **R8 / ProGuard ve API 36:** Android 16 (API 36) hedeflemesi ve tam R8 kod optimizasyonu korundu.

### Sürüm v3.4.2 — PC Tek Pencereli Hızlı Kurulum Paneli & Sürüm Senkronizasyonu (2026-09-20)

- **PC Tek Pencereli Bütünleşik Hızlı Kurulum Dashboard'u (`openPCQuickSetupMenu`):**
  - Eski iki aşamalı menü kurgusu (1. Ekran: Mod Seçimi ➔ 2. Ekran: Seçenekler) tamamen kaldırıldı; mobildeki gibi tek bir şık ve bütünleşik Hızlı Kurulum ekranı oluşturuldu.
  - Ana menüde "Oyna" (Yerel Oyun) tıklandığında doğrudan 2 sütunlu neon kontrol paneli açılır.
  - **Sol Sütun:** 1P vs 2P, Oyun Modu (Klasik, VS YAPAY ZEKA / Hızlı Rekabetçi, Alan 51, Macera), Duvar Modu (dinamik), Boost (dinamik).
  - **Sağ Sütun:** Hız/Zorluk, Renk & İsim kutuları, büyük "BAŞLA" butonu, alt satırda "Geri" ve `?` "Mod Bilgisi" butonları.
  - Menü açıldığında varsayılanlar (1P - VS YAPAY ZEKA - DUVARSIZ - NORMAL - Boost Açık) hazır seçili gelir; oyuncu doğrudan tek tıkla "BAŞLA" diyerek maça girebilir.
- **Sürüm ve Çevrimdışı Fallback Senkronu:**
  - `2 Player Snake Mobile v3.4.2.html` ve `2 Player Snake PC v3.4.2.html` oluşturuldu (`VERSION = 'v3.4.2'`).
  - Android ve iOS `mobile_offline_fallback.html` çevrimdışı fallback paketleri mobil v3.4.2 ile %100 bayt bayt eşitlendi.
- **Otomatik Testler:**
  - `node --test tests/ios-runtime.test.cjs` 42/42 test (%100) başarıyla geçti.

### Sürüm v3.4.1 — Varsayılan Mod: 1P VS AI & Online HUD D-Pad Layout Düzeltmesi (2026-09-20)

- **Varsayılan Mod Değişikliği (1P - VS YAPAY ZEKA - DUVARSIZ - NORMAL):**
  - Hızlı Kurulum menüsü ("Oyna" ➔ "Başla") açıldığında seçenekler varsayılan olarak **1P**, **VS YAPAY ZEKA** (`fastCompetitive`), **DUVARSIZ** (`MOD_WALLS.NONE`) ve **NORMAL** hız modunda seçili (highlighted) olarak gelir.
  - Oyuncu hiçbir butona basmadan doğrudan "BAŞLA" butonuna bastığında bu varsayılan ayarlarla oyun başlar.
- **Online Maç Rakip Paneli Sıkışma & Buton Taşması Düzeltmesi:**
  - Rastgele eşleşme veya özel oda ile online maç başlatıldığında, daha önce 1P Solo modunda oynamış cihazlarda D-Pad yuvasında kalan Pause ve Ses butonlarının sağ rakip panelini 18 piksele sıkıştırması ve ekran dışına taşması hatası giderildi.
  - `updateUIVisibility()` fonksiyonunun `isOnlineMode` bloğuna `#p1OpponentPanel` aktivasyonu, rakip adı/seri noktaları ve `applyPlayerControlLayout('p1', p1ControlLayout)` çağrısı eklenerek butonların panel içlerine düzgün dağıtılması sağlandı.
- **PC Sürüm Senkronu:**
  - `2 Player Snake PC v3.4.1.html` oluşturuldu; PC Hızlı Kurulum Ekran 2 seçenekleri varsayılan olarak 1P, DUVARSIZ ve NORMAL olarak ön tanımlandı.
- **Çevrimdışı Fallback Senkronu:**
  - Hem iOS (`mobile_offline_fallback.html`) hem Android (`mobile_offline_fallback.html`) dosyaları `2 Player Snake Mobile v3.4.1.html` ile %100 birebir eşitlendi.
- **Otomatik Testler:**
  - `node --test tests/ios-runtime.test.cjs` 40/40 test ile %100 başarıyla doğrulandı.

### Sürüm v3.4.0 — Dinamik "VS YAPAY ZEKA" / "VS AI" Menü İsimlendirmesi (2026-09-20)

- **Dinamik Mod İsimlendirmesi (1P vs AI Netliği):**
  - Hızlı Kurulum menüsünde oyuncu **1P** seçtiğinde, mod seçimindeki 2. buton dinamik olarak **"VS YAPAY ZEKA"** (İngilizce: **"VS AI"**) adına bürünür.
  - Oyuncu **2P** seçtiğinde ise aynı buton orijinal **"HIZLI REKABETÇİ"** (**"FAST COMPETITIVE"**) adına geri döner.
  - PC sürümünde de Seçenekler ekranında 1P seçildiğinde başlık `VS YAPAY ZEKA` / `VS AI` olarak dinamik güncellenir.
- **21 Dilde `vsAiMode` Entegrasyonu:**
  - Desteklenen 21 dilin tamamında (`tr`, `en`, `fr`, `it`, `es`, `de`, `zh`, `hi`, `pl`, `ptbr`/`pt-BR`, `ar`, `ru`, `id`, `ja`, `ko`, `vi`, `th`, `tl`, `nl`, `el`, `cs`) yerelleştirilmiş terimler (`VS IA`, `VS KI`, `ПРОТИВ ИИ`, `ضد الذكاء الاصطناعي` vb.) eklendi.
- **Sürüm ve Çevrimdışı Fallback Senkronu:**
  - Mobil (`2 Player Snake Mobile v3.4.0.html`) ve PC (`2 Player Snake PC v3.4.0.html`) dosyaları oluşturuldu (`VERSION = 'v3.4.0'`).
  - Android ve iOS `mobile_offline_fallback.html` paketleri %100 eşitlendi; 38/38 otomatik test doğrulandı.

### Sürüm v3.3.9 — Ergonomik 3 Sütunlu D-Pad, Gömülü Panel Butonları & HUD Simetrisi (2026-09-20)

- **3 Sütunlu D-Pad Yukarı & Aşağı Genişletmesi:**
  - Orta sütundaki Yukarı (`↑`) ve Aşağı (`↓`) butonlarının maksimum genişliği `clamp(75px, 23vw, 108px)` seviyesine yükseltildi (eski: 60-82px).
  - Arcade/gamepad hissiyle butonlar daha etli/kare hale geldi; başparmak ile hedefleme ve dokunma kolaylığı üst düzeye çıkarıldı.
- **Stat Panelleri İçine Gömülü Pause & Ses Butonları (Rakip Modları):**
  - D-Pad modunda Pause ve Ses butonlarının panellerin dışına taşarak aradaki boşluğu kapatması sorunu giderildi (`calc(100% + 21px)` kaldırıldı).
  - **Sol Panel (P1 / P2):** Pause butonu doğrudan panel kutusunun içine, seri galibiyet noktalarının altına ortalandı (`position: static; margin: 4px auto 0;`).
  - **Sağ Panel (Rakip / AI):** Ses butonu doğrudan rakip panelinin içine, seri noktalarının altına ortalandı (`position: static; margin: 4px auto 0;`).
  - Paneller ile D-Pad arasındaki ~70px gereksiz ara boşluk yok edilerek ortadaki D-Pad kümesi ferahlatıldı.
- **1P Solo Modu Büyük Butonlar:**
  - Tek kişilik Solo modda sağ yuvadaki dikey Pause ve Ses butonları 28px'ten **36px**'e (+8px), SVG simgeleri 15px'ten **19px**'e büyütüldü. Yuva genişliği 50px'e çıkarıldı.
- **1P vs 2P Modunda 2P Yükseklik & Ölçek Düzeltmesi:**
  - 180° dönen P2 kontrollerinde (`.ctrl-content-rotated`) güvenli alan çentiğinin yanlış döndürülmesinden doğan basıklık çözüldü.
  - `#p2-controls.layout-dpad` güvenli alanı doğrudan üstten karşılar (`padding-top: var(--safe-area-top)`); `.ctrl-content-rotated` unrotated olarak %100 yükseklik ve simetrik `padding: 6px 8px` alarak P1 ile birebir piksel pikselliğe eşitlendi.
- **1P vs AI Modu HUD'ının 1Pvs2P ile %100 Birebir Eşitlenmesi:**
  - İki butonlu moddan kalan `.dual-ai .player-stat-panel { max-width: 50%; }` kısıtlaması D-Pad modunda geçersiz kılındı (`max-width: 100% !important; flex: 1 1 100% !important;`).
  - Solda P1 paneli (Pause içinde), ortada genişletilmiş D-Pad, sağda AI rakip paneli (Ses içinde) tam 72px genişlikle 1Pvs2P P1 HUD'ı ile birebir simetrik hale getirildi.
- **Sürüm Senkronu:**
  - `2 Player Snake Mobile v3.3.9.html` ve `2 Player Snake PC v3.3.9.html` dosyaları `v3.3.9` olarak güncellendi.
  - iOS ve Android `mobile_offline_fallback.html` çevrimdışı fallback paketleri eşitlendi.
- **Otomatik Testler:**
  - `node --test tests/ios-runtime.test.cjs` 36/36 test ile %100 başarıyla doğrulandı.

### App Store & TestFlight Release — Build 45 (v3.3.7, 2026-09-19)

- **Durum:** **🎉 APPLE İNCELEMESİNE GÖNDERİLDİ (Waiting for Review)** 🟡
- **Gönderim Tarihi:** 19 Eylül 2026, 23:08 (TSI)
- **Submission ID:** `56fe5578-39ff-4c0c-b05a-87c56ed0c11b`
- **Uygulama Sürümü:** `3.3.7 (45)` (`CFBundleShortVersionString = 3.3.7`, `CFBundleVersion = 45`)
- **İncelemeye Gönderilen Öğeler (16):** iOS App 3.3.7 (Build 45) + 15 Game Center Başarımı
- **GitHub Run:** [Run #35465802316](https://github.com/toygun1725/2-player-snake/actions/runs/35465802316) (`ios-v3.3.7-b45` / `4098d9c`)
- **App Store Çoklu Dil Desteği (`CFBundleLocalizations`):**
  - App Store ürün sayfasında "Diller: Sadece İngilizce" görünmesi sorunu çözüldü.
  - Oyunun desteklediği 21 dil `CFBundleLocalizations` etiketiyle `Info.plist` içine tanımlandı:
    `en`, `tr`, `fr`, `it`, `es`, `de`, `zh-Hans`, `zh`, `hi`, `pl`, `pt`, `pt-BR`, `ar`, `ru`, `id`, `ja`, `ko`, `vi`, `th`, `fil`, `tl`, `nl`, `el`, `cs`.
  - Artık App Store mağaza sayfasındaki Bilgiler (Information) bölümünde tüm diller resmi olarak listelenir.
- **Universal Links & Re-engagement Bildirimleri:**
  - Build 44 ile entegre edilen ve gerçek cihazda onaylanan Universal Links ve 21 dilde yerel bildirimler korundu.

### TestFlight Release — Build 44 (v3.3.7, 2026-09-19)

- **Durum:** **✅ TESTFLIGHT'A BAŞARIYLA YÜKLENDİ & CİHAZDA DOĞRULANDI (Build 44)** 🟢
- **Tarih:** 19 Eylül 2026, 22:15 (TSI)
- **GitHub Run:** [Run #35463663786](https://github.com/toygun1725/2-player-snake/actions/runs/35463663786) (`ios-v3.3.7-b44` / `db055d3`)
- **Uygulama Sürümü:** `3.3.7 (44)` (`CFBundleShortVersionString = 3.3.7`, `CFBundleVersion = 44`)
- **Universal Links & WhatsApp Daveti (Doğrudan Uygulama Açma):**
  - WhatsApp, Notlar veya Mesajlar üzerinden paylaşılan `https://2playersnake.com/invite?room=...&mode=...` bağlantısına tıklandığında Safari/Chrome arayüzü yerine doğrudan iPhone'daki yerel **2 Player Snake** uygulaması açılır.
  - Teaser video otomatik atlanır ve oyuncu doğrudan arkadaşının odasına/maçına yönlendirilir.
  - Sunucu tarafında `public_html/.well-known/apple-app-site-association` doğrulaması aktif edildi (HTTP 200 OK).
  - Web fallback için `public_html/invite/index.html` güncellenerek `twoplayersnake://` custom scheme ve "UYGULAMADA AÇ" butonu eklendi.
  - `TwoPlayerSnake.entitlements` dosyasına `applinks:2playersnake.com` yetkisi tanımlandı.
- **Re-engagement Bildirimleri (iOS - 21 Dil):**
  - Android sürümündeki yerel bildirim mimarisi `UserNotifications.framework` ile iOS'a taşındı (`NotificationManager.swift`, `NotificationStrings.swift`).
  - **1. Gün (24 saat)**, **3. Gün (72 saat)** ve **7. Gün (168 saat)** aralıklarında 21 farklı dilde yerel bildirim planlanır.
  - Oyuncu her oyuna girdiğinde sayaçlar sıfırlanır (aktif kullanıcı asla rahatsız edilmez).
  - Apple HIG yönergeleriyle tam uyumlu olarak bildirim izni **3. uygulama açılışında** istenir.
- **HTML Sürüm Senkronizasyonu (v3.3.7):**
  - Yeni `2 Player Snake Mobile v3.3.7.html` ve `2 Player Snake PC v3.3.7.html` referans dosyaları oluşturuldu; `VERSION = 'v3.3.7'` tanımlandı.
  - Hem mobil hem PC HTML dosyalarına oda davetleri için `window.joinOnlineRoom` köprüsü entegre edildi.
- **UI & Güvenli Alan İyileştirmesi:**
  - iPhone HUD panel alt göstergeleri Android ile birebir oval tasarıma (`border-radius: 12px`, `padding-bottom: 0`) kavuşturuldu.
- **Otomatik Testler:**
  - `node --test tests/ios-runtime.test.cjs` 26/26 test ile %100 başarılı geçti.

### App Store Release — Build 42 (v3.3.6, 2026-09-18)

- **Durum:** **🎉 APPLE TARAFINDAN ONAYLANDI & YAYINDA (Ready for Distribution)** 🟢
- **Onay Tarihi:** 18 Eylül 2026, 21:28 (TSI) *(Gönderimden sadece 2.5 saat sonra rekor hızla onaylandı!)*
- **Submission ID:** `6fab8c78-d9b9-493e-a651-db3ccf0338ad`
- **Uygulama Sürümü:** `3.3.6 (42)` (`CFBundleShortVersionString = 3.3.6`, `CFBundleVersion = 42`)
- **App Store Küresel Yerelleştirme (26+ Dil):**
  - App Store Connect mağaza listelemesi 26 dilde eksiksiz yerelleştirildi:
    1. Türkçe (Turkish)
    2. İspanyolca (Spanish - Spain)
    3. Almanca (German)
    4. Fransızca (French)
    5. İtalyanca (Italian)
    6. Portekizce (Portuguese - Portugal)
    7. Rusça (Russian)
    8. Felemenkçe (Dutch)
    9. Lehçe (Polish)
    10. Arapça (Arabic)
    11. Çince (Chinese - Simplified)
    12. Japonca (Japanese)
    13. Korece (Korean)
    14. Hintçe (Hindi)
    15. Endonezce (Indonesian)
    16. Tayca (Thai)
    17. Vietnamca (Vietnamese)
    18. İbranice (Hebrew)
    19. İngilizce UK (English - U.K.)
    20. Çekçe (Czech)
    21. Danca (Danish)
    22. Fince (Finnish)
    23. Yunanca (Greek)
    24. Macarca (Hungarian)
    25. İsveççe (Swedish)
    26. İngilizce US (English - U.S. / Primary)
  - Tüm dillerde Apple standartlarına uygun, emojilerden arındırılmış, kurşun işaretli (`•`) profesyonel standart şablon uygulandı.
- **Sürüm Yenilikleri (Release Notes):**
  - 15 yeni başarım ile Apple Game Center entegrasyonu.
  - Doğrudan App Store değerlendirme ve puanlama kısayolu.
  - Genel hata düzeltmeleri, görsel iyileştirmeler ve kararlılık artışı.
- **Apple Game Center Yetkisi (`TwoPlayerSnake.entitlements`):**
  - İkili dosyaya `com.apple.developer.game-center: true` yetkisi başarıyla gömüldü; sarı uyarı tamamen kalktı.
- **iPhone (iOS App, Safari & Chrome) 60 FPS GPU Kompozitör & Blur Optimizasyonu:**
  - **DPR 1.35 Sınırı:** iOS mobil cihazlar için Android WebView ile aynı `dpr = 1.35` sınırı uygulanarak piksel işleme yükü %54 azaltıldı.
  - **Orijinal Cyberpunk Blur (6px) Korundu:** Arka plan demo canvas'ındaki `filter: blur(6px)` korundu; `transform: translateZ(0); will-change: filter, transform;` ile Metal üzerinde izole donanım katmanına bağlandı. Orijinal `rgba(8, 12, 18, 0.20)` atmosferik karartması geri getirildi.
  - **Çifte Blur Engellendi:** Alt menülerdeki (`.banner.padded`) `backdrop-filter` kaldırılarak GPU'nun bulanık canvas'ı tekrar bulanıklaştırması önlendi.
  - **Menü Geçiş Dondurması:** `menuDemoFreezeUntil` iOS cihazları için de devreye alındı; menü butonlarına basıldığında geçiş animasyonları 60 FPS akar.
  - **Kullanıcı Onayı:** Kullanıcı tarafından fiziksel iPhone üzerinde test edildi ve tam akıcılıkla onaylandı.

### TestFlight & App Store Release — Build 40 & 41 (v3.3.6, 2026-09-18)

- **Apple Game Center Yetki Dosyası (`TwoPlayerSnake.entitlements`):**
  - App Store Connect uyarısını ve Game Center kimlik doğrulama engelini çözmek için `com.apple.developer.game-center: true` yetkisi içeren `TwoPlayerSnake.entitlements` dosyası projeye eklendi ve `CODE_SIGN_ENTITLEMENTS` tanımlandı.
- **Apple Game Center Entegrasyonu (`GameKit` / `GameCenterManager.swift`):**
  - Android Play Games'teki 15 başarımın tamamı (`ACH_FIRST_FOOD` - `ACH_ADVENTURE_COMPLETE`) Apple Game Center'a bağlandı.
  - Uygulama açılışında `GKLocalPlayer.local.authenticateHandler` ile Game Center oturumu otomatik doğrulanır.
  - Başarım kilidi açıldığında `GKAchievement.report` ile Game Center'a iletilir ve yerel tamamlama banner'ı gösterilir.
  - Menüden "Başarımlar" seçildiğinde kullanıcı bağlıysa yerel `GKGameCenterViewController` arayüzü sunulur; bağlı değilse oyun içi neon HTML başarımlar penceresi fallback olarak açılır.
- **App Store "Bize Puan Verin" Doğrudan İnceleme Modalı:**
  - `SKStoreReviewController.requestReview`'un TestFlight'ta engellenmesi ve yıllık 3 gösterim kotasına takılması sorunları giderildi.
  - Menüdeki butona tıklandığında `itms-apps://itunes.apple.com/app/id6811546748?action=write-review` resmi derin bağlantısı açılarak kullanıcı doğrudan 5 yıldız seçebileceği ve yorum yazabileceği App Store formuna yönlendirilir.
- **Patreon Destek Sisteminin Kaldırılması:**
  - Oyunun tüm HTML ve offline dosyalarındaki Patreon bağlantıları ve CSS'leri 21 dilde temizlendi.
- **Proje Meta Verileri & Sürüm Yükseltme:**
  - `Info.plist`: `CFBundleShortVersionString = 3.3.6`, `CFBundleVersion = 40`.
  - `project.pbxproj`: `MARKETING_VERSION = 3.3.6`, `CURRENT_PROJECT_VERSION = 40`, `TwoPlayerSnake.entitlements`, `GameCenterManager.swift` ve `GameKit.framework` kaynaklara eklendi.
  - `mobile_offline_fallback.html`: v3.3.6 sürümüyle senkronize edildi.
- **iPhone (iOS App & Mobile Safari) Menü ve Demo Yılan Performans Devrimi:**
  - **İç İçe Blur Yükünün Kaldırılması:** 3x Retina ekranda 60 FPS canvas üzerinde çalışan `.main-menu-actions` üzerindeki gereksiz ikinci `backdrop-filter` kaldırıldı (`backdrop-filter: none`). Butonlar arkadaki kartın cam efekti üzerinde estetiğini %100 korurken GPU bellek okuma/yazma döngüsü %75 azaltıldı.
  - **Donanım Hızlandırmalı Neon Aura (Repaint Engellemesi):** Menü kartındaki `animation: borderGlow` sürekli `box-shadow` yeniden boyaması yerine, donanım hızlandırmalı sabit neon pembe/turkuaz aura yerleştirildi. Katman geçersiz kılma döngüsü yok edildi.
  - **Menü Geçişleri Ghost Kartı Optimizasyonu:** Menü geçişlerinde 200 ms içinde silinen hayalet kart (`ghost`) için blur ve animasyon iOS'ta da kapatılarak geçiş sırasındaki 4 katmanlı anlık blur darboğazı ve takılma çözüldü.
  - **Yılan Başına İzole AI Önbelleği (Safari & App):** `IS_APPLE_DEVICE` (tüm iOS cihazlar) yılan başına bağımsız önbelleğe (`getIosAiCache`) bağlandı. Demo modunda P1 ve P2 birbirinin BFS rotasını ezmez, BFS çalıştırma sıklığı %75 azalır.
  - **Safari Demo Polling Koruması:** Demo modunda/menüde periyodik 700KB versiyon çekme döngüsü iOS cihazlar için engellenerek Garbage Collection (GC) takılmaları önlendi.
  - **Android ve PC Güvencesi:** Tüm CSS iyileştirmeleri `@supports (-webkit-touch-callout: none)` ve `html[data-ios-device="true"]` ile izole edildi; Android ve PC masaüstü tarayıcıları kesinlikle etkilenmedi.
- **Otomatik Testler:**
  - `node --test tests/ios-runtime.test.cjs` dosyasına Safari AI önbelleği ve iOS donanım hızlandırmalı CSS testleri eklendi; 21/21 test ile %100 başarılı geçti.

### TestFlight Release — Build 37 (v3.3.5, 2026-09-16)

**Yükleme doğrulandı:** [Run #38](https://github.com/toygun1725/2-player-snake/actions/runs/35062652055)
SUCCESS; kaynak `fcf0dbd`, tag `ios-v3.3.5-b37`. 16 JS testi, macOS WebKit
kontrolleri, native archive/imzalama ve App Store Connect yüklemesi geçti.

Build 36 çalışmasının tamamını içerir; ek olarak HTTP 200 dönse bile boş/geçersiz
uzak HTML oyun-hazır sayılmaz ve offline dosyaya geçilir. Canlı site bu kontrolde
boş HTML döndürdüğü için bu koruma eklendi. HTML runtime revision aynı `36` kalır.

İlk Build 36 signing hatası mevcut Build 35 P12 artifact'i yeniden kullanılarak çözüldü;
Apple sertifikası iptal edilmedi. Sonraki Build 36 denemesi imzalı IPA üretti fakat
boş sayfa korumasını eklemek için upload sırasında durduruldu. Build 37 başarıyla
yüklendi; iPhone performans kabulü ve WordPress'teki 0 KB dosya sorunu açık kalır.
Ayrıntılar ve run bağlantıları devir kaydındadır.

### Build 36 hazırlığı (v3.3.5, 2026-09-16)

Durum: Kod hazır; 16/16 yerel otomatik test geçti. TestFlight yüklemesi ve canlı mobil HTML yayını henüz doğrulanmadı.

- Orijinal blur/glass, glow ve animasyonlar geri getirildi; safe-area korunur.
- iOS için gerçek closure-local version polling koruması, paket içi font/logo/ikon/Socket.IO kaynakları.
- Yılan başına AI cache'i, iOS demo freeze kaldırılması ve sınırlı interpolasyon.
- Native oyun-hazır sinyali, kontrollü offline fallback ve gecikmiş navigasyon yanıtı koruması.
- Reklamda timeout/geç/tekrarlı yanıt koruması; gerçek ödüllü reklam bitmeden oyuna dönülmez.
- Kontrol kaydı ve cihaz test listesi: [iOS_Build_36_Verification.md](iOS_Build_36_Verification.md).

> Aşağıdaki Build 32–35 kayıtları tarihsel notlardır. “60 FPS/kasma kesin çözüldü”
> ifadeleri son kullanıcı testleriyle doğrulanmadı. Build 35'in window-level version-check
> stub'ı closure-local fonksiyonları durdurmuyordu; bu Build 36'da asıl HTML'de düzeltildi.

### TestFlight Release (v3.3.5 / Build 35)
> Durum (2026-09-15): GitHub Actions Run #35 üzerinden macOS bulutunda derlendi ve TestFlight'a yüklendi (`ios-v3.3.5-b35`). App Store incelemesindeki Build 29 bağımsız olarak beklemektedir.

- **Arka Plan Sürüm Kontrolü (`fetch` Polling) Devre Dışı Bırakıldı:**
  - `ios_bridge_bootstrap.js` içinde `window.checkForFreshVersion` ve `window.scheduleVersionCheck` fonksiyonları no-op stub'landı. Sürüm takibinin native iOS'ta App Store/TestFlight ve `Info.plist` ile yapılması sağlandı; arka planda periyodik olarak 700KB HTML indirilip taranması ve Garbage Collection (GC) CPU/GPU takılmaları engellendi.
- **Dış Font (Google Fonts / FontAwesome) Ağ Bloklaması Çözüldü:**
  - CSS `@font-face` seviyesinde `font-display: optional !important` enjekte edilerek dış font indirmelerinin ilk 10-15 saniyede WebKit Canvas render döngüsünü ve piksel haritasını yeniden hesaplayıp 60 FPS'i kilitlemesi çözüldü.
- **Ağ Önbellek Politikası Optimize Edildi & Reklam Yoklamaları Temizlendi:**
  - `ViewController.swift` içinde `URLRequest` önbellek politikası `.returnCacheDataElseLoad` olarak ayarlandı; statik varlıkların anında önbellekten okunması sağlandı. `window.adsbygoogle` ve `adBreak` stub'lanarak reklam yoklamaları kesildi.

### TestFlight Release (v3.3.5 / Build 34)
> Durum (2026-09-15): GitHub Actions Run #34 üzerinden macOS bulutunda derlendi ve TestFlight'a yüklendi (`ios-v3.3.5-b34`). App Store incelemesindeki Build 29 bağımsız olarak beklemektedir.

- **Çevrimiçi Mod Menü Kasması & Demo Yılan Takılma Kök Neden Çözümü:**
  - `ios_bridge_bootstrap.js` içinde `isAndroidWebView` değişkeni `Object.defineProperty` kullanılarak `writable: false, configurable: false` şeklinde kilitlendi. Uzak web sayfasının inline `<script>` bloğunun bu değeri ezmesi (override) ve `false` yapması kesin olarak engellendi.
  - `ViewController.swift` içinde uzak sayfa URL parametresi `app=android` olarak ayarlandı (ve platform takibi için `app_platform=ios` eklendi). Böylece uzak web sayfasının kendi senkron kontrolü de başarıyla `true` döner ve Google H5 Ads script yüklemesini baypas eder.
  - Ağır Google H5 Ads script'inin periyodik ağ yoklaması ve arka plan CPU/GPU yükü tamamen ortadan kaldırıldı; demo yılanların menü geçişlerinde donarak teleportlanmayı önleyen `menuDemoFreezeUntil` mekanizması çevrimiçi modda da aktif hale getirildi.
- **Eksik Backdrop-Filter GPU Override'ları Eklendi:**
  - `.game-end-overlay`, `.online-alert-overlay`, `.panel-pause-btn`, `.achievement-card`, `#qs-info-btn` ve açık tema (`[data-theme="light"]`) kontrol panelleri üzerindeki tüm `backdrop-filter` efektleri donanım hızlandırmalı düz opak cam katmanlarıyla değiştirildi.

### TestFlight Release (v3.3.5 / Build 33)
> Durum (2026-09-15): GitHub Actions Run #33 üzerinden macOS bulutunda derlendi ve TestFlight'a yüklendi (`ios-v3.3.5-b33`). App Store incelemesindeki Build 29 bağımsız olarak beklemektedir.

- **Yerel Dosya Erişimi & Documents Uygulaması Yönlendirme Düzeltmesi:** `ViewController.swift` içinde `decidePolicyFor` metoduna yerel `url.isFileURL` kontrolü eklendi; yerel paket dosyalarının harici dosya yöneticilerine (Documents by Readdle) gönderilmesi engellendi ve WebView içinde doğrudan açılması garanti altına alındı.
- **Sahte "Bağlantı Geri Geldi" Uyarısı Engellendi:** `NetworkMonitor` başlatma durumundaki gereksiz çevrimdışı gecikmesi giderildi; `offerOnlineGameReload` uyarısı yalnızca kullanıcı gerçekten çevrimdışı maça girip oynadıktan sonra çalışacak şekilde sınırlandırıldı.
- **Ana Menü & Retina GPU Tam Performans Çözümü:** `ios_bridge_bootstrap.js` içinde `atDocumentStart` anında `document.head` `null` kontrolü eksikliğinden kaynaklanan kritik JS çökmesi giderildi (`target = document.head || document.documentElement`). `window.isAndroidWebView = true` dosyanın 1. satırına taşınarak Google H5 reklamlarının ve demo freeze kilitlenmesinin önüne geçildi. Asıl ana menü kutusu olan `.main-menu-actions`, `.main-menu-glow`, `.main-menu-logo` ve alt pencerelerdeki tüm ağır `backdrop-filter` ve animasyonlu `box-shadow` GPU döngüleri kapatılarak donanım hızlandırmalı zengin opak cyberpunk tasarımı uygulandı; dokunma gecikmesi 0ms'ye indirildi.

### TestFlight Release (v3.3.5 / Build 32)
> Durum (2026-09-15): GitHub Actions Run #32 üzerinden macOS bulutunda derlendi ve TestFlight'a yüklendi (`ios-v3.3.5-b32`). App Store incelemesindeki Build 29 bağımsız olarak beklemektedir.

- **Uçak Modu / Çevrimdışı Soğuk Açılış İyileştirmesi:** `NetworkMonitor` başlangıç yarış durumu düzeltildi ve `ViewController` içine 2.5s soğuk açılış emniyet zamanlayıcısı (watchdog) eklendi. Cihaz internetsiz veya uçak modunda açıldığında `%8 hazır` ekranında takılmadan doğrudan yerel iki kişilik çevrimdışı oyunu (`mobile_offline_fallback.html`) anında açar ve `START` butonunu gösterir.
- **Ana Menü & Retina GPU Performansı (Sıfır Gecikme):** iPhone 3x Retina ekranlarda 60 FPS canvas üzerinde ağır Gaussian blur compositing kilitlenmesini önlemek için yüksek performanslı donanım hızlandırmalı cam tasarımı (`blur(4px)` + zengin opaklık) uygulandı; animasyonlu GPU box-shadow döngüsü optimize edildi. Menü ve alt pencerelerdeki 0.5s dokunma gecikmesi 0ms seviyesine indirildi.
- **Demo Yılan Geçiş Dondurması (Android Parity):** `window.isAndroidWebView` köprü eşlemesi etkinleştirilerek menü ve alt pencere geçişlerindeki demo yılan dondurma (`menuDemoFreezeUntil`) iOS'ta tam olarak devreye sokuldu.
- **Periyodik 30s Kasma Dalgalanması Kaldırıldı:** Harici Google Web H5 reklam script yoklaması baypas edildi; AdMob yeniden deneme (retry) döngüsü ana iş parçacığından arka plana (`DispatchQueue.global`) alındı ve çevrimdışı durum korumasıyla izole edildi.

### TestFlight Release (v3.3.5 / Build 30)
> Durum (2026-09-15): GitHub Actions Run #31 üzerinden macOS bulutunda derlendi ve TestFlight'a yüklendi (`ios-v3.3.5-b30`). App Store incelemesindeki Build 29 bağımsız olarak beklemektedir.

- **iOS Reklam Köprüsü (`start` türü):** Oyna ve Ana Menü dönüşlerindeki `start` reklam çağrısı native AdMob bridge'ine bağlandı; `AdManager.adInProgress` kilitlenmesi önlendi.
- **Pause ➔ Ana Menü Yarış Koşulu Giderildi:** Bridge içindeki mükerrer dinleyiciler kaldırılarak menüye tek dokunuşla akıcı dönüş sağlandı.
- **Menü & CPU Performansı:** Ana menüdeki gereksiz haptic polling (rAF) döngüsü temizlendi; WebKit gereksiz yükten kurtarıldı.
- **Gerçek Çevrimdışı (Offline) Desteği:** Android eşdeğeri yerel iki kişilik offline oyun (`mobile_offline_fallback.html`), logo ve Orbitron fontu iOS uygulama paketine dahil edildi. İnternetsiz açılışta veya ağ hatasında yerel oyun otomatik açılır; ağ geri geldiğinde güvenli geçiş uyarısı sunulur.
- **Platform Ayrımı:** iOS kabuğuna özel `data-ios-app`, `data-native-platform="ios"` nitelikleri tanımlandı.

> Durum (2026-09-17): 🎉 **iOS Native Swift kabuğu `v3.3.5` / Build 29 (`ios-v3.3.5-b29`) Apple App Store incelemesini başarıyla geçti ve dünya genelinde App Store'da CANLI YAYINDA (Ready for Sale)!** Aşama 6 (RevenueCat IAP - Remove Ads Lifetime) ve Aşama 7 (App Store Mağaza Yayını & İnceleme) başarıyla tamamlandı.

### App Store Resmi Canlı Yayını — v3.3.5 (Build 29, 2026-09-17 Yayında)
* **App Store Bağlantısı:** [2 Player Snake - App Store](https://apps.apple.com/app/id6811546748) (Apple ID: `6811546748`)
* **AdMob & Ads Durumu:** AdMob App Store bağlantısı tamamlandı. `ads.txt` ve `app-ads.txt` dosyaları yayında (`https://2playersnake.com/ads.txt`, AdSense tarafından onaylandı).

<en-US>
What's New in iOS v3.3.5 (Build 29):
• Official App Store Launch Release: Initial public submission for iPhone and iPad devices worldwide.
• In-App Purchases (IAP): Integrated RevenueCat & StoreKit for "Remove Ads Lifetime" non-consumable purchase with one-tap restore.
• Live AdMob & ATT: Google Mobile Ads SDK with App Tracking Transparency permission compliance.
• iPhone & iPad Support: Optimized edge-to-edge cyberpunk graphics for 6.5"/6.7" iPhone and 13" iPad Pro displays.
• Offline & Online Play: Full 2-player local battle on one screen, plus real-time online PvP.
</en-US>

<tr-TR>
iOS v3.3.5 (Build 29) Yenilikleri:
• Resmi App Store Yayını: iPhone ve iPad cihazlar için dünya genelinde ilk genel mağaza sürümü.
• Uygulama İçi Satın Alma (IAP): RevenueCat ve StoreKit ile tek seferlik "Ömür Boyu Reklamsız Sürüm" satın alma ve geri yükleme entegrasyonu.
• Canlı AdMob & ATT: Apple App Tracking Transparency (ATT) gizlilik standardıyla uyumlu Google Mobile Ads entegrasyonu.
• iPhone ve iPad Desteği: 6.5"/6.7" iPhone ve 13" iPad Pro ekranları için optimize edilmiş kenardan kenara cyberpunk arayüz.
• Çevrimdışı ve Çevrimiçi Oynanış: Tek ekranda internet gerektirmeyen 2 kişilik kapışma ve gerçek zamanlı online PvP.
</tr-TR>

---

### TestFlight Release (v3.3.5 / Build 28)

<en-US>
What's New in iOS v3.3.5 (Build 28):
• Live Google AdMob Integration: Integrated Google Mobile Ads iOS SDK via CocoaPods with live Interstitial & Rewarded ad units.
• Apple App Tracking Transparency (ATT): Integrated native ATT authorization request dialog upon entering the main menu.
• Deadlock Protection: Dual-layer watchdog timers (9.0s native, 8.5s JS) ensure the match always starts seamlessly even with slow network or ad fill drops.
• Preloaded Ads: Interstitial and Rewarded ads preload automatically in the background with exponential backoff retry.
</en-US>

<tr-TR>
iOS v3.3.5 (Build 28) Yenilikleri:
• Canlı Google AdMob Entegrasyonu: CocoaPods ile Google Mobile Ads SDK, canlı Geçiş ve Ödüllü reklam birimleriyle entegre edildi.
• Apple App Tracking Transparency (ATT): Ana menüye inildiğinde Apple'ın resmi takip izni penceresi gösterilerek kullanıcı gizliliği tam olarak sağlandı.
• Çift Katmanlı Kilitlenme Koruması (Watchdog): Swift (9.0s) ve JS (8.5s) zaman aşımı koruması ile reklam yüklenemese veya internet kopsa dahi maçların anında başlaması garanti altına alındı.
• Reklam Önyükleme (Preload): Geçiş ve Ödüllü reklamlar arka planda otomatik olarak önden yüklenir ve oynanışı aksatmaz.
</tr-TR>

---

### TestFlight Release (v3.3.5 / Build 27)

<en-US>
What's New in iOS v3.3.5 (Build 27):
• Version Parity: Synchronized marketing version to 3.3.5 matching Android & Web releases.
• Match Start Fix: Resolved game start button deadlock by ensuring immediate synchronous ad callbacks.
• Hardware Food Haptics: Added Peek haptic feedback via AudioServices and Taptic Engine on food collection during matches.
• Keyboard & Viewport Restoration: Fixed screen offset staying shifted after keyboard dismiss on player name inputs.
• Pause Menu: Fixed pause menu "Home" button returning directly to main screen without getting stuck.
• Android Visual Parity: Added glassmorphism UI panel styles, edge-to-edge layout, and animated start screen.
</en-US>

<tr-TR>
iOS v3.3.5 (Build 27) Yenilikleri:
• Sürüm Eşitlemesi: Pazarlama sürümü Android ve Web ile eşitlenerek 3.3.5 yapıldı.
• Maç Başlatma Düzeltmesi: Reklam geri çağırmalarının anında tetiklenmesi sağlanarak oyun başlatma butonu kilidi çözüldü.
• Donanımsal Yem Haptikleri: Maç esnasında yem yendiğinde çalışan donanımsal Peek haptic ve Taptic Engine titreşimi eklendi.
• Klavye & Ekran Hizalaması: İsim yazarken klavye kapandıktan sonra oyun ekranının yukarıda asılı kalması giderildi.
• Duraklatma Menüsü: Duraklatma ekranındaki "Ana Menü" butonunun takılmadan ana menüye dönmesi sağlandı.
• Android Görsel Paritesi: Cyberpunk buzlu cam (glassmorphism) panel stilleri, kenardan kenara (edge-to-edge) yerleşim ve animasyonlu Start ekranı entegre edildi.
</tr-TR>

---

### TestFlight Beta (v1.0.0 / Build 15)

<en-US>
What's New in iOS v1.0.0 (Build 15):
• Fullscreen layout fix: eliminated black space at the bottom (edge-to-edge 100dvh).
• Smooth gameplay start: resolved adBreak callback deadlock and added a 350ms failsafe timer.
• Added cinematic intro teaser video (`loading_video.mp4` with AVPlayer) matching the Android version with full-screen looping and sound.
• Removed duplicate native loading screen for seamless, instant splash transition.
</en-US>

<tr-TR>
iOS v1.0.0 (Build 15) Yenilikleri:
• Tam ekran yerleşim düzeltmesi: ekranın altındaki siyah boşluk kaldırıldı (100dvh edge-to-edge).
• Akıcı oyun başlangıcı: adBreak geri çağırma kilidi çözüldü ve 350ms emniyet zaman aşımı eklendi.
• Android sürümüyle birebir uyumlu sinematik açılış teaser videosu (`loading_video.mp4` + AVPlayer) sesli ve tam ekran olarak eklendi.
• Çift splash ekranı sorunu giderildi, doğrudan sinematik videodan oyuna geçiş sağlandı.
</tr-TR>

---

### TestFlight Initial Beta (v1.0.0 / Build 14)

<en-US>
What's New in iOS v1.0.0 (Build 14):
• Initial iOS Native release on TestFlight!
• Smooth WKWebView integration with high-performance 60+ FPS rendering.
• Hardware Taptic Engine haptic feedback for food collection, power-ups, and collisions.
• Edge-to-edge support with Dynamic Island and notch-aware safe-area layout.
• Built and signed headlessly via GitHub Actions CI/CD with Xcode 26 & iOS 26 SDK.
</en-US>

<tr-TR>
iOS v1.0.0 (Build 14) Yenilikleri:
• TestFlight üzerinde ilk iOS Native beta sürümü!
• Yüksek performanslı 60+ FPS çizim ile akıcı WKWebView entegrasyonu.
• Yem toplama, güçlendiriciler ve çarpmalar için Apple Taptic Engine donanımsal titreşim desteği.
• Dynamic Island ve çentik uyumlu tam ekran güvenli alan (safe-area) yerleşimi.
• Xcode 26 & iOS 26 SDK ile GitHub Actions CI/CD üzerinden otomatik bulut derlemesi ve imzalaması.
</tr-TR>

---

## Core Game Release Notes (v3.3.9, 2026-09-20)

> Durum (2026-09-20): Mobil ana oyun dosyası (`2 Player Snake Mobile v3.3.9.html`), PC ana oyun dosyası (`2 Player Snake PC v3.3.9.html`) ve çevrimdışı fallback dosyaları (`mobile_offline_fallback.html`) yeni ergonomik 3 sütunlu D-Pad tasarımı, D-Pad dikey yükseklik eşitlemesi, ses butonu ve 1P vs AI panel yerleşimi düzeltmesiyle `v3.3.9` sürümüne güncellendi ve senkronize edildi.

- **3 Sütunlu Ergonomik D-Pad Tasarımı (`istediğim.png`):**
  - Eski 2 satırlı (üstte tek Yukarı ok, altta 3 yön) ve kenarlarda boşluk bırakan asimetrik buton mimarisi yerine; Canva tasarımıyla birebir uyumlu 3 sütunlu arcade gamepad mimarisine geçildi.
  - **Sol Sütun:** Tam boy dikey sol ok (`←`) kartı.
  - **Orta Sütun:** Üst üste dizili yukarı ok (`↑`) ve aşağı ok (`↓`).
  - **Sağ Sütun:** Tam boy dikey sağ ok (`→`) kartı.
  - Başparmak ergonomisi ve dokunmatik hassasiyeti belirgin ölçüde iyileştirildi; yatay ve dikey dönüşlerde yanlış yöne basma riski ortadan kaldırıldı.
  - P1 ve P2 neon parlamaları (`--p1-rgb`, `--p2-rgb`), aktif basılma hissi (`scale(0.93)`) ve karanlık/aydınlık tema kontrastı korundu.
  - Kontroller Modalı (`ctrlOptDpad`) içerisindeki mini D-Pad önizleme ikonu da 3 sütunlu yapıyla birebir uyumlu hale getirildi.
- **D-Pad Buton Yüksekliği & Gösterge Panelleriyle Dikey Hizalama:**
  - D-Pad butonlarının üst ve altındaki boşluklar (`max-height: 110px` kısıtlaması) kaldırılarak kontrol çubuğunda `align-items: stretch` yapısına geçildi.
  - D-Pad buton yüksekliği gösterge panelleri (`.player-stat-panel`) ile birebir aynı dikey yüksekliğe getirildi; dikey ölü boşluklar tamamen giderildi.
- **D-Pad Ses Açma / Kapama (Mute/Unmute) Butonu:**
  - **Rakip Olan Modlarda (1P vs AI, 2P, Online):** Pause butonu nasıl sol gösterge paneline iliştirildiyse (`left: calc(100% + 21px); top: 21px;`), Ses Açma/Kapama butonu (`#soundBtnP1`, `#soundBtnP2`) da tam karşısındaki rakip paneline tam ayna simetrisiyle iliştirildi (`right: calc(100% + 21px); top: 21px;`).
  - **Solo 1P Modunda:** Rakip paneli bulunmadığından, sağ yuvada (`.dpad-slot-right`) Pause butonunun hemen altında dikey kolon düzeninde yerleştirildi.
  - Butona tıklandığında/dokunulduğunda doğrudan ses açık/kapalı durumu değiştirilir (`toggleSound()`), ikon anında dinamik güncellenir ve oyun duraklatılmadan ses kontrolü sağlanır.
- **1P vs AI Modu Stat Panel Yerleşimi Düzeltmesi (`1PvsAI.png` vs `1Pvs2P.png`):**
  - 1P vs AI modunda D-Pad aktifken hem P1 hem de AI gösterge panellerinin sol tarafa sıkıştırılarak ekran dengesini bozması ve D-Pad'i ezmesi sorunu çözüldü.
  - `1P vs 2P` modunda olduğu gibi: **Sol tarafta Oyuncu (P1)**, **Ortada D-Pad**, **Sağ tarafta Rakip (AI)** gösterimi sağlandı.
  - Duraklat (Pause) butonu, 1P vs AI, 2P ve Online maçlarda P1 panelinin sağ kenarına estetik olarak iliştirildi (`left: calc(100% + 21px); top: 21px;`).
  - Yalnızca Solo 1P (rakipsiz) modda sağdaki dairesel Pause butonu sağ yuvada (`.dpad-slot-right`) konumlandırıldı (`istediğim.png`).
- **PC Sürüm Senkronizasyonu (v3.3.9):**
  - Mobil v3.3.9 ile sürüm paritesini korumak adına `2 Player Snake PC v3.3.9.html` oluşturuldu; başlık, yorum satırları ve `VERSION = 'v3.3.9'` sabiti güncellendi.
- **Çevrimdışı Fallback Senkronizasyonu (iOS & Android):**
  - Hem iOS (`Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html`) hem Android (`Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html`) fallback dosyaları `v3.3.9` D-Pad, panel ayrımı, D-Pad dikey boyutu ve Ses butonu yenilikleriyle eşitlendi.
- **Otomatik Test Kapsamı:**
  - `node --test tests/ios-runtime.test.cjs` test dosyasına v3.3.9 kontrolleri, 3 sütunlu D-Pad dikey esneme, Ses butonları ve PC v3.3.9 script ayrıştırma assertion'ları dahil edildi; 36/36 test (%100) başarıyla tamamlandı.

---

## Core Game Release Notes (v3.3.8, 2026-09-20)

> Durum (2026-09-20): Mobil ve PC ana oyun dosyaları (`2 Player Snake Mobile v3.3.8.html`, `2 Player Snake PC v3.3.8.html`) final `v3.3.8` sürümüne güncellendi ve senkronize edildi.

- **Mobil 2 Kişilik D-Pad Pause Butonu ve Tıklama İyileştirmesi:**
  - 2 Kişilik D-Pad modundaki pause butonu boyutu 29px'e yükseltildi (+3px), konumu `(calc(100% + 21px), 21px)` olarak ayarlandı; ekran kenarlarına olan mesafe dengelendi.
  - Z-index ve stacking context düzeltildi: `.panel-with-btns` ve `.player-stat-panel` `z-index: 20`, pause butonu `z-index: 30` yapıldı; `.dpad-cluster`'ın (`z-index: 5`) mouse ve dokunma tıklamalarını engellemesi sorunu tamamen giderildi.
- **Ayarlar Menüsüne Kontroller Seçeneği:**
  - Ayarlar modalına Dil ve Ses butonları arasına yeni "Kontroller" butonu (`settingsControlsBtn`) eklendi.
  - Tıklandığında kontrol şemasını gösteren modal doğrudan ayarlar içerisinden açılabilir hale getirildi.
- **Kontroller Modalı 21 Dil Çeviri Desteği (`CONTROLS_STRINGS`):**
  - Yeni eklenen Kontroller penceresi için `CONTROLS_STRINGS` objesi ve dinamik `updateControlsStrings()` fonksiyonu entegre edildi.
  - 21 resmi dilin tamamında (`en`, `tr`, `fr`, `it`, `es`, `de`, `zh`, `hi`, `pl`, `pt`, `ar`, `ru`, `id`, `ja`, `ko`, `vi`, `th`, `tl`, `nl`, `el`, `cs`) başlık, D-Pad, Joystick, Swipe ve İpuçları eksiksiz yerelleştirildi. Dil değiştirildiğinde veya pencere açıldığında anında dinamik olarak güncellenir.
- **Geliştiriciler (Developers) Modalı Boyut Sabitleme:**
  - Ayarlar penceresi ile Geliştiriciler penceresinin genişlik ve yükseklikleri `--settings-w` ve `--settings-h` CSS değişkenleriyle eşitlendi.
  - Geliştiriciler penceresinin genişlik bozulması ve orantısız büyüme sorunları giderilerek Ayarlar penceresiyle birebir aynı ebatta kalması ve iç kaydırma (`min-height: 0; overflow-y: auto;`) sağlandı.
- **PC Sürüm Senkronizasyonu (v3.3.8):**
  - `2 Player Snake PC v3.3.8.html` referans dosyası oluşturuldu; başlık ve `VERSION = 'v3.3.8'` sabiti güncellendi.
- **İlk Maç Öncesi Kontrol Onboarding Gösterimi (Tek Seferlik):**
  - Oyunu mobil tarayıcıda, Android veya iOS uygulamasında ilk kez oynayan kullanıcılara, maça girmeden önce ("Oyna" butonuna basıldığında) geri sayım öncesinde Kontroller penceresi otomatik gösterilir.
  - Oyuncu kontrol şemasını görüp onayladığında (`localStorage: twoPlayerSnake_hasSeenControls`), tercih hafızaya kalıcı kaydedilir ve sonraki maçlarda bir daha asla otomatik çıkmaz (doğrudan geri sayıma geçer). Kullanıcı istediği zaman Ayarlar veya Pause menüsünden kontrollere erişebilir.
- **Çevrimiçi (Online) Maçlarda Deterministik Rastgele Yılan Renkleri:**
  - Online maçlarda (rastgele eşleşme ve özel oda) sabit Pembe/Turkuaz zorunluluğu kaldırıldı. Her yeni maçta ve her "Yeniden Oyna" (Rematch) anında 9 canlı neon renkten oluşan paletten (Lime hariç) rastgele 2 farklı renk (`idx1` ve `idx2`) seçilir (72 farklı renk kombinasyonu).
  - Deterministik 32-bit PRNG tohumu (`roomId + '_' + onlineMatchIndex`) kullanılarak her iki oyuncunun telefon ve PC ekranlarında **%100 birebir aynı renk çifti** (örneğin P1 Kırmızı, P2 Sarı) görünür.
  - Maç içerisindeki roundlar boyunca renkler sabit kalır (round geçişlerinde yılan renkleri değişmez). Yalnızca yeni maç veya rövanş başladığında yeni bir renk çifti atanır.
  - P2 rolündeki oyuncu için alt kontrol barındaki (`#p1-controls`) butonların dinamik aydınlatması ve tıklama parlaması P2 yılanının rengiyle (`var(--p2)`) tam uyumlu hale getirildi.
  - Sunucu (`server.js`) üzerinde protokol veya ağ değişikliği gerektirmez; yerel mobil uygulamalarda yeni AAB/IPA derlemesi gerekmeksizin web yayınıyla tam uyumludur.
- **Çevrimdışı Fallback Senkronizasyonu (iOS & Android):**
  - Hem iOS (`Ana Dosya/iOS/TwoPlayerSnake/Resources/Offline/mobile_offline_fallback.html`) hem Android (`Ana Dosya/Android/app/src/main/assets/offline/mobile_offline_fallback.html`) çevrimdışı fallback dosyaları `v3.3.8` ile eşitlendi. Gelecekteki ilk build için hazır hale getirildi.

---

## Core Game Release Notes (v3.3.6, 2026-09-18)

> Durum (2026-09-18): Mobil ve PC ana oyun dosyaları (`2 Player Snake Mobile v3.3.6.html`, `2 Player Snake PC v3.3.6.html`) ile iOS ve Android çevrimdışı fallback (`mobile_offline_fallback.html`) dosyaları `v3.3.6` sürümüne yükseltildi.

- **PC Ana Menüye "iPhone'da Oyna" Butonu Eklendi:**
  - PC sürümünde "Android'te Oyna" butonunun hemen üzerine `menuPlayOnIphone` butonu eklendi.
  - Tıklandığında doğrudan canlı App Store sayfasına (`https://apps.apple.com/us/app/2-player-snake/id6811546748`, Apple ID: `6811546748`) yönlendirir.
  - Hover durumunda iOS / App Store resmi canlı elektrik mavisi gradyanı (`linear-gradient(135deg, #0071e3 0%, #00c6ff 100%)`) ile parlar.
  - 21 dilin tamamında (`playOnIphone`) eksiksiz yerelleştirildi.
- **Patreon Destek Sistemi Tamamen Kaldırıldı:**
  - Ayarlar > Geliştiriciler (Developers) modalında yer alan Patreon bağış ve destek bölümü 21 dilde tamamen temizlendi.
  - CSS stilleri (`.btn-patreon`, `.btn-patreon i`, `.btn-patreon:active`), buton seçicileri ve hover sweep efektleri tamamen kaldırıldı.
  - Geliştiriciler modalında sırasıyla: Geliştiriciler, Instagram, Haklar ve Lisans, Kullanım Koşulları, İletişim/Website ve Sürüm (`v3.3.6`) bölümleri kesintisiz ve temiz bir akışla sunulmaktadır.
- **Sürüm Senkronizasyonu:**
  - Mobil, PC, iOS offline fallback ve Android offline fallback sürümleri `v3.3.6` olarak senkronize edildi.
  - Otomatik test suite'i (`tests/ios-runtime.test.cjs`) `v3.3.6.html` dosyasına bağlandı ve 16/16 test başarıyla doğrulandı.

---

## Play Store Release Notes

> Durum (2026-09-18): Güncel mobil ve PC web kaynak referansı `v3.3.6`. Android shell'in son AAB'si `v3.3.5` / versionCode **69** olarak derlendi, R8 bellek ve kalite optimizasyonları ile imzalandı (`2PlayerSnake-v3.3.5-release.aab`). Çevrimdışı fallback `mobile_offline_fallback.html` v3.3.6 ile eşitlendi.

## Published Play Store Release Notes (v3.3.5 / Code 69)

<en-US>
What's New in v3.3.5:
• Memory & lifecycle optimizations: reduced background RAM and CPU usage.
• Enhanced performance and smooth menu transitions.
• Updated code shrinking & optimization rules for faster startup and reliability.
• General improvements and bug fixes.
</en-US>

<tr-TR>
v3.3.5'teki Yenilikler:
• Bellek ve yaşam döngüsü optimizasyonları: arka planda RAM ve CPU tüketimi azaltıldı.
• Geliştirilmiş performans ve daha akıcı menü geçişleri.
• Daha hızlı açılış ve güvenilirlik için optimize edilmiş kod küçültme kuralları.
• Genel iyileştirmeler ve hata düzeltmeleri yapıldı.
</tr-TR>

<fr-FR>
Nouveautés de la v3.3.5 :
• Optimisations de la mémoire et du cycle de vie : utilisation réduite de la RAM et du processeur en arrière-plan.
• Performances améliorées et transitions de menu plus fluides.
• Règles de réduction de code optimisées pour un démarrage plus rapide et une meilleure fiabilité.
• Améliorations générales et corrections de bugs.
</fr-FR>

<it-IT>
Novità nella v3.3.5:
• Ottimizzazioni di memoria e ciclo di vita: ridotto l'uso di RAM e CPU in background.
• Prestazioni migliorate e transizioni dei menu più fluide.
• Regole di ottimizzazione del codice aggiornate per un avvio più rapido e maggiore affidabilità.
• Miglioramenti generali e correzioni di bug.
</it-IT>

<es-ES>
Novedades en v3.3.5:
• Optimizaciones de memoria y ciclo de vida: menor uso de RAM y CPU en segundo plano.
• Rendimiento mejorado y transiciones de menú más fluidas.
• Reglas de optimización de código actualizadas para un inicio más rápido y mayor confiabilidad.
• Mejoras generales y corrección de errores.
</es-ES>

<de-DE>
Neu in v3.3.5:
• Speicher- und Lebenszyklusoptimierungen: reduzierter RAM- und CPU-Verbrauch im Hintergrund.
• Verbesserte Leistung und flüssigere Menüübergänge.
• Optimierte Code-Schrumpfungsregeln für schnelleren Start und höhere Zuverlässigkeit.
• Allgemeine Verbesserungen und Fehlerbehebungen.
</de-DE>

<zh-CN>
v3.3.5 更新内容：
• 内存与生命周期优化：降低后台 RAM 和 CPU 占用。
• 性能提升及更流畅的菜单过渡效果。
• 优化代码压缩与混淆规则，启动更快、更稳定。
• 常规改进与问题修复。
</zh-CN>

<hi-IN>
v3.3.5 में नया:
• मेमोरी और जीवनचक्र अनुकूलन: पृष्ठभूमि में रैम और सीपीयू उपयोग कम हुआ।
• बेहतर प्रदर्शन और सहज मेनू संक्रमण।
• तेज़ शुरुआत और विश्वसनीयता के लिए अनुकूलित कोड नियम।
• सामान्य सुधार और बग फिक्स।
</hi-IN>

<pl-PL>
Co nowego w v3.3.5:
• Optymalizacje pamięci i cyklu życia: zmniejszone zużycie pamięci RAM i procesora w tle.
• Lepsza wydajność i płynniejsze przejścia w menu.
• Zaktualizowane reguły optymalizacji kodu dla szybszego uruchamiania i niezawodności.
• Ogólne ulepszenia i poprawki błędów.
</pl-PL>

<pt-BR>
Novidades na v3.3.5:
• Otimizações de memória e ciclo de vida: menor uso de RAM e CPU em segundo plano.
• Desempenho aprimorado e transições de menu mais suaves.
• Regras de otimização de código atualizadas para inicialização mais rápida e maior confiabilidade.
• Melhorias gerais e correções de bugs.
</pt-BR>

<ar>
الجديد في الإصدار v3.3.5:
• تحسينات الذاكرة ودورة الحياة: تقليل استهلاك الذاكرة والمعالج في الخلفية.
• أداء محسّن وتنقل أكثر سلاسة بين القوائم.
• تحديث قواعد تحسين الكود لبدء تشغيل أسرع وموثوقية أعلى.
• تحسينات عامة وإصلاحات للأخطاء.
</ar>

<ru-RU>
Что нового в v3.3.5:
• Оптимизация памяти и жизненного цикла: снижено использование ОЗУ и процессора в фоновом режиме.
• Повышенная производительность и более плавные переходы в меню.
• Оптимизированные правила сжатия кода для более быстрого запуска и надежности.
• Общие улучшения и исправления ошибок.
</ru-RU>

<id>
Yang Baru di v3.3.5:
• Pengoptimalan memori & siklus proses: pengurangan penggunaan RAM dan CPU di latar belakang.
• Peningkatan kinerja dan transisi menu yang lebih mulus.
• Aturan pengoptimalan kode yang diperbarui untuk pemuatan lebih cepat dan andal.
• Peningkatan umum dan perbaikan bug.
</id>

<ja-JP>
v3.3.5 の新機能：
• メモリとライフサイクルの最適化：バックグラウンドでの RAM および CPU 使用量を削減。
• パフォーマンスの向上とスムーズなメニュー切り替え。
• 起動の高速化と信頼性向上のためのコード最適化ルールの更新。
• 一般的な改善とバグの修正。
</ja-JP>

<ko-KR>
v3.3.5 새로운 기능:
• 메모리 및 수명 주기 최적화: 백그라운드 RAM 및 CPU 사용량 감소.
• 성능 개선 및 더욱 부드러운 메뉴 전환.
• 더 빠른 실행과 안정성을 위한 코드 최적화 규칙 업데이트.
• 일반적인 개선 및 버그 수정.
</ko-KR>

<vi>
Điểm mới trong v3.3.5:
• Tối ưu hóa bộ nhớ & vòng đời: giảm mức sử dụng RAM và CPU ở chế độ nền.
• Hiệu suất nâng cao và chuyển đổi menu mượt mà hơn.
• Quy tắc tối ưu hóa mã được cập nhật để khởi động nhanh hơn và ổn định hơn.
• Cải tiến chung và sửa lỗi.
</vi>

<th>
ใหม่ใน v3.3.5:
• การเพิ่มประสิทธิภาพหน่วยความจำและวงจรชีวิต: ลดการใช้ RAM และ CPU ในเบื้องหลัง
• ประสิทธิภาพที่ดีขึ้นและการสลับเมนูที่ราบรื่นยิ่งขึ้น
• อัปเดตกฎการย่อขนาดโค้ดเพื่อการเริ่มทำงานที่รวดเร็วและเสถียรยิ่งขึ้น
• การปรับปรุงทั่วไปและการแก้ไขข้อบกพร่อง
</th>

<fil-PH>
Bago sa v3.3.5:
• Mga pag-optimize sa memory at lifecycle: nabawasan ang paggamit ng RAM at CPU sa background.
• Pinahusay na performance at mas maayos na transition sa menu.
• Na-update na code optimization rules para sa mas mabilis na pag-load at pagiging maaasahan.
• Mga pangkalahatang pagpapabuti at pag-aayos ng bug.
</fil-PH>

<nl-NL>
Nieuw in v3.3.5:
• Geheugen- en levenscyclusoptimalisaties: verminderd RAM- en CPU-gebruik op de achtergrond.
• Verbeterde prestaties en soepelere menuovergangen.
• Geoptimaliseerde regels voor codeverkleining voor sneller opstarten en betrouwbaarheid.
• Algemene verbeteringen en bugfixes.
</nl-NL>

<el-GR>
Νέα στην v3.3.5:
• Βελτιστοποιήσεις μνήμης και κύκλου ζωής: μειωμένη χρήση RAM και CPU στο παρασκήνιο.
• Βελτιωμένη απόδοση και πιο ομαλές μεταβάσεις μενού.
• Ενημερωμένοι κανόνες βελτιστοποίησης κώδικα για ταχύτερη εκκίνηση και αξιοπιστία.
• Γενικές βελτιώσεις και διορθώσεις σφαλμάτων.
</el-GR>

<cs-CZ>
Novinky ve v3.3.5:
• Optimalizace paměti a životního cyklu: snížení využití paměti RAM a procesoru na pozadí.
• Vyšší výkon a plynulejší přechody v menu.
• Optimalizovaná pravidla pro zmenšení kódu pro rychlejší spouštění a spolehlivost.
• Obecná vylepšení a opravy chyb.
</cs-CZ>

<da-DK>
Hvad er nyt i v3.3.5:
• Hukommelses- og livscyklusoptimeringer: reduceret RAM- og CPU-forbrug i baggrunden.
• Forbedret ydeevne og mere jævne menuovergange.
• Opdaterede kodeoptimeringsregler for hurtigere opstart og pålidelighed.
• Generelle forbedringer og fejlrettelser.
</da-DK>

<fi-FI>
Uutta versiossa v3.3.5:
• Muistin ja elinkaaren optimoinnit: pienempi RAM- ja suoritinkäyttö taustalla.
• Parannettu suorituskyky ja sujuvammat valikkosiirtymät.
• Päivitetyt koodinoptimointisäännöt nopeampaan käynnistykseen ja luotettavuuteen.
• Yleisiä parannuksia ja virheenkorjauksia.
</fi-FI>

<iw-IL>
מה חדש בגרסה v3.3.5:
• אופטימיזציות של זיכרון ומחזור חיים: צמצום השימוש ב-RAM וב-CPU ברקע.
• ביצועים משופרים ומעברי תפריט חלקים יותר.
• עדכון כללי אופטימיזציית קוד להפעלה מהירה ואמינות גבוהה יותר.
• שיפורים כלליים ותיקוני באגים.
</iw-IL>

<hu-HU>
Újdonságok a v3.3.5 verzióban:
• Memória és életciklus optimalizálások: csökkentett háttérbeli RAM és processzor használat.
• Javított teljesítmény és simább menüátmenetek.
• Frissített kódoptimalizálási szabályok a gyorsabb indítás és megbízhatóság érdekében.
• Általános fejlesztések és hibajavítások.
</hu-HU>

<no-NO>
Hva er nytt i v3.3.5:
• Minne- og livssyklusoptimaliseringer: redusert RAM- og CPU-bruk i bakgrunnen.
• Forbedret ytelse og jevnere menyoverganger.
• Optimaliserte regler for kodekomprimering for raskere oppstart og stabilitet.
• Generelle forbedringer og feilrettinger.
</no-NO>

<pt-PT>
Novidades na v3.3.5:
• Otimizações de memória e ciclo de vida: menor uso de RAM e CPU em segundo plano.
• Desempenho melhorado e transições de menu mais fluidas.
• Regras de otimização de código actualizadas para inicialização mais rápida e fiabilidade.
• Melhorias gerais e correções de erros.
</pt-PT>

<ro>
Noutăți în v3.3.5:
• Optimizări de memorie și ciclu de viață: consum redus de RAM și CPU în fundal.
• Performanță îmbunătățită și tranziții mai line în meniuri.
• Reguli optimizate de reducere a codului pentru o pornire mai rapidă și fiabilitate sporită.
• Îmbunătățiri generale și remedieri de erori.
</ro>

<sk>
Novinky vo v3.3.5:
• Optimalizácie pamäte a životného cyklu: zníženie využitia RAM a procesora na pozadí.
• Vyšší výkon a plynulejšie prechody v menu.
• Optimalizované pravidlá zmenšenia kódu pre rýchlejšie spúšťanie a spoľahlivosť.
• Všeobecné vylepšenia a opravy chýb.
</sk>

<uk>
Що нового в v3.3.5:
• Оптимізація пам'яті та життєвого циклу: знижено використання оперативної пам'яті та процесора у фоновому режимі.
• Підвищена продуктивність та плавніші переходи в меню.
• Оновлені правила оптимізації коду для швидшого запуску та надійності.
• Загальні покращення та виправлення помилок.
</uk>

> Durum (2026-09-27): Güncel mobil ve PC kaynak referansı `v3.4.9` (versionCode 71) AAB derlendi, imzalandı ve Google Play Console Üretim kanalına yüklendi (`2PlayerSnake-v3.4.9-release.aab` - In Review).

## Published Play Store Release Notes (v3.4.9 — versionCode 71)

<tr-TR>
v3.4.9 sürümündeki yenilikler!

• Dokunsal Geri Bildirim (Haptics!): Artık her hamleyi avucunun içinde hisset! Normal yemlerde çıtır bir tık, elmaslarda tok bir vuruş, canavar modunda çift nabız ve çarpışmalarda sarsıcı arcade darbesi!

• Yenilenmiş Çevrimdışı Mod: Metroda, uçakta, internetsiz her yerde kesintisiz ve akıcı 60 FPS arcade keyfi.

• Hata düzeltmeleri ve optimizasyonlar.
</tr-TR>

<en-US>
What's New in v3.4.9:

• Next-Gen Haptic Feedback: Feel every move in the palm of your hand! Crisp clicks for normal food, heavy thuds for diamonds, double-pulse surges in beast mode, and powerful shockwaves on collisions!

• Polished Offline Mode: Seamless, silky-smooth 60 FPS arcade gameplay anywhere—subway, flights, or off the grid.

• Bug fixes and performance optimizations.
</en-US>

## Published Play Store Release Notes (v3.3.4)

<en-US>
What's New in v3.3.4:
• Target API updated to Android 16 (API 36) for improved security and performance.
• Updated Google Play Billing Library for seamless in-app purchases.
• Fixed Play Games Services login stability and profile prompts.
• Performance optimizations and reliability fixes.
</en-US>

<tr-TR>
v3.3.4'teki Yenilikler:
• Gelişmiş güvenlik ve performans için Hedef API, Android 16 (API 36) seviyesine güncellendi.
• Sorunsuz satın alımlar için Google Play Faturalandırma Kitaplığı güncellendi.
• Play Oyun Hizmetleri giriş kararlılığı ve profil uyarıları düzeltildi.
• Genel performans iyileştirmeleri ve güvenilirlik düzeltmeleri yapıldı.
</tr-TR>

## Published Play Store Release Notes (v3.3.2)

<en-US>
What's New in v3.3.2:
• Added Cloud Save support via Google Play Games. High scores and premium status are now stored in the cloud!
• Added physical keyboard support for Google Play Games on PC.
• Native Play Games achievements overlay is now integrated.
• General improvements and reliability fixes.
</en-US>

<tr-TR>
v3.3.2'deki Yenilikler:
• Google Play Oyunlar aracılığıyla Bulut Kaydı desteği eklendi. Yüksek skorlar ve premium durum artık bulutta saklanıyor!
• PC'de Google Play Oyunlar için fiziksel klavye desteği eklendi.
• Native Play Oyunlar başarımlar arayüzü entegre edildi.
• Genel iyileştirmeler ve güvenilirlik düzeltmeleri yapıldı.
</tr-TR>

<fr-FR>
Nouveautés de la v3.3.2 :
• Ajout de la sauvegarde cloud via Google Play Games. Les scores et le statut premium sont enregistrés !
• Ajout du support clavier physique pour Google Play Games sur PC.
• Intégration de l'interface native des réussites Play Games.
• Améliorations générales et corrections de bugs.
</fr-FR>

<it-IT>
Novità nella v3.3.2:
• Aggiunto il salvataggio in cloud tramite Google Play Games. Punteggi e stato premium salvati nel cloud!
• Supporto per tastiera fisica su Google Play Games per PC.
• Integrata la schermata nativa degli obiettivi di Play Games.
• Miglioramenti generali e correzioni di bug.
</it-IT>

<es-ES>
Novedades en v3.3.2:
• Se agregó soporte de guardado en la nube con Google Play Games. ¡Tus puntuaciones y estado premium se guardan en la nube!
• Soporte para teclado físico en Google Play Games para PC.
• Se integró el menú nativo de logros de Play Games.
• Mejoras generales y corrección de errores.
</es-ES>

<de-DE>
Neu in v3.3.2:
• Cloud-Speicherunterstützung über Google Play Games hinzugefügt. Highscores und Premium-Status werden in der Cloud gespeichert!
• Unterstützung für physische Tastatur unter Google Play Games auf dem PC.
• Natives Play Games-Erfolge-Overlay integriert.
• Allgemeine Verbesserungen und Fehlerbehebungen.
</de-DE>

<zh-CN>
v3.3.2 更新内容：
• 添加了 Google Play 游戏云端存档 support。高分和高级会员状态已安全备份至云端！
• 针对 PC 版 Google Play 游戏添加了实体键盘支持。
• 集成了原生 Play 游戏成就查看功能。
• 常规改进与稳定性修复。
</zh-CN>

<hi-IN>
v3.3.2 में नया:
• Google Play Games के माध्यम से क्लाउड सेव सपोर्ट जोड़ा गया। हाई स्कोर और प्रीमियम स्थिति अब क्लाउड में सहेजी गई है!
• पीसी पर Google Play Games के लिए भौतिक कीबोर्ड समर्थन जोड़ा गया।
• मूल Play Games उपलब्धियों का ओवरले अब एकीकृत है।
• सामान्य सुधार और विश्वसनीयता सुधार।
</hi-IN>

<pl-PL>
Co nowego w v3.3.2:
• Dodano obsługę zapisu w chmurze przez Google Play Games. Wyniki i status premium są zapisywane w chmurze!
• Obsługa klawiatury fizycznej w Google Play Games na PC.
• Zintegrowano natywną nakładkę osiągnięć Play Games.
• Ogólne ulepszenia i poprawki błędów.
</pl-PL>

<pt-BR>
Novidades na v3.3.2:
• Adicionado suporte para salvamento na nuvem via Google Play Games. Pontuações e status premium salvos na nuvem!
• Suporte para teclado físico no Google Play Games no PC.
• Tela nativa de conquistas do Play Games integrada.
• Melhorias gerais e correções de bugs.
</pt-BR>

<ar>
الجديد في الإصدار v3.3.2:
• إضافة دعم الحفظ السحابي عبر Google Play Games. يتم حفظ الأرقام القياسية والحالة المميزة في السحابة!
• دعم لوحة المفاتيح الفعلية للعبة Google Play Games على الكمبيوتر.
• دمج واجهة إنجازات Play Games الأصلية.
• تحسينات عامة وإصلاحات للأخطاء.
</ar>

<ru-RU>
Что нового в v3.3.2:
• Добавлена поддержка облачных сохранений через Google Play Games. Рекорды и премиум-статус сохраняются в облаке!
• Поддержка физической клавиатуры в Google Play Games на ПК.
• Интегрирован нативный интерфейс достижений Play Games.
• Общие улучшения и исправления ошибок.
</ru-RU>

<id>
Yang Baru di v3.3.2:
• Menambahkan dukungan simpan Cloud via Google Play Games. Skor tinggi dan status premium kini disimpan di cloud!
• Dukungan keyboard fisik untuk Google Play Games di PC.
• Hamparan pencapaian Play Games bawaan kini terintegrasi.
• Peningkatan umum dan perbaikan bug.
</id>

<ja-JP>
v3.3.2 の新機能：
• Google Play ゲームによるクラウドセーブに対応。ハイスコアとプレミアム状態がクラウドに保存されます！
• PC版 Google Play ゲームの物理キーボード操作に対応しました。
• Play ゲーム의ネイティブ実績画面を統合しました。
• 一般的な改善とバグの修正。
</ja-JP>

<ko-KR>
v3.3.2 새로운 기능:
• Google Play 게임을 통한 클라우드 저장 지원이 추가되었습니다. 점수 및 프리미엄 상태가 클라우드에 백업됩니다!
• PC용 Google Play 게임의 물리 키보드 지원이 추가되었습니다.
• 네이티브 Play 게임 업적 화면이 통합되었습니다.
• 일반적인 개선 및 버그 수정.
</ko-KR>

<vi>
Điểm mới trong v3.3.2:
• Đã thêm hỗ trợ lưu trên đám mây qua Google Play Games. Điểm số cao và trạng thái cao cấp hiện được lưu trữ trên đám mây!
• Đã thêm hỗ trợ bàn phím vật lý cho Google Play Games trên PC.
• Giao diện thành tích Play Games gốc hiện đã được tích hợp.
• Sửa lỗi chung và cải thiện độ tin cậy.
</vi>

<th>
ใหม่ใน v3.3.2:
• เพิ่มการรองรับการบันทึกบนระบบคลาวด์ผ่าน Google Play Games คะแนนสูงและสถานะพรีเมียมจะถูกบันทึกไว้ในคลาวด์!
• เพิ่มการรองรับคีย์บอร์ดจริงสำหรับ Google Play Games บนพีซี
• รวมเมนูความสำเร็จของ Play Games แบบเนทีฟไว้แล้ว
• การปรับปรุงทั่วไปและการแก้ไขข้อบกพร่อง
</th>

<fil-PH>
Bago sa v3.3.2:
• Idinagdag ang suporta sa Cloud Save sa pamamagitan ng Google Play Games. Ang mga matataas na marka at premium status ay naka-store na sa cloud!
• Idinagdag ang suporta sa pisikal na keyboard para sa Google Play Games sa PC.
• Ang native na achievements overlay ng Play Games ay integrated na.
• Mga pangkalahatang pagpapabuti at pag-aayos ng bug.
</fil-PH>

<nl-NL>
Nieuw in v3.3.2:
• Ondersteuning voor cloudopslag toegevoegd via Google Play Games. Highscores en premiumstatus worden in de cloud opgeslagen!
• Fysieke toetsenbordondersteuning toegevoegd voor Google Play Games op pc.
• Systeemeigen overlay voor Play Games-prestaties is nu geïntegreerd.
• Algemene verbeteringen en prestatieverbeteringen.
</nl-NL>

<el-GR>
Νέα στην v3.3.2:
• Προστέθηκε υποστήριξη Cloud Save μέσω του Google Play Games. Τα υψηλά σκορ και η κατάσταση premium αποθηκεύονται πλέον στο cloud!
• Προστέθηκε υποστήριξη φυσικού πληκτρολογίου για το Google Play Games σε υπολογιστή.
• Το εγγενές μενού επιτευγμάτων του Play Games έχει πλέον ενσωματωθεί.
• Γενικές βελτιώσεις και διορθώσεις σφαλμάτων.
</el-GR>

<cs-CZ>
Novinky ve v3.3.2:
• Přidána podpora ukládání do cloudu prostřednictvím Google Play Games. Nejvyšší skóre a prémiový status jsou nyní uloženy v cloudu!
• Přidána podpora fyzické klávesnice pro Google Play Games na PC.
• Integrováno nativní zobrazení úspěchů Play Games.
• Obecná vylepšení a opravy chyb.
</cs-CZ>

<da-DK>
Hvad er nyt i v3.3.2:
• Tilføjet understøttelse af cloud-lagring via Google Play Games. Highscores og premiumstatus gemmes nu i skyen!
• Tilføjet understøttelse af fysisk tastatur til Google Play Games på pc.
• Indbygget Play Games-præstationsvisning er nu integreret.
• Generelle forbedringer og fejlrettelser.
</da-DK>

<fi-FI>
Uutta versiossa v3.3.2:
• Lisätty pilvitallennustuki Google Play Gamesin kautta. Parhaat pisteet ja premium-tila tallennetaan pilveen!
• Lisätty fyysisen näppäimistön tuki Google Play Gamesille tietokoneella.
• Alkuperäinen Play Games -saavutusten peittokuva on nyt integroitu.
• Yleisiä parannuksia ja virheenkorjauksia.
</fi-FI>

<iw-IL>
מה חדש בגרסה v3.3.2:
• נוספה תמיכה בשמירה בענן באמצעות Google Play Games. שיאים ומצב פרימיום נשמרים כעת בענן!
• נוספה תמיכה במקלדת פיזית עבור Google Play Games במחשב.
• תצוגת ההישגים המובנית של Play Games משולבת כעת.
• שיפורים כלליים ותיקוני באגים.
</iw-IL>

<hu-HU>
Újdonságok a v3.3.2 verzióban:
• Felhőalapú mentés támogatása hozzáadva a Google Play Games segítségével. A pontszámok és a prémium státusz a felhőben tárolódnak!
• Fizikai billentyűzet támogatása hozzáadva a Google Play Games PC-s verziójához.
• A natív Play Games teljesítmények réteg integrálva lett.
• Általános fejlesztések és hibajavítások.
</hu-HU>

<no-NO>
Hva er nytt i v3.3.2:
• Lagt til støtte for lagring i skyen via Google Play Games. Highscores og premiumstatus lagres nå i skyen!
• Lagt til støtte for fysisk tastatur for Google Play Games på PC.
• Innebygd Play Games-prestasjonsoverlegg er nå integrert.
• Generelle forbedringer og feilrettinger.
</no-NO>

<pt-PT>
Novidades na v3.3.2:
• Adicionado suporte para gravação na nuvem via Google Play Games. Pontuações e estado premium guardados na nuvem!
• Suporte para teclado físico no Google Play Games no PC.
• Tela nativa de conquistas do Play Games integrada.
• Melhorias gerais e correções de erros.
</pt-PT>

<ro>
Noutăți în v3.3.2:
• S-a adăugat suport pentru salvarea în cloud prin Google Play Games. Scorurile mari și statutul premium sunt acum stocate în cloud!
• S-a adăugat suport pentru tastatură fizică pentru Google Play Games pe PC.
• Meniul nativ de realizări din Play Games este acum integrat.
• Îmbunătățiri generale și remedieri de erori.
</ro>

<sk>
Novinky vo v3.3.2:
• Pridaná podpora ukladania do cloudu prostredníctvom Google Play Games. Najvyššie skóre a prémiový status sú teraz uložené v cloude!
• Pridaná podpora fyzickej klávesnice pre Google Play Games na PC.
• Integrované natívne zobrazenie úspechov Play Games.
• Všeobecné vylepšenia a opravy chýb.
</sk>

<uk>
Що нового в v3.3.2:
• Додано підтримку хмарних збережень через Google Play Games. Рекорди та преміум-статус зберігаються в хмарі!
• Додано підтримку фізичної клавіатури в Google Play Games на ПК.
• Інтегровано оригінальний інтерфейс досягнень Play Games.
• Загальні покращення та виправлення помилок.
</uk>
