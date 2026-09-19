import Foundation

/// v3.3.7 — Re-engagement bildirim metinleri (iOS).
/// 21 dil × 3 aşama (Day 1, Day 3, Day 7).
/// Cihaz dili algılanır; eşleşme yoksa İngilizce (EN) varsayılan kullanılır.
enum NotificationStrings {

    struct NotificationText {
        let title: String
        let body: String
    }

    enum Stage: String {
        case day1 = "reengage_day1"
        case day3 = "reengage_day3"
        case day7 = "reengage_day7"
    }

    private static let day1: [String: NotificationText] = [
        "tr": NotificationText(title: "🐍 Hazır mısın?", body: "Yeni bir yılan düellosu seni bekliyor!"),
        "en": NotificationText(title: "🐍 Ready to play?", body: "A new snake duel awaits you!"),
        "de": NotificationText(title: "🐍 Bereit?", body: "Ein neues Schlangenduell wartet auf dich!"),
        "fr": NotificationText(title: "🐍 Prêt(e) ?", body: "Un nouveau duel de serpents t'attend !"),
        "es": NotificationText(title: "🐍 ¿Estás listo?", body: "¡Un nuevo duelo de serpientes te espera!"),
        "it": NotificationText(title: "🐍 Sei pronto?", body: "Un nuovo duello tra serpenti ti aspetta!"),
        "pt": NotificationText(title: "🐍 Está pronto?", body: "Um novo duelo de cobras te aguarda!"),
        "zh": NotificationText(title: "🐍 准备好了吗？", body: "一场新的蛇决斗在等着你！"),
        "ja": NotificationText(title: "🐍 準備はいい？", body: "新しいスネーク決闘があなたを待っています！"),
        "ko": NotificationText(title: "🐍 준비됐어요?", body: "새로운 뱀 결투가 기다리고 있어요!"),
        "ru": NotificationText(title: "🐍 Готов?", body: "Тебя ждёт новая змеиная дуэль!"),
        "ar": NotificationText(title: "🐍 هل أنت مستعد؟", body: "دوري جديد بالثعابين ينتظرك!"),
        "id": NotificationText(title: "🐍 Siap bermain?", body: "Duel ular baru menantimu!"),
        "nl": NotificationText(title: "🐍 Ben je er klaar voor?", body: "Een nieuw slangenduel wacht op je!"),
        "pl": NotificationText(title: "🐍 Gotowy?", body: "Czeka na ciebie nowy pojedynek węży!"),
        "th": NotificationText(title: "🐍 พร้อมหรือยัง?", body: "การดวลงูรอบใหม่รอคุณอยู่!"),
        "vi": NotificationText(title: "🐍 Bạn đã sẵn sàng chưa?", body: "Một trận đấu rắn mới đang chờ bạn!"),
        "el": NotificationText(title: "🐍 Είσαι έτοιμος;", body: "Μια νέα μάχη φιδιών σε περιμένει!"),
        "cs": NotificationText(title: "🐍 Jsi připraven?", body: "Čeká na tebe nový hadí souboj!"),
        "tl": NotificationText(title: "🐍 Handa ka na ba?", body: "Isang bagong snake duel ang naghihintay sa iyo!"),
        "hi": NotificationText(title: "🐍 क्या तुम तैयार हो?", body: "एक नया सांप द्वंद्व तुम्हारा इंतज़ार कर रहा है!")
    ]

