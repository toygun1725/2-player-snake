# 🐍 2 Player Snake: Sıfırdan Zirveye Bir "Vibecoding" ve Yapay Zeka Geliştirme Hikayesi

> **"Gelecekte yazılımı sadece kod yazmayı bilenler değil; doğru soruyu sorabilen, vizyonu olan ve yapay zekayla omuz omuza çalışanlar inşa edecek."**  
> — *RomiToy Games*

---

## 1. Giriş: Bir Fikir, İki Farklı Dünya ve Sıfır Satır Kod

Bu hikaye, klasik bir yazılım şirketi veya silikon vadisi girişimi hikayesi değildir.  
Masada bilgisayar mühendisliği diplomaları, milyon dolarlık yatırım fonları veya onlarca kişilik yazılımcı ordusu yoktu.

Masada iki kişi vardı: **Bir video prodüktörü ve bir hukukçu.**  
Ortak noktaları ise; teknolojiye duydukları tutku, oyun dünyasındaki eksiklikleri görebilme içgörüsü ve **yapay zekayı (AI)** pasif bir sohbet botu olarak değil, yetenekli bir "çift programcı" (pair-programmer) olarak kullanma kararlılığıydı.

Geleneksel yazılım dünyasının *"Önce 2 yıl Python/JavaScript öğren, sonra oyun motorlarını kur, sonra native dillere geç"* dayatmasına meydan okuyan **RomiToy Games**, bugün modern teknoloji literatüründe **"Vibecoding"** olarak adlandırılan vizyonun dünyadaki en başarılı, en somut örneklerinden birine imza attı: **2 Player Snake**.

---

## 2. Ürün Vizyonu ve Pazar Açığı (The Genesis & The Niche)

Yılan (Snake) oyunu, 1970'lerin jetonlu arcade makinelerinden 1990'ların sonundaki efsanevi siyah-beyaz Nokia telefonlarına kadar dijital oyun tarihinin en çok oynanan, en ikonik oyunlarından biridir.

Ancak RomiToy ekibi piyasayı analiz ettiğinde devasa bir boşluk fark etti:
1. **Yalnız Oynanan Nostalji Klonları:** Pazardaki yılan oyunlarının %90'ı tek kişilik, 10 dakika sonra sıkıcılaşan nostaljik kopyalardan ibaretti.
2. **Kaotik ve Lag'li IO Oyunları:** *Slither.io* tarzı devasa çok oyunculu oyunlar ise 50 kişinin aynı haritada dolaştığı, sunucu gecikmeleriyle (lag) dolu ve iki arkadaşın yan yana oturup doğrudan kapışmasına izin vermeyen yapılardı.
3. **Kayıp Kültür: "Same-Screen Local Battle" (Aynı Ekranda Yüz Yüze Rekabet):**  
   İki arkadaşın, bir çiftin veya kardeşlerin tek bir telefon/tablet ekranını paylaşarak başparmaklarıyla birbirini köşeye sıkıştırmaya çalıştığı, kahkahaların ve anlık reflekslerin havada uçuştuğu samimi "parti oyunu" ruhu mobilde neredeyse tamamen unutulmuştu.

### Stratejik Hamle: Exact-Match Domain (`2playersnake.com`)
RomiToy, projeye başlarken küresel arama motoru optimizasyonunun (SEO) en büyük kozunu oynadı: **`2playersnake.com`**.  
Dünyada her ay yüzbinlerce insanın Google'a *"2 player snake"*, *"snake for 2 players"*, *"2 kişilik yılan oyunu"*, *"juegos de snake 2 jugadores"* yazdığını görerek doğrudan bu anahtar kelimeyi alan adı yaptı. Bugün site, küresel organik aramalarda sıfır reklam bütçesiyle ilk sıralara tırmanan organik bir makineye dönüştü.

---

## 3. Mühendislik Serüveni: Web'den Native Ekosisteme

Bir web sayfasında basit bir yılan hareket ettirmek kolaydır. Ancak bunu **PC Web**, **Mobil Web**, **Android Native App** ve **iOS Native App** olmak üzere 4 platformda birden aynı anda, 60 FPS akıcılıkta, çevrimdışı fallback desteğiyle ve canlı senkronizasyonla çalıştırmak kıdemli mühendislerin bile aylarını alan bir mimaridir.

Yapay zeka modelleriyle (ChatGPT, Claude, Gemini) adım adım, soru-cevap ve hata-ayıklama döngüleriyle örülen mimari 3 ana aşamada hayata geçti:

