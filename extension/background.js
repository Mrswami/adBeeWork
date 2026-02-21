/**
 * background.js - Handles side panel behavior for Chrome
 */

// Chrome specific: Open the side panel when the toolbar icon is clicked
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error(error));
}

// Optional: Listener for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'REFRESH_DASHBOARD') {
        // We could trigger a reload of the sidebar iframe here if needed
    }
});
