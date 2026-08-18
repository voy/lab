// pinwand-patrol — Google Apps Script variant.
//
// Watches a password-protected TaskCards pinboard and emails a German summary
// of changes to a list of parents. See README.md for setup.
//
// Script Properties (Project Settings → Script Properties):
//   BOARD_ID           board UUID from the share link
//   SHARE_TOKEN        token UUID from the share link
//   BOARD_PASSWORD     the board password
//   EMAIL_TO           comma-separated recipient list
//   ANTHROPIC_API_KEY  optional — without it, emails contain plain change counts
//
// Managed by the script itself: VISITOR_TOKEN, SNAPSHOT_FILE_ID.

const BASE = "https://www.taskcards.de";
const PROPS = PropertiesService.getScriptProperties();

// Trigger entry point (time-driven).
function checkBoard() {
  run_(true);
}

// Manual run: logs the email instead of sending it.
function debugRun() {
  run_(false);
}

// One-shot E2E test helper: rewinds the stored snapshot so the next run sees
// realistic changes against the real, unchanged board — a "new" post (the
// board's most content-rich card), a "rescheduled" date, and a "new"
// attachment. All content in the resulting diff is real board content.
// Then run debugRun() (logs the email) or checkBoard() (actually sends it).
// The next run saves a fresh snapshot, so state self-heals after one cycle.
function simulateChanges() {
  const text = readSnapshot_();
  if (!text) {
    Logger.log("No snapshot yet — run debugRun() first to store the baseline.");
    return;
  }
  const s = JSON.parse(text);
  const simulated = [];

  // 1) "New post": hide the most content-rich card, so the real card
  //    reappears as freshly posted with its full text, dates, and files.
  let richest = -1;
  s.cards.forEach(function (c, i) {
    if (richest === -1 || (c.description || "").length > (s.cards[richest].description || "").length) {
      richest = i;
    }
  });
  if (richest !== -1) {
    simulated.push('new post "' + (s.cards[richest].title || "(ohne Titel)") + '"');
    s.cards.splice(richest, 1);
  }

  // 2) "Rescheduled": shift the first date in some card's stored description
  //    back a day, so the real board looks like the teacher moved a date.
  const dateRe = /(\d{1,2})\.(\d{1,2})\./;
  for (let i = 0; i < s.cards.length; i++) {
    const m = (s.cards[i].description || "").match(dateRe);
    if (!m) continue;
    const day = Number(m[1]);
    const shifted = (day > 1 ? day - 1 : day + 1) + "." + m[2] + ".";
    s.cards[i].description = s.cards[i].description.replace(dateRe, shifted);
    simulated.push('date moved on "' + s.cards[i].title + '": ' + shifted + " → " + m[0]);
    break;
  }

  // 3) "New attachment": hide one real file, so it reappears as newly uploaded.
  for (let j = 0; j < s.cards.length; j++) {
    if ((s.cards[j].attachments || []).length > 0) {
      const file = s.cards[j].attachments.pop();
      simulated.push('new attachment "' + file + '" on "' + (s.cards[j].title || "(ohne Titel)") + '"');
      break;
    }
  }

  if (simulated.length === 0) {
    Logger.log("Nothing to simulate — snapshot has no cards.");
    return;
  }
  writeSnapshot_(s);
  Logger.log(
    "Snapshot rewound — simulated:\n  - " +
      simulated.join("\n  - ") +
      "\nRun debugRun() to preview the email or checkBoard() to send it.",
  );
}

function run_(sendEmail) {
  const board = fetchBoard_();
  const snapshot = normalize_(board);

  const prevText = readSnapshot_();
  if (!prevText) {
    writeSnapshot_(snapshot);
    Logger.log('Baseline saved: %s cards on "%s".', String(snapshot.cards.length), snapshot.board);
    return;
  }

  const diff = diff_(JSON.parse(prevText), snapshot);
  const count = diff.added.length + diff.removed.length + diff.changed.length;
  if (count === 0) {
    Logger.log("No changes.");
    return;
  }

  Logger.log(
    "Changes detected: %s added, %s changed, %s removed — %s",
    String(diff.added.length),
    String(diff.changed.length),
    String(diff.removed.length),
    diff.added.concat(diff.changed.map(function (x) { return x.after; }), diff.removed)
      .map(function (c) { return c.title || "(ohne Titel)"; })
      .join(" | "),
  );

  const summary = summarize_(diff) || fallbackSummary_(diff, snapshot);
  const body = buildEmail_(summary, diff);
  writeSnapshot_(snapshot);

  if (sendEmail) {
    MailApp.sendEmail({
      to: PROPS.getProperty("EMAIL_TO"),
      subject: 'Pinnwand "' + snapshot.board + '": Neuigkeiten',
      body: body,
    });
    Logger.log("Email sent to %s.", PROPS.getProperty("EMAIL_TO"));
  } else {
    Logger.log(body);
  }
}