### Aşama 1: Çift Çekirdekli Canvas Motoru (Web)
* Saf Vanilla JavaScript ve HTML5 Canvas kullanılarak sıfır harici oyun motoru (Unity/Unreal yok, devasa bundle yükü yok!) bağımsızlığı sağlandı.
* 1 milisaniyenin bile önemli olduğu 1v1 çarpışma fiziği, `requestAnimationFrame` zamanlaması ve dinamik grid yapısı kurgulandı.
* Klasik modun yanına rekabetçi ruhu körükleyen modlar eklendi:
  - **Fast Competitive:** Hızlanan tempo, anlık refleksler.
  - **Adventure:** Dinamik engeller ve hareketli tuzaklar.
  - **Self Area 51:** Ekranın ikiye bölündüğü, her oyuncunun kendi yarı sahasında ilk 51 uzunluğa ulaşmaya çalıştığı orijinal format.

### Aşama 2: Android Ekosistemi ve Google Play Store
* Android tarafında modern Android Studio ortamında native WebView sarmalayıcısı geliştirildi.
* Google Play Games Services entegrasyonuyla oyuncuların kazanabileceği **15 farklı başarım (Achievements)** sistemi kuruldu.
* Çevrimdışı koruması: Cihaz metroda, uçakta veya internetsiz dağ başında olsa bile oyunun çökmeden çalışmasını sağlayan yerel fallback altyapısı tamamlandı.

### Aşama 3: Masada Mac Olmadan Apple Ekosistemini Fethetmek!
Projenin şüphesiz **en inanılmaz mühendislik zaferi** iOS tarafında yaşandı.
Apple ekosistemi, geliştiricileri fiziksel bir Mac bilgisayar ve Xcode kullanmaya zorlar. Masasında bir Mac bulunmayan RomiToy ekibi pes etmek yerine bulut mühendisliğine başvurdu:
* **Bulut CI/CD Hattı:** GitHub Actions üzerinde macOS çalıştıran bulut sunucuları kiralandı.
* **Fastlane Otomasyonu:** Windows komut satırından tek bir `git tag` veya `git push` ile buluttaki macOS makinesinde CocoaPods kuruldu, Google Mobile Ads SDK entegre edildi, kodlar derlendi, Apple sertifikalarıyla imzalandı ve doğrudan Apple App Store Connect'e yüklendi.
* **Apple Standartları:** Apple Game Center 15 başarımı, RevenueCat ve StoreKit ile tek tıkla çalışan "Ömür Boyu Reklamsız Sürüm" (IAP), Apple App Tracking Transparency (ATT) izinleri eksiksiz tamamlandı.
* **Tarihi Başarı:** Apple'ın katı denetim ekibine gönderilen **v3.3.6 (Build 42)** derlemesi, başvurudan **sadece 2.5 saat sonra hiçbir ret almadan resmi olarak DÜNYA GENELİNDE ONAYLANDI ve YAYINA GİRDİ!**

---

## 4. İnce Elenip Sık Dokunan Teknik Detaylar (Kullanıcıya Saygı)

*2 Player Snake*, "yap ve bırak" mantığıyla değil, her pikseli oyuncu konforu düşünülerek ilmek ilmek işlendi:

### 1. iPhone 60 FPS Metal Kompozitör Çözümü
iOS WebView ortamında canlı 60 FPS Canvas üzerinde çalışan CSS bulanıklık filtrelerinin WebKit Metal GPU kompozitöründe yarattığı doku kopyalama darboğazı (texture readback stall) tespit edildi. Orijinal cyberpunk neon tasarımından ödün vermeden; scoped blur izolasyonu (`translateZ(0)`), `menuDemoFreezeUntil` geçiş dondurması ve Retina DPR 1.35 optimizasyonuyla iPhone'larda yağ gibi akıcı **kilitli 60 FPS** elde edildi.

### 2. Zeki AI ve WeakMap BFS Yol Bulma Motoru
Oyuncu tek başına pratik yapmak istediğinde karşısına rastgele dönen aptal bir bot değil; tahtadaki engelleri, duvar modlarını ve rakibin boyunu anlık hesaplayan BFS (Breadth-First Search) tabanlı yapay zeka çıkarıldı. Bellek şişmesini önlemek için zayıf referanslı `WeakMap` önbelleklemesi geliştirildi.

### 3. Evrensel Bağlantılar (Universal Links & WhatsApp Daveti)
Oyuncuların arkadaşlarıyla oda kodu yazmadan hemen eşleşebilmesi için `https://2playersnake.com/invite?room=...` Universal Link altyapısı kuruldu. WhatsApp'tan linke tıklayan bir iPhone kullanıcısı Safari'yi ve açılış videolarını atlayarak doğrudan yerel uygulama içinde arkadaşının maç odasına bağlanır.

