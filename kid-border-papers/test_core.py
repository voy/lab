"""Unit tests for the pure logic in core.py. Uses only fake data.

Run:  uv run --with pytest --with dateparser --with parsedatetime --with pymupdf pytest -q
"""

import datetime as dt

import pytest

from core import THINSP, fmt_phone, parse_date, pickups_for

# a fixed Monday, so relative dates are deterministic
BASE = dt.datetime(2026, 6, 8)


# ---------- fmt_phone ----------

@pytest.mark.parametrize("raw, expected", [
    ("+420600000000", "+420 600 000 000"),    # CZ: 3-3-3
    ("+4915100000000", "+49 151 0000 0000"),  # DE: 3-4-4
    ("+4915111111111", "+49 151 1111 1111"),
    ("+420 600 000 000", "+420 600 000 000"),  # already spaced -> normalised
    ("", ""),
    (None, ""),
])
def test_fmt_phone_grouping(raw, expected):
    # the expected string uses normal spaces; the real separator is a thin space
    assert fmt_phone(raw) == expected.replace(" ", THINSP)


def test_fmt_phone_uses_thin_space_not_nnbsp():
    out = fmt_phone("+420600000000")
    assert THINSP in out
    assert " " not in out  # the glyphless NNBSP must never appear


@pytest.mark.parametrize("raw", [
    "+420600",          # too short for CZ
    "+4915100000",      # too short for DE
    "+12025550123",     # unknown country code
    "not a number",
])
def test_fmt_phone_passthrough_unknown(raw):
    assert fmt_phone(raw) == raw.strip()


# ---------- parse_date ----------

@pytest.mark.parametrize("raw, expected", [
    ("24.12.2026", dt.date(2026, 12, 24)),
    ("24.12", dt.date(2026, 12, 24)),         # year-less -> current/future
    ("Dec 24 2026", dt.date(2026, 12, 24)),
    ("24 dec", dt.date(2026, 12, 24)),
    ("tomorrow", dt.date(2026, 6, 9)),
    ("in 3 days", dt.date(2026, 6, 11)),
    ("next week", dt.date(2026, 6, 15)),
    ("5.3", dt.date(2027, 3, 5)),             # already past this year -> next year
])
def test_parse_date_explicit_and_relative(raw, expected):
    assert parse_date(raw, base=BASE) == expected


@pytest.mark.parametrize("raw, weekday", [
    ("saturday", 5),
    ("sat", 5),
    ("next saturday", 5),
    ("this friday", 4),
    ("next friday", 4),
])
def test_parse_date_weekdays_resolve_to_future(raw, weekday):
    d = parse_date(raw, base=BASE)
    assert d is not None
    assert d.weekday() == weekday
    assert d > BASE.date()           # never a past date


def test_parse_date_bare_weekday_is_the_upcoming_one():
    assert parse_date("saturday", base=BASE) == dt.date(2026, 6, 13)


@pytest.mark.parametrize("raw", ["", "asdfqwer", "florgle"])
def test_parse_date_garbage_returns_none(raw):
    assert parse_date(raw, base=BASE) is None


# ---------- pickups_for ----------

CFG = {
    "signer": "Jan Novák",
    "home_city": "berlin",
    "parents": [
        {"name": "Jan Novák", "phone": "+4915100000000"},
        {"name": "Eva Nováková", "phone": "+4915111111111"},
    ],
    "pickup": {
        "praha": [
            {"name": "Marie Svobodová", "phone": "+420600000000"},
            {"name": "Petr Svoboda", "phone": "+420600111111"},
        ],
    },
}


def test_pickups_home_city_is_parents():
    assert pickups_for(CFG, "berlin") == CFG["parents"]


def test_pickups_away_city_is_hosts():
    assert pickups_for(CFG, "praha") == CFG["pickup"]["praha"]


def test_pickups_unknown_away_city_is_empty():
    assert pickups_for(CFG, "wien") == []
