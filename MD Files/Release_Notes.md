# 2 Player Snake - Sürüm Notları (Release Notes)

## iOS App Store & TestFlight Release Notes

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

> Durum (2026-09-14): iOS Native Swift kabuğu `v3.3.5` / Build **29** (`ios-v3.3.5-b29`) olarak derlendi ve **Apple App Store İncelemesine Gönderildi** (`Waiting for Review`). Aşama 6 (RevenueCat IAP - Remove Ads Lifetime) ve Aşama 7 (App Store Mağaza Yayını & İnceleme Gönderimi) tamamlandı.

### App Store Canlı Yayına Gönderim (v3.3.5 / Build 29)

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

## Play Store Release Notes

> Durum (2026-09-04): Güncel mobil ve PC web kaynak referansı `v3.3.5`. Android shell'in son AAB'si `v3.3.5` / versionCode **69** olarak derlendi, R8 bellek ve kalite optimizasyonları ile imzalandı (`2PlayerSnake-v3.3.5-release.aab`).

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

> Durum (2026-07-22): Güncel mobil ve PC kaynak referansı `v3.3.4` (versionCode 67) AAB derlendi ve Play Store yüklemesine hazırlandı.

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