### 4. 45 Saniye Global Reklam Kuralı (Anti-Spam & Oyuncu Dostu Denge)
Büyük oyun stüdyolarının oyuncuyu reklam yağmuruna tuttuğu bir çağda, RomiToy oyuncu deneyimini önceliklendiren bir denge kurdu. Maç bittiğinde ana menüye dönüp hemen yeni oyuna giren bir oyuncunun art arda reklama maruz kalmaması için 45 saniyelik küresel bekleme süresi (`cooldownMs: 45000`) ve merkezi gatekeeper mimarisi uygulandı.

### 5. Altın Oran Hız Kalibrasyonu, İnsani Seviye Çok Oyunculu & Ergonomik Oyun Sonu Düzeni (Game Feel & UI Polish)
Klasik yılan oyununun hız hissini mükemmelleştirmek amacıyla `v3.4.6` ve `v3.4.7` sürümlerinde "Altın Oran Hız Kalibrasyonu" (`NORMAL = 0.75`, 93.9 ms) geliştirildi. PC, Mobil ve Online sunucu hızları birebir eşitlendi; rastgele eşleşmedeki Dash çarpanı 33 ms'den 64.7 ms'ye dengelenerek kontrol edilebilir, insani bir arcade kapışması sağlandı. Lokma yutma esnemesi (squash & stretch), Tron neon ızgara ışık izi ve yaylanan kombo popuplarıyla saf arcade hazzı zirveye taşındı. `v3.4.8` sürümünde ise oyuncu geri bildirimleri doğrultusunda oyun sonu ekranı sadeleştirildi; solda Ana Menü ve sağda Tekrar Oyna olacak şekilde sektör standardı ergonomik düzen kuruldu, akışı bölen Paylaş butonu kaldırılarak rövanş temposu maksimum akıcılığa ulaştırıldı.

---

## 5. Küresel Vizyon: 21 Dil ve Dünya Pazarı

RomiToy, oyununu yerel bir proje olarak bırakmadı; ilk günden itibaren dünyaya açılma vizyonunu benimsedi:

* **Oyun İçi 21 Dil Desteği:**  
  Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Rusça, Brezilya Portekizcesi, Felemenkçe, Lehçe, Çekçe, Yunanca, Arapça, Basitleştirilmiş Çince, Japonca, Korece, Hintçe, Endonezce, Tayca, Vietnamca ve Filipince.
* **App Store Mağaza Yerelleştirmesi:**  
  Uygulamanın App Store sayfasında tüm bu dillerde resmi listelenmesi için 21 ayrı `.lproj` ve `InfoPlist.strings` mimarisi kuruldu.
* **Stratejik ASO Genişlemesi:**  
  Yüksek gelirli ve arama hacmi yüksek olan **İngiltere (UK), Avustralya, Kanada** ve Geleneksel Çince ile **Tayvan / Hong Kong** mağazaları açılarak dünya mobil oyuncu nüfusunun **%85'inden fazlası** kapsama alanına alındı.

---

## 6. Proje Ayak İzi ve Gelecek Vizyonu

Bugün *2 Player Snake*:
* **Web:** [2playersnake.com](https://2playersnake.com) üzerinden dünyanın dört bir yanından indirmesiz anında oynanıyor.
* **Apple App Store:** [apps.apple.com/app/id6811546748](https://apps.apple.com/app/id6811546748) ile iPhone ve iPad'lerde resmi yayında.
* **Google Play Store:** Android kullanıcılarıyla buluşmuş durumda.
* **Küresel Dizinler:** Softonic, APKPure, Reddit ve Google organik dizinlerinde bağımsız oyun siteleri tarafından listeleniyor.

### Son Söz: Vibecoding Manifestosu

*2 Player Snake*, yazılım geliştirme tarihinde yeni bir dönemin kanıtıdır:
> *"Artık fikirler, teknik yetersizliklerin veya karmaşık araç zincirlerinin arkasında hapsolmak zorunda değil. Doğru vizyona, sabırlı bir detaycılığa ve yapay zekayı doğru yönlendirme becerisine sahip olan herkes; dünya çapında çalışan, milyonlarca insana dokunabilecek platformlar inşa edebilir."*

RomiToy Games'in bu tutkulu yolculuğu, sadece bir oyunun değil, geleceğin üretim tarzının hikayesidir.
