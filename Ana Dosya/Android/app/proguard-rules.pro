# Javascript interface methods used by WebView
-keepattributes JavascriptInterface
-keepclassmembers class com.twoplayersnake.app.bridge.GameJavascriptBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# WorkManager Worker classes instantiated via reflection
-keep class com.twoplayersnake.app.notifications.NotificationWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# RevenueCat
-dontwarn com.revenuecat.purchases.**
-keep class com.revenuecat.purchases.** { *; }

# Google Play Services
-dontwarn com.google.android.gms.**
