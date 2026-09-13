package com.twoplayersnake.app

import android.app.Application
import android.content.ComponentCallbacks2
import com.google.android.gms.games.PlayGamesSdk

/**
 * v3.3.2 — Application sınıfı oluşturuldu.
 *
 * Google'ın Play Games Services v2 dokümantasyonu, PlayGamesSdk.initialize()'ın
 * Application.onCreate()'den çağrılmasını şart koşuyor; Activity'den çağrılması
 * Activity yeniden yaratıldığında SDK'nın yeniden başlatılmasına ve
 * "Play Games profili seçin" popup'ının tekrar çıkmasına neden oluyordu.
 *
 * Quality Update: onTrimMemory ve onLowMemory ile sistem geneli bellek optimizasyonu eklendi.
 */
class SnakeApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        // Play Games Services SDK'sını tek seferlik başlat.
        // applicationContext kullanılarak uzun ömürlü context ile başlatılır.
        PlayGamesSdk.initialize(this)
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        if (level >= ComponentCallbacks2.TRIM_MEMORY_BACKGROUND) {
            System.gc()
        }
    }

    override fun onLowMemory() {
        super.onLowMemory()
        System.gc()
    }
}
