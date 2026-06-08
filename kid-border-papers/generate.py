#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.9"
# dependencies = ["pymupdf", "questionary", "rich", "dateparser", "parsedatetime"]
# ///
"""Generate signature-ready RegioJet powers of attorney for minors travelling
between Berlin and Prague, plus a German consent page for the border."""

import datetime as dt
import json
import sys
from pathlib import Path

import fitz
import questionary
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from core import cz_date, fmt_phone, parse_date, pickups_for, pretty, slug

HERE = Path(__file__).parent
TEMPLATE = HERE / "template.pdf"
OUTDIR = HERE / "output"

# --- fonts
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "ar"           # registered name for embedded Arial
FONT_BOLD = "arb"         # registered name for embedded Arial Bold
BLACK = (0, 0, 0)

# --- Czech form text placement
BODY_SIZE = 10.0          # body font size, matches the form's printed labels
ARIAL_CAP_RATIO = 0.717   # cap-height / font-size for Arial
CAP = ARIAL_CAP_RATIO * BODY_SIZE
FIELD_INDENT = 5.0        # left padding inside a gray field
FIELD_TOP_PAD = 5.0       # top padding when a tall field is top-aligned

# --- German consent page (A4) layout, in points
PAGE_W, PAGE_H = 595.0, 842.0
DE_LEFT = 70.0            # left text margin
DE_SUBINDENT = 15.0       # extra indent for items beneath a heading
DE_TITLE_Y = 90.0
DE_SUBTITLE_Y = 110.0
DE_BODY_TOP = 160.0       # first body line
DE_TITLE_SIZE = 18.0
DE_BODY_SIZE = 11.0
GAP_LINE = 18.0           # between tightly-related lines
GAP_ITEM = 20.0           # between list entries (people)
GAP_HEADING = 22.0        # heading -> its first item
GAP_SECTION = 40.0        # between sections
GAP_SIGN = 45.0           # around the signature lines
GAP_WIDE = 50.0           # before the place/date line

console = Console()

# --- Czech form field rectangles (top-left coords), from the template's gray boxes
F = {
    "signer":   fitz.Rect(64.1, 84.5, 566.5, 101.7),
    "from":     fitz.Rect(73.8, 145.3, 208.9, 162.5),
    "to":       fitz.Rect(249.4, 145.3, 384.4, 162.5),
    "date":     fitz.Rect(449.2, 145.6, 565.5, 162.8),
    "handed":   fitz.Rect(312.2, 202.3, 565.7, 229.5),
    "medical":  fitz.Rect(36.0, 399.8, 565.5, 458.3),   # tall -> top aligned
    "pphone":   fitz.Rect(312.2, 511.0, 565.0, 528.3),
    "cphone":   fitz.Rect(312.0, 543.3, 565.5, 560.5),
    "cname":    fitz.Rect(312.0, 598.1, 565.5, 615.4),
    "dob":      fitz.Rect(312.0, 626.1, 565.5, 643.3),
    "addr":     fitz.Rect(309.6, 662.9, 566.8, 680.1),
    "passport": fitz.Rect(309.5, 691.2, 565.5, 708.5),
}
ISSUED = fitz.Rect(116.6, 621.6, 249.6, 685.6)          # page 2, tall -> top aligned
TOP_FIELDS = {"medical"}


def load_config():
    path = HERE / "config.json"
    if not path.exists():
        console.print("[red]config.json not found.[/] Copy config.example.json to "
                      "config.json and fill in your details.")
        sys.exit(1)
    return json.loads(path.read_text())


# ---------- rendering ----------

def put(page, rect, text, top=False):
    if not text:
        return
    x = rect.x0 + FIELD_INDENT
    if top:
        y = rect.y0 + FIELD_TOP_PAD + CAP
    else:
        y = (rect.y0 + rect.y1) / 2 + CAP / 2     # vertical centre (measured-correct)
    page.insert_text((x, y), text, fontsize=BODY_SIZE, fontname=FONT_REG,
                     fontfile=ARIAL, color=BLACK)


def fill_cz(doc, cfg, kid, origin, dest, date, sign):
    p0, p1 = doc[0], doc[1]
    pickups = pickups_for(cfg, dest)
    names = ", ".join(p["name"] for p in pickups)
    pickup_phones = ", ".join(fmt_phone(p["phone"]) for p in pickups if p["phone"])
    parent_phones = ", ".join(fmt_phone(p["phone"]) for p in cfg["parents"] if p["phone"])
    vals = {
        "signer": cfg["signer"],
        "from": cfg["cities"][origin]["cz_gen"],
        "to": cfg["cities"][dest]["cz_gen"],
        "date": cz_date(date),
        "handed": names,
        "medical": kid.get("medical", ""),
        "pphone": parent_phones,
        "cphone": pickup_phones,
        "cname": kid["name"],
        "dob": kid["dob"],
        "addr": cfg["home_address"],
        "passport": kid["passport"],
    }
    for key, rect in F.items():
        put(p0, rect, vals[key], top=key in TOP_FIELDS)
    put(p1, ISSUED, cz_date(sign), top=True)


