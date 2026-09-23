import Foundation

/// v3.3.8 — Native iOS UI Yerelleştirme (21 Dil).
/// Cihazın tercih ettiği dile göre Teaser yükleme ekranı, Çevrimdışı (Offline) overlay
/// ve Uygulama İçi Satın Alma (IAP) mesajlarını dinamik olarak döndürür.
/// Eşleşme yoksa güvenli İngilizce (EN) fallback kullanılır.
enum AppStrings {

    /// Cihaz dilini veya uygulamanın tercih edilen yerelleştirmesini algılar.
    static var currentLanguageCode: String {
        if let preferred = Bundle.main.preferredLocalizations.first?.lowercased() {
            let code = preferred.replacingOccurrences(of: "_", with: "-")
            if code == "zh-hans" || code.hasPrefix("zh") { return "zh" }
            if code == "pt-br" || code.hasPrefix("pt") { return "pt" }
            if code == "fil" || code.hasPrefix("tl") { return "tl" }
            let prefix = String(code.prefix(2))
            if supportedLanguages.contains(prefix) { return prefix }
        }
        if let localeCode = Locale.current.languageCode?.lowercased() {
            if localeCode == "fil" { return "tl" }
            if supportedLanguages.contains(localeCode) { return localeCode }
        }
        return "en"
    }

    private static let supportedLanguages: Set<String> = [
        "en", "tr", "de", "fr", "es", "it", "pt", "zh", "ja", "ko",
        "ru", "ar", "id", "nl", "pl", "th", "vi", "el", "cs", "tl", "hi"
    ]

    // MARK: - 1. Teaser (Açılış & Yükleme Ekranı)
    enum Teaser {
        private static let titles: [String: String] = [
            "en": "TWO PLAYERS. ONE ARENA. GET READY…",
            "tr": "İKİ OYUNCU. TEK ARENA. HAZIR OL…",
            "de": "ZWEI SPIELER. EINE ARENA. MACH DICH BEREIT…",
            "fr": "DEUX JOUEURS. UNE ARÈNE. PRÉPAREZ-VOUS…",
            "es": "DOS JUGADORES. UNA ARENA. PREPÁRATE…",
            "it": "DUE GIOCATORI. UN'ARENA. PREPARATI…",
            "pt": "DOIS JOGADORES. UMA ARENA. PREPARE-SE…",
            "zh": "两名玩家。一个竞技场。准备好…",
            "ja": "2人のプレイヤー。1つのアリーナ。準備はいいか…",
            "ko": "두 명의 플레이어. 하나의 아레나. 준비하세요…",
            "ru": "ДВА ИГРОКА. ОДНА АРЕНА. ГОТОВЬТЕСЬ…",
            "ar": "لاعبان. ساحة واحدة. استعد…",
            "id": "DUA PEMAIN. SATU ARENA. BERSIAPLAH…",
            "nl": "TWEE SPELERS. ÉÉN ARENA. MAAK JE KLAAR…",
            "pl": "DWÓCH GRACZY. JEDNA ARENA. PRZYGOTUJ SIĘ…",
            "th": "ผู้เล่นสองคน เวทีเดียว เตรียมพร้อม…",
            "vi": "HAI NGƯỜI CHƠI. MỘT ĐẤU TRƯỜNG. CHUẨN BỊ…",
            "el": "ΔΥΟ ΠΑΙΚΤΕΣ. ΜΙΑ ΑΡΕΝΑ. ΕΤΟΙΜΑΣΤΕΙΤΕ…",
            "cs": "DVA HRÁČI. JEDNA ARÉNA. PŘIPRAVTE SE…",
            "tl": "DALAWANG MANLALARO. ISANG ARENA. HUMANDA NA…",
            "hi": "दो खिलाड़ी. एक अखाड़ा. तैयार हो जाएं…"
        ]

