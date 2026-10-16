# 2 Player Snake — Ortak Online Sunucu

Bu klasör PC ve Mobile istemcilerinin ortak Node/Socket.IO sunucusunu içerir. Klasör adındaki `Mobile`, sunucunun yalnız mobil oyunculara hizmet verdiği anlamına gelmez.

## v3.6.0 boost kuralı

Online Boost/Dash yalnız iki oyuncu da PC iken Hızlı Rekabetçi modda kullanılabilir. PC–Mobile ve Mobile–Mobile maçlarda iki oyuncu için de kapalıdır. Normal modda kapalıdır. Rastgele eşleşme, özel oda, yeni round ve tekrar maç aynı kurala uyar.

`isBoostAllowed(room)` oda modunu/platformunu ve iki oyuncunun platformunu kontrol eder. Sunucu `gameInit` içinde boolean `boostEnabled` gönderir; `requestDash` ve hareket hızını aynı koşulla doğrular. İstemcinin gönderdiği izin alanı bu kararı değiştirmez. Beast/yakut ve diğer yem güçleri mevcut kurallarını kullanır.

PC v3.6.0 bu izni Shift, boost çubukları ve kontrol ipuçlarında kullanır. İzin alanı gelmezse online boost kapalıdır. Yerel PC boost ayarı ayrı tutulur. Mobilde boost kontrolü yoktur.

## Çalıştırma ve doğrulama

Bu klasörde bağımlılıkları yükleyip sunucuyu başlatın:

```sh
npm install
node server.js
```

Mevcut barındırma ortamının port/ağ ayarları `server.js` içindedir. Repo kökünden boost testleri:

```sh
node --test tests/online-boost.test.cjs
```

[v3.6.0 doğrulama raporu](../../../MD%20Files/v3.6.0_Online_Boost_Verification.md): toplam 195 otomatik test ve 13 gerçek yerel Socket.IO tarayıcı kontrolü geçti.

## Yayın

v3.6.0 nihai final sürümdür. Ortak sunucu (`server.js`) ve PC/Mobile v3.6.0 HTML kaynakları canlıda yayındadır.
