#!/usr/bin/env python3
"""Sayyato class auto-booker — uses Playwright (Chromium/BoringSSL) to pass TLS fingerprint check.

Usage:
  python3 book.py              # book class DAYS_AHEAD from today (cron mode)
  python3 book.py book         # same
  python3 book.py sync         # cancel any booked slots that are in the skip list
  python3 book.py debug        # auth check + slot list for next ~2 weeks, no booking
  python3 book.py list         # list upcoming booked slots
  python3 book.py book-all     # book every available future slot
"""

import json
import json5
import sys
from datetime import date, timedelta, datetime, timezone
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse
from urllib.request import urlopen, Request
from zoneinfo import ZoneInfo

from playwright.sync_api import sync_playwright

SCRIPT_DIR = Path(__file__).parent
CONFIG     = json.loads((SCRIPT_DIR / "config.json").read_text())

API_BASE           = CONFIG["API_BASE"]
CLUB_ID            = CONFIG["CLUB_ID"]
PLAN_ID            = CONFIG["PLAN_ID"]
BERLIN             = ZoneInfo("Europe/Berlin")
GIST_URL           = CONFIG.get("SKIP_GIST_URL", "")
GIST_EDIT          = GIST_URL.replace("gist.githubusercontent.com", "gist.github.com").split("/raw/")[0] if GIST_URL else ""
_api_host          = urlparse(API_BASE).hostname
BOOKING_URL        = f"https://{_api_host}/booking/#!/kursplan?cid={CLUB_ID}&id={PLAN_ID}"
OPENHOLIDAYS_BASE  = CONFIG.get("OPENHOLIDAYS_BASE", "https://openholidaysapi.org")
HOLIDAYS_GIST_URL  = CONFIG.get("HOLIDAYS_GIST_URL", "")


def log(msg: str) -> None:
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} {msg}", flush=True)


def tg(msg: str) -> None:
    log(msg)
    token   = CONFIG.get("TELEGRAM_TOKEN")
    chat_id = CONFIG.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return
    full = f"{msg}\n\n✏️ Skip list: {GIST_EDIT}"
    try:
        payload = json.dumps({"chat_id": chat_id, "text": full, "link_preview_options": {"is_disabled": True}}).encode()
        urlopen(
            Request(
                f"https://api.telegram.org/bot{token}/sendMessage",
                data=payload,
                headers={"Content-Type": "application/json"},
            ),
            timeout=10,
        )
    except Exception as e:
        log(f"Telegram error: {e}")


def fetch_skip_dates() -> list:
    if not GIST_URL:
        return []
    try:
        with urlopen(GIST_URL, timeout=10) as r:
            return json5.loads(r.read())
    except Exception as e:
        log(f"Skip-list fetch failed (ignoring): {e}")
        return []


_holidays: Optional[dict] = None  # {"public": set[str], "school": [{"start", "end", "name"}]}



def _load_holidays() -> dict:
    global _holidays
    if _holidays is not None:
        return _holidays

    cache_file = SCRIPT_DIR / "holidays_cache.json"
    if cache_file.exists():
        cached = json.loads(cache_file.read_text())
        if (datetime.now().timestamp() - cached.get("ts", 0)) < 60 * 86400:
            _holidays = {"public": set(cached["public"]), "school": cached["school"]}
            return _holidays

    try:
        today     = datetime.now(tz=BERLIN)
        date_from = today.strftime("%Y-%m-%d")
        date_to   = f"{today.year + 2}-12-31"
        params    = f"countryIsoCode=DE&languageIsoCode=DE&subdivisionCode=DE-BE&validFrom={date_from}&validTo={date_to}"

        with urlopen(f"{OPENHOLIDAYS_BASE}/PublicHolidays?{params}", timeout=10) as r:
            pub_raw = json.loads(r.read())
        with urlopen(f"{OPENHOLIDAYS_BASE}/SchoolHolidays?{params}", timeout=10) as r:
            sch_raw = json.loads(r.read())

        public_dates = [h["startDate"] for h in pub_raw]
        school = [
            {
                "start": h["startDate"],
                "end":   str(date.fromisoformat(h["endDate"]) + timedelta(days=1)),
                "name":  next((n["text"] for n in h["name"] if n["language"] == "DE"), h["name"][0]["text"]),
            }
            for h in sch_raw
        ]
        serializable = {"ts": datetime.now().timestamp(), "public": public_dates, "school": school}
        cache_file.write_text(json.dumps(serializable))
        _holidays = {"public": set(public_dates), "school": school}
        return _holidays

    except Exception as e:
        log(f"OpenHolidays fetch failed: {e}")

    if HOLIDAYS_GIST_URL:
        try:
            with urlopen(HOLIDAYS_GIST_URL, timeout=10) as r:
                cached = json.loads(r.read())
            _holidays = {"public": set(cached["public"]), "school": cached["school"]}
            log("Holidays loaded from gist fallback.")
            return _holidays
        except Exception as e:
            log(f"Holidays gist fallback failed: {e}")

    _holidays = {"public": set(), "school": []}
    return _holidays


