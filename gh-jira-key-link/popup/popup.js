function setFeedback(btn, message, isError) {
  const original = btn.textContent;
  btn.textContent = message;
  btn.classList.toggle('saved', !isError);
  btn.classList.toggle('error', !!isError);
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('saved', 'error');
  }, 900);
}

async function init() {
  const input = document.getElementById('subdomain');
  const saveBtn = document.getElementById('save');

  const { jiraSubdomain } = await chrome.storage.sync.get(['jiraSubdomain']);
  input.value = jiraSubdomain || '';
  input.focus();
  input.select();

  saveBtn.addEventListener('click', async () => {
    const subdomain = input.value.trim().toLowerCase();
    if (!subdomain) {
      setFeedback(saveBtn, 'Enter a subdomain', true);
      return;
    }
    input.value = subdomain;
    await chrome.storage.sync.set({ jiraSubdomain: subdomain });
    setFeedback(saveBtn, 'Saved!');
    setTimeout(() => window.close(), 600);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn.click();
  });
}

init();
