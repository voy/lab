# countdown-digest

A Google Sheet of labeled dates ("1st seizure", "apartment finished", ...)
and a weekly Telegram message summarizing how long it's been since (or how
long until) each one, split into a Since/Until section and sorted
most-recent/soonest first within each, e.g.:

    📅 Weekly update

    ⏳ Since
    1st seizure: 5 months since (150 days)

    🕒 Until
    Dentist appointment: 5 days until (5 days)
    Apartment finished: 1 year, 5 months, 1 week, 5 days until (530 days)

Runs as a Google Apps Script bound to the sheet. No server, no build step,
free forever.

## Sheet format

First tab, header row, two columns:

| Label | Date |
|---|---|
| 1st seizure | 2026-02-08 |
| Apartment finished | 2027-12-20 |

"Since" vs "until" is inferred automatically from whether the date is in
the past or future. Rows with a blank Label or an unparseable Date are
skipped (logged, not sent).

## Setup (~5 min)

1. Create a Telegram bot via `@BotFather`, copy the token (or reuse an
   existing bot from another of your scripts).
2. Open your Google Sheet → Extensions → Apps Script, paste in `Code.gs`.
3. Project Settings → Script Properties → add `TELEGRAM_TOKEN` (the token
   from step 1).
4. Message the bot, run `setChatIdFromUpdates()` in the script editor, read
   the log for your chat id, then add it as `TELEGRAM_CHAT_ID` in Script
   Properties.
5. Run `debugRun()` once to grant permissions and preview the message in
   the log without sending it.
6. Triggers → add time-driven trigger → `sendWeeklyDigest` → week timer →
   every Monday, 8am-9am, timezone Europe/Prague.
