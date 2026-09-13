# 2 Player Snake Android

Hybrid Android shell for the live mobile build at:

- `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`

## What this project includes

- Native splash screen with logo animation
- Secure WebView host with trusted top-level navigation only
- Native loading overlay with progress
- Native offline screen with retry
- Connectivity listener with auto reload when the offline screen is active
- JavaScript bridge for gameplay events
- Native haptics for food, collision and game over
- Native settings screen for vibration and sound sync
- Back button handling with exit confirmation
- Fullscreen immersive mode

## Trusted URL rules

The app allows only these top-level game routes inside WebView:

- `https://2playersnake.com/wp-content/uploads/game-mobile/index.html`
- `https://2playersnake.com/wp-content/uploads/game-mobile/...`

Any other top-level navigation is opened in the device browser.

Subresources used by the trusted page can still load normally over HTTPS.

## JS bridge integration

Native bridge object:

- `window.Android.onEatFood(payloadJson)`
- `window.Android.onGameStart(payloadJson)`
- `window.Android.onCollision(payloadJson)`
- `window.Android.onGameOver(payloadJson)`
- `window.Android.emit(payloadJson)`

The app also injects a helper script that exposes:

- `window.TwoPlayerSnakeNative.onEatFood(payload)`
- `window.TwoPlayerSnakeNative.onGameStart(payload)`
- `window.TwoPlayerSnakeNative.onCollision(payload)`
- `window.TwoPlayerSnakeNative.onGameOver(payload)`
- `window.dispatchAndroidGameEvent(name, payload)`

And listens for custom events:

- `two-player-snake:eat-food`
- `two-player-snake:game-start`
- `two-player-snake:collision`
- `two-player-snake:game-over`

Native settings are published back into the page through:

- `window.dispatchNativeSettings({ vibrationEnabled, soundEnabled })`

## Notes

- Package name is `com.twoplayersnake.app`
- This project is staged from the finished mobile web game and intended for Android phones in portrait mode
- The WebView shell is not meant to be a generic browser wrapper; native UX and device integrations are included to make the app feel like a real product

## Shortcut launch reliability (v2.95.3)

- Dynamic launcher shortcuts are maintained in native code:
  - `normal_1p`
  - `fc_2p`
  - `fc_1p_ai`
- App URL loading now always uses `https://2playersnake.com/wp-content/uploads/game-mobile/index.html` as base.
- On each online launch, the app appends a timestamp query (`__ts`) to reduce stale top-level HTML cache.
- The app also appends:
  - `app=android`
  - `app_ver=<versionName>`
  - `app_code=<versionCode>`
  - `shortcut=<id>` when launched from a shortcut

Why this changed:

- The `/mobile` wrapper path could open the game correctly in normal launches, but shortcut query params were not reliably preserved all the way into the real game HTML.
- That caused Android launcher shortcuts to fall back to the normal main menu instead of the intended preset flow.

Result:

- Shortcut opens now target the real mobile game HTML directly.
- Preset shortcut flows can reach the intended `Name & Color` screen without being stripped by an intermediate wrapper page.
- The Android project is aligned for the package as `versionName v3.3.5` / `versionCode 69`.

## Packaging note (v3.3.5 / Code 69)

- Release bundle generation command:
  - `.\gradlew.bat bundleRelease`
- Output paths:
  - `app/build/outputs/bundle/release/app-release.aab`
  - `2PlayerSnake-v3.3.5-release.aab` (Signed Release AAB ready for Google Play Console)