        private static let subtitles: [String: String] = [
            "en": "Fine-tuning controls, audio and performance…",
            "tr": "Kontroller, ses ve performans ayarlanıyor…",
            "de": "Anpassung von Steuerung, Sound und Leistung…",
            "fr": "Ajustement des contrôles, du son et des performances…",
            "es": "Ajustando controles, sonido y rendimiento…",
            "it": "Regolazione dei controlli, del suono e delle prestazioni…",
            "pt": "Ajustando controles, som e desempenho…",
            "zh": "正在调整控制、声音和性能…",
            "ja": "操作、サウンド、パフォーマンスを調整中…",
            "ko": "컨트롤, 사운드, 성능 조정 중…",
            "ru": "Настройка управления, звука и производительности…",
            "ar": "ضبط عناصر التحكم والصوت والأداء…",
            "id": "Menyesuaikan kontrol, suara, dan kinerja…",
            "nl": "Besturing, geluid en prestaties afstemmen…",
            "pl": "Dostrajanie sterowania, dźwięku i wydajności…",
            "th": "กำลังปรับการควบคุม เสียง และประสิทธิภาพ…",
            "vi": "Đang tinh chỉnh điều khiển, âm thanh và hiệu suất…",
            "el": "Προσαρμογή ελέγχων, ήχου και απόδοσης…",
            "cs": "Nastavení ovládání, zvuku a výkonu…",
            "tl": "Inaayos ang mga kontrol, tunog, at performance…",
            "hi": "कंट्रोल, ध्वनि और प्रदर्शन सेट कर रहे हैं…"
        ]

        private static let percentFormats: [String: String] = [
            "en": "%d%% ready",
            "tr": "%%%d hazır",
            "de": "%d%% bereit",
            "fr": "%d%% prêt",
            "es": "%d%% listo",
            "it": "%d%% pronto",
            "pt": "%d%% pronto",
            "zh": "%d%% 就绪",
            "ja": "%d%% 準備完了",
            "ko": "%d%% 준비 완료",
            "ru": "%d%% готово",
            "ar": "%d%% جاهز",
            "id": "%d%% siap",
            "nl": "%d%% gereed",
            "pl": "%d%% gotowe",
            "th": "%d%% พร้อมแล้ว",
            "vi": "%d%% sẵn sàng",
            "el": "%d%% έτοιμο",
            "cs": "%d%% připraveno",
            "tl": "%d%% handa na",
            "hi": "%d%% तैयार"
        ]

        static var title: String {
            let lang = AppStrings.currentLanguageCode
            return titles[lang] ?? titles["en"]!
        }

        static var subtitle: String {
            let lang = AppStrings.currentLanguageCode
            return subtitles[lang] ?? subtitles["en"]!
        }

        static func percentText(for percent: Int) -> String {
            let lang = AppStrings.currentLanguageCode
            let format = percentFormats[lang] ?? percentFormats["en"]!
            return String(format: format, percent)
        }
    }

    // MARK: - 2. Çevrimdışı (Offline) Durumları & Pop-up'lar
    enum Offline {
        private static let titles: [String: String] = [
            "en": "No Connection",
            "tr": "Bağlantı Yok",
            "de": "Keine Verbindung",
            "fr": "Pas de connexion",
            "es": "Sin conexión",
            "it": "Nessuna connessione",
            "pt": "Sem conexão",
            "zh": "无网络连接",
            "ja": "接続なし",
            "ko": "연결 없음",
            "ru": "Нет подключения",
            "ar": "لا يوجد اتصال",
            "id": "Tidak Ada Koneksi",
            "nl": "Geen verbinding",
            "pl": "Brak połączenia",
            "th": "ไม่มีการเชื่อมต่อ",
            "vi": "Không có kết nối",
            "el": "Χωρίς σύνδεση",
            "cs": "Žádné připojení",
            "tl": "Walang Koneksyon",
            "hi": "कोई कनेक्शन नहीं"
        ]

