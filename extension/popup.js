document.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('status-text');
    const icalPreview = document.getElementById('ical-preview');
    const syncBtn = document.getElementById('sync-btn');
    const rescanLink = document.getElementById('rescan-link');

    const LOCAL_3000 = 'http://localhost:3000';
    const LOCAL_3001 = 'http://localhost:3001';
    const PROD_URL = 'https://scheduleassistant-735d8.web.app';

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

    updateStatus();

    rescanLink.onclick = async (e) => {
        e.preventDefault();
        statusText.innerText = "Scanning...";
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
            setTimeout(updateStatus, 500);
        }
    };

    syncBtn.onclick = async () => {
        const data = await chrome.storage.local.get(['lastFoundIcal', 'lastFoundShifts']);
        syncBtn.innerText = "Syncing...";
        syncBtn.disabled = true;

        let baseUrl = LOCAL_3001; // Default to 3001
        console.log("🐝 Attempting to connect to dashboard...");

        // Check 3000 then 3001 then Prod
        try {
            const check3000 = await fetch(LOCAL_3000 + '/auth/status', { signal: AbortSignal.timeout(500) });
            if (check3000.ok) {
                baseUrl = LOCAL_3000;
                console.log("🐝 Connected to port 3000");
            } else {
                throw new Error();
            }
        } catch (e) {
            try {
                const check3001 = await fetch(LOCAL_3001 + '/auth/status', { signal: AbortSignal.timeout(500) });
                if (check3001.ok) {
                    baseUrl = LOCAL_3001;
                    console.log("🐝 Connected to port 3001");
                } else {
                    throw new Error();
                }
            } catch (e2) {
                baseUrl = PROD_URL;
                console.log("🐝 Local not found, falling back to PROD");
            }
        }

        try {
            let endpoint = '/api/schedules/save-url';
            let body = { url: data.lastFoundIcal };
            if (data.lastFoundShifts) {
                endpoint = '/api/schedules/save-raw';
                body = { shifts: data.lastFoundShifts };
            }

            const response = await fetch(baseUrl + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            if (response.ok) {
                syncBtn.innerText = "✅ Sent! Opening Dashboard...";
                syncBtn.style.background = "#22c55e";
                await chrome.storage.local.remove(['lastFoundShifts']);
                chrome.tabs.create({ url: baseUrl });
                setTimeout(() => window.close(), 2000);
            } else {
                throw new Error("Dashboard Error");
            }
        } catch (err) {
            statusText.innerText = "❌ Connection Failed. Check if dashboard is running.";
            syncBtn.innerText = "Retry";
            syncBtn.disabled = false;
        }
    };
});
