document.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('status-text');
    const icalPreview = document.getElementById('ical-preview');
    const syncBtn = document.getElementById('sync-btn');

    // Check storage for found data
    const data = await chrome.storage.local.get(['lastFoundIcal', 'lastFoundShifts']);

    if (data.lastFoundIcal) {
        statusText.innerText = "✅ Schedule Feed Found!";
        icalPreview.innerText = data.lastFoundIcal;
        icalPreview.style.display = 'block';
        syncBtn.disabled = false;
    } else if (data.lastFoundShifts && data.lastFoundShifts.length > 0) {
        statusText.innerText = `✅ Found ${data.lastFoundShifts.length} shifts on the current page!`;
        icalPreview.innerText = "We'll sync the shifts visible in your browser.";
        icalPreview.style.display = 'block';
        syncBtn.disabled = false;
    } else {
        statusText.innerText = "❌ No schedule found. Try navigating to your 'Schedule' tab or 'Settings > Calendar Sync'.";
        syncBtn.disabled = true;
    }

    syncBtn.onclick = async () => {
        syncBtn.innerText = "Syncing...";
        syncBtn.disabled = true;

        try {
            let endpoint = '/api/schedules/save-url';
            let body = { url: data.lastFoundIcal };

            if (data.lastFoundShifts) {
                endpoint = '/api/schedules/save-raw';
                body = { shifts: data.lastFoundShifts };
            }

            const response = await fetch('http://localhost:3000' + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                syncBtn.innerText = "✅ Sent to adBeeWork!";
                syncBtn.style.background = "#22c55e";
                setTimeout(() => window.close(), 1500);
            } else {
                throw new Error("Dashboard Error");
            }
        } catch (err) {
            statusText.innerText = "❌ Dashboard not running. Start it with 'npm run dev'.";
            syncBtn.innerText = "Retry";
            syncBtn.disabled = false;
        }
    };
});
