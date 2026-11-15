# Accero PrintPortal — Cross-Platform PWA Installation Guide

**Target Audience:** Operators, Digital Service Centers, Cyber Cafe Owners, Support Teams  
**Production URL:** [https://printportal.accero.app](https://printportal.accero.app)  

---

## 1. Overview of PWA Installation

Accero PrintPortal can be installed directly onto your desktop or mobile operating system without navigating third-party app stores (Google Play Store, Microsoft Store, or Apple App Store). Installing Accero confers several critical operational benefits for busy digital document centers:

- **Dedicated Desktop Window:** Opens as a clean, distraction-free application without browser address bars, tabs, or bookmarks.
- **Taskbar & Dock Integration:** Pin Accero to your Windows Taskbar, macOS Dock, or Android/iOS Home Screen for 1-click launching.
- **Fast Launch & Precached Assets:** Static application assets load instantly from disk cache, saving bandwidth during peak morning hours.
- **Preserved Printing & Hardware Access:** Seamlessly accesses connected thermal card printers, inkjet PVC tray printers, and system printer dialogs.

---

## 2. Windows 10 & Windows 11 Installation

### Method A: Using Google Chrome
1. Open Google Chrome and navigate to [https://printportal.accero.app](https://printportal.accero.app).
2. Look at the right side of the Chrome address bar for the **Install Icon** (a small computer monitor with an arrow pointing down).
3. Alternatively, click the floating **"Install App"** card in the bottom-right corner of the Accero portal.
4. When prompted with *"Install app: Accero PrintPortal?"*, click **Install**.
5. Accero will open in its own standalone window. A desktop shortcut will be created automatically.
6. *(Recommended)* Right-click the Accero icon on your Windows Taskbar and select **"Pin to taskbar"**.

### Method B: Using Microsoft Edge
1. Open Microsoft Edge and navigate to [https://printportal.accero.app](https://printportal.accero.app).
2. Click the **App Available** icon in the address bar (three squares and a plus icon) or click Edge menu (`...`) &rarr; **Apps** &rarr; **Install Accero PrintPortal**.
3. In the confirmation dialog, check the options you prefer:
   - *Pin to taskbar*
   - *Pin to Start*
   - *Create Desktop shortcut*
4. Click **Allow**. Accero is now installed as a native Windows application.

---

## 3. macOS Installation

### Method A: Using Google Chrome or Microsoft Edge on Mac
1. Open Chrome or Edge on macOS and visit [https://printportal.accero.app](https://printportal.accero.app).
2. Click the **Install** button in the address bar or the floating Accero install banner.
3. Click **Install**.
4. Accero will be placed inside your `~/Applications/Chrome Apps/` folder and appear in your macOS Launchpad and Dock.

### Method B: Using Safari (macOS Sonoma 14+ / "Add to Dock")
1. Open Apple Safari and navigate to [https://printportal.accero.app](https://printportal.accero.app).
2. In the top Safari menu bar, click **File** &rarr; **Add to Dock...**.
3. Confirm the application title: `Accero PrintPortal` and icon.
4. Click **Add**.
5. Accero now launches from your macOS Dock as an independent Mac app with its own isolated window and native window controls.

---

## 4. Android Mobile & Tablet Installation

### Using Google Chrome on Android
1. Open Google Chrome on your Android smartphone or tablet and navigate to [https://printportal.accero.app](https://printportal.accero.app).
2. A bottom banner will surface: **"Install Accero PrintPortal"**. Tap **Install App**.
3. If the banner was dismissed, tap the three-dot menu (`⋮`) in the top right of Chrome and select **"Install app"** (or **"Add to Home screen"**).
4. Tap **Install** in the system modal.
5. Android will add the adaptive high-resolution Accero maskable icon to your Home Screen and App Drawer.

---

## 5. iOS and iPadOS Installation (iPhone & iPad)

Apple Safari on iOS does not support the automated JavaScript `beforeinstallprompt` installation event. Follow these standard Apple WebClip installation steps:

1. Open **Apple Safari** on your iPhone or iPad. *(Note: Must be Safari; Chrome and Firefox on iOS cannot install PWAs).*
2. Navigate to [https://printportal.accero.app](https://printportal.accero.app).
3. If the Accero prompt appears, tap **"How to Install on iPhone"** to view on-screen visual guides.
4. Tap the **Share** button in the bottom Safari toolbar (the square icon with an upward-pointing arrow).
5. In the iOS share sheet, scroll down and tap **"Add to Home Screen"** (marked with a `+` inside a square).
6. Verify the icon and name (`Accero`), then tap **Add** in the top-right corner.
7. An official Accero icon is placed on your iOS Home Screen. When tapped, it opens in full-screen standalone mode with no Safari address bar or navigation buttons.

---

## 6. Installation Troubleshooting & Verification

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| **Install button does not appear in Chrome/Edge** | App is already installed or running inside standalone window. | Check your Windows Start menu or macOS Launchpad for "Accero PrintPortal". |
| **"Add to Home Screen" missing on iPhone** | Page opened inside an in-app browser (e.g. WhatsApp, Facebook) or Chrome for iOS. | Tap the compass icon in the bottom corner to open in native Apple Safari. |
| **Prompt dismissed accidentally** | Dismissal sets a 7-day cooldown cookie. | Clear browser site data for `printportal.accero.app` or use the browser address bar install icon. |
| **Incomplete layout after installation** | Device was offline during first launch. | Reconnect to internet and click "Retry Connection" to download initial application assets. |
