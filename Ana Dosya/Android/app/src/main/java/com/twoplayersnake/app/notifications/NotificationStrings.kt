package com.twoplayersnake.app.notifications

import java.util.Locale

/**
 * v3.3.1 — Re-engagement bildirim metinleri.
 * 21 dil × 3 aşama (Day1, Day3, Day7).
 * Cihaz dili algılanır; eşleşme yoksa İngilizce (EN) varsayılan kullanılır.
 */
object NotificationStrings {

    data class NotificationText(val title: String, val body: String)

    // Aşama sabitleri — WorkManager input data'sında kullanılır
    const val STAGE_DAY1 = "day1"
    const val STAGE_DAY3 = "day3"
    const val STAGE_DAY7 = "day7"

    // Notification IDs
    const val NOTIFICATION_ID_DAY1 = 1001
    const val NOTIFICATION_ID_DAY3 = 1003
    const val NOTIFICATION_ID_DAY7 = 1007

    private val day1 = mapOf(
        "tr" to NotificationText("🐍 Hazır mısın?", "Yeni bir yılan düellosu seni bekliyor!"),
        "en" to NotificationText("🐍 Ready to play?", "A new snake duel awaits you!"),
        "de" to NotificationText("🐍 Bereit?", "Ein neues Schlangenduell wartet auf dich!"),
        "fr" to NotificationText("🐍 Prêt(e) ?", "Un nouveau duel de serpents t'attend !"),
        "es" to NotificationText("🐍 ¿Estás listo?", "¡Un nuevo duelo de serpientes te espera!"),
        "it" to NotificationText("🐍 Sei pronto?", "Un nuovo duello tra serpenti ti aspetta!"),
        "pt" to NotificationText("🐍 Está pronto?", "Um novo duelo de cobras te aguarda!"),
        "zh" to NotificationText("🐍 准备好了吗？", "一场新的蛇决斗在等着你！"),
        "ja" to NotificationText("🐍 準備はいい？", "新しいスネーク決闘があなたを待っています！"),
        "ko" to NotificationText("🐍 준비됐어요?", "새로운 뱀 결투가 기다리고 있어요!"),
        "ru" to NotificationText("🐍 Готов?", "Тебя ждёт новая змеиная дуэль!"),
        "ar" to NotificationText("🐍 هل أنت مستعد؟", "دوري جديد بالثعابين ينتظرك!"),
        "id" to NotificationText("🐍 Siap bermain?", "Duel ular baru menantimu!"),
        "nl" to NotificationText("🐍 Ben je er klaar voor?", "Een nieuw slangenduel wacht op je!"),
        "pl" to NotificationText("🐍 Gotowy?", "Czeka na ciebie nowy pojedynek węży!"),
        "th" to NotificationText("🐍 พร้อมหรือยัง?", "การดวลงูรอบใหม่รอคุณอยู่!"),
        "vi" to NotificationText("🐍 Bạn đã sẵn sàng chưa?", "Một trận đấu rắn mới đang chờ bạn!"),
        "el" to NotificationText("🐍 Είσαι έτοιμος;", "Μια νέα μάχη φιδιών σε περιμένει!"),
        "cs" to NotificationText("🐍 Jsi připraven?", "Čeká na tebe nový hadí souboj!"),
        "tl" to NotificationText("🐍 Handa ka na ba?", "Isang bagong snake duel ang naghihintay sa iyo!"),
        "hi" to NotificationText("🐍 क्या तुम तैयार हो?", "एक नया सांप द्वंद्व तुम्हारा इंतज़ार कर रहा है!")
    )