        private static let subtitles: [String: String] = [
            "en": "Game failed to load. Please try again.",
            "tr": "Oyun yüklenemedi. Lütfen tekrar dene.",
            "de": "Spiel konnte nicht geladen werden. Bitte erneut versuchen.",
            "fr": "Échec du chargement du jeu. Veuillez réessayer.",
            "es": "Error al cargar el juego. Inténtalo de nuevo.",
            "it": "Caricamento del gioco non riuscito. Riprova.",
            "pt": "Falha ao carregar o jogo. Tente novamente.",
            "zh": "游戏加载失败，请重试。",
            "ja": "ゲームを読み込めませんでした。再試行してください。",
            "ko": "게임을 불러오지 못했습니다. 다시 시도해 주세요.",
            "ru": "Не удалось загрузить игру. Пожалуйста, попробуйте снова.",
            "ar": "فشل تحميل اللعبة. يرجى المحاولة مرة أخرى.",
            "id": "Gagal memuat game. Silakan coba lagi.",
            "nl": "Spel laden mislukt. Probeer het opnieuw.",
            "pl": "Nie udało się załadować gry. Spróbuj ponownie.",
            "th": "โหลดเกมไม่สำเร็จ โปรดลองอีกครั้ง",
            "vi": "Không thể tải trò chơi. Vui lòng thử lại.",
            "el": "Αποτυχία φόρτωσης παιχνιδιού. Δοκιμάστε ξανά.",
            "cs": "Hru se nepodařilo načíst. Zkuste to znovu.",
            "tl": "Hindi na-load ang laro. Pakisubukang muli.",
            "hi": "गेम लोड नहीं हो सका। कृपया पुनः प्रयास करें।"
        ]

        private static let retryButtons: [String: String] = [
            "en": "Retry",
            "tr": "Tekrar Dene",
            "de": "Erneut versuchen",
            "fr": "Réessayer",
            "es": "Reintentar",
            "it": "Riprova",
            "pt": "Tentar novamente",
            "zh": "重试",
            "ja": "再試行",
            "ko": "다시 시도",
            "ru": "Повторить",
            "ar": "إعادة المحاولة",
            "id": "Coba Lagi",
            "nl": "Opnieuw proberen",
            "pl": "Ponów",
            "th": "ลองใหม่",
            "vi": "Thử lại",
            "el": "Δοκιμάστε ξανά",
            "cs": "Zkusit znovu",
            "tl": "Subukang muli",
            "hi": "पुनः प्रयास करें"
        ]

        private static let reconnectTitles: [String: String] = [
            "en": "Connection Restored",
            "tr": "Bağlantı Geri Geldi",
            "de": "Verbindung wiederhergestellt",
            "fr": "Connexion rétablie",
            "es": "Conexión restablecida",
            "it": "Connessione ripristinata",
            "pt": "Conexão restaurada",
            "zh": "网络已恢复",
            "ja": "接続が復旧しました",
            "ko": "연결 복구됨",
            "ru": "Соединение восстановлено",
            "ar": "تمت استعادة الاتصال",
            "id": "Koneksi Pulih",
            "nl": "Verbinding hersteld",
            "pl": "Połączenie przywrócone",
            "th": "การเชื่อมต่อกลับมาแล้ว",
            "vi": "Đã khôi phục kết nối",
            "el": "Η σύνδεση αποκαταστάθηκε",
            "cs": "Připojení obnoveno",
            "tl": "Naibalik ang Koneksyon",
            "hi": "कनेक्शन वापस आ गया"
        ]

        private static let reconnectMessages: [String: String] = [
            "en": "The game will reload for online mode and updates. Current offline match will be lost.",
            "tr": "Çevrimiçi mod, reklamlar ve en güncel oyun sürümü için oyun yeniden yüklenecek. Mevcut yerel maçın kaybolur.",
            "de": "Das Spiel wird für den Online-Modus und Updates neu geladen. Das aktuelle Offline-Spiel geht verloren.",
            "fr": "Le jeu va se recharger pour le mode en ligne et les mises à jour. Le match hors ligne en cours sera perdu.",
            "es": "El juego se recargará para el modo en línea y las actualizaciones. La partida local actual se perderá.",
            "it": "Il gioco verrà ricaricato per la modalità online e gli aggiornamenti. La partita offline corrente andrà persa.",
            "pt": "O jogo será recarregado para o modo online e atualizações. A partida offline atual será perdida.",
            "zh": "游戏将重新加载以进入在线模式并获取更新。当前的离线对局将会丢失。",
            "ja": "オンラインモードと更新のためゲームを再読み込みします。現在のオフライン対戦は失われます。",
            "ko": "온라인 모드 및 업데이트를 위해 게임을 다시 로드합니다. 현재 오프라인 매치는 종료됩니다.",
            "ru": "Игра перезагрузится для онлайн-режима и обновлений. Текущий офлайн-матч будет потерян.",
            "ar": "ستتم إعادة تحميل اللعبة لوضع الاتصال والتحديثات. ستفقد المباراة غير المتصلة الحالية.",
            "id": "Game akan dimuat ulang untuk mode online dan pembaruan. Pertandingan offline saat ini akan hilang.",
            "nl": "De game wordt opnieuw geladen voor online modus en updates. De huidige offline match gaat verloren.",
            "pl": "Gra zostanie przeładowana do trybu online i aktualizacji. Bieżący mecz offline zostanie utracony.",
            "th": "เกมจะโหลดใหม่สำหรับโหมดออนไลน์และการอัปเดต แมตช์ออฟไลน์ปัจจุบันจะหายไป",
            "vi": "Trò chơi sẽ tải lại cho chế độ trực tuyến và cập nhật. Trận đấu ngoại tuyến hiện tại sẽ bị mất.",
            "el": "Το παιχνίδι θα επαναφορτωθεί για online λειτουργία και ενημερώσεις. Ο τρέχων αγώνας εκτός σύνδεσης θα χαθεί.",
            "cs": "Hra se znovu načte pro online režim a aktualizace. Aktuální offline zápas bude ztracen.",
            "tl": "Magre-reload ang laro para sa online mode at mga update. Mawawala ang kasalukuyang offline match.",
            "hi": "ऑनलाइन मोड और अपडेट के लिए गेम पुनः लोड होगा। वर्तमान ऑफ़लाइन मैच समाप्त हो जाएगा।"
        ]