def is_public_holiday(date_str: str) -> bool:
    return date_str in _load_holidays()["public"]


def is_schulferien(date_str: str) -> bool:
    return any(f["start"] <= date_str < f["end"] for f in _load_holidays()["school"])


def is_bridge_day(date_str: str) -> bool:
    d   = date.fromisoformat(date_str)
    dow = d.weekday()
    pub = _load_holidays()["public"]
    if dow == 0:  # Monday: skip if Tuesday is a public holiday
        return str(d + timedelta(days=1)) in pub
    if dow == 4:  # Friday: skip if Thursday is a public holiday
        return str(d - timedelta(days=1)) in pub
    return False


def week_bounds(target: date):
    mon = target - timedelta(days=target.weekday())
    sun = mon - timedelta(days=1)
    sat = mon + timedelta(days=5)
    def utc22(d: date) -> str:
        return datetime(d.year, d.month, d.day, 22, tzinfo=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    return utc22(sun), utc22(sat)


# ── Playwright session ────────────────────────────────────────────────────────

def make_page(pw):
    browser = pw.chromium.launch(headless=True)
    ctx     = browser.new_context(
        locale="de-DE",
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/149.0.0.0 Safari/537.36"
        ),
    )
    page = ctx.new_page()
    log("Navigating to booking page…")
    page.goto(BOOKING_URL, wait_until="networkidle", timeout=30_000)
    log("Page loaded.")
    return browser, page


def angular_api(page, method: str, path: str, body=None, token: Optional[str] = None):
    result = page.evaluate(
        """([method, url, body, token]) => {
            const inj   = angular.element(document.querySelector('[ng-app]')).injector();
            const $http = inj.get('$http');
            const cfg   = {
                method,
                url,
                data:    body,
                headers: { 'Accept': 'application/json, text/plain, */*' },
            };
            if (token) cfg.headers['Authorization'] = 'Bearer ' + token;
            return $http(cfg).then(r => ({ ok: true, status: r.status, data: r.data }))
                             .catch(e => ({ ok: false, status: e.status, data: e.data }));
        }""",
        [method, f"{API_BASE}{path}", body, token],
    )
    if not result["ok"]:
        raise RuntimeError(f"API {method} {path} → {result['status']}: {str(result['data'])[:300]}")
    return result["data"]


def angular_api_raw(page, method: str, path: str, body=None, token: Optional[str] = None):
    """Like angular_api but returns (ok, data) without raising — used to inspect error payloads."""
    result = page.evaluate(
        """([method, url, body, token]) => {
            const inj   = angular.element(document.querySelector('[ng-app]')).injector();
            const $http = inj.get('$http');
            const cfg   = { method, url, data: body, headers: { 'Accept': 'application/json, text/plain, */*' } };
            if (token) cfg.headers['Authorization'] = 'Bearer ' + token;
            return $http(cfg).then(r => ({ ok: true, status: r.status, data: r.data }))
                             .catch(e => ({ ok: false, status: e.status, data: e.data }));
        }""",
        [method, f"{API_BASE}{path}", body, token],
    )
    return result["ok"], result["data"], result.get("status")


def login(page):
    angular_api(page, "POST", "/booking/authenticate", {"ref": ""})
    data = angular_api(page, "POST", "/booking/check/login", {
        "email":    CONFIG["EMAIL"],
        "password": CONFIG["PASSWORD"],
    })
    return data["token"], data["uid"]


