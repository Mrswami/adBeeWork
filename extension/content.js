/**
 * content.js - Scans for iCal feeds OR scrapes shifts directly from the view
 */

console.log("🐝 adBeeWork Connector: Scanning for schedules...");

function findScheduleData() {
    // 1. Check for iCal link (best method)
    const inputs = document.querySelectorAll('input, a, code');
    for (const el of inputs) {
        const text = (el.value || el.innerText || el.href || "");
        if (text.includes('app.socialschedules.com/ical/')) {
            const url = text.trim();
            chrome.storage.local.set({ lastFoundIcal: url, lastFoundShifts: null });
            showAdBeeNotice("Found your schedule feed! Ready to sync.");
            return true;
        }
    }

    // 2. Scrape shifts directly from the "Week" view if iCal isn't found
    // Based on SocialSchedules DOM structure
    const shiftElements = document.querySelectorAll('.schedule-event, [class*="event"], [class*="shift"]');
    if (shiftElements.length > 5) { // Threshold to avoid false positives
        const scrapedShifts = [];

        // We attempt to find elements that look like shifts
        // Usually they have a title, time, and date context
        // This is a generic backup scraper
        const events = document.querySelectorAll('div[role="button"], .shift-container');
        events.forEach(ev => {
            const text = ev.innerText;
            if (text.includes(':') && (text.includes('am') || text.includes('pm'))) {
                // It's likely a shift!
                scrapedShifts.push({
                    id: 'scraped-' + Math.random().toString(36).substr(2, 9),
                    title: ev.querySelector('.title, [class*="name"]')?.innerText || "Work Shift",
                    rawText: text,
                    timestamp: Date.now()
                });
            }
        });

        if (scrapedShifts.length > 0) {
            chrome.storage.local.set({ lastFoundShifts: scrapedShifts, lastFoundIcal: null });
            showAdBeeNotice(`Found ${scrapedShifts.length} shifts on this page!`);
            return true;
        }
    }

    return false;
}

function showAdBeeNotice(msg) {
    if (document.getElementById('adbee-notice')) return;
    const div = document.createElement('div');
    div.id = 'adbee-notice';
    div.style = `position:fixed; top:20px; right:20px; background:#FDBB2D; color:#000; padding:16px 24px; border-radius:12px; z-index:9999999; font-family:sans-serif; box-shadow:0 10px 25px rgba(0,0,0,0.4); font-weight:600; cursor:pointer; display:flex; align-items:center; gap:10px; animation:slideIn 0.4s ease-out;`;
    div.innerHTML = `<span>🐝</span> <span>${msg}</span>`;
    const style = document.createElement('style');
    style.innerHTML = `@keyframes slideIn { from { transform: translateX(120%); } to { transform: translateX(0); } }`;
    document.head.appendChild(style);
    div.onclick = () => div.remove();
    document.body.appendChild(div);
    setTimeout(() => { if (div.parentNode) div.remove(); }, 8000);
}

// Initial/Periodic Scan
findScheduleData();
setInterval(findScheduleData, 5000);
