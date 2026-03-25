/**
 * content.js - Scans for schedules on the page
 */

console.log("%c📅 Schedule Assistant: W2W Connector active.", "color: #6366f1; font-weight: bold; font-size: 13px;");

function findSchedules() {
    console.log("🐝 Scanning for shifts...");
    const scraped = [];

    // W2W Scraper for "Trade My Shifts" / "Upcoming Shifts" table
    // Layout: "Sun Mar 29, 2026 1:45pm - 6:15pm Membership | Welcome Center Desk"
    const w2wDateRegex = /([A-Z][a-z]{2})\s+([A-Z][a-z]{2})\s+(\d{1,2}),?\s+(\d{4})/i;
    const w2wTimeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i;

    const rows = document.querySelectorAll('tr, .w2w-row, div[style*="display: table-row"], .p-4');
    console.log(`📅 Scanning ${rows.length} rows/elements...`);

    const processedTexts = new Set();

    rows.forEach(row => {
        const text = row.innerText.replace(/\s+/g, ' ').trim();
        // Use text length as filter instead of child-element check (prevents missing the 18th shift)
        if (text.length < 20 || text.length > 250) return;
        if (processedTexts.has(text)) return;

        const dateMatch = text.match(w2wDateRegex);
        const timeMatch = text.match(w2wTimeRegex);

        if (dateMatch && timeMatch) {
            processedTexts.add(text);
            console.log("🐝 Found potential W2W row:", text);
            const dateStr = dateMatch[0];
            const timeStr = timeMatch[0];
            
            // Extract Dept and Position
            const afterTime = text.split(timeStr)[1] || "";
            const parts = afterTime.split(/\|| - | at /).map(p => p.trim()).filter(p => p && p.length > 2);
            
            // Clean up title: ignore the rest of the text if it's too long
            let title = parts.length > 0 ? parts.join(' - ') : "Work Shift";
            if (title.length > 50) title = title.substring(0, 50) + "...";

            scraped.push({
                id: 'w2w-' + btoa(text.replace(/[^a-zA-Z0-9]/g, '')).substring(0, 20),
                title: title,
                date: dateStr,
                time: timeStr,
                location: parts[parts.length - 1] || "YMCA",
                fullText: text
            });
        }
    });

    // 3. Fallback Generic Scraper (kept for flexibility)
    if (scraped.length === 0) {
        const timeRegex = /(\d{1,2}:\d{2})\s*(am|pm)\s*-\s*(\d{1,2}:\d{2})\s*(am|pm)/i;
        const potentialShiftElements = document.querySelectorAll('div, span, section');
        potentialShiftElements.forEach((el) => {
            if (el.children.length > 10) return;
            const text = el.innerText;
            const match = text.match(timeRegex);
            if (match && !scraped.some(s => s.fullText === text.trim())) {
                scraped.push({
                    id: 'scraped-' + Math.random().toString(36).substr(2, 5),
                    title: el.querySelector('strong, h3, h4, .title, .name')?.innerText || "Found Shift",
                    time: match[0],
                    fullText: text.replace(/\s+/g, ' ').trim()
                });
            }
        });
    }

    if (scraped.length > 0) {
        console.log(`%c🐝 Found ${scraped.length} potential shifts!`, "color: #22c55e; font-weight: bold;");
        chrome.storage.local.set({ lastFoundShifts: scraped, lastFoundIcal: null });

        // Notify the sidebar if it's open
        chrome.runtime.sendMessage({ type: 'SHIFTS_FOUND', count: scraped.length }).catch(() => { });

        return true;
    }

    return false;
}

// Run immediately
findSchedules();

// And periodically (for SPAs)
const scanner = setInterval(() => {
    const found = findSchedules();
    if (found) {
        // We found something, but don't stop scanning in case they change weeks
        console.log("🐝 Shift data current.");
    }
}, 5000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ping") {
        sendResponse({ status: "alive" });
    }
});
