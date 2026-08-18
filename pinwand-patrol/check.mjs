#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Anthropic from "@anthropic-ai/sdk";

const BASE = "https://www.taskcards.de";
const DIR = path.join(os.homedir(), ".config", "pinwand-patrol");
const CONFIG = path.join(DIR, "config.json");
const STATE = path.join(DIR, "state.json");
const SNAPSHOT = path.join(DIR, "snapshot.json");
const HISTORY = path.join(DIR, "history");

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const writeJson = (f, data) => fs.writeFileSync(f, JSON.stringify(data, null, 2) + "\n");

function loadConfig() {
  if (!fs.existsSync(CONFIG)) {
    fs.mkdirSync(DIR, { recursive: true });
    writeJson(CONFIG, { boardId: "", shareToken: "" });
    console.error(`Created ${CONFIG} — fill in boardId and shareToken from the share link.`);
    process.exit(1);
  }
  const config = readJson(CONFIG);
  if (!config.boardId || !config.shareToken) {
    console.error(`Fill in boardId and shareToken in ${CONFIG}.`);
    process.exit(1);
  }
  return config;
}

function keychain(account) {
  return execFileSync(
    "security",
    ["find-generic-password", "-s", "pinwand-patrol", "-a", account, "-w"],
    { encoding: "utf8" },
  ).trim();
}

function keychainPassword() {
  try {
    return keychain("taskcards");
  } catch {
    console.error(
      "Board password not found in Keychain. Add it (interactive prompt, nothing lands in files or history):\n" +
        "  security add-generic-password -s pinwand-patrol -a taskcards -w",
    );
    process.exit(1);
  }
}

function anthropicApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    return keychain("anthropic");
  } catch {
    return undefined; // let the SDK try its own resolution, else counts fallback
  }
}

async function gql(token, query, variables) {
  const res = await fetch(`${BASE}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-token": token },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function createVisitor() {
  const json = await gql("", "mutation { createVisitor { id } }");
  return json.data.createVisitor.id;
}

async function unlock(token, config) {
  const url = `${BASE}/api/boards/${config.boardId}/permissions/${config.shareToken}/accesses`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-token": token },
    body: JSON.stringify({ password: keychainPassword() }),
  });
  if (res.status !== 201) {
    console.error(`Unlock failed (HTTP ${res.status}) — wrong password or revoked share link.`);
    process.exit(1);
  }
}

const BOARD_QUERY = `query ($id: String!) {
  board(id: $id) {
    id name
    lists { id name position }
    cards {
      id title description link created modified
      attachments { filename }
      comments { text }
      kanbanPosition { listId position }
    }
  }
}`;

async function fetchBoard(config) {
  fs.mkdirSync(DIR, { recursive: true });
  const state = fs.existsSync(STATE) ? readJson(STATE) : {};
  if (!state.visitorToken) {
    state.visitorToken = await createVisitor();
    writeJson(STATE, state);
  }
  let json = await gql(state.visitorToken, BOARD_QUERY, { id: config.boardId });
  if (json.errors) {
    // Token expired or not yet authorized for this board: mint a fresh one and unlock.
    state.visitorToken = await createVisitor();
    await unlock(state.visitorToken, config);
    writeJson(STATE, state);
    json = await gql(state.visitorToken, BOARD_QUERY, { id: config.boardId });
  }
  if (json.errors || !json.data?.board) {
    console.error("Board fetch failed:", JSON.stringify(json.errors ?? json));
    process.exit(1);
  }
  return json.data.board;
}

function normalize(board) {
  const listName = new Map(board.lists.map((l) => [l.id, l.name.trim()]));
  const cards = board.cards
    .map((c) => ({
      id: c.id,
      list: listName.get(c.kanbanPosition?.listId) ?? null,
      title: (c.title ?? "").trim(),
      description: c.description ?? "",
      link: c.link ?? "",
      attachments: (c.attachments ?? []).map((a) => a.filename).sort(),
      comments: (c.comments ?? []).map((x) => x.text),
      modified: c.modified,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const lists = board.lists
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((l) => l.name.trim());
  return { board: board.name, lists, cards };
}

const CONTENT_FIELDS = ["list", "title", "description", "link", "attachments", "comments"];
const contentKey = (card) =>
  JSON.stringify(Object.fromEntries(CONTENT_FIELDS.map((f) => [f, card[f]])));

function diffSnapshots(prev, next) {
  const prevById = new Map(prev.cards.map((c) => [c.id, c]));
  const nextById = new Map(next.cards.map((c) => [c.id, c]));
  return {
    added: next.cards.filter((c) => !prevById.has(c.id)),
    removed: prev.cards.filter((c) => !nextById.has(c.id)),
    changed: next.cards
      .filter((c) => prevById.has(c.id) && contentKey(prevById.get(c.id)) !== contentKey(c))
      .map((c) => ({ before: prevById.get(c.id), after: c })),
  };
}

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

async function summarize(diff) {
  const client = new Anthropic({ apiKey: anthropicApiKey() });
  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 16000,
    system: SUMMARY_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(diff) }],
  });
  if (response.stop_reason === "refusal") return null;
  return response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

function notify(text) {
  if (process.platform !== "darwin") return;
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  try {
    execFileSync("osascript", [
      "-e",
      `display notification "${esc(text).slice(0, 240)}" with title "Pinwand Patrol"`,
    ]);
  } catch {
    // notification is best-effort
  }
}

const config = loadConfig();
const snapshot = normalize(await fetchBoard(config));

if (!fs.existsSync(SNAPSHOT)) {
  writeJson(SNAPSHOT, snapshot);
  console.log(`Baseline saved: ${snapshot.cards.length} cards on "${snapshot.board}".`);
  process.exit(0);
}

const diff = diffSnapshots(readJson(SNAPSHOT), snapshot);
const count = diff.added.length + diff.removed.length + diff.changed.length;
if (count === 0) {
  console.log("No changes.");
  process.exit(0);
}

const fallbackText = `${diff.added.length} neue, ${diff.changed.length} geänderte, ${diff.removed.length} entfernte Karte(n) auf "${snapshot.board}".`;
let summary;
try {
  summary = (await summarize(diff)) ?? fallbackText;
} catch (err) {
  console.error(`Summarizer unavailable (${err.message}); falling back to counts.`);
  summary = fallbackText;
}

fs.mkdirSync(HISTORY, { recursive: true });
fs.copyFileSync(
  SNAPSHOT,
  path.join(HISTORY, `snapshot-${new Date().toISOString().replace(/[:.]/g, "-")}.json`),
);
writeJson(SNAPSHOT, snapshot);

console.log(summary);
notify(summary);
