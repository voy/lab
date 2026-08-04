# GH PR Jira Key Link

A Chrome extension that turns Jira issue keys (e.g. `SLIDES-1881`) in GitHub
PR titles into links to your Jira instance.

## Installation

1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked" and select this directory
4. Click the toolbar icon and set your Jira subdomain (the `xyz` in
   `xyz.atlassian.net`) — the extension does nothing until this is set

## How it works

A content script runs on `github.com/*/*/pull/*` pages, scans the PR title
for text matching `KEY-123`, and replaces each match with a link to
`https://<subdomain>.atlassian.net/browse/KEY-123`. The subdomain is stored in
`chrome.storage.sync` and read by the content script; there is no default.

GitHub PR pages are single-page apps, so a `MutationObserver` re-scans the
title on DOM changes (e.g. navigating between PRs without a full reload).

## Development

Run `icons/regenerate-icons.sh` to rebuild the icon set (requires
`rsvg-convert`, e.g. `brew install librsvg`).

Run `./pack.sh` to build `dist/gh-jira-key-link.zip` for distribution.
