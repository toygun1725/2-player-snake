package com.twoplayersnake.app.ui

import java.util.Locale

object AppStrings {

    private val supportedLanguages = setOf(
        "en", "tr", "de", "fr", "es", "it", "pt", "zh", "ja", "ko",
        "ru", "ar", "id", "nl", "pl", "th", "vi", "el", "cs", "tl", "hi"
    )

    val currentLanguageCode: String
        get() {
            val raw = Locale.getDefault().language.lowercase(Locale.ROOT)
            val normalized = when {
                raw == "fil" -> "tl"
                raw == "in" -> "id"
                raw.startsWith("zh") -> "zh"
                raw.startsWith("pt") -> "pt"
                else -> raw.take(2)
            }
            return if (supportedLanguages.contains(normalized)) normalized else "en"
        }

    object IAP {
        private val removeAdsTitles = mapOf(
            "en" to "👑 Ads Removed!",
            "tr" to "👑 Reklamlar Kaldırıldı!",
            "de" to "👑 Werbung entfernt!",
            "fr" to "👑 Publicités supprimées !",
            "es" to "👑 ¡Anuncios eliminados!",
            "it" to "👑 Annunci rimossi!",
            "pt" to "👑 Anúncios removidos!",
            "zh" to "👑 已移除广告！",
            "ja" to "👑 広告が削除されました！",
            "ko" to "👑 광고가 제거되었습니다!",
            "ru" to "👑 Реклама отключена!",
            "ar" to "👑 تمت إزالة الإعلانات!",
            "id" to "👑 Iklan Dihapus!",
            "nl" to "👑 Advertenties verwijderd!",
            "pl" to "👑 Reklamy usunięte!",
            "th" to "👑 ลบโฆษณาแล้ว!",
            "vi" to "👑 Đã xóa quảng cáo!",
            "el" to "👑 Οι διαφημίσεις αφαιρέθηκαν!",
            "cs" to "👑 Reklamy odstraněny!",
            "tl" to "👑 Tinanggal ang mga Ad!",
            "hi" to "👑 विज्ञापन हटा दिए गए!"
        )

        private val removeAdsMessages = mapOf(
            "en" to "Thank you! Enjoy your ad-free experience.",
            "tr" to "Teşekkürler! Artık reklamsız bir deneyimin tadını çıkarabilirsin.",
            "de" to "Danke! Genieße dein werbefreies Spielerlebnis.",
            "fr" to "Merci ! Profitez de votre expérience sans publicité.",
            "es" to "¡Gracias! Disfruta de tu experiencia sin anuncios.",
            "it" to "Grazie! Goditi la tua esperienza senza pubblicità.",
            "pt" to "Obrigado! Aproveite sua experiência sem anúncios.",
            "zh" to "谢谢！享受无广告的游戏体验。",
            "ja" to "ありがとうございます！広告なしでお楽しみください。",
            "ko" to "감사합니다! 광고 없이 게임을 즐겨보세요.",
            "ru" to "Спасибо! Наслаждайтесь игрой без рекламы.",
            "ar" to "شكراً لك! استمتع بتجربة خالية من الإعلانات.",
            "id" to "Terima kasih! Nikmati pengalaman tanpa iklan.",
            "nl" to "Bedankt! Geniet van je advertentievrije ervaring.",
            "pl" to "Dziękujemy! Ciesz się grą bez reklam.",
            "th" to "ขอบคุณ! สนุกกับเกมแบบไม่มีโฆษณา",
            "vi" to "Cảm ơn bạn! Tận hưởng trải nghiệm không có quảng cáo.",
            "el" to "Ευχαριστούμε! Απολαύστε την εμπειρία χωρίς διαφημίσεις.",
            "cs" to "Děkujeme! Užijte si hru bez reklam.",
            "tl" to "Salamat! Masiyahan sa iyong ad-free na karanasan.",
            "hi" to "धन्यवाद! विज्ञापन-मुक्त अनुभव का आनंद लें।"
        )

        private val awesomeButtons = mapOf(
            "en" to "Awesome!",
            "tr" to "Harika!",
            "de" to "Super!",
            "fr" to "Génial !",
            "es" to "¡Genial!",
            "it" to "Fantastico!",
            "pt" to "Incrível!",
            "zh" to "太棒了！",
            "ja" to "最高！",
            "ko" to "좋아요!",
            "ru" to "Отлично!",
            "ar" to "رائع!",
            "id" to "Hebat!",
            "nl" to "Geweldig!",
            "pl" to "Świetnie!",
            "th" to "ยอดเยี่ยม!",
            "vi" to "Tuyệt vời!",
            "el" to "Τέλεια!",
            "cs" to "Skvělé!",
            "tl" to "Galing!",
            "hi" to "शानदार!"
        )

