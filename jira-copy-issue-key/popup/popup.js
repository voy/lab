const ISSUE_KEY_RE = /^[A-Z][A-Z0-9]+-\d+$/;

function extractFromURL(href) {
  const url = new URL(href);

  // /browse/KEY-123
  const browse = url.pathname.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/i);
  if (browse) return browse[1].toUpperCase();

  // ?selectedIssue=KEY-123
  const selected = url.searchParams.get('selectedIssue');
  if (selected && ISSUE_KEY_RE.test(selected.toUpperCase())) return selected.toUpperCase();

  return null;
}

async function extractFromDOM(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const KEY_RE = /\b([A-Z][A-Z0-9]+-\d+)\b/;

        // Document title
        const titleMatch = document.title.match(KEY_RE);
        if (titleMatch) return titleMatch[1];

        // Meta tag (older Jira)
        const meta = document.querySelector('meta[name="ajs-issue-key"]');
        if (meta?.content?.match(/^[A-Z][A-Z0-9]+-\d+$/)) return meta.content;

        // data-issue-key attribute
        const el = document.querySelector('[data-issue-key]');
        if (el?.dataset?.issueKey?.match(/^[A-Z][A-Z0-9]+-\d+$/)) return el.dataset.issueKey;

        return null;
      },
    });
    return result || null;
  } catch {
    return null;
  }
}

function browseURL(tabURL, issueKey) {
  const { protocol, host } = new URL(tabURL);
  return `${protocol}//${host}/browse/${issueKey}`;
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

function setFeedback(btn, message) {
  btn.textContent = message;
  btn.classList.add('copied');
  setTimeout(() => window.close(), 600);
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url?.includes('atlassian.net')) return;

  const issueKey = extractFromURL(tab.url) || await extractFromDOM(tab.id);

  if (!issueKey) return;

  const link = browseURL(tab.url, issueKey);

  document.getElementById('key').textContent = issueKey;

  const copyKeyBtn = document.getElementById('copy-key');
  const copyLinkBtn = document.getElementById('copy-link');

  copyKeyBtn.addEventListener('click', async () => {
    await copyText(issueKey);
    setFeedback(copyKeyBtn, 'Copied!');
  });

  copyLinkBtn.addEventListener('click', async () => {
    await copyText(link);
    setFeedback(copyLinkBtn, 'Copied!');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'k') { copyKeyBtn.focus(); copyKeyBtn.click(); }
    if (e.key === 'l') { copyLinkBtn.focus(); copyLinkBtn.click(); }
  });

  document.getElementById('not-found').hidden = true;
  document.getElementById('found').hidden = false;
  copyKeyBtn.focus();
}

init();
