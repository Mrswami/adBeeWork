document.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('status-text');
    const icalPreview = document.getElementById('ical-preview');
    const syncBtn = document.getElementById('sync-btn');
    const rescanLink = document.getElementById('rescan-link');

    async function updateStatus() {
        const data = await chrome.storage.local.get(['lastFoundIcal', 'lastFoundShifts']);

        if (data.lastFoundIcal) {
            statusText.innerText = "✅ Schedule Feed Link Found!";
            icalPreview.innerText = data.lastFoundIcal;
            icalPreview.style.display = 'block';
            syncBtn.disabled = false;
        } else if (data.lastFoundShifts && data.lastFoundShifts.length > 0) {
            statusText.innerHTML = `✅ Found <strong>${data.lastFoundShifts.length}</strong> shifts on this page!<br><span style="font-size:11px; color:#FDBB2D">Ready for dashboard sync.</span>`;
            icalPreview.innerText = data.lastFoundShifts.slice(0, 2).map(s => `• ${s.time}: ${s.fullText.substring(0, 30)}...`).join('\n');
            icalPreview.style.display = 'block';
            syncBtn.disabled = false;
        } else {
            statusText.innerText = "🔍 No shifts found. Try navigating to your Schedule tab.";
            icalPreview.style.display = 'none';
            syncBtn.disabled = true;
        }
    }

    // Initial check
    updateStatus();

    // Rescan handler
    rescanLink.onclick = async (e) => {
        e.preventDefault();
        statusText.innerText = "Scanning...";

        // Execute script in active tab to be sure
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            setTimeout(updateStatus, 500);
        }
    };

    syncBtn.onclick = async () => {
        const data = await chrome.storage.local.get(['lastFoundIcal', 'lastFoundShifts']);
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
                syncBtn.innerText = "✅ Sent! Opening Dashboard...";
                syncBtn.style.background = "#22c55e";

                // Clear storage
                await chrome.storage.local.remove(['lastFoundShifts']);

                // Open the dashboard automatically
                chrome.tabs.create({ url: 'http://localhost:3000' });

                setTimeout(() => window.close(), 2000);
            } else {
                throw new Error("Dashboard Error");
            }
        } catch (err) {
            statusText.innerText = "❌ Connection Failed. Is the dashboard running?";
            syncBtn.innerText = "Retry";
            syncBtn.disabled = false;
        }
    };
});
