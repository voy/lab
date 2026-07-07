#!/usr/bin/env python3
"""magenspiegel-watch — polls arzt-direkt for a Magenspiegelung opening at
MVZ Gastroenterologie Friedrichshain and auto-books the first one found.

Usage:
  python3 book.py check   # poll + book if open (cron mode, default)
  python3 book.py debug   # print current openings, no booking
"""

import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
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