        private static let reloadNowButtons: [String: String] = [
            "en": "Reload Now",
            "tr": "Şimdi Yükle",
            "de": "Jetzt laden",
            "fr": "Recharger",
            "es": "Recargar ahora",
            "it": "Ricarica ora",
            "pt": "Recarregar agora",
            "zh": "立即加载",
            "ja": "今すぐ読み込む",
            "ko": "지금 로드",
            "ru": "Перезагрузить",
            "ar": "تحميل الآن",
            "id": "Muat Sekarang",
            "nl": "Nu laden",
            "pl": "Przeładuj teraz",
            "th": "โหลดใหม่ตอนนี้",
            "vi": "Tải lại ngay",
            "el": "Επαναφόρτωση τώρα",
            "cs": "Znovu načíst",
            "tl": "I-reload Ngayon",
            "hi": "अभी लोड करें"
        ]

        private static let keepOfflineButtons: [String: String] = [
            "en": "Keep Playing Offline",
            "tr": "Offline Devam Et",
            "de": "Offline weiterspielen",
            "fr": "Continuer hors ligne",
            "es": "Seguir jugando sin conexión",
            "it": "Continua offline",
            "pt": "Continuar offline",
            "zh": "继续离线游玩",
            "ja": "オフラインで続ける",
            "ko": "오프라인으로 계속 플레이",
            "ru": "Продолжить офлайн",
            "ar": "متابعة بلا اتصال",
            "id": "Tetap Main Offline",
            "nl": "Offline blijven spelen",
            "pl": "Graj dalej offline",
            "th": "เล่นออฟไลน์ต่อ",
            "vi": "Tiếp tục chơi ngoại tuyến",
            "el": "Συνέχεια εκτός σύνδεσης",
            "cs": "Pokračovat offline",
            "tl": "Magpatuloy sa Offline",
            "hi": "ऑफ़लाइन खेलना जारी रखें"
        ]

        private static let okButtons: [String: String] = [
            "en": "OK",
            "tr": "Tamam",
            "de": "OK",
            "fr": "OK",
            "es": "Aceptar",
            "it": "OK",
            "pt": "OK",
            "zh": "好的",
            "ja": "OK",
            "ko": "확인",
            "ru": "ОК",
            "ar": "حسناً",
            "id": "OK",
            "nl": "OK",
            "pl": "OK",
            "th": "ตกลง",
            "vi": "OK",
            "el": "OK",
            "cs": "OK",
            "tl": "OK",
            "hi": "ठीक है"
        ]

        static var title: String {
            let lang = AppStrings.currentLanguageCode
            return titles[lang] ?? titles["en"]!
        }

        static var subtitle: String {
            let lang = AppStrings.currentLanguageCode
            return subtitles[lang] ?? subtitles["en"]!
        }