// --- TaskCards API ---

function gql_(token, query, variables) {
  const res = UrlFetchApp.fetch(BASE + "/graphql", {
    method: "post",
    contentType: "application/json",
    headers: { "x-token": token },
    payload: JSON.stringify({ query: query, variables: variables }),
    muteHttpExceptions: true,
  });
  return JSON.parse(res.getContentText());
}

function createVisitor_() {
  const json = gql_("", "mutation { createVisitor { id } }");
  return json.data.createVisitor.id;
}

function unlock_(token) {
  const url =
    BASE +
    "/api/boards/" +
    PROPS.getProperty("BOARD_ID") +
    "/permissions/" +
    PROPS.getProperty("SHARE_TOKEN") +
    "/accesses";
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "x-token": token },
    payload: JSON.stringify({ password: PROPS.getProperty("BOARD_PASSWORD") }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 201) {
    throw new Error(
      "Unlock failed (HTTP " + res.getResponseCode() + ") — wrong password or revoked share link.",
    );
  }
}

const BOARD_QUERY =
  "query ($id: String!) { board(id: $id) { id name " +
  "lists { id name position } " +
  "cards { id title description link created modified " +
  "attachments { filename } comments { text } " +
  "kanbanPosition { listId position } } } }";

function fetchBoard_() {
  const boardId = PROPS.getProperty("BOARD_ID");
  let token = PROPS.getProperty("VISITOR_TOKEN");
  if (!token) {
    token = createVisitor_();
    PROPS.setProperty("VISITOR_TOKEN", token);
  }
  let json = gql_(token, BOARD_QUERY, { id: boardId });
  if (json.errors) {
    // Token expired or not yet authorized for this board: mint a fresh one and unlock.
    Logger.log("Visitor token rejected (%s) — re-authenticating.", JSON.stringify(json.errors));
    token = createVisitor_();
    unlock_(token);
    PROPS.setProperty("VISITOR_TOKEN", token);
    Logger.log("Re-authenticated with fresh visitor token.");
    json = gql_(token, BOARD_QUERY, { id: boardId });
  }
  if (json.errors || !json.data || !json.data.board) {
    throw new Error("Board fetch failed: " + JSON.stringify(json.errors || json));
  }
  return json.data.board;
}

// --- Snapshot storage (Drive file; revisions provide history) ---

function readSnapshot_() {
  const id = PROPS.getProperty("SNAPSHOT_FILE_ID");
  if (!id) return null;
  try {
    return DriveApp.getFileById(id).getBlob().getDataAsString();
  } catch (e) {
    return null;
  }
}

function writeSnapshot_(snapshot) {
  const text = JSON.stringify(snapshot, null, 2);
  const id = PROPS.getProperty("SNAPSHOT_FILE_ID");
  if (id) {
    try {
      DriveApp.getFileById(id).setContent(text);
      return;
    } catch (e) {
      Logger.log("Snapshot file %s not writable (%s) — creating a fresh one.", id, e);
    }
  }
  const file = DriveApp.createFile("pinwand-patrol-snapshot.json", text, "application/json");
  PROPS.setProperty("SNAPSHOT_FILE_ID", file.getId());
  Logger.log("Created snapshot file in Drive: %s", file.getId());
}

// --- Normalize & diff ---

function normalize_(board) {
  const listName = {};
  board.lists.forEach(function (l) {
    listName[l.id] = l.name.trim();
  });
  const cards = board.cards
    .map(function (c) {
      const listId = c.kanbanPosition ? c.kanbanPosition.listId : null;
      return {
        id: c.id,
        list: listName[listId] || null,
        title: (c.title || "").trim(),
        description: c.description || "",
        link: c.link || "",
        attachments: (c.attachments || []).map(function (a) { return a.filename; }).sort(),
        comments: (c.comments || []).map(function (x) { return x.text; }),
        modified: c.modified,
      };
    })
    .sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  const lists = board.lists
    .slice()
    .sort(function (a, b) { return a.position - b.position; })
    .map(function (l) { return l.name.trim(); });
  return { board: board.name, lists: lists, cards: cards };
}

const CONTENT_FIELDS = ["list", "title", "description", "link", "attachments", "comments"];

function contentKey_(card) {
  const o = {};
  CONTENT_FIELDS.forEach(function (f) { o[f] = card[f]; });
  return JSON.stringify(o);
}

function diff_(prev, next) {
  const prevById = {};
  prev.cards.forEach(function (c) { prevById[c.id] = c; });
  const nextById = {};
  next.cards.forEach(function (c) { nextById[c.id] = c; });
  return {
    added: next.cards.filter(function (c) { return !prevById[c.id]; }),
    removed: prev.cards.filter(function (c) { return !nextById[c.id]; }),
    changed: next.cards
      .filter(function (c) {
        return prevById[c.id] && contentKey_(prevById[c.id]) !== contentKey_(c);
      })
      .map(function (c) { return { before: prevById[c.id], after: c }; }),
  };
}

