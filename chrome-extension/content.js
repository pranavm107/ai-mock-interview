// Inject a script tag or just listen to window messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTENSION_INTEGRITY_SIGNAL') {
    // Forward the signal to the web page via postMessage
    window.postMessage({
      type: 'PREPPILOT_INTEGRITY_SIGNAL',
      signalType: message.signalType,
      metadata: message.metadata
    }, window.origin);
  }
});

// Listen for messages FROM the page (e.g. to know if a session is active)
window.addEventListener('message', (event) => {
  // Verify origin if needed, but we are running in the page's context
  if (event.data && event.data.type === 'PREPPILOT_SESSION_STATE') {
    chrome.runtime.sendMessage({
      type: 'UPDATE_SESSION_STATE',
      isActive: event.data.isActive
    }).catch(() => {});
  }
});

// Notify the page that the extension is installed
window.postMessage({ type: 'PREPPILOT_EXTENSION_INSTALLED' }, window.origin);
