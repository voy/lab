/**
 * Weekly countdown/countup digest (Google Apps Script).
 *
 * Reads a two-column sheet (Label, Date) and sends one weekly Telegram
 * message summarizing how long it's been since (or until) each date, e.g.
 * "1st seizure: 5 months since (150 days)".
 *
 * SETUP (no secrets live in this file — they go in Script Properties):
 *   1. Create a Telegram bot via @BotFather, copy its token (or reuse an
 *      existing one from another script).
 *   2. Send the bot any message, then run setChatIdFromUpdates() once and
 *      read the log.
 *   3. Project Settings -> Script Properties -> add:
 *        TELEGRAM_TOKEN   = <bot token>
 *        TELEGRAM_CHAT_ID = <chat id>
 *   4. Fill in the bound sheet's first tab with a header row (Label, Date)
 *      and one data row per countdown/countup.
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
