# MarSei Ceramics restock monitor

Google Apps Script that watches the **Kalíšky cappuccino** and **Kalíšky latté** categories on
[marseiceramics.cz](https://marseiceramics.cz) and sends a **Telegram** alert the instant any
cup becomes purchasable. Alerts fire only on the sold-out → in-stock transition (no repeats
while it stays in stock).

## How it works

The store is Lunar (Laravel) + Livewire. The initial server HTML defaults every card to
"available", so the monitor replays a Livewire call per category (`Code.gs:fetchCategoryStock`)
to get the real stock state — pure HTTP, no headless browser.

It sends two updates in one POST: `callMethod load` (fetches real stock from the DB) and
`syncInput filterValues.product-boolean-attributes.in-stock` (applies the "skladem" filter
server-side). The response HTML contains only in-stock products across all pages, so pagination
is not an issue. If the filtered result is empty the server returns a known empty-state string
that the script checks as a sanity signal.

State (which categories currently have stock) is persisted in `ScriptProperties` across runs.

## Setup (~5 min, free)

1. **Bot:** message `@BotFather` → `/newbot` → copy the **token**.
2. **Chat id:** send your new bot any message, then run `setChatIdFromUpdates()` once and read the
   execution log for `"chat":{"id": <NUMBER>}`.
3. **Project:** create a project at [script.google.com](https://script.google.com), paste `Code.gs`.
4. **Secrets:** Project Settings → Script Properties → add `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`.
   Optionally add `EMAIL_TO` for health alerts (defaults to the Google account owner).
5. **Authorize:** run `checkStock()` once manually and approve the external-request permission.
6. **Schedule:** Triggers → add time-driven trigger on `checkStock`, every 1 minute.

## Customizing

- Watch different categories: edit `CATEGORIES` (use the slug from `/kategorie/<slug>`).
- Active hours: `ACTIVE_START_HOUR` / `ACTIVE_END_HOUR` (Prague time, default 09:00–21:00).
- Health alerts: after `FAIL_THRESHOLD` (default 3) consecutive failures an email is sent;
  another email fires when the monitor recovers.