        private val okButtons = mapOf(
            "en" to "OK",
            "tr" to "Tamam",
            "de" to "OK",
            "fr" to "OK",
            "es" to "Aceptar",
            "it" to "OK",
            "pt" to "OK",
            "zh" to "好的",
            "ja" to "OK",
            "ko" to "확인",
            "ru" to "ОК",
            "ar" to "حسناً",
            "id" to "OK",
            "nl" to "OK",
            "pl" to "OK",
            "th" to "ตกลง",
            "vi" to "OK",
            "el" to "OK",
            "cs" to "OK",
            "tl" to "OK",
            "hi" to "ठीक है"
        )

        private val errorTitles = mapOf(
            "en" to "Error",
            "tr" to "Hata",
            "de" to "Fehler",
            "fr" to "Erreur",
            "es" to "Error",
            "it" to "Errore",
            "pt" to "Erro",
            "zh" to "错误",
            "ja" to "エラー",
            "ko" to "오류",
            "ru" to "Ошибка",
            "ar" to "خطأ",
            "id" to "Kesalahan",
            "nl" to "Fout",
            "pl" to "Błąd",
            "th" to "ข้อผิดพลาด",
            "vi" to "Lỗi",
            "el" to "Σφάλμα",
            "cs" to "Chyba",
            "tl" to "Error",
            "hi" to "त्रुटि"
        )

        private val purchaseFailedPrefixes = mapOf(
            "en" to "Purchase failed",
            "tr" to "Satın alma başarısız",
            "de" to "Kauf fehlgeschlagen",
            "fr" to "Échec de l'achat",
            "es" to "Compra fallida",
            "it" to "Acquisto non riuscito",
            "pt" to "Falha na compra",
            "zh" to "购买失败",
            "ja" to "購入に失敗しました",
            "ko" to "구매 실패",
            "ru" to "Ошибка покупки",
            "ar" to "فشلت عملية الشراء",
            "id" to "Pembelian gagal",
            "nl" to "Aankoop mislukt",
            "pl" to "Zakup nie powiódł się",
            "th" to "การซื้อล้มเหลว",
            "vi" to "Giao dịch mua thất bại",
            "el" to "Η αγορά απέτυχε",
            "cs" to "Nákup se nezdařil",
            "tl" to "Nabigo ang pagbili",
            "hi" to "खरीद विफल रही"
        )

        private val restoreTitles = mapOf(
            "en" to "Restore Purchases",
            "tr" to "Satın Alımları Geri Yükle",
            "de" to "Käufe wiederherstellen",
            "fr" to "Restaurer les achats",
            "es" to "Restaurar compras",
            "it" to "Ripristina acquisti",
            "pt" to "Restaurar compras",
            "zh" to "恢复购买",
            "ja" to "購入を復元",
            "ko" to "구매 항목 복원",
            "ru" to "Восстановить покупки",
            "ar" to "استعادة المشتريات",
            "id" to "Pulihkan Pembelian",
            "nl" to "Aankopen herstellen",
            "pl" to "Przywróć zakupy",
            "th" to "กู้คืนการซื้อ",
            "vi" to "Khôi phục giao dịch mua",
            "el" to "Επαναφορά αγορών",
            "cs" to "Obnovit nákupy",
            "tl" to "I-restore ang mga Binili",
            "hi" to "खरीद बहाल करें"
        )

