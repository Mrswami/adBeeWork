# W2W Sync: Enterprise Schedule Assistant

A premium bridge between **WhenToWork (W2W)** and **Google Calendar**. 

This system extracts your work shifts directly from the WhenToWork web interface using a companion browser extension and synchronizes them silently with your Google Calendar—without triggering auto-reply emails or event invitations.

## Key Features

- **Direct Scraping:** No iCal URL required. The browser extension grabs shifts from your "Trade My Shifts" or "Upcoming Shifts" pages.
- **Enterprise Aesthetics:** A clean, professional indigo/slate interface built for productivity.
- **Silent Synchronization:** Uses Google Calendar API with `sendUpdates: 'none'` to ensure zero email noise for managers or coworkers.
- **Duplicate Prevention:** Automatically detects existing calendar entries to skip previously synced shifts.
- **Precision Tracking:** Real-time feedback badges (✅ Synced / ⏭ Skipped / ❌ Failed) for every shift.

---

## Getting Started

### 1. Browser Extension Setup
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `/extension` directory from this project.

### 2. Local Backend
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Configure your `.env` (Google Client ID/Secret).
3. Start the server on port 3001:
   ```bash
   $env:PORT=3001; node server.js
   ```

### 3. Usage Flow
1. Navigate to your **WhenToWork Schedule** in Chrome.
2. Click the **W2W Sync** icon and click **Send to Dashboard**.
3. On the dashboard (`localhost:3001`), click **Sign in with Google**.
4. Select your shifts and click **Add Selected Shifts to Google Calendar**.

---

## Production Deployment

### Backend (Node.js)
- **Deployment Host:** Recommended: [Render.com](https://render.com) or Heroku.
- **Env Vars:** Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `SESSION_SECRET`.

### Frontend (Static)
- **Firebase Hosting:** Run `firebase deploy` to host the dashboard.
- **Google Console:** Add your production domain as an **Authorized JavaScript Origin** and your `/auth/callback` as an **Authorized Redirect URI**.
