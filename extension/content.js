/**
 * content.js - Scans the page for schedule info
 */

console.log("🐝 adBeeWork Connector: Scanning for schedules...");

function findScheduleFeed() {
    let foundUrl = null;

    // SocialSchedules specific: looking for the iCal export link
    // They often put it in an input field or a link with /ical/
    const icalElements = document.querySelectorAll('input, a, code');

    for (const el of icalElements) {
        const text = (el.value || el.innerText || el.href || "");
        if (text.includes('app.socialschedules.com/ical/')) {
            foundUrl = text.trim();
            break;
        }
    }

    if (foundUrl) {
        console.log("🐝 Found iCal Feed:", foundUrl);
        chrome.storage.local.set({ lastFoundIcal: foundUrl });
        showAdBeeNotice("Found your schedule feed! Click the bee icon to sync.");
        return true;
    }
    return false;
}

function showAdBeeNotice(msg) {
    if (document.getElementById('adbee-notice')) return;

    const div = document.createElement('div');
    div.id = 'adbee-notice';
    div.style = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #FDBB2D;
    color: #000;
    padding: 16px 24px;
    border-radius: 12px;
    z-index: 9999999;
    font-family: 'Outfit', sans-serif;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.4s ease-out;
  `;

    div.innerHTML = `<span>🐝</span> <span>${msg}</span>`;

    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes slideIn {
      from { transform: translateX(120%); }
      to { transform: translateX(0); }
    }
  `;
    document.head.appendChild(style);

    div.onclick = () => div.remove();
    document.body.appendChild(div);

    // Auto remove after 8 seconds
    setTimeout(() => { if (div.parentNode) div.remove(); }, 8000);
}

// Initial scan
findScheduleFeed();

// Periodically scan (useful for Single Page Apps like SocialSchedules)
const scanInterval = setInterval(() => {
    if (findScheduleFeed()) {
        // Stop scanning once found to save resources
        clearInterval(scanInterval);
    }
}, 3000);