    private static let day3: [String: NotificationText] = [
        "tr": NotificationText(title: "⚔️ Rakibini seç!", body: "Online veya aynı ekranda arkadaşına meydan oku."),
        "en": NotificationText(title: "⚔️ Choose your rival!", body: "Challenge a friend online or on the same screen."),
        "de": NotificationText(title: "⚔️ Wähle deinen Rivalen!", body: "Fordere einen Freund online oder am selben Bildschirm heraus."),
        "fr": NotificationText(title: "⚔️ Choisis ton rival !", body: "Défie un ami en ligne ou sur le même écran."),
        "es": NotificationText(title: "⚔️ ¡Elige tu rival!", body: "Desafía a un amigo en línea o en la misma pantalla."),
        "it": NotificationText(title: "⚔️ Scegli il tuo rivale!", body: "Sfida un amico online o sullo stesso schermo."),
        "pt": NotificationText(title: "⚔️ Escolha seu rival!", body: "Desafie um amigo online ou na mesma tela."),
        "zh": NotificationText(title: "⚔️ 选择你的对手！", body: "在线或在同一屏幕上向朋友发起挑战。"),
        "ja": NotificationText(title: "⚔️ ライバルを選べ！", body: "オンラインまたは同じ画面で友達に挑戦しよう。"),
        "ko": NotificationText(title: "⚔️ 라이벌을 선택하세요!", body: "온라인이나 같은 화면에서 친구에게 도전하세요."),
        "ru": NotificationText(title: "⚔️ Выбери соперника!", body: "Брось вызов другу онлайн или на одном экране."),
        "ar": NotificationText(title: "⚔️ اختر منافسك!", body: "تحدَّ صديقك عبر الإنترنت أو على نفس الشاشة."),
        "id": NotificationText(title: "⚔️ Pilih rivalmu!", body: "Tantang teman secara online atau di layar yang sama."),
        "nl": NotificationText(title: "⚔️ Kies je rivaal!", body: "Daag een vriend online of op hetzelfde scherm uit."),
        "pl": NotificationText(title: "⚔️ Wybierz rywala!", body: "Rzuć wyzwanie przyjacielowi online lub na tym samym ekranie."),
        "th": NotificationText(title: "⚔️ เลือกคู่ต่อสู้!", body: "ท้าทายเพื่อนออนไลน์หรือบนหน้าจอเดียวกัน"),
        "vi": NotificationText(title: "⚔️ Chọn đối thủ của bạn!", body: "Thách thức bạn bè trực tuyến hoặc trên cùng màn hình."),
        "el": NotificationText(title: "⚔️ Διάλεξε τον αντίπαλό σου!", body: "Προκάλεσε έναν φίλο online ή στην ίδια οθόνη."),
        "cs": NotificationText(title: "⚔️ Vyber si soupeře!", body: "Vyzvi přítele online nebo na stejné obrazovce."),
        "tl": NotificationText(title: "⚔️ Piliin ang iyong karibal!", body: "Hamunin ang isang kaibigan online o sa parehong screen."),
        "hi": NotificationText(title: "⚔️ अपना प्रतिद्वंद्वी चुनो!", body: "ऑनलाइन या एक ही स्क्रीन पर दोस्त को चुनौती दो।")
    ]

    private static let day7: [String: NotificationText] = [
        "tr": NotificationText(title: "👑 Geri dön şampiyon!", body: "Yeni bir düello başlat!"),
        "en": NotificationText(title: "👑 Come back, champion!", body: "Start a new duel!"),
        "de": NotificationText(title: "👑 Komm zurück, Champion!", body: "Starte ein neues Duell!"),
        "fr": NotificationText(title: "👑 Reviens, champion !", body: "Lance un nouveau duel !"),
        "es": NotificationText(title: "👑 ¡Vuelve, campeón!", body: "¡Inicia un nuevo duelo!"),
        "it": NotificationText(title: "👑 Torna, campione!", body: "Inizia un nuovo duello!"),
        "pt": NotificationText(title: "👑 Volte, campeão!", body: "Inicie um novo duelo!"),
        "zh": NotificationText(title: "👑 回来吧，冠军！", body: "开始一场新的决斗！"),
        "ja": NotificationText(title: "👑 戻ってこい、チャンピオン！", body: "新しい決闘を始めよう！"),
        "ko": NotificationText(title: "👑 돌아와요, 챔피언!", body: "새로운 결투를 시작하세요!"),
        "ru": NotificationText(title: "👑 Вернись, чемпион!", body: "Начни новую дуэль!"),
        "ar": NotificationText(title: "👑 عد يا بطل!", body: "ابدأ دوريًا جديدًا!"),
        "id": NotificationText(title: "👑 Kembali, juara!", body: "Mulai duel baru!"),
        "nl": NotificationText(title: "👑 Kom terug, kampioen!", body: "Start een nieuw duel!"),
        "pl": NotificationText(title: "👑 Wróć, mistrzu!", body: "Rozpocznij nowy pojedynek!"),
        "th": NotificationText(title: "👑 กลับมาเลย แชมป์!", body: "เริ่มการดวลใหม่!"),
        "vi": NotificationText(title: "👑 Quay lại đi, nhà vô địch!", body: "Bắt đầu một trận đấu mới!"),
        "el": NotificationText(title: "👑 Επέστρεψε, πρωταθλητή!", body: "Ξεκίνα μια νέα μάχη!"),
        "cs": NotificationText(title: "👑 Vrať se, šampione!", body: "Zahaj nový souboj!"),
        "tl": NotificationText(title: "👑 Bumalik ka, kampeon!", body: "Simulan ang isang bagong duel!"),
        "hi": NotificationText(title: "👑 वापस आओ, चैंपियन!", body: "एक नया द्वंद्व शुरू करो!")
    ]

    /// Cihaz dilini algılayıp ilgili aşamanın metnini döndürür.
    /// Dil bulunamazsa İngilizce (EN) fallback kullanılır.
    static func get(for stage: Stage) -> NotificationText {
        let langCode = Locale.current.languageCode?.lowercased() ?? "en"
        let map: [String: NotificationText]
        switch stage {
        case .day1: map = day1
        case .day3: map = day3
        case .day7: map = day7
        }
        return map[langCode] ?? map["en"] ?? NotificationText(title: "2 Player Snake", body: "Ready to play?")
    }
}