// --- Summarize (Claude) ---

const SUMMARY_PROMPT =
  "You summarize changes to a German school class pinboard (TaskCards) so parents don't have to read the board. " +
  "You receive a JSON diff with added, removed, and changed cards; changed cards carry before/after. " +
  "Descriptions may contain HTML markup — read through it, never reproduce it.\n\n" +
  "Write in plain German, neutral and friendly, as running text for a plain-text email: " +
  "no markdown, no greeting, no preamble. Scale length to the changes — one small change is one or " +
  "two sentences; several changes get a short sentence each, most actionable first.\n\n" +
  "Never omit actionable details that appear in the diff: dates, times, and deadlines; amounts of money " +
  "and payment details; things to sign, bring, buy, or return; locations; schedule changes. " +
  "For changed cards, say what actually changed (for a moved date: old and new). " +
  "Mention new file attachments by filename so parents know to open them on the board. " +
  "Keep card and list titles verbatim.\n\n" +
  "Only report what is in the diff — never infer or invent details. If a change is trivial " +
  "(typo, formatting), say so in a few words instead of dramatizing it.";

// Models are separate capacity pools: when Opus is overloaded (529), Haiku
// usually isn't. Try each in order, with per-model retries.
const SUMMARY_MODELS = ["claude-sonnet-5", "claude-haiku-4-5"];

function summarize_(diff) {
  const key = PROPS.getProperty("ANTHROPIC_API_KEY");
  if (!key) return null;
  for (let i = 0; i < SUMMARY_MODELS.length; i++) {
    try {
      const text = trySummarize_(SUMMARY_MODELS[i], diff, key);
      if (text) return text;
    } catch (e) {
      Logger.log("Summarizer (%s) failed: %s", SUMMARY_MODELS[i], e);
    }
  }
  return null;
}

function trySummarize_(model, diff, key) {
  const RETRYABLE = [429, 500, 529];
  const MAX_ATTEMPTS = 3;
  const body = {
    model: model,
    max_tokens: 16000,
    system: SUMMARY_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(diff) }],
  };
  const headers = { "x-api-key": key, "anthropic-version": "2023-06-01" };
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
      method: "post",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify(body),
      muteHttpExceptions: true,
    });
    const status = res.getResponseCode();
    if (RETRYABLE.indexOf(status) !== -1 && attempt < MAX_ATTEMPTS) {
      const retryAfter = Number(res.getHeaders()["retry-after"]) || 0;
      const backoffSeconds = Math.max(retryAfter, Math.pow(2, attempt)); // 2s, 4s
      Logger.log("%s HTTP %s, retrying in %ss (attempt %s/%s)", model, String(status), String(backoffSeconds), String(attempt), String(MAX_ATTEMPTS));
      Utilities.sleep(backoffSeconds * 1000);
      continue;
    }
    const json = JSON.parse(res.getContentText());
    if (status !== 200 || json.stop_reason === "refusal") {
      Logger.log("%s unavailable (HTTP %s): %s", model, String(status), res.getContentText());
      return null; // caller moves on to the next model
    }
    const text = json.content
      .filter(function (b) { return b.type === "text"; })
      .map(function (b) { return b.text; })
      .join("")
      .trim();
    Logger.log(
      "Summary by %s: %s input / %s output tokens.",
      json.model,
      String(json.usage.input_tokens),
      String(json.usage.output_tokens),
    );
    return text || null;
  }
  return null;
}

function fallbackSummary_(diff, snapshot) {
  return (
    diff.added.length + " neue, " +
    diff.changed.length + " geänderte, " +
    diff.removed.length + " entfernte Karte(n) auf \"" + snapshot.board + "\"."
  );
}

// --- Email ---

function buildEmail_(summary, diff) {
  const lines = [summary, "", "Betroffene Karten:"];
  diff.added.forEach(function (c) {
    lines.push("  + " + (c.title || "(ohne Titel)") + (c.list ? " — " + c.list : ""));
  });
  diff.changed.forEach(function (x) {
    lines.push("  ~ " + (x.after.title || "(ohne Titel)") + (x.after.list ? " — " + x.after.list : ""));
  });
  diff.removed.forEach(function (c) {
    lines.push("  − " + (c.title || "(ohne Titel)") + (c.list ? " — " + c.list : ""));
  });
  lines.push("");
  lines.push("—");
  lines.push(
    "Diese Zusammenfassung wurde automatisch von einer KI erstellt und kann Fehler enthalten. " +
      "Verbindlich ist allein die Pinnwand — bitte wichtige Termine und Angaben dort nachprüfen:",
  );
  lines.push(
    BASE + "/#/board/" + PROPS.getProperty("BOARD_ID") +
      "?token=" + PROPS.getProperty("SHARE_TOKEN"),
  );
  return lines.join("\n");
}
