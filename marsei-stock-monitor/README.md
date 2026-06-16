# MarSei Ceramics restock monitor

Google Apps Script that watches the **Kalíšky cappuccino** and **Kalíšky latté** categories on
[marseiceramics.cz](https://marseiceramics.cz) and sends a **Telegram** alert the instant any
cup flips from *Vyprodáno* (sold out) to purchasable. Alerts fire only on the
sold-out → in-stock transition (no repeats while it stays in stock).

## How it works
The store is Lunar (Laravel) + Livewire. The initial server HTML defaults every card to
"available", so the monitor replays the Livewire `load` call per category (`Code.gs:fetchCategoryStock`)
to get the *real* stock state — pure HTTP, no headless browser. The returned card HTML is parsed
per product (`parseProducts`) for the `Vyprodáno` marker. State is diffed against the previous
run, stored in `ScriptProperties.inStockSlugs`.

## Setup (~5 min, free)
1. **Bot:** message `@BotFather` → `/newbot` → copy the **token**.
2. **Chat id:** send your new bot any message, then run `setChatIdFromUpdates()` once and read the
   execution log for `"chat":{"id": <NUMBER>}`.
3. **Project:** create a project at [script.google.com](https://script.google.com), paste `Code.gs`.
4. **Secrets:** Project Settings → Script Properties → add `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`.
   (No secrets live in the source — they are read from Script Properties at runtime.)
5. **Authorize:** run `checkStock()` once manually and approve the external-request permission.
6. **Schedule:** Triggers → add time-driven trigger on `checkStock`, every 1 or 5 minutes.

## Customizing
- Watch different categories: edit `CATEGORIES` (use the slug from `/kategorie/<slug>`).
- The categories currently page-1 only (≤9 items each). If a category grows past one page, the
  log emits a pagination warning — extend `fetchCategoryStock` to follow `gotoPage` then.