        static var retryButton: String {
            let lang = AppStrings.currentLanguageCode
            return retryButtons[lang] ?? retryButtons["en"]!
        }

        static var reconnectTitle: String {
            let lang = AppStrings.currentLanguageCode
            return reconnectTitles[lang] ?? reconnectTitles["en"]!
        }

        static var reconnectMessage: String {
            let lang = AppStrings.currentLanguageCode
            return reconnectMessages[lang] ?? reconnectMessages["en"]!
        }

        static var reconnectActionReload: String {
            let lang = AppStrings.currentLanguageCode
            return reloadNowButtons[lang] ?? reloadNowButtons["en"]!
        }

        static var reconnectActionCancel: String {
            let lang = AppStrings.currentLanguageCode
            return keepOfflineButtons[lang] ?? keepOfflineButtons["en"]!
        }

        static var okButton: String {
            let lang = AppStrings.currentLanguageCode
            return okButtons[lang] ?? okButtons["en"]!
        }
    }

    // MARK: - 3. Uygulama İçi Satın Alma (IAP & RevenueCat)
    enum IAP {
        private static let removeAdsTitles: [String: String] = [
            "en": "👑 Ads Removed!",
            "tr": "👑 Reklamlar Kaldırıldı!",
            "de": "👑 Werbung entfernt!",
            "fr": "👑 Publicités supprimées !",
            "es": "👑 ¡Anuncios eliminados!",
            "it": "👑 Annunci rimossi!",
            "pt": "👑 Anúncios removidos!",
            "zh": "👑 已移除广告！",
            "ja": "👑 広告が削除されました！",
            "ko": "👑 광고가 제거되었습니다!",
            "ru": "👑 Реклама отключена!",
            "ar": "👑 تمت إزالة الإعلانات!",
            "id": "👑 Iklan Dihapus!",
            "nl": "👑 Advertenties verwijderd!",
            "pl": "👑 Reklamy usunięte!",
            "th": "👑 ลบโฆษณาแล้ว!",
            "vi": "👑 Đã xóa quảng cáo!",
            "el": "👑 Οι διαφημίσεις αφαιρέθηκαν!",
            "cs": "👑 Reklamy odstraněny!",
            "tl": "👑 Tinanggal ang mga Ad!",
            "hi": "👑 विज्ञापन हटा दिए गए!"
        ]

        private static let removeAdsMessages: [String: String] = [
            "en": "Thank you! Enjoy your ad-free experience.",
            "tr": "Teşekkürler! Artık reklamsız bir deneyimin tadını çıkarabilirsin.",
            "de": "Danke! Genieße dein werbefreies Spielerlebnis.",
            "fr": "Merci ! Profitez de votre expérience sans publicité.",
            "es": "¡Gracias! Disfruta de tu experiencia sin anuncios.",
            "it": "Grazie! Goditi la tua esperienza senza pubblicità.",
            "pt": "Obrigado! Aproveite sua experiência sem anúncios.",
            "zh": "谢谢！享受无广告的游戏体验。",
            "ja": "ありがとうございます！広告なしでお楽しみください。",
            "ko": "감사합니다! 광고 없이 게임을 즐겨보세요.",
            "ru": "Спасибо! Наслаждайтесь игрой без рекламы.",
            "ar": "شكراً لك! استمتع بتجربة خالية من الإعلانات.",
            "id": "Terima kasih! Nikmati pengalaman tanpa iklan.",
            "nl": "Bedankt! Geniet van je advertentievrije ervaring.",
            "pl": "Dziękujemy! Ciesz się grą bez reklam.",
            "th": "ขอบคุณ! สนุกกับเกมแบบไม่มีโฆษณา",
            "vi": "Cảm ơn bạn! Tận hưởng trải nghiệm không có quảng cáo.",
            "el": "Ευχαριστούμε! Απολαύστε την εμπειρία χωρίς διαφημίσεις.",
            "cs": "Děkujeme! Užijte si hru bez reklam.",
            "tl": "Salamat! Masiyahan sa iyong ad-free na karanasan.",
            "hi": "धन्यवाद! विज्ञापन-मुक्त अनुभव का आनंद लें।"
        ]