def de_page(out, cfg, kids, legs, sign):
    """One consolidated German consent page covering all kids and all legs."""
    page = out.new_page(width=PAGE_W, height=PAGE_H)
    fb = fitz.Font(fontfile=ARIAL_BOLD)
    item = DE_LEFT + DE_SUBINDENT
    plural = len(kids) > 1

    def line(x, y, text, size=DE_BODY_SIZE, bold=False):
        page.insert_text((x, y), text, fontsize=size,
                         fontname=FONT_BOLD if bold else FONT_REG,
                         fontfile=ARIAL_BOLD if bold else ARIAL, color=BLACK)

    def centred(y, text, size, bold=False):
        w = fb.text_length(text, size)
        line((PAGE_W - w) / 2, y, text, size, bold)

    centred(DE_TITLE_Y, "REISEVOLLMACHT", DE_TITLE_SIZE, bold=True)
    centred(DE_SUBTITLE_Y,
            f"Einverständniserklärung zur Reise {'Minderjähriger' if plural else 'eines Minderjährigen'}",
            DE_BODY_SIZE)

    y = DE_BODY_TOP
    line(DE_LEFT, y, "Die sorgeberechtigten Eltern / Erziehungsberechtigten:", bold=True)
    for p in cfg["parents"]:
        y += GAP_ITEM
        tel = f"   Tel.: {fmt_phone(p['phone'])}" if p["phone"] else ""
        line(item, y, f"{p['name']}{tel}")
    y += GAP_ITEM
    line(DE_LEFT, y, f"Anschrift: {cfg['home_address']}")

    y += GAP_SECTION
    line(DE_LEFT, y,
         f"erklären ihr Einverständnis mit der Reise {'der Kinder' if plural else 'des Kindes'}:",
         bold=True)
    for k in kids:
        y += GAP_ITEM
        line(item, y, f"{k['name']}     geb. {k['dob']}     Reisepass-Nr.: {k['passport']}")

    y += GAP_SECTION
    line(DE_LEFT, y, "Reise:", bold=True)
    for origin, dest, date in legs:
        y += GAP_ITEM
        route = f"{cfg['cities'][origin]['de']} → {cfg['cities'][dest]['de']}"
        line(item, y, f"{route}     am {cz_date(date)}")
    y += GAP_LINE
    line(item, y, "Beförderer: STUDENT AGENCY k.s. / RegioJet")

    y += GAP_SECTION
    line(DE_LEFT, y, "Übergabe bei Ankunft an folgende Person(en):", bold=True)
    seen = []
    for _, dest, _ in legs:
        if dest in seen:
            continue
        seen.append(dest)
        y += GAP_ITEM
        people = ", ".join(
            f"{p['name']} ({fmt_phone(p['phone'])})" if p["phone"] else p["name"]
            for p in pickups_for(cfg, dest)
        )
        line(item, y, f"in {cfg['cities'][dest]['de']}: {people}")

    y += GAP_SECTION
    line(DE_LEFT, y,
         f"Wir versichern, das Sorgerecht für {'die Kinder' if plural else 'das Kind'} zu besitzen.")
    y += GAP_WIDE
    home_de = cfg["cities"][cfg["home_city"]]["de"]
    line(DE_LEFT, y, f"Ort, Datum: {home_de}, {cz_date(sign)}")
    y += GAP_SIGN
    line(DE_LEFT, y, "Unterschrift: _________________________")


def impose_form(out, form):
    """Place a form's pages side-by-side on a single landscape A4 page (2-up)."""
    land = out.new_page(width=PAGE_H, height=PAGE_W)
    n = form.page_count
    w = PAGE_H / n
    for i in range(n):
        land.show_pdf_page(fitz.Rect(i * w, 0, (i + 1) * w, PAGE_W), form, i)


def generate(cfg, kids, legs, sign):
    OUTDIR.mkdir(exist_ok=True)
    out = fitz.open()
    # One self-standing packet per leg: each kid's form imposed 2-up onto a single
    # landscape page, then one consolidated German POA covering all kids for that leg.
    for origin, dest, date in legs:
        for kid in kids:
            tdoc = fitz.open(TEMPLATE)
            fill_cz(tdoc, cfg, kid, origin, dest, date, sign)
            impose_form(out, tdoc)
            tdoc.close()
        de_page(out, cfg, kids, [(origin, dest, date)], sign)
    kidslug = "-".join(slug(k["name"]) for k in kids)
    fname = f"poa_{kidslug}_{legs[0][2].isoformat()}.pdf"
    path = OUTDIR / fname
    out.save(str(path), garbage=4, deflate=True)
    out.close()
    return path


# ---------- interactive prompts ----------

