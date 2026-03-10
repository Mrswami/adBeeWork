# adBeeWork: Silent Calendar Synchronization

A critical bridge between the **SocialSchedules** app and **Google Calendar**. 

This system reads confirmed shifts and automatically translates them into Google Calendar events. Crucially, it does this silently—without triggering the cascade of default auto-reply emails and event invitations that plague standard calendar integrations.

## The Motif
**Invisible Infrastructure.**
Calendar sync tools often generate more noise than the problems they solve. adBeeWork is designed to operate in the background, updating your schedule with zero outward-facing friction. The core principle is that a schedule update should be a personal notification, not a broadcast.

---

## Operational Mechanics

- **One-Way Secure Sync:** Uses Google OAuth to securely write shifts to your calendar without ever storing passwords.
- **Duplicate Aversion:** Intelligently scans existing calendar states to skip previously synced events.
- **Notification Suppression:** By default, it forces Google's API to use `sendUpdates: 'none'`, meaning absolutely no emails are generated or sent to coworkers or managers attached to the shift data.
- **Opt-In Auditing:** A toggle allows you to send a quiet confirmation *only to yourself*.

---

## System Configuration

### 1. Google OAuth Pipeline
The app requires an authorized Google Cloud path to perform calendar writes on your behalf.
- Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
- Enable the **Google Calendar API**.
- Generate Web Application OAuth 2.0 credentials with the redirect URI: `http://localhost:3000/auth/callback`.

### 2. Environment Variables
Map your credentials to the local environment:
```bash
cp .env.example .env
```
Ensure the `.env` file contains your `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a secure `SESSION_SECRET`.

### 3. Startup Sequence
```bash
npm install
npm start
```

### Operational Workarounds: iCal Extraction
SocialSchedules does not expose a clean public API for shift data. To extract the data, navigate to the SocialSchedules mobile app: **Settings → Calendar Sync → Copy Link** and feed the resulting iCal URL into the adBeeWork dashboard.
