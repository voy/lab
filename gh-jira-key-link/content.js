const ISSUE_KEY_RE = /\b([A-Z][A-Z0-9]+-\d+)\b/g;
const TITLE_SELECTOR = 'h1[data-component="PH_Title"] .markdown-title';

let jiraHost = null;

function linkify(el) {
  if (!el || !jiraHost || el.dataset.jiraLinked) return;

  const text = el.textContent;
  if (!ISSUE_KEY_RE.test(text)) return;
  ISSUE_KEY_RE.lastIndex = 0;

  const frag = document.createDocumentFragment();
  let last = 0;
  let match;
  while ((match = ISSUE_KEY_RE.exec(text))) {
    if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));

    const a = document.createElement('a');
    a.href = `${jiraHost}/browse/${match[1]}`;
    a.textContent = match[1];
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'jira-key-link';
    frag.appendChild(a);

    last = match.index + match[1].length;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));

  el.textContent = '';
  el.appendChild(frag);
  el.dataset.jiraLinked = 'true';
}

function scan() {
  document.querySelectorAll(TITLE_SELECTOR).forEach(linkify);
}

function relinkAll() {
  document.querySelectorAll(TITLE_SELECTOR).forEach((el) => delete el.dataset.jiraLinked);
  scan();
}

let debounceTimer;
new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(scan, 200);
}).observe(document.body, { childList: true, subtree: true });

chrome.storage.sync.get(['jiraSubdomain'], ({ jiraSubdomain }) => {
  if (!jiraSubdomain) return;
  jiraHost = `https://${jiraSubdomain}.atlassian.net`;
  scan();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync' || !changes.jiraSubdomain) return;
  jiraHost = changes.jiraSubdomain.newValue ? `https://${changes.jiraSubdomain.newValue}.atlassian.net` : null;
  relinkAll();
});