def get_week_slots(page, target: date) -> list:
    week_start, week_end = week_bounds(target)
    data = angular_api(page, "PUT", "/booking/kursplan/week", {
        "Start": week_start, "Ende": week_end, "Id": PLAN_ID,
        "CheckBuchbareKurse": True, "AnzahlWochenZumPruefen": 52,
    })
    return (data or {}).get("Daten", {}).get("alleKurse") or []


def find_slot(slots: list, course_name: str, target_str: str):
    name_lc = course_name.lower()
    return next(
        (s for s in slots
         if not s.get("Stattgefunden")
         and name_lc in s.get("Bezeichnung", "").lower()
         and s.get("Start", "")[:10] == target_str),
        None,
    )


def is_booked(slot: dict) -> bool:
    return bool(slot.get("MeinTermin") or slot.get("IstGebucht") or slot.get("Gebucht"))


def book_slot(page, token: str, uid: str, slot: dict):
    """Book slot, returns orderId UUID."""
    return angular_api(page, "POST", "/booking/create/kurs", {
        "PersonNr":       uid,
        "TerminartNr":    slot["Terminart_Nr"],
        "Start":          slot["Start"],
        "Ende":           slot["Ende"],
        "Language":       "de",
        "TerminNr":       slot["Nr"],
        "Artikel":        slot["Bezeichnung"],
        "RessourcenIds":  slot["RessourcesNrs"],
        "Zahlart":        "",
        "Leistungsarten": [],
        "MitgliedsOption": 1,
    }, token=token)


def get_order_id(page, token: str, uid: str, slot: dict) -> Optional[str]:
    """Return the booking orderId UUID for an already-booked slot.
    The server returns it in the error payload when a double-booking is attempted."""
    ok, data, _ = angular_api_raw(page, "POST", "/booking/create/kurs", {
        "PersonNr":       uid,
        "TerminartNr":    slot["Terminart_Nr"],
        "Start":          slot["Start"],
        "Ende":           slot["Ende"],
        "Language":       "de",
        "TerminNr":       slot["Nr"],
        "Artikel":        slot["Bezeichnung"],
        "RessourcenIds":  slot["RessourcesNrs"],
        "Zahlart":        "",
        "Leistungsarten": [],
        "MitgliedsOption": 1,
    }, token=token)
    if isinstance(data, dict):
        return data.get("orderId")
    if ok and isinstance(data, str):
        return data
    return None


def _find_cancel_endpoint(page) -> str:
    """Fetch all external Angular JS files and search for cancel/delete endpoint patterns."""
    return page.evaluate("""async () => {
        const urls = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
        const sources = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.textContent);
        for (const url of urls) {
            try { sources.push(await fetch(url).then(r => r.text())); } catch(e) {}
        }
        const all = sources.join(' ');
        const hits = all.match(/['"](\/[^'"]{3,80}(?:delete|cancel|storno|buchung)[^'"]{0,40})['"]/gi) || [];
        return [...new Set(hits)].slice(0, 30).join('\\n');
    }""")


def _find_angular_services(page) -> str:
    """List Angular DI service names that sound booking/cancel related."""
    return page.evaluate("""() => {
        try {
            const inj = angular.element(document.querySelector('[ng-app]')).injector();
            const cache = inj._cache || inj.$$cache || {};
            return Object.keys(cache).filter(n =>
                /book|kurs|termin|member|cancel|storno|buchung/i.test(n)
            ).join(', ');
        } catch(e) { return 'err: ' + e.message; }
    }""")


def cancel_slot(page, token: str, uid: str, slot: dict) -> bool:
    """Cancel a booked slot. Returns True on success."""
    ok_raw, data_raw, _ = angular_api_raw(page, "POST", "/booking/create/kurs", {
        "PersonNr":       uid,
        "TerminartNr":    slot["Terminart_Nr"],
        "Start":          slot["Start"],
        "Ende":           slot["Ende"],
        "Language":       "de",
        "TerminNr":       slot["Nr"],
        "Artikel":        slot["Bezeichnung"],
        "RessourcenIds":  slot["RessourcesNrs"],
        "Zahlart":        "",
        "Leistungsarten": [],
        "MitgliedsOption": 1,
    }, token=token)

    order_id = None
    if isinstance(data_raw, dict):
        order_id = data_raw.get("orderId")
        log(f"  booking-create ok={ok_raw} keys={list(data_raw.keys())}")
    elif ok_raw and isinstance(data_raw, str):
        order_id = data_raw

    if not order_id:
        log(f"  Could not resolve orderId (ok={ok_raw} data={str(data_raw)[:200]}) — skipping cancel")
        return False

    log(f"  DELETE orderId={order_id}")
    ok, resp, status = angular_api_raw(page, "DELETE", f"/onlinebooking/deleteMember/{order_id}", token=token)
    log(f"  DELETE http={status} ok={ok} resp={str(resp)[:300]}")
    return ok


