# pinwand-patrol

Watches a password-protected [TaskCards](https://www.taskcards.de) pinboard and
tells you what the teacher changed — a 2–4 sentence German summary written by
Claude, plus the list of affected cards. Silent when nothing changed.

Two variants sharing the same logic:

- **`Code.gs`** — Google Apps Script (the deployed one). Runs on a time
  trigger, emails a parent list via `MailApp`, stores the previous snapshot as
  a JSON file in Drive (Drive revisions = free history), secrets in Script
  Properties. No server, no build step.
- **`check.mjs`** — local Node variant. macOS notification instead of email,
  snapshot in `~/.config/pinwand-patrol/`, secrets in the macOS Keychain.

## How it works

TaskCards is a GraphQL app. The script mints an anonymous visitor token
(`createVisitor`), unlocks the board once via
`POST /api/boards/<id>/permissions/<token>/accesses` with the password, then
pulls the whole board (lists, cards, attachments, comments) in a single query.
Cards are normalized and diffed by id on content fields only, so reorderings
and reaction counters don't trigger noise. The diff goes to `claude-sonnet-5`
(with `claude-haiku-4-5` as an overload fallback) for the German summary;
without an API key it falls back to plain change counts. Emails carry a fixed
German footer noting the summary is AI-generated and linking to the board as
the authoritative source.

## Apps Script setup (~5 min)

1. [script.google.com](https://script.google.com) → New project → paste in
   `Code.gs`.
2. Project Settings → Script Properties → add:
   - `BOARD_ID` and `SHARE_TOKEN` — the two UUIDs from the share link
     `https://www.taskcards.de/#/board/<BOARD_ID>?token=<SHARE_TOKEN>`
   - `BOARD_PASSWORD` — the board password
   - `EMAIL_TO` — comma-separated recipients
   - `ANTHROPIC_API_KEY` — optional, for the Claude summary
3. Run `debugRun()` once to grant permissions and store the baseline snapshot
   (first run never emails).
4. Run `simulateChanges()` — it rewinds the stored snapshot so the next run
   sees realistic changes (a "new" post, a "moved" date, a "new" attachment,
   all built from real board content) — then `debugRun()` to preview the email
   in the log without sending, or `checkBoard()` to actually send it. State
   self-heals after one run.
5. Triggers → add time-driven trigger → `checkBoard` → day timer → e.g. 7-8am,
   timezone Europe/Berlin. Set the trigger's failure notification to
   "immediately" so you hear about breakage (e.g. a rotated board password).

The script manages `VISITOR_TOKEN` and `SNAPSHOT_FILE_ID` properties itself.

## Local Node variant

```sh
npm install
security add-generic-password -s pinwand-patrol -a taskcards -w    # board password
security add-generic-password -s pinwand-patrol -a anthropic -w    # Anthropic API key (optional)
node check.mjs   # first run creates ~/.config/pinwand-patrol/config.json — fill in the two UUIDs
```

First run stores a baseline; later runs print/notify a summary on changes and
archive the old snapshot under `~/.config/pinwand-patrol/history/`.
