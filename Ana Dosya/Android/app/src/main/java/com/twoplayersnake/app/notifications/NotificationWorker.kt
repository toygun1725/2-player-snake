package com.twoplayersnake.app.notifications

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters

/**
 * v3.3.1 — Re-engagement bildirim Worker'ı.
 * INPUT_STAGE parametresine göre (day1 / day3 / day7) doğru metni seçer,
 * cihaz dilini algılar ve bildirimi gösterir.
 */
class NotificationWorker(
    private val context: Context,
    params: WorkerParameters
) : Worker(context, params) {

    override fun doWork(): Result {
        val stage = inputData.getString(INPUT_STAGE) ?: NotificationStrings.STAGE_DAY1

        NotificationHelper.createChannel(context)

        val text = NotificationStrings.get(stage)
        val notificationId = when (stage) {
            NotificationStrings.STAGE_DAY1 -> NotificationStrings.NOTIFICATION_ID_DAY1
            NotificationStrings.STAGE_DAY3 -> NotificationStrings.NOTIFICATION_ID_DAY3
            NotificationStrings.STAGE_DAY7 -> NotificationStrings.NOTIFICATION_ID_DAY7
            else -> NotificationStrings.NOTIFICATION_ID_DAY1
        }

        NotificationHelper.sendNotification(
            context = context,
            title = text.title,
            body = text.body,
            notificationId = notificationId
        )

        return Result.success()
    }

    companion object {
        const val INPUT_STAGE = "stage"

        // WorkManager tag'leri — iptal etmek için kullanılır
        const val TAG_DAY1 = "notif_day1"
        const val TAG_DAY3 = "notif_day3"
        const val TAG_DAY7 = "notif_day7"
    }
}
