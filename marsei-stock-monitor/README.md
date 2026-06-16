# MarSei Ceramics restock monitor

Cups on [marseiceramics.cz](https://marseiceramics.cz) sell out within seconds of a drop.
This monitor watches the **Kalíšky cappuccino** and **Kalíšky latté** categories and sends
a **Telegram** push notification the moment anything becomes purchasable — so you can open
the shop before it's gone again.

Runs as a Google Apps Script on a 1-minute trigger. No server, no headless browser, free forever.

## Setup (~5 min)

1. Create a Telegram bot via `@BotFather`, copy the token.
2. Message the bot, run `setChatIdFromUpdates()` in the script editor, read the log for your chat id.
3. Paste `Code.gs` into a new [Apps Script](https://script.google.com) project.
4. Project Settings → Script Properties → add `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`.
5. Run `checkStock()` once to grant permissions.
6. Triggers → time-driven → `checkStock` → every 1 minute.
