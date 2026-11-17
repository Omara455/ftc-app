# Testing on an Android device

The web build is enough for quick layout checks, but at the end of every milestone the app has to run natively. That's the only way to check RTL (forced by the `expo-localization` plugin), the Cairo fonts, the SVG backgrounds, bottom sheets and gestures.

The app uses native modules that Expo Go doesn't include (and Expo Go also resets RTL), so it needs a **development build**: your own debug app with the dev client built in. You build it once, and after that JS changes load over the network. Rebuild only when you add a native package or change `app.json` plugins.

## Option A: EAS cloud build (no Android Studio needed)

One-time setup:
1. `npm install -g eas-cli`
2. `eas login` (create a free Expo account if you don't have one).
3. `eas init` in the repo. It creates the EAS project and writes `extra.eas.projectId` into `app.json`. Commit that change.
4. The Android package name is `com.ftcksu.app` (`android.package` in `app.json`). **⚠️ Confirm it with the club before the first store release.** It can't be changed once the app is published on Google Play.

Each time native code changes:
5. `eas build --profile development --platform android`. It takes about 10–20 minutes, then prints a QR code and a link to an `.apk`.
6. Open the link on the phone and install the APK. Allow installs from unknown sources if Android asks.

Daily use:
7. `npx expo start --dev-client`, then open the FTC dev app on the phone and pick the server, or scan the QR code. The phone and the PC must be on the same Wi-Fi. If they can't be, use `npx expo start --dev-client --tunnel`.

## Option B: Android Studio emulator (local, no account)

1. Install Android Studio. In **SDK Manager**, install an Android SDK, and in **Device Manager**, create a Pixel device (API 34+). Start it.
2. Set `ANDROID_HOME` (usually `%LOCALAPPDATA%\Android\Sdk`) and add `%ANDROID_HOME%\platform-tools` to `PATH`.
3. `npx expo run:android`. It generates `android/` (git-ignored), builds, installs and launches the dev build on the emulator. Use the same command after native changes.
4. After that, `npx expo start --dev-client` is enough for JS changes.

## What to check on the device
- `/dev/kit` (open it from the dev menu, or with a deep link: `adb shell am start -a android.intent.action.VIEW -d "ftcapp://dev/kit"`). Everything should be laid out right-to-left, with chevrons ‹ and back arrows →.
- Cairo at every weight (400–800), the bottom sheet opening and closing with a drag, and toggles animating.
- `+3`, `6 / 25` and emails keep their order inside Arabic text.
- The launcher icon, splash and notification icon (status bar) show the FTC mark.