        private static let awesomeButtons: [String: String] = [
            "en": "Awesome!",
            "tr": "Harika!",
            "de": "Super!",
            "fr": "Génial !",
            "es": "¡Genial!",
            "it": "Fantastico!",
            "pt": "Incrível!",
            "zh": "太棒了！",
            "ja": "最高！",
            "ko": "좋아요!",
            "ru": "Отлично!",
            "ar": "رائع!",
            "id": "Hebat!",
            "nl": "Geweldig!",
            "pl": "Świetnie!",
            "th": "ยอดเยี่ยม!",
            "vi": "Tuyệt vời!",
            "el": "Τέλεια!",
            "cs": "Skvělé!",
            "tl": "Galing!",
            "hi": "शानदार!"
        ]

        private static let errorTitles: [String: String] = [
            "en": "Error",
            "tr": "Hata",
            "de": "Fehler",
            "fr": "Erreur",
            "es": "Error",
            "it": "Errore",
            "pt": "Erro",
            "zh": "错误",
            "ja": "エラー",
            "ko": "오류",
            "ru": "Ошибка",
            "ar": "خطأ",
            "id": "Kesalahan",
            "nl": "Fout",
            "pl": "Błąd",
            "th": "ข้อผิดพลาด",
            "vi": "Lỗi",
            "el": "Σφάλμα",
            "cs": "Chyba",
            "tl": "Error",
            "hi": "त्रुटि"
        ]

        private static let purchaseFailedPrefixes: [String: String] = [
            "en": "Purchase failed",
            "tr": "Satın alma başarısız",
            "de": "Kauf fehlgeschlagen",
            "fr": "Échec de l'achat",
            "es": "Compra fallida",
            "it": "Acquisto non riuscito",
            "pt": "Falha na compra",
            "zh": "购买失败",
            "ja": "購入に失敗しました",
            "ko": "구매 실패",
            "ru": "Ошибка покупки",
            "ar": "فشلت عملية الشراء",
            "id": "Pembelian gagal",
            "nl": "Aankoop mislukt",
            "pl": "Zakup nie powiódł się",
            "th": "การซื้อล้มเหลว",
            "vi": "Giao dịch mua thất bại",
            "el": "Η αγορά απέτυχε",
            "cs": "Nákup se nezdařil",
            "tl": "Nabigo ang pagbili",
            "hi": "खरीद विफल रही"
        ]

        private static let restoreTitles: [String: String] = [
            "en": "Restore Purchases",
            "tr": "Satın Alımları Geri Yükle",
            "de": "Käufe wiederherstellen",
            "fr": "Restaurer les achats",
            "es": "Restaurar compras",
            "it": "Ripristina acquisti",
            "pt": "Restaurar compras",
            "zh": "恢复购买",
            "ja": "購入を復元",
            "ko": "구매 항목 복원",
            "ru": "Восстановить покупки",
            "ar": "استعادة المشتريات",
            "id": "Pulihkan Pembelian",
            "nl": "Aankopen herstellen",
            "pl": "Przywróć zakupy",
            "th": "กู้คืนการซื้อ",
            "vi": "Khôi phục giao dịch mua",
            "el": "Επαναφορά αγορών",
            "cs": "Obnovit nákupy",
            "tl": "I-restore ang mga Binili",
            "hi": "खरीद बहाल करें"
        ]

        private static let restoreSuccessMessages: [String: String] = [
            "en": "👑 Your ad-free purchase has been successfully restored!",
            "tr": "👑 Reklamsız satın alımın başarıyla geri yüklendi!",
            "de": "👑 Dein werbefreier Kauf wurde erfolgreich wiederhergestellt!",
            "fr": "👑 Votre achat sans publicité a été restauré avec succès !",
            "es": "👑 ¡Tu compra sin anuncios se ha restaurado con éxito!",
            "it": "👑 Il tuo acquisto senza pubblicità è stato ripristinato con successo!",
            "pt": "👑 Sua compra sem anúncios foi restaurada com sucesso!",
            "zh": "👑 您的无广告购买已成功恢复！",
            "ja": "👑 広告なしの購入が正常に復元されました！",
            "ko": "👑 광고 제거 구매가 성공적으로 복원되었습니다!",
            "ru": "👑 Ваша покупка отключения рекламы успешно восстановлена!",
            "ar": "👑 تمت استعادة عملية الشراء بدون إعلانات بنجاح!",
            "id": "👑 Pembelian bebas iklan berhasil dipulihkan!",
            "nl": "👑 Je advertentievrije aankoop is succesvol hersteld!",
            "pl": "👑 Twój zakup bez reklam został pomyślnie przywrócony!",
            "th": "👑 กู้คืนการซื้อแบบไม่มีโฆษณาเรียบร้อยแล้ว!",
            "vi": "👑 Giao dịch mua không quảng cáo của bạn đã được khôi phục thành công!",
            "el": "👑 Η αγορά σας χωρίς διαφημίσεις αποκαταστάθηκε με επιτυχία!",
            "cs": "👑 Váš nákup bez reklam byl úspěšně obnoven!",
            "tl": "👑 Matagumpay na na-restore ang iyong ad-free na binili!",
            "hi": "👑 आपकी विज्ञापन-मुक्त खरीद सफलतापूर्वक बहाल कर दी गई है!"
        ]

