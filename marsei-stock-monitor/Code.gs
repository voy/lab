/**
 * MarSei Ceramics restock monitor (Google Apps Script).
 *
 * Polls the "Kalíšky cappuccino" and "Kalíšky latté" categories on marseiceramics.cz
 * and sends a Telegram alert when a category goes from all-sold-out to having anything
 * buyable. Detection is category-level: (products on page) > ("Vyprodáno" markers).
 *
 * Channels: restock alerts -> Telegram (urgent). Health alerts -> email: one mail after
 * FAIL_THRESHOLD consecutive failed runs, and one "recovered" mail when it reads again.
 *
 * SETUP (no secrets live in this file — they go in Script Properties):
 *   1. Create a Telegram bot via @BotFather, copy its token.
 *   2. Send the bot any message, then run setChatIdFromUpdates() once and read the log.
 *   3. Project Settings -> Script Properties -> add:
 *        TELEGRAM_TOKEN   = <bot token>
 *        TELEGRAM_CHAT_ID = <chat id>
 *        EMAIL_TO         = <your email>   (optional; defaults to this account's owner)
 *   4. Run checkStock() once manually to grant the external-request permission.
 *   5. Triggers -> add time-driven trigger on checkStock, every 1 or 5 minutes.
 *
 * To test the Telegram path: set DEBUG_FORCE_ALERT = true, run checkStock() once
 * (it sends a sample alert and skips the real check), then set it back to false.
 */

var BASE = 'https://marseiceramics.cz';
var CATEGORIES = ['kalisky-cappuccino', 'kalisky-latte'];
var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
         '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';
var STATE_KEY = 'availableCategories';
var FAIL_KEY = 'failCount';            // consecutive failed runs (persisted across executions)
var NEXT_TRY_KEY = 'nextTryAt';        // epoch ms; after a failure, don't retry before this

var DEBUG_FORCE_ALERT = false;         // set true for one run to fire a test Telegram alert

// Run a 1-minute trigger, but only actually poll during daytime Prague hours.
// (Drops cluster Tue + midday/evening; nothing of value happens overnight.)
var ACTIVE_START_HOUR = 9;             // inclusive, Europe/Prague
var ACTIVE_END_HOUR = 21;             // exclusive
var RETRY_DELAY_MIN = 5;               // after any failure, wait this long before retrying
var FAIL_THRESHOLD = 3;                // email after this many consecutive failures

// ---- entry point (wire this to the time-driven trigger) --------------------

function checkStock() {
  var props = PropertiesService.getScriptProperties();

  if (DEBUG_FORCE_ALERT) {
    notifyTelegram(CATEGORIES.map(function (c) { return { slug: c, inStockCount: '(test)' }; }));
    Logger.log('DEBUG_FORCE_ALERT — sent test alert, skipping real check.');
    return;
  }

  if (!isActiveNow()) { Logger.log('Outside active hours — skipping run.'); return; }
  var nextTry = Number(props.getProperty(NEXT_TRY_KEY) || 0);
  if (Date.now() < nextTry) {                                  // cooling down after a failure
    Logger.log('Cooling down until %s', new Date(nextTry));
    return;
  }

  try {
    Logger.log('Polling %s', CATEGORIES.join(', '));
    var results = CATEGORIES.map(fetchCategoryStock);
    var availableNow = results.filter(function (r) { return r.available; });
    var nowSlugs = availableNow.map(function (r) { return r.slug; });

    var prev = JSON.parse(props.getProperty(STATE_KEY) || '[]');
    var newly = availableNow.filter(function (r) { return prev.indexOf(r.slug) === -1; });
    if (newly.length) notifyTelegram(newly);
    props.setProperty(STATE_KEY, JSON.stringify(nowSlugs));

    onSuccess(props);
    Logger.log('OK — ' + availableNow.length + '/' + CATEGORIES.length + ' categories have stock, ' + newly.length + ' newly available.');
  } catch (err) {
    onFailure(props, err);
  }
}

// Reset failure tracking; if we had previously alerted, send one "recovered" email.
function onSuccess(props) {
  var fails = Number(props.getProperty(FAIL_KEY) || 0);
  if (fails >= FAIL_THRESHOLD) {
    emailAlert('MarSei monitor recovered',
      'The monitor can read the shop again (after ' + fails + ' consecutive failures).');
  }
  props.deleteProperty(FAIL_KEY);
  props.deleteProperty(NEXT_TRY_KEY);
}

// Count the failure, schedule a retry, and email exactly once on the FAIL_THRESHOLD-th strike.
function onFailure(props, err) {
  var fails = Number(props.getProperty(FAIL_KEY) || 0) + 1;
  props.setProperty(FAIL_KEY, String(fails));
  props.setProperty(NEXT_TRY_KEY, String(Date.now() + RETRY_DELAY_MIN * 60 * 1000));
  Logger.log('Attempt failed (%s in a row): %s', fails, err);
  if (fails === FAIL_THRESHOLD) {
    emailAlert('MarSei monitor is failing',
      fails + ' consecutive failures — the monitor cannot read the shop.\n\nLast error:\n' + err);
  }
}

