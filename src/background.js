// Background script for YouTube Music Bookmarker
chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Music Bookmarker (React) extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open the popup (this is handled automatically by manifest.json)
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabInfo') {
    sendResponse({
      tabId: sender.tab.id,
      url: sender.tab.url,
      title: sender.tab.title,
    });
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    console.log('Storage changed:', changes);
  }
});
