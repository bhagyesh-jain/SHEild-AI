# SHEild AI 2.0 — Dev 1 Mobile Testing & Validation Runbook

## Overview
This runbook defines the physical Android device testing procedures, verification matrices, and environment configuration owned by **Dev 1 (Mobile & Android)** for the SHEild AI 2.0 Expo React Native application.

---

## Environment Setup for Physical Android Testing

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **Expo CLI**: Expo SDK ~54 compatible
- **Local Network**: Android device and developer machine connected to the same Wi-Fi network.
- **Environment Override**:
  Create `.env` inside `mobile/`:
  ```bash
  EXPO_PUBLIC_API_URL=http://<DEVELOPER_LOCAL_IP>:8000/api/v1
  ```
  *(Example: `EXPO_PUBLIC_API_URL=http://192.168.1.50:8000/api/v1`)*

### Commands Executed During Dev 1 Verification
```bash
# 1. Isolated Mobile Typecheck
cd mobile
npx tsc --noEmit

# 2. Expo Health Check
npx expo-doctor
```

---

## Physical Android Test Procedures

### 1. Manual SOS Trigger
- **Procedure**:
  1. Open app on Android device.
  2. Press and hold the central red **"HOLD 1.8s FOR SOS"** button.
  3. Keep finger pressed until the 1.8-second progress animation completes.
- **Expected Outcome**:
  - Haptic feedback pulses upon completion.
  - 3-second cancellation overlay modal opens immediately.
  - Generates `client_event_id` (`evt_<timestamp>_<random>`).

---

### 2. SOS Cancellation Window
- **Procedure**:
  1. Trigger Manual SOS or Shake SOS.
  2. When the red cancellation countdown overlay appears ("Emergency Alert Armed - Dispatched in 3s"), tap **"CANCEL EMERGENCY ALERT"**.
- **Expected Outcome**:
  - Countdown timer stops immediately.
  - Modal dismisses.
  - Zero network payloads or outbox items are enqueued.

---

### 3. Shake Detection (Accelerometer)
- **Procedure**:
  1. Ensure "Shake Alert" toggle is ON on Triggers tab.
  2. Perform 2 rapid physical phone shakes ($\ge 3.0\text{ g}$ magnitude within 1.5 seconds).
- **Expected Outcome**:
  - App detects multi-peak gesture.
  - Opens the 3-second cancellation overlay modal.
  - 5-second refractory cooldown prevents accidental re-triggers during continued shaking.

---

### 4. Location Permission Denied Handling
- **Procedure**:
  1. On Android prompt: *"Allow SHEild AI to access this device's location?"*, select **Deny**.
  2. Trigger Manual SOS.
- **Expected Outcome**:
  - App does NOT crash.
  - Status banner displays `GPS Tracking Off / Simulated`.
  - SOS payload dispatches successfully using `share_location: false` and default fallback coordinates (`0.0, 0.0`).

---

### 5. GPS / Hardware Location Unavailable
- **Procedure**:
  1. Turn OFF Location / GPS toggles in Android System Quick Settings.
  2. Trigger Manual SOS.
- **Expected Outcome**:
  - Location fetch times out safely inside `try / catch`.
  - SOS dispatch proceeds immediately without waiting for GPS fix.

---

### 6. Offline SOS Queueing
- **Procedure**:
  1. Turn ON Airplane Mode on Android device (disconnect Wi-Fi & Mobile Data).
  2. Trigger Manual SOS and let the 3-second countdown expire.
- **Expected Outcome**:
  - Status banner alerts: `OFFLINE (OUTBOX QUEUED)`.
  - Payload stored persistently in `sheild_offline_outbox_v1.json` (`FileSystem.documentDirectory`).
  - Item status marks `NOT_SENT` / `PENDING`.

---

### 7. Network Restoration & Auto-Retry
- **Procedure**:
  1. Turn OFF Airplane Mode (reconnect Wi-Fi / Data).
  2. Re-open app or wait for periodic background sync.
- **Expected Outcome**:
  - `offlineOutbox.sync()` executes automatically.
  - Retries payload passing `"Idempotency-Key": client_event_id`.
  - Upon receiving HTTP 20x from FastAPI backend, outbox marks `SENT_ACCEPTED` and purges the pending queue item.

---

### 8. Guardian Acknowledgement Pipeline
- **Procedure**:
  1. Trigger SOS while backend is online.
  2. Navigate to **Incident Status** tab.
  3. Simulate Guardian Acknowledgement via API or Guardian Web Dashboard (`POST /api/v1/incidents/{id}/acknowledge`).
- **Expected Outcome**:
  - Real-Time Status Pipeline highlights Step 1 (`Queued`) $\rightarrow$ Step 2 (`Received`) $\rightarrow$ Step 3 (`Push Sent`) $\rightarrow$ Step 4 (`Guardian Ack`).
  - Active incident card updates with `🟢 Guardian Acknowledged!`.

---

### 9. Safe Journey Tracker
- **Procedure**:
  1. Navigate to **Safe Journey** tab.
  2. Select Destination ("Home") and ETA (15 Mins).
  3. Tap **"Start Safe Journey"**.
  4. Tap **"I Have Arrived Safely (Check-In)"**.
- **Expected Outcome**:
  - Journey active banner displays live countdown.
  - Tapping Check-In dispatches `POST /api/v1/journeys/{id}/check-in` and safely disarms the countdown timer.

---

### 10. Emergency Helpline Hand-offs
- **Procedure**:
  1. On Triggers tab, tap **"📞 112 Emergency"** or **"📞 1091 Women"**.
- **Expected Outcome**:
  - Android system phone dialer opens with pre-populated phone number (`tel:112` or `tel:1091`).

---

### 11. Background / Locked Screen Behavior & Android Limitations
- **Observed Behavior & Android Constraints**:
  - **Foreground App State**: All features (1.8s hold, Shake, Voice keyword, Siren, GPS streaming) function with 100% precision.
  - **Screen Locked / Background**: Standard Android Doze Mode & OS battery optimization suspend un-foregrounded JavaScript event loops.
  - **FCM Push Notifications**: High-priority Firebase Cloud Messaging (FCM) notifications wake device screen when configured via native Android payload handlers.
  - **Background Audio**: Voice keyword recognition is restricted by Android OS policy from recording continuous audio in the background without a persistent foreground notification service.

---

## Verification Summary

| Check | Tool | Result |
| :--- | :--- | :--- |
| **TypeScript Validation** | `npx tsc --noEmit` (Cwd: `mobile/`) | **0 Errors (PASS)** |
| **Expo Health Check** | `npx expo-doctor` | **16/18 Checks Passed** (2 workspace lockfile notices) |
| **Android Permissions Manifest** | `mobile/app.json` | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `RECORD_AUDIO` |