        private val restoreSuccessMessages = mapOf(
            "en" to "👑 Your ad-free purchase has been successfully restored!",
            "tr" to "👑 Reklamsız satın alımın başarıyla geri yüklendi!",
            "de" to "👑 Dein werbefreier Kauf wurde erfolgreich wiederhergestellt!",
            "fr" to "👑 Votre achat sans publicité a été restauré avec succès !",
            "es" to "👑 ¡Tu compra sin anuncios se ha restaurado con éxito!",
            "it" to "👑 Il tuo acquisto senza pubblicità è stato ripristinato con successo!",
            "pt" to "👑 Sua compra sem anúncios foi restaurada com sucesso!",
            "zh" to "👑 您的无广告购买已成功恢复！",
            "ja" to "👑 広告なしの購入が正常に復元されました！",
            "ko" to "👑 광고 제거 구매가 성공적으로 복원되었습니다!",
            "ru" to "👑 Ваша покупка отключения рекламы успешно восстановлена!",
            "ar" to "👑 تمت استعادة عملية الشراء بدون إعلانات بنجاح!",
            "id" to "👑 Pembelian bebas iklan berhasil dipulihkan!",
            "nl" to "👑 Je advertentievrije aankoop is succesvol hersteld!",
            "pl" to "👑 Twój zakup bez reklam został pomyślnie przywrócony!",
            "th" to "👑 กู้คืนการซื้อแบบไม่มีโฆษณาเรียบร้อยแล้ว!",
            "vi" to "👑 Giao dịch mua không quảng cáo của bạn đã được khôi phục thành công!",
            "el" to "👑 Η αγορά σας χωρίς διαφημίσεις αποκαταστάθηκε με επιτυχία!",
            "cs" to "👑 Váš nákup bez reklam byl úspěšně obnoven!",
            "tl" to "👑 Matagumpay na na-restore ang iyong ad-free na binili!",
            "hi" to "👑 आपकी विज्ञापन-मुक्त खरीद सफलतापूर्वक बहाल कर दी गई है!"
        )

        private val restoreNotFoundMessages = mapOf(
            "en" to "No previous ad-free purchase was found for this Google Play account.",
            "tr" to "Bu Google Play hesabında daha önce reklam kaldırma satın alımı bulunamadı.",
            "de" to "Für dieses Google Play-Konto wurde kein vorheriger werbefreier Kauf gefunden.",
            "fr" to "Aucun achat sans publicité antérieur n'a été trouvé pour ce compte Google Play.",
            "es" to "No se encontró ninguna compra anterior sin anuncios para esta cuenta de Google Play.",
            "it" to "Nessun acquisto senza pubblicità precedente trovato per questo account Google Play.",
            "pt" to "Nenhuma compra anterior sem anúncios foi encontrada para esta conta do Google Play.",
            "zh" to "此 Google Play 账户未找到以前的无广告购买记录。",
            "ja" to "この Google Play アカウントには以前の広告なしの購入が見つかりませんでした。",
            "ko" to "이 Google Play 계정에서 이전 광고 제거 구매 내역을 찾을 수 없습니다.",
            "ru" to "Для этого аккаунта Google Play не найдено предыдущих покупок отключения рекламы.",
            "ar" to "لم يتم العثور على مشتريات سابقة لإزالة الإعلانات لهذا الحساب.",
            "id" to "Tidak ditemukan pembelian bebas iklan sebelumnya untuk akun Google Play ini.",
            "nl" to "Er is geen eerdere advertentievrije aankoop gevonden voor dit Google Play-account.",
            "pl" to "Dla tego konta Google Play nie znaleziono wcześniejszego zakupu bez reklam.",
            "th" to "ไม่พบประวัติการซื้อแบบไม่มีโฆษณาก่อนหน้าสำหรับบัญชี Google Play นี้",
            "vi" to "Không tìm thấy giao dịch mua không quảng cáo nào trước đây cho tài khoản Google Play này.",
            "el" to "Δεν βρέθηκε προηγούμενη αγορά χωρίς διαφημίσεις για αυτόν τον λογαριασμό Google Play.",
            "cs" to "Pro tento účet Google Play nebyl nalezen žádný předchozí nákup bez reklam.",
            "tl" to "Walang nakitang dating ad-free na binili para sa Google Play account na ito.",
            "hi" to "इस Google Play खाते के लिए कोई पूर्व विज्ञापन-मुक्त खरीद नहीं मिली।"
        )

