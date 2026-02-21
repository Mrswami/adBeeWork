document.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('status-text');
    const icalPreview = document.getElementById('ical-preview');
    const syncBtn = document.getElementById('sync-btn');

    // Check storage for found URL
    const data = await chrome.storage.local.get('lastFoundIcal');

    if (data.lastFoundIcal) {
        statusText.innerText = "Ready to sync your SocialSchedules feed!";
        icalPreview.innerText = data.lastFoundIcal;
        icalPreview.style.display = 'block';
        syncBtn.disabled = false;
    } else {
        statusText.innerText = "No schedule feed found yet. Please open SocialSchedules to the Calendar Sync settings page.";
        syncBtn.disabled = true;
    }

    syncBtn.onclick = async () => {
        const originalText = syncBtn.innerText;
        syncBtn.innerText = "Syncing...";
        syncBtn.disabled = true;

        try {
            // We try to talk to the local dashboard
            const response = await fetch('http://localhost:3000/api/schedules/save-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: data.lastFoundIcal })
            });

            if (response.ok) {
                syncBtn.innerText = "Successfully Sent!";
                syncBtn.style.background = "#22c55e"; // Success green
                setTimeout(() => window.close(), 1500);
            } else {
                throw new Error("Dashboard responded with error");
            }
        } catch (err) {
            statusText.innerText = "Connection Failed. Make sure your adBeeWork dashboard is running at localhost:3000";
            syncBtn.innerText = "Retry Connection";
            syncBtn.disabled = false;
        }
    };
});