def slot_status(slot: dict) -> str:
    if is_booked(slot):
        return "✅ booked"
    if slot.get("NichtBuchbar"):
        reason = slot.get("NichtBuchbarGrund") or "not bookable"
        return f"🔒 {reason}"
    free = slot.get("FreiePlaetze", "?")
    return f"🟢 available ({free} free)"


def upcoming_summary(page, skip_dates: list, n: int = 5) -> str:
    today       = datetime.now(tz=BERLIN).date()
    slots_cache: dict = {}
    lines = []
    count = 0
    n_no_slot = 0

    for offset in range(1, 50):
        target = today + timedelta(days=offset)
        dow    = target.weekday()
        course = next((c for c in CONFIG["COURSES"] if c["dow"] == dow), None)
        if not course:
            continue

        week_key = str(target - timedelta(days=dow))
        if week_key not in slots_cache:
            slots_cache[week_key] = get_week_slots(page, target)

        target_str = str(target)
        slot = find_slot(slots_cache[week_key], course["name"], target_str)
        if slot:
            n_no_slot = 0
            tags = []
            if target_str in skip_dates:       tags.append("skip")
            if is_public_holiday(target_str):  tags.append("holiday")
            if is_schulferien(target_str):     tags.append("Ferien")
            if is_bridge_day(target_str):      tags.append("Brückentag")
            suffix = f" ({', '.join(tags)})" if tags else ""
            lines.append(f"  {target_str} {course['name']}: {slot_status(slot)}{suffix}")
            count += 1
            if count >= n:
                break
        else:
            n_no_slot += 1
            if n_no_slot == 1:
                lines.append(f"  {target_str} {course['name']}: not published yet")
            else:
                break

    if not lines:
        return ""
    return "\n\n📅 Upcoming:\n" + "\n".join(lines)


# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_book():
    days_ahead    = CONFIG.get("DAYS_AHEAD", 2)
    today         = datetime.now(tz=BERLIN).date()
    today_str     = str(today)
    target        = today + timedelta(days=days_ahead)
    target_str    = str(target)
    skip_dates    = fetch_skip_dates()

    target_course = next((c for c in CONFIG["COURSES"] if c["dow"] == target.weekday()), None)
    today_course  = next((c for c in CONFIG["COURSES"] if c["dow"] == today.weekday()), None)

    with sync_playwright() as pw:
        browser, page = make_page(pw)
        summary      = ""
        today_header = ""
        try:
            token, uid = login(page)

            # Confirm (or last-minute book) today's class via a definitive booking attempt
            if today_course and today_str not in skip_dates:
                today_slots = get_week_slots(page, today)
                today_slot  = find_slot(today_slots, today_course["name"], today_str)
                if today_slot:
                    try:
                        book_slot(page, token, uid, today_slot)
                        today_header = f"✅ Today: {today_course['name']} on {today_str} — just booked"
                    except RuntimeError as e:
                        if "T_Member_already_in_course" in str(e):
                            today_header = f"✅ Today: {today_course['name']} on {today_str} — booked ✓"
                        else:
                            today_header = f"⚠️ Today: {today_course['name']} — {e}"

            summary = upcoming_summary(page, skip_dates)

            if not target_course:
                if today_header:
                    tg(today_header + summary)
                return

            log(f"Target: {target} — {target_course['name']}")

            if target_str in skip_dates:
                tg(f"⏭️ Skipping {target_course['name']} on {target} — in skip list" + summary)
                return
            if is_public_holiday(target_str):
                tg(f"⛔ Skipping {target_course['name']} on {target} — public holiday" + summary)
                return
            if is_schulferien(target_str):
                tg(f"🏖️ Skipping {target_course['name']} on {target} — Schulferien" + summary)
                return
            if is_bridge_day(target_str):
                tg(f"🌉 Skipping {target_course['name']} on {target} — bridge day" + summary)
                return

            slots = get_week_slots(page, target)
            slot  = find_slot(slots, target_course["name"], target_str)
            if not slot:
                tg(f"⏳ {target_course['name']} on {target} — slot not published yet" + summary)
                return
            if is_booked(slot):
                tg(f"✅ Already booked: {target_course['name']} on {target}" + summary)
                return
            book_slot(page, token, uid, slot)
            tg(f"✅ Booked: {slot['Bezeichnung']} on {target}" + summary)
        except RuntimeError as e:
            if "T_Member_already_in_course" in str(e):
                tg(f"✅ Already booked: {target_course['name'] if target_course else '?'} on {target}" + summary)
            else:
                tg(f"❌ Error: {e}")
        finally:
            browser.close()