        private val restoreFailedPrefixes = mapOf(
            "en" to "Purchases could not be restored",
            "tr" to "Satın alımlar geri yüklenemedi",
            "de" to "Käufe konnten nicht wiederhergestellt werden",
            "fr" to "Impossible de restaurer les achats",
            "es" to "No se pudieron restaurar las compras",
            "it" to "Impossibile ripristinare gli acquisti",
            "pt" to "Não foi possível restaurar as compras",
            "zh" to "无法恢复购买",
            "ja" to "購入を復元できませんでした",
            "ko" to "구매 항목을 복원할 수 없습니다",
            "ru" to "Не удалось восстановить покупки",
            "ar" to "تعذرت استعادة المشتريات",
            "id" to "Gagal memulihkan pembelian",
            "nl" to "Aankopen konden niet worden hersteld",
            "pl" to "Nie można przywrócić zakupów",
            "th" to "ไม่สามารถกู้คืนการซื้อได้",
            "vi" to "Không thể khôi phục giao dịch mua",
            "el" to "Δεν ήταν δυνατή η επαναφορά των αγορών",
            "cs" to "Nákupy se nepodařilo obnovit",
            "tl" to "Hindi ma-restore ang mga binili",
            "hi" to "खरीद बहाल नहीं की जा सकी"
        )

        private val packageNotFoundMessages = mapOf(
            "en" to "Purchase package not found. Please try again later.",
            "tr" to "Satın alma paketi bulunamadı. Lütfen daha sonra tekrar deneyin.",
            "de" to "Kaufpaket nicht gefunden. Bitte versuchen Sie es später erneut.",
            "fr" to "Pack d'achat introuvable. Veuillez réessayer plus tard.",
            "es" to "Paquete de compra no encontrado. Inténtalo de nuevo más tarde.",
            "it" to "Pacchetto di acquisto non trovato. Riprova più tardi.",
            "pt" to "Pacote de compra não encontrado. Tente novamente mais tarde.",
            "zh" to "未找到购买项目，请稍后重试。",
            "ja" to "購入パッケージが見つかりませんでした。後でもう一度お試しください。",
            "ko" to "구매 상품을 찾을 수 없습니다. 나중에 다시 시도해 주세요.",
            "ru" to "Пакет покупки не найден. Пожалуйста, повторите попытку позже.",
            "ar" to "حزمة الشراء غير موجودة. يرجى المحاولة مرة أخرى لاحقاً.",
            "id" to "Paket pembelian tidak ditemukan. Silakan coba lagi nanti.",
            "nl" to "Aankooppakket niet gevonden. Probeer het later opnieuw.",
            "pl" to "Pakiet zakupu nie został znaleziony. Spróbuj ponownie później.",
            "th" to "ไม่พบแพ็กเกจการซื้อ โปรดลองใหม่อีกครั้งในภายหลัง",
            "vi" to "Không tìm thấy gói mua. Vui lòng thử lại sau.",
            "el" to "Το πακέτο αγοράς δεν βρέθηκε. Δοκιμάστε ξανά αργότερα.",
            "cs" to "Nákupní balíček nebyl nalezen. Zkuste to prosím později.",
            "tl" to "Hindi nahanap ang purchase package. Pakisubukang muli mamaya.",
            "hi" to "खरीद पैकेज नहीं मिला। कृपया बाद में पुनः प्रयास करें।"
        )

        val removeAdsSuccessTitle: String
            get() = removeAdsTitles[currentLanguageCode] ?: removeAdsTitles.getValue("en")

        val removeAdsSuccessMessage: String
            get() = removeAdsMessages[currentLanguageCode] ?: removeAdsMessages.getValue("en")

        val awesomeButton: String
            get() = awesomeButtons[currentLanguageCode] ?: awesomeButtons.getValue("en")

        val okButton: String
            get() = okButtons[currentLanguageCode] ?: okButtons.getValue("en")

        val errorTitle: String
            get() = errorTitles[currentLanguageCode] ?: errorTitles.getValue("en")

        fun purchaseFailedMessage(error: String): String {
            val prefix = purchaseFailedPrefixes[currentLanguageCode] ?: purchaseFailedPrefixes.getValue("en")
            return "$prefix: $error"
        }

        val restoreTitle: String
            get() = restoreTitles[currentLanguageCode] ?: restoreTitles.getValue("en")

        val restoreSuccessMessage: String
            get() = restoreSuccessMessages[currentLanguageCode] ?: restoreSuccessMessages.getValue("en")

        val restoreNotFoundMessage: String
            get() = restoreNotFoundMessages[currentLanguageCode] ?: restoreNotFoundMessages.getValue("en")

        fun restoreFailedMessage(error: String): String {
            val prefix = restoreFailedPrefixes[currentLanguageCode] ?: restoreFailedPrefixes.getValue("en")
            return "$prefix: $error"
        }

        val packageNotFoundMessage: String
            get() = packageNotFoundMessages[currentLanguageCode] ?: packageNotFoundMessages.getValue("en")
    }
}