def ask_date(label, default=None):
    today = dt.date.today()
    default_str = default.strftime("%d.%m.%Y") if default else ""
    while True:
        raw = questionary.text(label, default=default_str).ask()
        if raw is None:
            sys.exit(0)
        d = parse_date(raw)
        if not d:
            console.print(f"   [red]Couldn't read “{raw}”. Try 24.12.2026, Dec 24, "
                          "or next saturday.[/]")
            continue
        delta = (d - today).days
        if delta < 0:
            rel = f"[red]{-delta} day(s) ago[/]"
        elif delta == 0:
            rel = "today"
        else:
            rel = f"in {delta} day(s)"
        console.print(f"   [bold cyan]→ {pretty(d)}[/] [dim]({rel})[/]")
        if questionary.confirm("   Correct?", default=True).ask():
            return d


def other_city(cfg, city):
    return next(c for c in cfg["cities"] if c != city)


def build_legs(cfg):
    trip = questionary.select(
        "Trip type?",
        choices=["Round trip (there and back)", "One-way"],
    ).ask()
    if trip is None:
        sys.exit(0)
    cities = cfg["cities"]
    if trip.startswith("Round"):
        home = cfg["home_city"]
        away = other_city(cfg, home)
        console.print(f"[dim]Round trip from home: {cities[home]['label']} → "
                      f"{cities[away]['label']} → {cities[home]['label']}[/]")
        out_d = ask_date(f"Outbound date ({cities[home]['label']} → {cities[away]['label']})")
        ret_d = ask_date(f"Return date ({cities[away]['label']} → {cities[home]['label']})")
        return [(home, away, out_d), (away, home, ret_d)]
    # one-way: need direction
    keys = list(cities)
    choices = [
        questionary.Choice(f"{cities[keys[0]]['label']} → {cities[keys[1]]['label']}",
                           value=(keys[0], keys[1])),
        questionary.Choice(f"{cities[keys[1]]['label']} → {cities[keys[0]]['label']}",
                           value=(keys[1], keys[0])),
    ]
    direction = questionary.select("Direction?", choices=choices).ask()
    if direction is None:
        sys.exit(0)
    d = ask_date("Travel date")
    return [(direction[0], direction[1], d)]


def summary(cfg, kids, legs, sign):
    t = Table(show_header=False, box=None, padding=(0, 1))
    t.add_column(style="bold")
    t.add_column()
    t.add_row("Children", ", ".join(k["name"] for k in kids))
    t.add_row("Signing date", pretty(sign))
    t.add_row("", "")
    for i, (o, d, date) in enumerate(legs, 1):
        route = f"{cfg['cities'][o]['label']} → {cfg['cities'][d]['label']}"
        pickups = pickups_for(cfg, d)
        who = ", ".join(p["name"] for p in pickups)
        tel = ", ".join(fmt_phone(p["phone"]) for p in pickups if p["phone"]) or "[red]no phone set[/]"
        t.add_row(f"Leg {i}", f"[cyan]{route}[/]  on [bold]{pretty(date)}[/]")
        t.add_row("", f"[dim]handed to {who} ({tel})[/]")
    forms = len(kids) * len(legs)
    pages = forms + len(legs)   # each form imposed to 1 landscape page; one POA per leg
    fname = f"poa_{'-'.join(slug(k['name']) for k in kids)}_{legs[0][2].isoformat()}.pdf"
    t.add_row("", "")
    t.add_row("Will generate", f"{pages} pages "
              f"[dim]({len(legs)} packet(s): {len(kids)} form(s) 2-up + 1 POA each)[/]")
    t.add_row("Output file", f"output/{fname}")
    console.print(Panel(t, title="[bold]Review before generating[/]", border_style="cyan"))


def main():
    cfg = load_config()
    console.print(Panel("[bold]Kid Border Papers[/] — RegioJet power-of-attorney generator",
                        border_style="green"))

    kid_choices = [questionary.Choice(k["name"], value=k, checked=True) for k in cfg["kids"]]
    kids = questionary.checkbox(
        "Which child/children are travelling?",
        choices=kid_choices,
        validate=lambda a: True if a else "Select at least one child.",
    ).ask()
    if not kids:
        sys.exit(0)

    legs = build_legs(cfg)
    sign = ask_date("Signing date (issued on)", default=dt.date.today())

    summary(cfg, kids, legs, sign)
    if not questionary.confirm("Generate this PDF?", default=True).ask():
        console.print("[yellow]Aborted.[/]")
        return
    path = generate(cfg, kids, legs, sign)
    console.print(f"[bold green]✓ Wrote[/] {path}")


# ---------- demo (non-interactive smoke test) ----------

def demo():
    cfg = load_config()
    kids = cfg["kids"]
    legs = [("berlin", "praha", dt.date(2026, 12, 24)),
            ("praha", "berlin", dt.date(2027, 1, 4))]
    sign = dt.date(2026, 6, 8)
    path = generate(cfg, kids, legs, sign)
    print("demo wrote", path)


if __name__ == "__main__":
    if "--demo" in sys.argv:
        demo()
    else:
        main()