def cmd_sync():
    """Cancel any booked slots that appear in the skip list."""
    skip_dates = fetch_skip_dates()
    if not skip_dates:
        log("Skip list is empty — nothing to sync.")
        return

    with sync_playwright() as pw:
        browser, page = make_page(pw)
        cancelled = []
        try:
            token, uid  = login(page)
            today       = datetime.now(tz=BERLIN).date()
            slots_cache: dict = {}

            for offset in range(0, 90):
                target = today + timedelta(days=offset)
                if str(target) not in skip_dates:
                    continue
                dow    = target.weekday()
                course = next((c for c in CONFIG["COURSES"] if c["dow"] == dow), None)
                if not course:
                    continue

                week_key = str(target - timedelta(days=dow))
                if week_key not in slots_cache:
                    slots_cache[week_key] = get_week_slots(page, target)

                slot = find_slot(slots_cache[week_key], course["name"], str(target))
                if not slot:
                    continue
                log(f"  Cancelling {course['name']} on {target}…")
                if cancel_slot(page, token, uid, slot):
                    cancelled.append(f"{target} {course['name']}")

        except Exception as e:
            tg(f"❌ Sync error: {e}")
            return
        finally:
            browser.close()

        if cancelled:
            tg("🗑️ Cancelled:\n" + "\n".join(f"  • {c}" for c in cancelled))
        else:
            log("Nothing to cancel.")


def cmd_debug():
    skip_dates = fetch_skip_dates()
    with sync_playwright() as pw:
        browser, page = make_page(pw)
        lines = ["🔍 Sayyato Booker — schedule"]
        try:
            token, uid = login(page)
            lines.append(f"Login: {uid[:8]}…")

            today       = datetime.now(tz=BERLIN).date()
            slots_cache: dict = {}
            n_no_slot   = 0

            for offset in range(1, 60):
                target = today + timedelta(days=offset)
                dow    = target.weekday()
                course = next((c for c in CONFIG["COURSES"] if c["dow"] == dow), None)
                if not course:
                    continue

                week_key = str(target - timedelta(days=dow))
                if week_key not in slots_cache:
                    slots_cache[week_key] = get_week_slots(page, target)

                target_str = str(target)
                slot = find_slot(slots_cache[week_key], course["name"], target_str)
                if slot:
                    n_no_slot = 0
                    status = slot_status(slot)
                    tags = []
                    if target_str in skip_dates:        tags.append("skip")
                    if is_public_holiday(target_str):   tags.append("holiday")
                    if is_schulferien(target_str):      tags.append("Ferien")
                    if is_bridge_day(target_str):       tags.append("Brückentag")
                    suffix = f" ({', '.join(tags)})" if tags else ""
                    lines.append(f"  {target_str} {course['name']}: {status}{suffix}")
                else:
                    n_no_slot += 1
                    if n_no_slot <= 2:
                        lines.append(f"  {target_str} {course['name']}: — not published yet")
                    elif n_no_slot == 3:
                        lines.append(f"  … (no more slots published)")
                        break

        except Exception as e:
            lines.append(f"❌ {e}")
        finally:
            browser.close()

        tg("\n".join(lines))