        private static let restoreNotFoundMessages: [String: String] = [
            "en": "No previous ad-free purchase was found for this Apple account.",
            "tr": "Bu Apple hesabında daha önce reklam kaldırma satın alımı bulunamadı.",
            "de": "Für diesen Apple-Account wurde kein vorheriger werbefreier Kauf gefunden.",
            "fr": "Aucun achat sans publicité antérieur n'a été trouvé pour ce compte Apple.",
            "es": "No se encontró ninguna compra anterior sin anuncios para esta cuenta de Apple.",
            "it": "Nessun acquisto senza pubblicità precedente trovato per questo account Apple.",
            "pt": "Nenhuma compra anterior sem anúncios foi encontrada para esta conta Apple.",
            "zh": "此 Apple 账户未找到以前的无广告购买记录。",
            "ja": "この Apple アカウントには以前の広告なしの購入が見つかりませんでした。",
            "ko": "이 Apple 계정에서 이전 광고 제거 구매 내역을 찾을 수 없습니다.",
            "ru": "Для этого аккаунта Apple не найдено предыдущих покупок отключения рекламы.",
            "ar": "لم يتم العثور على مشتريات سابقة لإزالة الإعلانات لهذا الحساب.",
            "id": "Tidak ditemukan pembelian bebas iklan sebelumnya untuk akun Apple ini.",
            "nl": "Er is geen eerdere advertentievrije aankoop gevonden voor dit Apple-account.",
            "pl": "Dla tego konta Apple nie znaleziono wcześniejszego zakupu bez reklam.",
            "th": "ไม่พบประวัติการซื้อแบบไม่มีโฆษณาก่อนหน้าสำหรับบัญชี Apple นี้",
            "vi": "Không tìm thấy giao dịch mua không quảng cáo nào trước đây cho tài khoản Apple này.",
            "el": "Δεν βρέθηκε προηγούμενη αγορά χωρίς διαφημίσεις για αυτόν τον λογαριασμό Apple.",
            "cs": "Pro tento účet Apple nebyl nalezen žádný předchozí nákup bez reklam.",
            "tl": "Walang nakitang dating ad-free na binili para sa Apple account na ito.",
            "hi": "इस Apple खाते के लिए कोई पूर्व विज्ञापन-मुक्त खरीद नहीं मिली।"
        ]

        private static let restoreFailedPrefixes: [String: String] = [
            "en": "Purchases could not be restored",
            "tr": "Satın alımlar geri yüklenemedi",
            "de": "Käufe konnten nicht wiederhergestellt werden",
            "fr": "Impossible de restaurer les achats",
            "es": "No se pudieron restaurar las compras",
            "it": "Impossibile ripristinare gli acquisti",
            "pt": "Não foi possível restaurar as compras",
            "zh": "无法恢复购买",
            "ja": "購入を復元できませんでした",
            "ko": "구매 항목을 복원할 수 없습니다",
            "ru": "Не удалось восстановить покупки",
            "ar": "تعذرت استعادة المشتريات",
            "id": "Gagal memulihkan pembelian",
            "nl": "Aankopen konden niet worden hersteld",
            "pl": "Nie można przywrócić zakupów",
            "th": "ไม่สามารถกู้คืนการซื้อได้",
            "vi": "Không thể khôi phục giao dịch mua",
            "el": "Δεν ήταν δυνατή η επαναφορά των αγορών",
            "cs": "Nákupy se nepodařilo obnovit",
            "tl": "Hindi ma-restore ang mga binili",
            "hi": "खरीद बहाल नहीं की जा सकी"
        ]

