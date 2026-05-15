# iPhone 17 Pro — Study Standby Dock Integration

## Overview

Turn your iPhone 17 Pro into a **dedicated study companion display** when it's docked horizontally on your desk. The Raspberry Pi dashboard acts as the **controller** — when you start a study/deep work session on the dashboard, it broadcasts a signal to your phone. Your phone, running a custom web page from the Pi, transforms into a clean, landscape-oriented **Study Standby screen** showing your active timer, current task, and subject — no notifications, no distractions.

This is **not** triggered by charging. It's triggered **manually** from the dashboard when you're ready to focus.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Same Wi-Fi Network                           │
│                                                                      │
│  ┌─────────────────────┐                ┌────────────────────────┐   │
│  │  Samsung Monitor     │                │  iPhone 17 Pro         │   │
│  │  (Chromium Kiosk)    │                │  (Safari, landscape)   │   │
│  │                      │                │                        │   │
│  │  Full Dashboard      │                │  Opens:                │   │
│  │  - Pomodoro timer    │    SSE push    │  http://pi:3000/phone  │   │
│  │  - 90-day plan       │ ─────────────▶ │                        │   │
│  │  - Click "Focus"     │                │  Shows study standby   │   │
│  │                      │                │  screen when active    │   │
│  └──────────┬───────────┘                └────────────┬───────────┘   │
│             │                                         │               │
│             │         ┌──────────────────┐            │               │
│             └────────▶│  Node.js Server  │◀───────────┘               │
│                       │  (Express :3000) │                            │
│                       │                  │                            │
│                       │  Serves both:    │                            │
│                       │  /       → dash  │                            │
│                       │  /phone  → phone │                            │
│                       │  /api/events SSE │                            │
│                       └──────────────────┘                            │
└──────────────────────────────────────────────────────────────────────┘
```

**How it works:**
1. Your iPhone opens `http://<pi-ip>:3000/phone` in Safari and you "Add to Home Screen" for fullscreen.
2. The phone page connects to the Pi's `/api/events` SSE stream and waits.
3. On the dashboard, you click the **"🎯 Focus"** button (or the Pomodoro timer starts).
4. The server broadcasts a `study-mode` event with session details (subject, task, timer).
5. The phone's page receives it and transitions into the Study Standby display.
6. When you end the session on the dashboard, another event fires and the phone returns to its idle dock screen.

---

## Part 1: Local Node.js Server

### [NEW] `server.js`

Express server with SSE broadcast. Serves two frontends and manages study session state.

```
Endpoint                     Method   Purpose
────────────────────────────────────────────────────────────────
/                            GET      Serve main dashboard (index.html)
/phone                       GET      Serve phone standby page (phone.html)
/api/events                  GET      SSE stream — both dashboard and phone connect here
/api/study                   POST     Dashboard sends this to start/stop a study session
/api/status                  GET      Returns current study session state (for reconnects)
```

**POST /api/study body:**
```json
{
  "active": true,
  "subject": "Physics",
  "task": "Lagrangian Mechanics — Ch. 7 Problems",
  "timerMinutes": 25,
  "timerEnd": 1718500500000
}
```

**SSE broadcast payload:**
```json
{ "type": "study", "active": true, "subject": "Physics", "task": "...", "timerEnd": 1718500500000 }
```

On `"active": false`, the phone returns to its idle dock screen.

The server stores the current session in memory so that if the phone reconnects (e.g., Safari refreshes), it can call `GET /api/status` and immediately show the correct state.

### [NEW] `package.json`

```json
{
  "name": "command-center",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "cors": "^2.8.5"
  }
}
```

---

## Part 2: Phone Standby Page (Landscape)

### [NEW] `phone.html`

A self-contained HTML page designed exclusively for **landscape iPhone 17 Pro** (2796 × 1290 logical, but the key dimensions are the Safari viewport in landscape fullscreen, roughly 852 × 393 points).

The page has **two states**:

### State A: Idle Dock (no active study session)

A minimal, ambient screen for when the phone is docked but you haven't started studying yet.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│       2:47 PM              Thursday, May 15             73°F ☀️     │
│                                                                     │
│                     ┌─────────────────────────┐                     │
│                     │   🎯  Day 14 of 90      │                     │
│                     └─────────────────────────┘                     │
│                                                                     │
│                       Dock ready. Start a                           │
│                      session from dashboard.                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- Background: near-black (`#080816`) matching the dashboard
- Clock: `3.5rem`, weight 200, left-aligned
- Date: `1rem`, centered
- Weather: `1rem`, right-aligned (pulled from server or localStorage)
- All three on the same horizontal row (landscape-optimized)
- Day badge centered below
- Hint text: `0.7rem`, `--text-tertiary`, fades with a pulse

### State B: Active Study Session

