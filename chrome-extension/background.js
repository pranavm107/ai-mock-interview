// Listen for tab switches
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  if (!enabled) return;

  // Send message to all tabs (only our content scripts will care, or we can query active tabs)
  chrome.tabs.query({ url: ["http://localhost:5173/*", "https://*.preppilot.com/*"] }, (tabs) => {
    tabs.forEach(tab => {
      // Don't send to the tab that just became active, send to the coding session tab
      // Actually, if the coding session tab lost focus, it's a tab switch.
      if (tab.id !== activeInfo.tabId) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXTENSION_INTEGRITY_SIGNAL',
          signalType: 'TAB_SWITCH',
          metadata: { source: 'chrome_extension_tabs_api' }
        }).catch(() => {});
      }
    });
  });
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  if (!enabled) return;

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // All chrome windows lost focus
    chrome.tabs.query({ url: ["http://localhost:5173/*", "https://*.preppilot.com/*"] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXTENSION_INTEGRITY_SIGNAL',
          signalType: 'WINDOW_BLUR',
          metadata: { source: 'chrome_extension_windows_api' }
        }).catch(() => {});
      });
    });
  }
});
