"""Pure helpers (no PDF/UI deps) so they can be unit-tested in isolation."""

import datetime as dt
import re
import unicodedata

import dateparser
import parsedatetime

# U+2009 THIN SPACE — narrow, and (unlike U+202F) present in Arial, so it does
# not render as a tofu box. Used to group phone digits.
THINSP = " "

# country code -> digit grouping of the national number
PHONE_GROUPS = {"420": (3, 3, 3), "49": (3, 4, 4)}

_CAL = parsedatetime.Calendar()


def fmt_phone(raw):
    """Group a phone number with thin spaces, e.g. +420 737 200 403."""
    if not raw:
        return ""
    digits = re.sub(r"\D", "", raw)
    for cc, groups in PHONE_GROUPS.items():
        if digits.startswith(cc) and len(digits) - len(cc) == sum(groups):
            rest, parts, i = digits[len(cc):], [], 0
            for g in groups:
                parts.append(rest[i:i + g])
                i += g
            return "+" + cc + THINSP + THINSP.join(parts)
    return raw.strip()  # unknown format -> leave untouched


def parse_date(raw, base=None):
    """Parse a human date. dateparser handles numeric/explicit (day-first) and
    bare weekdays; parsedatetime covers 'next saturday' / 'this friday'. Ambiguous
    and year-less dates resolve to the future. Returns a date, or None."""
    if base is None:
        base = dt.datetime.combine(dt.date.today(), dt.time())
    d = dateparser.parse(raw, settings={
        "DATE_ORDER": "DMY",
        "RELATIVE_BASE": base,
        "PREFER_DATES_FROM": "future",
    })
    if d:
        return d.date()
    res, flag = _CAL.parseDT(raw, sourceTime=base)
    return res.date() if flag else None


def cz_date(d):
    return f"{d.day}.{d.month}.{d.year}"


def pretty(d):
    return d.strftime("%A, %d %B %Y")


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return s.split()[0].lower() if s.split() else "x"


def pickups_for(cfg, city):
    """Who collects the child in `city`: the parents at home, hosts elsewhere."""
    if city == cfg["home_city"]:
        return cfg["parents"]
    return cfg["pickup"].get(city, [])
