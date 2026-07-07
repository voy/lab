#!/usr/bin/env python3
"""magenspiegel-watch — polls arzt-direkt for a Magenspiegelung opening at
MVZ Gastroenterologie Friedrichshain and auto-books the first one found.

Usage:
  python3 book.py check    # poll + book if open (cron mode, default)
  python3 book.py debug    # print current openings, no booking
  python3 book.py dry-run  # print the payloads a real opening would trigger, no network writes, no Telegram
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request

SCRIPT_DIR = Path(__file__).parent


def _load_config() -> dict:
    config_path = SCRIPT_DIR / "config.json"
    if config_path.exists():
        return json.loads(config_path.read_text())
    return {}


CONFIG = _load_config()

INSTANCE_ID = "6943cef1dff73ea25ae87e6b"
TERMIN_SUCHE_IDENT = "182614876737765376"
APPOINTMENT_TYPE_ID = "6967559789418c1e963163a3"
DURATION_MINUTES = 30
RESERVATION_SECONDS = 600
SCHEMA_VERSION = "169"
API_BASE = "https://onlinetermine.arzt-direkt.com"

APPOINTMENT_NAME = {
    "de": "Magenspiegelung (Gastroskopie)",
    "en": "MULTILINGUAL-FIELD.NO-TRANSLATION",
    "fr": "MULTILINGUAL-FIELD.NO-TRANSLATION",
    "it": "MULTILINGUAL-FIELD.NO-TRANSLATION",
    "es": "MULTILINGUAL-FIELD.NO-TRANSLATION",
}
APPOINTMENT_DESCRIPTION = {
    "de": "<p>Magenspiegelung (mit oder ohne Schlafmittel/Sedierung)</p>",
    "en": "MULTILINGUAL-FIELD.NO-TRANSLATION",
    "fr": "MULTILINGUAL-FIELD.NO-TRANSLATION",
    "it": "MULTILINGUAL-FIELD.NO-TRANSLATION",
    "es": "MULTILINGUAL-FIELD.NO-TRANSLATION",
}


def log(msg: str) -> None:
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} {msg}", flush=True)


def tg(msg: str) -> None:
    log(msg)
    token = CONFIG.get("TELEGRAM_TOKEN")
    chat_id = CONFIG.get("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return
    try:
        payload = json.dumps({
            "chat_id": chat_id,
            "text": msg,
            "link_preview_options": {"is_disabled": True},
        }).encode()
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


def _iso_utc(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def _parse_iso(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=timezone.utc)


def _birthdate_iso(birth_date_str: str) -> str:
    year, month, day = (int(x) for x in birth_date_str.split("-"))
    return _iso_utc(datetime(year, month, day, tzinfo=timezone.utc))


def build_reserve_payload(opening: dict) -> dict:
    duration = opening.get("duration", DURATION_MINUTES)
    expiry = datetime.now(timezone.utc) + timedelta(seconds=RESERVATION_SECONDS)
    return {
        "instance": INSTANCE_ID,
        "terminSucheIdent": TERMIN_SUCHE_IDENT,
        "dateAppointment": opening["date"],
        "duration": duration,
        "dateExpiry": _iso_utc(expiry),
        "doctorIds": [kd["kid"] for kd in opening["kdSet"]],
    }


def build_book_payload(opening: dict, reservation_id: str) -> dict:
    duration = opening.get("duration", DURATION_MINUTES)
    start = opening["date"]
    end = _iso_utc(_parse_iso(start) + timedelta(minutes=duration))
    return {
        "otkAppointment": {
            "instance": INSTANCE_ID,
            "eventType": "OtkAppointment",
            "terminSucheIdent": TERMIN_SUCHE_IDENT,
            "start": start,
            "end": end,
            "kdSet": opening["kdSet"],
            "accessCode": None,
            "strategy": "autoconfirm",
            "patientData": {
                "personal": {
                    "fname": CONFIG["FIRST_NAME"],
                    "lname": CONFIG["LAST_NAME"],
                    "email": CONFIG["EMAIL"],
                    "emailCC": "",
                    "birthdate": _birthdate_iso(CONFIG["BIRTH_DATE"]),
                    "preferredLocale": "de",
                    "gender": CONFIG["GENDER"],
                    "info": "",
                    "phone": CONFIG["PHONE"],
                    "street": "",
                    "streetNumber": "",
                    "zip": "",
                    "city": "",
                    "countryCode": "",
                    "customerId": "",
                },
                "insurance": {"type": "gkv", "name": CONFIG.get("INSURANCE_NAME", "")},
                "customFieldResponses": [],
                "checkboxResponses": [],
            },
            "isPrimary": True,
            "bookedOver": "a-d",
            "referringDoctor": None,
            "reservationId": reservation_id,
            "schemaVersion": SCHEMA_VERSION,
            "displayStringNames": opening.get("displayStringNames", ""),
            "name": APPOINTMENT_NAME,
            "description": APPOINTMENT_DESCRIPTION,
            "dialect": "behandler",
        },
        "otkAttachments": None,
    }


def _api_get(path: str, params: dict) -> dict:
    query = urlencode(params)
    with urlopen(f"{API_BASE}{path}?{query}", timeout=15) as r:
        return json.loads(r.read())


def _api_post(path: str, body: dict) -> dict:
    data = json.dumps(body).encode()
    req = Request(
        f"{API_BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def fetch_openings() -> list:
    data = _api_get("/api/opening", {
        "localityIds": "",
        "instance": INSTANCE_ID,
        "terminSucheIdent": TERMIN_SUCHE_IDENT,
        "forerunTime": 0,
    })
    return data.get("openings") or []


def reserve_slot(opening: dict):
    data = _api_post("/api/reservation/reserve", build_reserve_payload(opening))
    return data.get("reservation")


def book_slot(opening: dict, reservation_id: str) -> dict:
    return _api_post("/api/appointment/book", build_book_payload(opening, reservation_id))


def cancel_reservation(reservation_id: str) -> None:
    try:
        _api_post("/api/reservation/cancel", {"instance": INSTANCE_ID, "reservationId": reservation_id})
    except Exception as e:
        log(f"Reservation cancel failed (ignoring): {e}")


def log_event(entry: dict) -> None:
    log(json.dumps(entry))


_PII_KEYS = {
    "patientData", "personal", "insurance",
    "fname", "lname", "email", "emailCC", "phone", "birthdate", "customerId",
    "insuranceName", "insuranceNumber", "street", "streetNumber", "zip", "city",
}


def _redact(obj):
    """Strip known PII-bearing keys before anything touches stdout/Telegram — this repo is public."""
    if isinstance(obj, dict):
        return {k: ("[redacted]" if k in _PII_KEYS else _redact(v)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_redact(v) for v in obj]
    return obj


def _mark_github_output(key: str, value: str) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if not output_path:
        return
    with open(output_path, "a") as f:
        f.write(f"{key}={value}\n")


def cmd_check() -> None:
    try:
        openings = fetch_openings()
    except Exception as e:
        tg(f"❌ Opening-check failed: {e}")
        return

    if not openings:
        log("No openings.")
        return

    opening = openings[0]
    log_event({
        "type": "detection",
        "detectedAt": _iso_utc(datetime.now(timezone.utc)),
        "openingsCount": len(openings),
        "openings": openings,
    })

    _attempt_booking(opening)


def _attempt_booking(opening: dict) -> None:
    reservation = None
    try:
        reservation = reserve_slot(opening)
        if not reservation:
            tg(f"⏳ Slot {opening['date']} was taken before we could reserve it.")
            log_event({"type": "reserve_failed", "opening": opening})
            return

        response = book_slot(opening, reservation["_id"])
        appointment = response.get("appointment") if response else None
        log_event({
            "type": "book_attempt",
            "opening": opening,
            "reservationId": reservation["_id"],
            "response": _redact(response),
            "success": bool(appointment),
        })

        if not appointment:
            cancel_reservation(reservation["_id"])
            tg(f"❌ Booking rejected for {opening['date']}: {_redact(response)}")
            return

        _mark_github_output("booked", "true")
        tg(f"✅ Booked: Magenspiegelung on {opening['date']}")

    except Exception as e:
        if reservation:
            cancel_reservation(reservation["_id"])
        log_event({"type": "book_error", "opening": opening, "error": str(e)})
        tg(f"❌ Booking error for {opening['date']}: {e}")


def cmd_debug() -> None:
    try:
        openings = fetch_openings()
    except Exception as e:
        print(f"❌ {e}")
        return
    if not openings:
        print("No openings currently available.")
        return
    print(f"{len(openings)} opening(s):")
    for o in openings[:10]:
        print(f"  {o['date']} ({o.get('displayStringTime', '?')})")


def cmd_dry_run() -> None:
    if os.environ.get("GITHUB_ACTIONS") == "true":
        print("❌ Refusing to run dry-run inside GitHub Actions — it prints real patient PII to stdout and this repo is public. Run it locally instead.")
        return
    try:
        openings = fetch_openings()
    except Exception as e:
        print(f"❌ Opening-check failed: {e}")
        return
    if not openings:
        print("No openings.")
        return

    opening = openings[0]
    print(f"Found {len(openings)} opening(s). Would act on: {opening['date']}")
    print("Reserve payload that would be sent (no network write made):")
    print(json.dumps(build_reserve_payload(opening), indent=2))
    print("Book payload that would be sent (placeholder reservationId; no network write made, no Telegram message sent):")
    print(json.dumps(build_book_payload(opening, "DRY-RUN-RESERVATION-ID"), indent=2))


COMMANDS = {"check": cmd_check, "debug": cmd_debug, "dry-run": cmd_dry_run}

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if cmd not in COMMANDS:
        print(f"Usage: book.py [{'|'.join(COMMANDS)}]", file=sys.stderr)
        sys.exit(1)
    COMMANDS[cmd]()
