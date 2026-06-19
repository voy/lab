# sayyato-booker

Automated class booking for [Sayyato](https://sayyato.de) gym in Berlin, built on top of the clubkonzepte24.de booking platform.

Runs daily on GitHub Actions, books configured classes two days ahead, skips Berlin public holidays and Schulferien, and sends Telegram notifications. A Gist-backed skip list lets you veto individual dates without touching code.

## Why Playwright

The booking backend runs a Node.js/Express API that enforces a TLS fingerprint check on every connection. Requests from curl, Node.js, and Python's `urllib` all use OpenSSL or LibreSSL — their JA3 TLS Client Hello signatures differ from Chrome's BoringSSL and get rejected with HTTP 403 at the server middleware layer.

Playwright launches a real Chromium instance, which uses BoringSSL and produces the same JA3 fingerprint as a desktop Chrome browser. The page navigation also triggers the Angular app's initialization sequence (`checkVersion` → `authenticate`), establishing the session in exactly the way the server expects. API calls are then made via `page.evaluate()` into the Angular `$http` service, so they ride the same browser context and TLS session.

## Why not Google Apps Script

GAS was the first approach — it runs on Google's infrastructure, has a built-in cron scheduler (`time-based triggers`), and can call external HTTP APIs. Two blockers killed it:

1. **Header stripping.** GAS's `UrlFetchApp` silently drops `sec-fetch-*` headers and overrides `User-Agent` with `"Google-Apps-Script"`. The booking server checks these headers as part of its browser-verification logic.

2. **TLS fingerprinting.** GAS makes outbound HTTPS connections through Google's Java-based HTTP stack. Its JA3 fingerprint matches no known browser and is rejected server-side before headers are even inspected.

Neither issue is fixable from within GAS — both are enforced by the runtime.

## Setup

All configuration is injected at runtime via GitHub Secrets — nothing personal lives in the repository. Copy `config.json.example` to `config.json` for local use.

| Secret | Description |
|---|---|
| `SAYYATO_EMAIL` | Login email |
| `SAYYATO_PASSWORD` | Login password |
| `SAYYATO_API_BASE` | Booking API base URL |
| `SAYYATO_CLUB_ID` | Club UUID |
| `SAYYATO_PLAN_ID` | Booking plan UUID |
| `SAYYATO_DAYS_AHEAD` | How many days ahead to book (default: 2) |
| `SAYYATO_COURSES` | JSON array of `{"dow": <0-6>, "name": "<partial match>"}` |
| `SAYYATO_TELEGRAM_TOKEN` | Bot token from @BotFather |
| `SAYYATO_TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `SAYYATO_SKIP_GIST_URL` | Raw URL of a Gist containing a JSON date array |

## Skip list

To skip a date (e.g. because you cancelled a class), add it to the Gist:

```json
["2026-06-22", "2026-07-07"]
```

On the next run, `sync` will cancel any existing bookings for those dates and `book` will not rebook them.

## Commands

```
python3 book.py book      # book the class DAYS_AHEAD from today (default)
python3 book.py sync      # cancel booked slots that appear in the skip list
python3 book.py debug     # show upcoming schedule with booking status, no changes
python3 book.py list      # list currently booked slots
python3 book.py book-all  # book every available future slot
```