    private val day3 = mapOf(
        "tr" to NotificationText("⚔️ Rakibini seç!", "Online veya aynı ekranda arkadaşına meydan oku."),
        "en" to NotificationText("⚔️ Choose your rival!", "Challenge a friend online or on the same screen."),
        "de" to NotificationText("⚔️ Wähle deinen Rivalen!", "Fordere einen Freund online oder am selben Bildschirm heraus."),
        "fr" to NotificationText("⚔️ Choisis ton rival !", "Défie un ami en ligne ou sur le même écran."),
        "es" to NotificationText("⚔️ ¡Elige tu rival!", "Desafía a un amigo en línea o en la misma pantalla."),
        "it" to NotificationText("⚔️ Scegli il tuo rivale!", "Sfida un amico online o sullo stesso schermo."),
        "pt" to NotificationText("⚔️ Escolha seu rival!", "Desafie um amigo online ou na mesma tela."),
        "zh" to NotificationText("⚔️ 选择你的对手！", "在线或在同一屏幕上向朋友发起挑战。"),
        "ja" to NotificationText("⚔️ ライバルを選べ！", "オンラインまたは同じ画面で友達に挑戦しよう。"),
        "ko" to NotificationText("⚔️ 라이벌을 선택하세요!", "온라인이나 같은 화면에서 친구에게 도전하세요."),
        "ru" to NotificationText("⚔️ Выбери соперника!", "Брось вызов другу онлайн или на одном экране."),
        "ar" to NotificationText("⚔️ اختر منافسك!", "تحدَّ صديقك عبر الإنترنت أو على نفس الشاشة."),
        "id" to NotificationText("⚔️ Pilih rivalmu!", "Tantang teman secara online atau di layar yang sama."),
        "nl" to NotificationText("⚔️ Kies je rivaal!", "Daag een vriend online of op hetzelfde scherm uit."),
        "pl" to NotificationText("⚔️ Wybierz rywala!", "Rzuć wyzwanie przyjacielowi online lub na tym samym ekranie."),
        "th" to NotificationText("⚔️ เลือกคู่ต่อสู้!", "ท้าทายเพื่อนออนไลน์หรือบนหน้าจอเดียวกัน"),
        "vi" to NotificationText("⚔️ Chọn đối thủ của bạn!", "Thách thức bạn bè trực tuyến hoặc trên cùng màn hình."),
        "el" to NotificationText("⚔️ Διάλεξε τον αντίπαλό σου!", "Προκάλεσε έναν φίλο online ή στην ίδια οθόνη."),
        "cs" to NotificationText("⚔️ Vyber si soupeře!", "Vyzvi přítele online nebo na stejné obrazovce."),
        "tl" to NotificationText("⚔️ Piliin ang iyong karibal!", "Hamunin ang isang kaibigan online o sa parehong screen."),
        "hi" to NotificationText("⚔️ अपना प्रतिद्वंद्वी चुनो!", "ऑनलाइन या एक ही स्क्रीन पर दोस्त को चुनौती दो।")
    )

    private val day7 = mapOf(
        "tr" to NotificationText("👑 Geri dön şampiyon!", "Yeni bir düello başlat!"),
        "en" to NotificationText("👑 Come back, champion!", "Start a new duel!"),
        "de" to NotificationText("👑 Komm zurück, Champion!", "Starte ein neues Duell!"),
        "fr" to NotificationText("👑 Reviens, champion !", "Lance un nouveau duel !"),
        "es" to NotificationText("👑 ¡Vuelve, campeón!", "¡Inicia un nuevo duelo!"),
        "it" to NotificationText("👑 Torna, campione!", "Inizia un nuovo duello!"),
        "pt" to NotificationText("👑 Volte, campeão!", "Inicie um novo duelo!"),
        "zh" to NotificationText("👑 回来吧，冠军！", "开始一场新的决斗！"),
        "ja" to NotificationText("👑 戻ってこい、チャンピオン！", "新しい決闘を始めよう！"),
        "ko" to NotificationText("👑 돌아와요, 챔피언!", "새로운 결투를 시작하세요!"),
        "ru" to NotificationText("👑 Вернись, чемпион!", "Начни новую дуэль!"),
        "ar" to NotificationText("👑 عد يا بطل!", "ابدأ دوريًا جديدًا!"),
        "id" to NotificationText("👑 Kembali, juara!", "Mulai duel baru!"),
        "nl" to NotificationText("👑 Kom terug, kampioen!", "Start een nieuw duel!"),
        "pl" to NotificationText("👑 Wróć, mistrzu!", "Rozpocznij nowy pojedynek!"),
        "th" to NotificationText("👑 กลับมาเลย แชมป์!", "เริ่มการดวลใหม่!"),
        "vi" to NotificationText("👑 Quay lại đi, nhà vô địch!", "Bắt đầu một trận đấu mới!"),
        "el" to NotificationText("👑 Επέστρεψε, πρωταθλητή!", "Ξεκίνα μια νέα μάχη!"),
        "cs" to NotificationText("👑 Vrať se, šampione!", "Zahaj nový souboj!"),
        "tl" to NotificationText("👑 Bumalik ka, kampeon!", "Simulan ang isang bagong duel!"),
        "hi" to NotificationText("👑 वापस आओ, चैंपियन!", "एक नया द्वंद्व शुरू करो!")
    )

    /**
     * Cihaz dilini algılayıp ilgili aşamanın metnini döndürür.
     * Dil bulunamazsa İngilizce (EN) fallback kullanılır.
     */
    fun get(stage: String): NotificationText {
        val lang = Locale.getDefault().language.lowercase()
        val map = when (stage) {
            STAGE_DAY1 -> day1
            STAGE_DAY3 -> day3
            STAGE_DAY7 -> day7
            else -> day1
        }
        return map[lang] ?: map["en"]!!
    }
}
