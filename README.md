# adBeeWork — SocialSchedules → Google Calendar Sync

Reads your confirmed shifts from the **SocialSchedules** app and automatically creates **Google Calendar** events — silently, with no auto-reply emails sent to anyone.

## Features

- **Sign in with Google** — secure OAuth, no passwords stored
- **Paste your SocialSchedules iCal URL** — fetches all upcoming confirmed shifts
- **One-click sync** — creates Google Calendar events for selected shifts
- **No auto-replies** — `sendUpdates: 'none'` means zero email invites or notifications sent
- **Optional self-notify** — flip a toggle to send yourself a confirmation email only
- **Duplicate detection** — skips events already in your calendar

---

## Setup

### 1. Google Cloud Credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable **Google Calendar API**
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URI: `http://localhost:3000/auth/callback`
7. Copy **Client ID** and **Client Secret**

### 2. Environment File

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=any_random_string
```

### 3. Install & Run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Getting Your SocialSchedules iCal URL

1. Open the **SocialSchedules** app on your phone
2. Tap **Menu (☰) → Settings → Calendar Sync**
3. Tap **Copy Link** (Android calendar link)
4. Paste it into the app

---

## How Auto-Replies Are Suppressed

When creating calendar events via the Google Calendar API, the `sendUpdates` parameter controls notifications:

| Value | Behavior |
|-------|----------|
| `'none'` | No emails sent to anyone ✅ (default in this app) |
| `'all'` | Emails sent to all attendees |
| `'emailAddress'` | Emails sent to attendees with email addresses |

This app uses `'none'` by default. Enable **"Notify myself"** in the UI to switch to `'all'` — but since no other attendees are added to events, only you receive anything.
