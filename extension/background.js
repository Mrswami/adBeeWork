/**
 * background.js - Handles side panel and sidebar behavior
 */

// Chrome specific: Open the side panel when the toolbar icon is clicked
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error(error));
}

// Firefox specific: Toggle the sidebar when the toolbar icon is clicked
if (typeof browser !== 'undefined' && browser.sidebarAction) {
    browser.action.onClicked.addListener(() => {
        browser.sidebarAction.toggle();
    });
} else if (typeof chrome !== 'undefined' && chrome.action) {
    // Fallback for Chrome if setPanelBehavior above isn't supported for some reason
    chrome.action.onClicked.addListener((tab) => {
        if (chrome.sidePanel) {
            chrome.sidePanel.open({ windowId: tab.windowId });
        }
    });
}

// Global listener for found shifts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SHIFTS_FOUND') {
        console.log("🐝 Shifts detected in background:", message.count);
        // Optional: Could trigger a notification here
    }
});
