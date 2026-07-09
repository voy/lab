/**
 * Weekly countdown/countup digest (Google Apps Script).
 *
 * Reads a two-column sheet (Label, Date) and sends one weekly Telegram
 * message summarizing how long it's been since (or until) each date, split
 * into Since/Until sections, e.g.
 * "⏳ Since\n1st seizure: 5 months since (150 days)".
 *
 * SETUP (no secrets live in this file — they go in Script Properties):
 *   1. Create a Telegram bot via @BotFather, copy its token (or reuse an
 *      existing one from another script).
 *   2. Fill in the bound sheet's first tab with a header row (Label, Date)
 *      and one data row per countdown/countup.
 *   3. Project Settings -> Script Properties -> add TELEGRAM_TOKEN (the
 *      token from step 1).
 *   4. Send the bot any message, then run setChatIdFromUpdates() and read
 *      the log for the chat id; add it as TELEGRAM_CHAT_ID.
 *   5. Run debugRun() once manually to grant permissions and preview the
 *      message in the log without sending it.
 *   6. Triggers -> add time-driven trigger on sendWeeklyDigest, weekly,
 *      Monday, 8-9am, timezone Europe/Prague.
 */

// ---- formatting -----------------------------------------------------------

function formatRow(label, targetDate, today) {
  var direction = targetDate.getTime() <= today.getTime() ? 'since' : 'until';
  var start = direction === 'since' ? targetDate : today;
  var end = direction === 'since' ? today : targetDate;
  var totalDays = Math.round((end - start) / 86400000);
  if (totalDays === 0) return label + ': today (0 days)';
  var breakdown = breakdownSpan(start, end);
  return label + ': ' + breakdown + ' ' + direction + ' (' + totalDays + ' days)';
}

// Calendar-aware years/months/weeks/days breakdown between two dates (start <= end).
function breakdownSpan(start, end) {
  var years = end.getFullYear() - start.getFullYear();
  var months = end.getMonth() - start.getMonth();
  var days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    var daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  var weeks = Math.floor(days / 7);
  days = days % 7;

  var parts = [];
  if (years > 0) parts.push(pluralize(years, 'year'));
  if (months > 0) parts.push(pluralize(months, 'month'));
  if (weeks > 0) parts.push(pluralize(weeks, 'week'));
  if (days > 0) parts.push(pluralize(days, 'day'));

  return parts.length ? parts.join(', ') : 'today';
}

function pluralize(n, unit) {
  return n + ' ' + unit + (n === 1 ? '' : 's');
}

// ---- digest assembly -------------------------------------------------------

function buildDigestMessage(entries, today) {
  if (!entries.length) return null;

  var since = entries.filter(function (e) { return e.date.getTime() <= today.getTime(); });
  var until = entries.filter(function (e) { return e.date.getTime() > today.getTime(); });

  since.sort(function (a, b) { return b.date.getTime() - a.date.getTime(); }); // most recent first
  until.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); }); // soonest first

  var sections = [];
  if (since.length) sections.push('⏳ Since\n\n' + since.map(toLine(today)).join('\n'));
  if (until.length) sections.push('🕒 Until\n\n' + until.map(toLine(today)).join('\n'));

  return '📅 Weekly update\n\n' + sections.join('\n\n');
}

function toLine(today) {
  return function (e) { return formatRow(e.label, e.date, today); };
}

// ---- sheet reading ----------------------------------------------------------

function readEntries() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var entries = [];
  for (var i = 1; i < values.length; i++) {   // skip header row
    var label = String(values[i][0] || '').trim();
    var rawDate = values[i][1];
    var date = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (!label || isNaN(date.getTime())) {
      Logger.log('Skipping row %s: label=%s date=%s', i + 1, label, rawDate);
      continue;
    }
    entries.push({ label: label, date: date });
  }
  return entries;
}

// ---- entry points -------------------------------------------------------

function sendWeeklyDigest() {
  var message = buildDigestMessage(readEntries(), new Date());
  if (!message) {
    Logger.log('No valid rows found — nothing to send.');
    return;
  }
  sendTelegram(message);
  Logger.log('Sent digest:\n' + message);
}

// Preview the digest without sending it to Telegram.
function debugRun() {
  var message = buildDigestMessage(readEntries(), new Date());
  Logger.log(message || '(no valid rows)');
}

// ---- Telegram -----------------------------------------------------------

function sendTelegram(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) throw new Error('TELEGRAM_TOKEN / TELEGRAM_CHAT_ID not set');

  var resp = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    muteHttpExceptions: true,
    payload: { chat_id: chatId, text: text }
  });
  var code = resp.getResponseCode();
  if (code === 200) {
    Logger.log('Telegram sendMessage -> HTTP 200');
  } else {
    Logger.log('Telegram sendMessage -> HTTP %s: %s', code, resp.getContentText());
  }
}

/** One-off helper: message your bot first, then run this and read the log for the chat id. */
function setChatIdFromUpdates() {
  var token = PropertiesService.getScriptProperties().getProperty('TELEGRAM_TOKEN');
  if (!token) { Logger.log('Set TELEGRAM_TOKEN in Script Properties first.'); return; }
  var resp = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getUpdates',
    { muteHttpExceptions: true });
  Logger.log(resp.getContentText());
  Logger.log('Find "chat":{"id": <NUMBER> ...} above and save it as TELEGRAM_CHAT_ID.');
}
