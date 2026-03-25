---
description: Unified Workflow for Testing WhenToWork Sync
---
This workflow streamlines the testing of the WhenToWork scraper and Google Calendar sync.

### 1. Backend Setup
1. Open your terminal in the `scheduleAssistant` directory.
2. Run the server on port 3001:
   ```powershell
   $env:PORT=3001; node server.js
   ```

### 2. Extension Initialization
1. Go to `chrome://extensions`.
2. Ensure **Schedule Assistant** is loaded as an unpacked extension.
3. Click the **Refresh** icon to ensure the latest `content.js` and `popup.js` are active.

### 3. Scrape and Sync
1. Navigate to your **WhenToWork "Trade My Shifts"** or **"Upcoming Shifts"** page.
2. Click the extension icon.
3. When it says "✅ Found X shifts", click **Sync to Dashboard**.
4. The dashboard at `http://localhost:3001` will open.
5. **Sign in with Google** if not already signed in.

### 4. Verify & Calendar Sync
1. You should see all scraped shifts (e.g., all 18) listed on the dashboard.
2. Select the shifts you want to sync.
3. Click **Add Selected Shifts to Google Calendar**.
4. Check your Google Calendar to verify the entries.

---
// turbo-all
