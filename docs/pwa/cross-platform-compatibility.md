# Accero PrintPortal — Cross-Platform Compatibility Specification

**Platforms Evaluated:** Windows 10/11, macOS (Ventura/Sonoma+), Android 12+, iOS/iPadOS 16+  
**Target Browsers:** Google Chrome, Microsoft Edge, Apple Safari  

---

## 1. Operating System Compatibility Matrix

| Feature / Capability | Windows 10/11 (Chrome/Edge) | macOS (Chrome/Edge/Safari) | Android (Chrome/Samsung) | iOS / iPadOS (Safari) |
| :--- | :---: | :---: | :---: | :---: |
| **PWA Installability** | Direct Browser Prompt | Direct Prompt (Chrome) / Add to Dock (Safari) | Direct Prompt / Bottom Sheet | Manual "Add to Home Screen" |
| **Standalone Window** | Dedicated native window with custom title bar | Dedicated window without tab bar | Fullscreen with themed status bar | Fullscreen standalone WebClip |
| **Taskbar / Dock Pinning** | Supported (Right-click pin) | Supported (Dock pinning) | Supported (Home Screen / Drawer) | Supported (Home Screen) |
| **App Shortcuts** | Right-click jump list | Right-click Dock menu | Long-press icon menu | Long-press icon menu (iOS 16+) |
| **Maskable Icon Support** | Not applicable | Not applicable | Adaptive squircle/circle | Standard rounded rect (Apple WebClip) |
| **Offline Fallback** | Precached `/offline` | Precached `/offline` | Precached `/offline` | Precached `/offline` |
| **Background Updates** | Supported (`updatefound`) | Supported (`updatefound`) | Supported (`updatefound`) | Supported on page reopen |
| **PDF Export (jsPDF)** | Direct file download | Direct file download | Android Download Manager | Safari Share Sheet / Save to Files |
| **Dual PVC Tray Print** | `@media print` dialog | System Print / AirPrint dialog | System Print / OTG driver | AirPrint / Share Sheet |
| **Safe Area Insets** | Not required | Not required | Handled via viewport | Required (`env(safe-area-inset)`) |

---

## 2. Platform-Specific Implementation Details

### 2.1 Windows 10 and Windows 11
- **Engine:** Chromium (Google Chrome & Microsoft Edge).
- **Window Appearance:** Runs in a dedicated native window using the window controls overlay. Title bar colors inherit `theme_color: #8B1E2D`.
- **Hardware Printing:** Full support for local and networked printer drivers. Windows print dialog seamlessly receives `@media print` directives for custom paper sizes (e.g., dual-card tray dimensions: `171.2mm × 53.98mm`).
- **File Downloads:** High-DPI PDFs (`card_print.pdf`) save directly into the operator's default `Downloads` folder.

### 2.2 macOS (Chrome, Edge & Safari)
- **Engine:** Chromium and WebKit.
- **Window Appearance:** Seamless standalone application window. In Safari (macOS Sonoma 14+), "Add to Dock" generates a first-class Mac application container with individual cookie storage and separate notification settings.
- **Color Representation:** Displays high-contrast RGB palette accurately on Retina and Display P3 screens.
- **Printing:** Direct integration with macOS system print dialog, AirPrint, and CUPS printing services.

### 2.3 Android (Chrome & Chromium-Based Browsers)
- **Engine:** Blink / Chromium.
- **Icon Rendering:** Android's launcher automatically clips `icon-maskable-192.png` and `icon-maskable-512.png` into device-specific shapes (Samsung squircles, Google Pixel circles) without cutting off the central Accero brand mark.
- **Status Bar Integration:** Android status bar automatically tints to `#8B1E2D` (Imperial Burgundy), matching application branding.
- **Navigation Ergonomics:** Android back button navigates internal Next.js router history before closing the application.

### 2.4 iOS and iPadOS (Apple Safari)
- **Engine:** WebKit.
- **Status Bar Appearance:** Configured via `apple-mobile-web-app-status-bar-style: default` to ensure contrast across light and dark system appearances.
- **Safe Area Handling:** Root layout respects iPhone notch and dynamic island safe areas using `viewportFit: 'cover'` and CSS safe area environment variables:
  ```css
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  ```
- **iPadOS Split View:** Responsive layout gracefully scales the split-screen Studio editor between 50/50 desktop split and stacked mobile layouts depending on the active iPad multitask window size.

---

## 3. Physical Card Printing & Hardware Constraints

A critical objective of Accero PrintPortal is maintaining high fidelity for physical PVC card printing. Progressive Web Apps interact with printing hardware via the standard browser print subsystem (`window.print()` and `@media print`).

### What PWAs Can Do
- Invoke system printer dialogs with precise CSS dimensions (`@page { size: auto; margin: 0; }`).
- Suppress browser headers, footers, URLs, and background page chrome.
- Export high-DPI 300+ DPI vector-rasterized PDFs using `html2canvas` (scale: 3) and `jspdf`.
- Render bilingual Google Fonts (`Hind`) and regional scripts without requiring local font installation on the host machine.

### What PWAs Cannot Do (Known Industry Limitations)
1. **Silent Background Printing:** Modern operating systems and browsers deliberately prohibit websites and PWAs from printing silently in the background without explicit user confirmation, preventing printer hijacking or paper waste.
2. **Direct USB/Bluetooth Low-Level Printer Control:** WebUSB and Web Bluetooth are restricted and not supported across all browsers (especially iOS Safari). Accero relies on the OS print driver stack rather than custom proprietary printer protocols.
3. **Automatic Card Tray Feeder Commands:** Direct dual-card PVC tray commands require the operator to select the appropriate tray paper preset (e.g., *Tray 1 / CD-DVD Tray*) in the printer driver settings.