// ---- stock fetching --------------------------------------------------------

function fetchCategoryStock(slug) {
  var catUrl = BASE + '/kategorie/' + slug;
  var pageResp = UrlFetchApp.fetch(catUrl, {
    muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': UA }
  });
  assertOk(pageResp, slug + ' page');
  var page = pageResp.getContentText();
  var cookie = cookieHeader(pageResp);

  var tokenMatch = page.match(/window\.livewire_token\s*=\s*'([^']+)'/);
  if (!tokenMatch) throw new Error('livewire_token not found for ' + slug);
  var token = tokenMatch[1];

  var initial = extractComponent(page, 'collection-page');
  if (!initial) throw new Error('collection-page component not found for ' + slug);

  // Send load + skladem filter as a single Livewire call against the original serverMemo.
  // Two separate calls fail with 500 — the load response serverMemo checksum is not reusable.
  var resp = UrlFetchApp.fetch(BASE + '/livewire/message/collection-page', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: {
      'X-CSRF-TOKEN': token, 'X-Livewire': 'true',
      'Accept': 'text/html, application/xhtml+xml',
      'User-Agent': UA, 'Referer': catUrl, 'Origin': BASE, 'Cookie': cookie
    },
    payload: JSON.stringify({
      fingerprint: initial.fingerprint, serverMemo: initial.serverMemo,
      updates: [
        { type: 'callMethod', payload: { id: 'load', method: 'load', params: [] } },
        { type: 'syncInput', payload: { id: 'filter', name: 'filterValues.product-boolean-attributes.in-stock', value: 'in-stock' } }
      ]
    })
  });
  assertOk(resp, slug + ' load+filter');
  var filterHtml = JSON.parse(resp.getContentText()).effects.html;
  var inStock = countProducts(filterHtml);

  var status;
  if (inStock > 0) {
    status = inStock + ' in stock — RESTOCK!';
  } else if (/Tady prozat[ií]m nic nem[aá]me/i.test(filterHtml)) {
    status = '0 in stock (empty-state confirmed — filter OK)';
  } else {
    status = '0 in stock (WARNING: empty-state text not found — verify filter is still working)';
  }
  Logger.log('  ' + slug + ': ' + status);
  return { slug: slug, inStockCount: inStock, available: inStock > 0 };
}

function countProducts(html) {
  var seen = {}, re = /\/produkty\/([a-z0-9\-]+)/g, m;
  while ((m = re.exec(html)) !== null) seen[m[1]] = true;
  return Object.keys(seen).length;
}

// ---- Telegram --------------------------------------------------------------

function notifyTelegram(cats) {
  Logger.log('Restock! Alerting: %s', cats.map(function (c) { return c.slug; }).join(', '));
  var lines = cats.map(function (c) {
    return '🛎️ ' + catLabel(c.slug) + ' — ' + c.inStockCount + ' in stock\n' +
           BASE + '/kategorie/' + c.slug;
  });
  sendTelegram('Restock at MarSei Ceramics!\n\n' + lines.join('\n\n'));
}

function sendTelegram(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) throw new Error('TELEGRAM_TOKEN / TELEGRAM_CHAT_ID not set');

  var resp = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    muteHttpExceptions: true,
    payload: { chat_id: chatId, text: text, disable_web_page_preview: 'false' }
  });
  Logger.log('Telegram sendMessage -> HTTP %s', resp.getResponseCode());
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

// ---- helpers ---------------------------------------------------------------

function extractComponent(page, name) {
  var re = /wire:initial-data="([^"]*)"/g, m;
  while ((m = re.exec(page)) !== null) {
    var json = htmlUnescape(m[1]);
    if (json.indexOf('"name":"' + name + '"') !== -1) {
      return JSON.parse(json);
    }
  }
  return null;
}

function cookieHeader(resp) {
  var headers = resp.getAllHeaders();
  var sc = headers['Set-Cookie'];
  if (!sc) return '';
  if (!Array.isArray(sc)) sc = [sc];
  return sc.map(function (c) { return c.split(';')[0]; }).join('; ');
}

function isActiveNow() {
  var hour = Number(Utilities.formatDate(new Date(), 'Europe/Prague', 'H'));
  return hour >= ACTIVE_START_HOUR && hour < ACTIVE_END_HOUR;
}

function assertOk(resp, label) {
  var code = resp.getResponseCode();
  if (code !== 200) throw new Error('HTTP ' + code + ' on ' + label);
}

function emailAlert(subject, body) {
  var to = PropertiesService.getScriptProperties().getProperty('EMAIL_TO')
        || Session.getEffectiveUser().getEmail();
  if (!to) { Logger.log('No email recipient configured.'); return; }
  MailApp.sendEmail(to, subject, body);
  Logger.log('Emailed "%s" to %s', subject, to);
}

function htmlUnescape(s) {
  return s.replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function catLabel(cat) {
  return cat === 'kalisky-cappuccino' ? 'cappuccino'
       : cat === 'kalisky-latte' ? 'latté' : cat;
}