        static var removeAdsSuccessTitle: String {
            let lang = AppStrings.currentLanguageCode
            return removeAdsTitles[lang] ?? removeAdsTitles["en"]!
        }

        static var removeAdsSuccessMessage: String {
            let lang = AppStrings.currentLanguageCode
            return removeAdsMessages[lang] ?? removeAdsMessages["en"]!
        }

        static var awesomeButton: String {
            let lang = AppStrings.currentLanguageCode
            return awesomeButtons[lang] ?? awesomeButtons["en"]!
        }

        static var errorTitle: String {
            let lang = AppStrings.currentLanguageCode
            return errorTitles[lang] ?? errorTitles["en"]!
        }

        static func purchaseFailedMessage(with error: String) -> String {
            let lang = AppStrings.currentLanguageCode
            let prefix = purchaseFailedPrefixes[lang] ?? purchaseFailedPrefixes["en"]!
            return "\(prefix): \(error)"
        }

        static var restoreTitle: String {
            let lang = AppStrings.currentLanguageCode
            return restoreTitles[lang] ?? restoreTitles["en"]!
        }

        static var restoreSuccessMessage: String {
            let lang = AppStrings.currentLanguageCode
            return restoreSuccessMessages[lang] ?? restoreSuccessMessages["en"]!
        }

        static var restoreNotFoundMessage: String {
            let lang = AppStrings.currentLanguageCode
            return restoreNotFoundMessages[lang] ?? restoreNotFoundMessages["en"]!
        }

        static func restoreFailedMessage(with error: String) -> String {
            let lang = AppStrings.currentLanguageCode
            let prefix = restoreFailedPrefixes[lang] ?? restoreFailedPrefixes["en"]!
            return "\(prefix): \(error)"
        }

        private static let packageNotFoundMessages: [String: String] = [
            "en": "Purchase package not found. Please try again later.",
            "tr": "Satın alma paketi bulunamadı. Lütfen daha sonra tekrar deneyin.",
            "de": "Kaufpaket nicht gefunden. Bitte versuchen Sie es später erneut.",
            "fr": "Pack d'achat introuvable. Veuillez réessayer plus tard.",
            "es": "Paquete de compra no encontrado. Inténtalo de nuevo más tarde.",
            "it": "Pacchetto di acquisto non trovato. Riprova più tardi.",
            "pt": "Pacote de compra não encontrado. Tente novamente mais tarde.",
            "zh": "未找到购买项目，请稍后重试。",
            "ja": "購入パッケージが見つかりませんでした。後でもう一度お試しください。",
            "ko": "구매 상품을 찾을 수 없습니다. 나중에 다시 시도해 주세요.",
            "ru": "Пакет покупки не найден. Пожалуйста, повторите попытку позже.",
            "ar": "حزمة الشراء غير موجودة. يرجى المحاولة مرة أخرى لاحقاً.",
            "id": "Paket pembelian tidak ditemukan. Silakan coba lagi nanti.",
            "nl": "Aankooppakket niet gevonden. Probeer het later opnieuw.",
            "pl": "Pakiet zakupu nie został znaleziony. Spróbuj ponownie później.",
            "th": "ไม่พบแพ็กเกจการซื้อ โปรดลองใหม่อีกครั้งในภายหลัง",
            "vi": "Không tìm thấy gói mua. Vui lòng thử lại sau.",
            "el": "Το πακέτο αγοράς δεν βρέθηκε. Δοκιμάστε ξανά αργότερα.",
            "cs": "Nákupní balíček nebyl nalezen. Zkuste to prosím později.",
            "tl": "Hindi nahanap ang purchase package. Pakisubukang muli mamaya.",
            "hi": "खरीद पैकेज नहीं मिला। कृपया बाद में पुनः प्रयास करें।"
        ]

        static var packageNotFoundMessage: String {
            let lang = AppStrings.currentLanguageCode
            return packageNotFoundMessages[lang] ?? packageNotFoundMessages["en"]!
        }
    }
}
