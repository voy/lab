/**
 * MarSei Ceramics restock monitor (Google Apps Script).
 *
 * Polls the "Kalíšky cappuccino" and "Kalíšky latté" categories on marseiceramics.cz
 * and sends a Telegram alert the moment any cup flips from "Vyprodáno" (sold out) to
 * purchasable. Alerts fire only on the sold-out -> in-stock transition.
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
 */

var BASE = 'https://marseiceramics.cz';
var CATEGORIES = ['kalisky-cappuccino', 'kalisky-latte'];
var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
         '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';
var STATE_KEY = 'inStockSlugs';
var FAIL_KEY = 'failCount';            // consecutive failed runs (persisted across executions)
var NEXT_TRY_KEY = 'nextTryAt';        // epoch ms; after a failure, don't retry before this

// Run a 1-minute trigger, but only actually poll during daytime Prague hours.
// (Drops cluster Tue + midday/evening; nothing of value happens overnight.)
var ACTIVE_START_HOUR = 8;             // inclusive, Europe/Prague
var ACTIVE_END_HOUR = 22;             // exclusive
var RETRY_DELAY_MIN = 5;               // after any failure, wait this long before retrying
var FAIL_THRESHOLD = 3;                // email after this many consecutive failures

// ---- entry point (wire this to the time-driven trigger) --------------------

function checkStock() {
  var props = PropertiesService.getScriptProperties();

  if (!isActiveNow()) { Logger.log('Outside active hours — skipping run.'); return; }
  var nextTry = Number(props.getProperty(NEXT_TRY_KEY) || 0);
  if (Date.now() < nextTry) {                                  // cooling down after a failure
    Logger.log('Cooling down until %s', new Date(nextTry));
    return;
  }

  try {
    var products = [];
    CATEGORIES.forEach(function (slug) {
      products = products.concat(fetchCategoryStock(slug));
    });

    var nowInStock = products.filter(function (p) { return p.inStock; });
    var nowSlugs = nowInStock.map(function (p) { return p.slug; });

    var prev = JSON.parse(props.getProperty(STATE_KEY) || '[]');
    var newlyAvailable = nowInStock.filter(function (p) {
      return prev.indexOf(p.slug) === -1;
    });
    if (newlyAvailable.length) notifyTelegram(newlyAvailable);
    props.setProperty(STATE_KEY, JSON.stringify(nowSlugs));

    onSuccess(props);
    Logger.log('OK — checked %s products, %s in stock, %s newly available.',
      products.length, nowInStock.length, newlyAvailable.length);
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

  // The initial server HTML defaults every card to "available"; the real stock
  // state only comes back from this Livewire "load" call.
  var payload = {
    fingerprint: initial.fingerprint,
    serverMemo: initial.serverMemo,
    updates: [{ type: 'callMethod', payload: { id: 'load', method: 'load', params: [] } }]
  };

  var resp = UrlFetchApp.fetch(BASE + '/livewire/message/collection-page', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {
      'X-CSRF-TOKEN': token,
      'X-Livewire': 'true',
      'Accept': 'text/html, application/xhtml+xml',
      'User-Agent': UA,
      'Referer': catUrl,
      'Origin': BASE,
      'Cookie': cookie
    }
  });

  assertOk(resp, slug + ' load');
  var html = JSON.parse(resp.getContentText()).effects.html;
  return parseProducts(html, slug);
}

function parseProducts(html, cat) {
  var firsts = {}, order = [], re = /\/produkty\/([a-z0-9\-]+)/g, m;
  while ((m = re.exec(html)) !== null) {
    if (!(m[1] in firsts)) { firsts[m[1]] = m.index; order.push(m[1]); }
  }
  order.sort(function (a, b) { return firsts[a] - firsts[b]; });

  var out = [];
  for (var i = 0; i < order.length; i++) {
    var slug = order[i];
    var start = firsts[slug];
    var end = (i + 1 < order.length) ? firsts[order[i + 1]] : html.length;
    // back up to capture the title anchor that precedes the product link
    var seg = html.substring(Math.max(0, start - 400), end);

    var name = slug;
    var aRe = new RegExp('<a[^>]*produkty\\/' + escapeRe(slug) + '[^>]*>([\\s\\S]*?)<\\/a>', 'g');
    var a;
    while ((a = aRe.exec(seg)) !== null) {
      var txt = a[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (txt) { name = txt; break; }
    }

    out.push({
      slug: slug,
      cat: cat,
      name: name,
      url: BASE + '/produkty/' + slug,
      inStock: !/Vyprod[aá]no/i.test(seg)
    });
  }

  if (/wire:click="[^"]*(nextPage|gotoPage)/.test(html) || html.indexOf('page=2') !== -1) {
    Logger.log('WARNING: pagination present in "%s" — only page 1 is checked.', cat);
  }
  return out;
}

// ---- Telegram --------------------------------------------------------------

function notifyTelegram(products) {
  Logger.log('Restock! Alerting: %s', products.map(function (p) { return p.name; }).join(', '));
  var lines = products.map(function (p) {
    return '🛎️ ' + p.name + '  (' + catLabel(p.cat) + ')\n' + p.url;
  });
  sendTelegram('Restock at MarSei Ceramics!\n\n' + lines.join('\n\n'));
}

function sendTelegram(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('TELEGRAM_TOKEN');
  var chatId = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatId) throw new Error('TELEGRAM_TOKEN / TELEGRAM_CHAT_ID not set');

  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    muteHttpExceptions: true,
    payload: { chat_id: chatId, text: text, disable_web_page_preview: 'false' }
  });
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

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function catLabel(cat) {
  return cat === 'kalisky-cappuccino' ? 'cappuccino'
       : cat === 'kalisky-latte' ? 'latté' : cat;
}