def cmd_list():
    with sync_playwright() as pw:
        browser, page = make_page(pw)
        try:
            token, uid  = login(page)
            today       = datetime.now(tz=BERLIN).date()
            slots_cache: dict = {}
            booked      = []

            for offset in range(0, 90):
                target   = today + timedelta(days=offset)
                week_key = str(target - timedelta(days=target.weekday()))
                if week_key in slots_cache:
                    continue
                for slot in get_week_slots(page, target):
                    if is_booked(slot):
                        booked.append(slot)
                slots_cache[week_key] = True

            if not booked:
                tg("📋 No upcoming bookings.")
            else:
                lines = ["📋 Upcoming bookings:"]
                for s in sorted(booked, key=lambda x: x.get("Start", "")):
                    lines.append(f"  {s['Start'][:10]} {s.get('Bezeichnung', '?')}")
                tg("\n".join(lines))
        except Exception as e:
            tg(f"❌ {e}")
        finally:
            browser.close()


def cmd_probe():
    """Try multiple cancel endpoint variants and dump JS paths to find the correct one."""
    with sync_playwright() as pw:
        browser, page = make_page(pw)
        captured = []

        def on_request(req):
            if req.resource_type in ("xhr", "fetch", "other"):
                captured.append(f"{req.method} {req.url}")

        page.on("request", on_request)
        try:
            token, uid = login(page)
            log(f"Logged in as {uid[:8]}…")

            # Get a real slot + its Nr
            today = datetime.now(tz=BERLIN).date()
            probe_slot = None
            for course in CONFIG["COURSES"]:
                if course["dow"] == today.weekday():
                    slots = get_week_slots(page, today)
                    probe_slot = find_slot(slots, course["name"], str(today))
                    if probe_slot:
                        log(f"Slot Nr={probe_slot['Nr']} SerienterminNr={probe_slot['SerienterminNr']}")
                    break

            if not probe_slot:
                log("No slot for today's class — looking for next available")
                for offset in range(1, 15):
                    t = today + timedelta(days=offset)
                    for course in CONFIG["COURSES"]:
                        if course["dow"] == t.weekday():
                            slots = get_week_slots(page, t)
                            probe_slot = find_slot(slots, course["name"], str(t))
                            if probe_slot:
                                log(f"Slot for {t}: Nr={probe_slot['Nr']} SerienterminNr={probe_slot['SerienterminNr']}")
                                break
                    if probe_slot:
                        break

            if probe_slot:
                # Test: book a fresh slot, capture its real orderId, then immediately cancel
                # Find a FUTURE unbooked slot (not today) for the test
                test_slot = None
                for offset in range(1, 30):
                    t = today + timedelta(days=offset)
                    for course in CONFIG["COURSES"]:
                        if course["dow"] == t.weekday():
                            slots = get_week_slots(page, t)
                            s = find_slot(slots, course["name"], str(t))
                            if s and not s.get("NichtBuchbar") and not s.get("Ausgebucht"):
                                test_slot = s
                                log(f"Test slot: {t} Nr={s['Nr']} '{s['Bezeichnung']}'")
                                break
                    if test_slot:
                        break

                if test_slot:
                    # Book it fresh → get the REAL orderId
                    ok_b, data_b, st_b = angular_api_raw(page, "POST", "/booking/create/kurs", {
                        "PersonNr": uid, "TerminartNr": test_slot["Terminart_Nr"],
                        "Start": test_slot["Start"], "Ende": test_slot["Ende"],
                        "Language": "de", "TerminNr": test_slot["Nr"],
                        "Artikel": test_slot["Bezeichnung"], "RessourcenIds": test_slot["RessourcesNrs"],
                        "Zahlart": "", "Leistungsarten": [], "MitgliedsOption": 1,
                    }, token=token)
                    log(f"book test slot: http={st_b} ok={ok_b} data={str(data_b)[:300]}")

                    real_order_id = data_b.get("orderId") if isinstance(data_b, dict) else (data_b if ok_b else None)
                    nr = test_slot["Nr"]
                    log(f"real_order_id={real_order_id} nr={nr}")

                    if real_order_id:
                        # Now immediately cancel with the REAL orderId
                        ok_c, resp_c, st_c = angular_api_raw(page, "DELETE",
                            f"/onlinebooking/deleteMember/{real_order_id}", token=token)
                        log(f"cancel with real orderId → http={st_c} ok={ok_c} resp={str(resp_c)[:200]}")

                        # Check if slot is still booked
                        ok_b2, data_b2, st_b2 = angular_api_raw(page, "POST", "/booking/create/kurs", {
                            "PersonNr": uid, "TerminartNr": test_slot["Terminart_Nr"],
                            "Start": test_slot["Start"], "Ende": test_slot["Ende"],
                            "Language": "de", "TerminNr": test_slot["Nr"],
                            "Artikel": test_slot["Bezeichnung"], "RessourcenIds": test_slot["RessourcesNrs"],
                            "Zahlart": "", "Leistungsarten": [], "MitgliedsOption": 1,
                        }, token=token)
                        if ok_b2:
                            log(f"✅ CANCEL WORKED — slot is free again (re-booked ok={ok_b2})")
                            # Cancel the re-book too
                            re_id = data_b2.get("orderId") if isinstance(data_b2, dict) else data_b2
                            angular_api_raw(page, "DELETE", f"/onlinebooking/deleteMember/{re_id}", token=token)
                        else:
                            msg = data_b2.get("message") if isinstance(data_b2, dict) else str(data_b2)
                            log(f"❌ CANCEL FAILED — slot still booked: {msg}")
                            # Still booked, clean up: try another cancel approach or leave it

            # Dump all /booking/ and /onlinebooking/ paths from external JS
            js_paths = page.evaluate("""async () => {
                const urls = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
                const all = (await Promise.all(urls.map(u => fetch(u).then(r => r.text()).catch(() => '')))).join(' ');
                const hits = all.match(/['"](\/(?:booking|onlinebooking|onlinebuchung)[^'"]{0,60})['"]/gi) || [];
                return [...new Set(hits)].sort().join('\\n');
            }""")
            log(f"All booking-related JS paths:\n{js_paths}")

            log(f"All captured XHR (last 20):\n" + "\n".join(captured[-20:]))

        except Exception as e:
            log(f"Probe error: {e}")
        finally:
            browser.close()


