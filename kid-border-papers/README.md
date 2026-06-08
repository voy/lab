# kid-border-papers

Interactive generator for RegioJet / STUDENT AGENCY **powers of attorney** for
minors travelling unaccompanied between Berlin and Prague. Fills the official
bilingual (CZ/EN) form from a local config and adds a German consent page
(*Reisevollmacht*) for the border — emitted as **self-standing, print-ready
packets**, one per travel direction.

## Usage

```sh
cp config.example.json config.json   # then edit with your real details
./generate.py                        # or: uv run generate.py
```

The CLI asks which child/children are travelling, the trip type (round trip or
one-way), the date(s), and the signing date. Dates accept anything sensible
(`24.12.2026`, `Dec 24 2026`, `24.12` → current year, `next saturday`, `in 3 days`),
resolve ambiguous/year-less inputs to the **future**, and are echoed back with
their weekday and days-away for you to double-check. It prints a full summary
before writing anything, then emits one PDF to `output/`.

Round trips start from `home_city` (Berlin → Prague → Berlin); one-way trips ask
for the direction. Sign by hand after printing (the signature boxes are left blank).

## Output layout

One **self-standing packet per leg**, so you carry the outbound packet on the way
there and the return packet on the way back — each complete on its own:

```
PACKET 1 — Berlin → Praha        PACKET 2 — Praha → Berlin
  Child A form  (2-up landscape)   Child A form  (2-up landscape)
  Child B form    (2-up landscape)   Child B form    (2-up landscape)
  Power of attorney (portrait)     Power of attorney (portrait)
```

Each RegioJet form is **two pages** (fill-in page + terms/signature page); they're
imposed **2-up** onto one landscape sheet so a packet is 3 pages. Print **1-up /
normal** — the layout is baked into the PDF, no print-dialog settings needed.
A two-kid round trip is 6 pages total.

## How it works

- `template.pdf` — the blank RegioJet form (the official filled PDF with every
  annotation stripped; verified to contain no PII). Field values are baked in at
  10 pt Arial, vertically centred in each gray box.
- The "handed over to" person(s) and phone(s) are chosen per **destination**:
  the parents at `home_city`, otherwise `config.pickup[city]`. So the return-to-home
  leg lists the parents; the away leg lists the hosts.
- `generate.py` fills one Czech form per (kid, leg), imposes each 2-up, and appends
  one consolidated German POA per leg (listing all travelling kids).

## Config & PII

`config.json` holds PII (names, address, phones, passport numbers, birthdays) and
is **git-ignored**. `config.example.json` is the committed, fake-data template.
`output/` is git-ignored too. Each person carries their own phone number; phones
are auto-grouped on render (`+420 600 000 000`, `+49 151 0000 0000`).

## Tests

```sh
uv run --with pytest --with dateparser --with parsedatetime --with pymupdf pytest -q
```

`core.py` holds the pure logic (phone formatting, date parsing, pickup/signer
resolution) with no PDF/UI deps, so it's unit-tested in isolation. Tests use only
fake data.

## Design notes (for maintainers / LLMs)

- **Two layers, two files.** `core.py` = pure, testable logic (no `fitz`/UI).
  `generate.py` = PDF rendering + interactive prompts. Keep PII-free logic in core.
- **Fonts.** Built-in Helvetica lacks Czech glyphs (ě, ř, Ž…) and even the narrow
  no-break space **U+202F** has no glyph in Arial — it rendered as tofu boxes. We
  embed the system **Arial** TTF and group phone digits with **U+2009 thin space**
  (`core.THINSP`); `test_fonts.py` guards that the separator has a glyph.
- **Vertical centring.** Baked text baseline = box centre + `CAP/2`, where
  `CAP = 0.717 * font_size` (Arial cap-height ratio). Measured empirically.
- **Dates.** `dateparser` (day-first, prefer-future) handles numeric/explicit and
  bare weekdays; `parsedatetime` is a fallback for `next saturday` / `this friday`.
- **German page place/date** = residence city + **signing date** (not the travel
  date — a PoA is dated when executed; the travel date is on its own "Reise:" line).
- **macOS-only** for the hardcoded Arial path. Needs [`uv`](https://docs.astral.sh/uv/);
  deps are declared inline in `generate.py` and installed on first run.
- Field rectangles in `generate.py` (`F`, `ISSUED`) are calibrated to this exact
  template; re-measure if the form PDF is ever replaced.
