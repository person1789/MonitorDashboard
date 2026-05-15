# iPhone 17 Pro — Study Dock Setup Guide (Live Sync)

## Overview

Your iPhone is now a **live, cloud-synced study companion display**. Since we're using Firebase, you **no longer need to run a local server or find your IP address**. It works over the internet from anywhere.

---

## Quick Start (3 minutes)

### Step 1: Open the Dashboard on your PC
1. Navigate to your live dashboard URL (e.g., `https://person1789.github.io/MonitorDashboard/`).
2. You'll see the minimal focus icon (crosshair) in the bottom-right corner.

### Step 2: Open the Study Dock on your iPhone
1. Open **Safari** on your iPhone.
2. Navigate to: `https://person1789.github.io/MonitorDashboard/phone.html`
3. You should see the **Idle Dock** screen with a large clock.

### Step 3: Add to Home Screen (Fullscreen)
1. Tap the **Share** button (square with arrow) in Safari.
2. Scroll down and tap **"Add to Home Screen"**.
3. Name it **"Study Dock"** and tap **Add**.
4. Open the new "Study Dock" app from your Home Screen — it will now run in **fullscreen mode** (no browser bars).

### Step 4: Dock & Focus
1. Place your iPhone **horizontally** on your desk charger/dock.
2. On your PC dashboard, click the **Focus icon** → choose a subject → click **Start Session**.
3. Your phone will instantly transform into the **Active Study Display**.

---

## Pro Tips

### 1. Prevent Screen Dimming
The Study Dock uses the **Wake Lock API** to try and keep the screen on, but iOS is strict. For the best experience:
- Go to **Settings → Display & Brightness → Auto-Lock** and set it to **Never** while studying.
- **Low Power Mode** should be **OFF**, as it can force the screen to dim.

### 2. Guided Access (Deep Focus)
If you want to prevent yourself from leaving the study screen:
1. Go to **Settings → Accessibility → Guided Access** and turn it on.
2. While in the Study Dock app, **triple-click the side button**.
3. This locks the phone into the Study Dock so you can't check other apps until your session is over.

---

## How it Works (Technical)

- **Firebase Realtime Database**: Acts as the "bridge" between your PC and phone. When you click Start on the PC, it writes a small packet of data to the cloud. Your phone is "listening" for that packet and updates its screen instantly.
- **Cloud Sync**: Because it's in the cloud, you could even start a session from a different computer (like at the library) and your phone at home would still update.
- **Zero Terminal**: No `npm start`, no `ipconfig`, no local server needed. Just pure web technology.
