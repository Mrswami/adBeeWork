document.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('status-text');
    const icalPreview = document.getElementById('ical-preview');
    const syncBtn = document.getElementById('sync-btn');

    // Check storage for found URL
    const data = await chrome.storage.local.get('lastFoundIcal');

    if (data.lastFoundIcal) {
        statusText.innerText = "✅ Schedule found!";
        icalPreview.innerText = data.lastFoundIcal;
        icalPreview.style.display = 'block';
        syncBtn.disabled = false;
    } else {
        statusText.innerText = "❌ No schedule found. Open SocialSchedules Calendar Settings.";
    }

    syncBtn.onclick = async () => {
        syncBtn.innerText = "Syncing...";
        syncBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/api/schedules/save-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: data.lastFoundIcal })
            });

            if (response.ok) {
                syncBtn.innerText = "✅ Synced to adBee!";
                setTimeout(() => window.close(), 1500);
            } else {
                throw new Error("Local dashboard not running");
            }
        } catch (err) {
            statusText.innerText = "❌ adBeeWork Dashboard not running at localhost:3000";
            syncBtn.innerText = "Retry";
            syncBtn.disabled = false;
        }
    };
});
