/**
 * content.js - Scans the page for schedule info
 */

console.log("🐝 adBeeWork Connector Active");

// 1. Check for iCal link on SocialSchedules settings pages
function findSocialSchedulesICal() {
    const inputs = document.querySelectorAll('input[value*="app.socialschedules.com/ical"]');
    if (inputs.length > 0) {
        const icalUrl = inputs[0].value;
        console.log("🐝 Found iCal URL:", icalUrl);
        chrome.storage.local.set({ lastFoundIcal: icalUrl });

        // Notify the user via a small toast in the corner or just let the popup handle it
        showAdBeeNotice("Found your iCal feed! Open the adBeeWork extension to sync.");
    }
}

// 2. Simple UI Inject for "found it" notice
function showAdBeeNotice(msg) {
    if (document.getElementById('adbee-notice')) return;
    const div = document.createElement('div');
    div.id = 'adbee-notice';
    div.style = "position:fixed; top:20px; right:20px; background:#FDBB2D; color:#000; padding:12px 20px; border-radius:10px; z-index:999999; font-family:sans-serif; box-shadow:0 4px 12px rgba(0,0,0,0.3); font-weight:bold; cursor:pointer;";
    div.innerText = "🐝 " + msg;
    div.onclick = () => div.remove();
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

// Run scans
if (window.location.host.includes('socialschedules.com')) {
    // Check periodically as they navigate the SPA
    setInterval(findSocialSchedulesICal, 3000);
}