def cmd_book_all():
    skip_dates = fetch_skip_dates()
    with sync_playwright() as pw:
        browser, page = make_page(pw)
        try:
            token, uid  = login(page)
            today       = datetime.now(tz=BERLIN).date()
            slots_cache: dict = {}
            n_booked    = 0
            n_skipped   = 0

            for offset in range(1, 90):
                target = today + timedelta(days=offset)
                dow    = target.weekday()
                course = next((c for c in CONFIG["COURSES"] if c["dow"] == dow), None)
                if not course:
                    continue

                target_str = str(target)
                week_key   = str(target - timedelta(days=dow))
                if week_key not in slots_cache:
                    slots_cache[week_key] = get_week_slots(page, target)

                if target_str in skip_dates:
                    log(f"  {target_str} — in skip list"); n_skipped += 1; continue
                if is_public_holiday(target_str):
                    log(f"  {target_str} — public holiday"); n_skipped += 1; continue
                if is_schulferien(target_str):
                    log(f"  {target_str} — Schulferien"); n_skipped += 1; continue
                if is_bridge_day(target_str):
                    log(f"  {target_str} — bridge day"); n_skipped += 1; continue

                slot = find_slot(slots_cache[week_key], course["name"], target_str)
                if not slot:
                    log(f"  {target_str} {course['name']}: no slot"); continue
                if slot.get("NichtBuchbar"):
                    log(f"  {target_str} {course['name']}: not bookable yet"); continue
                if is_booked(slot):
                    log(f"  {target_str} {course['name']}: already booked"); continue

                try:
                    book_slot(page, token, uid, slot)
                    log(f"  ✅ {target_str} {course['name']} booked")
                    n_booked += 1
                except RuntimeError as e:
                    if "T_Member_already_in_course" in str(e):
                        log(f"  {target_str} {course['name']}: already booked")
                    else:
                        log(f"  ⚠️ {target_str} {course['name']}: {e}")

            tg(f"📅 book-all done: {n_booked} booked, {n_skipped} skipped")
        except Exception as e:
            tg(f"❌ {e}")
        finally:
            browser.close()


# ── Entry ─────────────────────────────────────────────────────────────────────

COMMANDS = {
    "book":     cmd_book,
    "sync":     cmd_sync,
    "debug":    cmd_debug,
    "list":     cmd_list,
    "book-all": cmd_book_all,
    "probe":    cmd_probe,
}

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "book"
    if cmd not in COMMANDS:
        print(f"Usage: book.py [{'|'.join(COMMANDS)}]", file=sys.stderr)
        sys.exit(1)
    COMMANDS[cmd]()
