document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusText = document.getElementById('statusText');

  const { enabled } = await chrome.storage.local.get({ enabled: true });
  updateUI(enabled);

  toggleBtn.addEventListener('click', async () => {
    const { enabled: currentEnabled } = await chrome.storage.local.get({ enabled: true });
    const newEnabled = !currentEnabled;
    await chrome.storage.local.set({ enabled: newEnabled });
    updateUI(newEnabled);
  });

  function updateUI(isEnabled) {
    if (isEnabled) {
      statusText.textContent = 'Active Monitoring';
      statusText.className = 'active-badge';
      toggleBtn.textContent = 'Disable Monitoring';
      toggleBtn.className = 'btn-disable';
    } else {
      statusText.textContent = 'Disabled';
      statusText.className = 'inactive-badge';
      toggleBtn.textContent = 'Enable Monitoring';
      toggleBtn.className = 'btn-enable';
    }
  }
});