Triggered when the SSE `study` event arrives with `active: true`. A focused, dramatic display.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ┌──────────┐                                                      │
│   │ PHYSICS  │                                                      │  ← Subject badge, accent color
│   └──────────┘                                                      │
│                                                                     │
│        18 : 42                                                      │  ← Countdown timer, 5rem, mono, ticking
│                                                                     │
│   Lagrangian Mechanics — Ch. 7 Problems                             │  ← Task name, 1.1rem
│                                                                     │
│   ═══════════════════════════════░░░░░░░░░░                         │  ← Progress bar (time elapsed / total)
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Design details:**
- Subject badge uses the existing dashboard accent colors (`--accent-physics`, `--accent-math`, etc.)
- Timer: `font-size: 5rem; font-weight: 300; font-variant-numeric: tabular-nums; font-family: var(--font-mono)`
- Timer calculates the remaining seconds from `timerEnd - Date.now()` (synced to the Pi's Pomodoro)
- When timer reaches 0, the display flashes gently and shows "Session Complete ✓"
- Progress bar: thin (4px), rounded, uses the subject accent color, animates smoothly
- Background shifts to have a subtle subject-colored glow (e.g., a dim blue orb for Physics) to visually differentiate subjects
- Transition between states: `0.6s` fade with a slight vertical slide

### [NEW] `css/phone.css`

Embedded directly inside `phone.html` (single-file for simplicity). Includes:
- `@viewport` and meta tags to lock landscape, prevent zoom, prevent bounce scroll
- `.phone-idle` and `.phone-active` state containers
- Timer typography
- Subject badge colors (reuse the same hex values from `theme.css`)
- Progress bar styles
- Ambient background orb (single orb, subject-colored, blur 120px, opacity 0.2)
- Entry/exit animations

### PWA Support

The `phone.html` will include a minimal `<meta name="apple-mobile-web-app-capable" content="yes">` so that when you "Add to Home Screen" in Safari, it runs fullscreen without the Safari chrome. Additional meta tags:
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `viewport: width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`
- Theme color: `#080816`

---

## Part 3: Dashboard Integration

### [MODIFY] `js/app.js`

Add a **"🎯 Focus"** FAB button to the dashboard (positioned to the left of the layout FAB at `bottom: 20px; right: 78px`).

**Click behavior:**
1. Opens a small modal/popover asking: **Subject** (dropdown: Physics, Math, ECE, Latin, General) and **Duration** (15 / 25 / 45 / 60 min, default 25).
2. On confirm, sends `POST /api/study` with the session details.
3. The FAB changes to a pulsing red dot to indicate an active session.
4. Clicking again while active sends `POST /api/study { active: false }` to end early.

**Integration with existing Pomodoro module:**
- When the Pomodoro timer starts, it can optionally auto-trigger the study broadcast (configurable).
- The `timerEnd` timestamp is shared so the phone countdown stays perfectly synced.

**SSE connection:**
- `connectToServer()` called during boot. Creates `EventSource('/api/events')`.
- Graceful degradation: if the server isn't running (opened as a static file), the Focus button still exists but shows a tooltip "Start with `npm start` to enable phone sync."

### [MODIFY] `index.html`

Add the Focus FAB button and the focus session popover HTML.

### [NEW] `css/standby.css`

Styles for:
- `.fab-focus` — the Focus FAB button (same glass style as layout FAB)
- `.fab-focus.active` — pulsing red dot state
- `.focus-popover` — the subject/duration picker modal

---

## Part 4: Setup Guide

### [NEW] `IPHONE_SETUP.md`

Step-by-step guide for connecting your iPhone:

1. **Connect to Wi-Fi** — Ensure your iPhone is on the same network as the Pi.
2. **Find the Pi's IP** — Run `hostname -I` on the Pi (e.g., `192.168.1.42`).
3. **Open in Safari** — Navigate to `http://192.168.1.42:3000/phone`.
4. **Add to Home Screen** — Tap the Share button → "Add to Home Screen" → name it "Study Dock".
5. **Dock your phone** — Place the iPhone horizontally on your charger/dock.
6. **Open the app** — Tap "Study Dock" from your home screen. It will open fullscreen in landscape.
7. **Start a session** — On the dashboard, click the 🎯 Focus button, choose a subject and duration, and your phone will instantly transform into the study display.

### Auto-Lock Prevention

To keep the phone screen on while docked:
- Go to **Settings → Display & Brightness → Auto-Lock** → set to **Never** (or use Guided Access for a locked-down study mode).
- Alternatively, the web page will include a `WakeLock` API call (`navigator.wakeLock.request('screen')`) to prevent the screen from dimming while the page is active.

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `server.js` | NEW | Express server with SSE, study session API, serves both frontends |
| `package.json` | NEW | Node.js project with express + cors |
| `phone.html` | NEW | Landscape study standby page for iPhone (self-contained with CSS) |
| `IPHONE_SETUP.md` | NEW | Step-by-step guide to connect the phone |
| `index.html` | MODIFY | Add Focus FAB button + session popover HTML |
| `js/app.js` | MODIFY | Add SSE connection, Focus button logic, study session API calls |
| `css/standby.css` | NEW | Focus FAB + popover styles for the dashboard side |

---

## Verification Plan

1. **Start server**: Run `npm install && npm start` in `dashboard/`. Open `http://localhost:3000` — dashboard loads. Open `http://localhost:3000/phone` — phone page loads in idle state.
2. **Simulate focus session**: Run `curl -X POST http://localhost:3000/api/study -H "Content-Type: application/json" -d '{"active":true,"subject":"Physics","task":"Lagrangian Mechanics","timerMinutes":25}'`. Confirm the phone page instantly transitions to the active study display with a ticking countdown.
3. **End session**: Run `curl -X POST http://localhost:3000/api/study -H "Content-Type: application/json" -d '{"active":false}'`. Confirm the phone fades back to idle.
4. **Dashboard button**: Click the 🎯 Focus button on the dashboard, pick a subject and duration, and confirm the phone updates.
5. **Phone reconnection**: Refresh the phone page mid-session. Confirm it calls `GET /api/status` and immediately shows the active session (no delay).
6. **WakeLock**: Confirm the phone screen stays on while the page is open (no auto-dim).
