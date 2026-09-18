# blitz-buerger

A drill app for the German Einbürgerungstest (citizenship test): the 300 general
BAMF questions plus Berlin's 10 state-specific questions (310 total). This first
step only produces the question bank (`questions.js`) and a tag-review checklist
(`tag-review.md`) — no quiz UI yet.

Each question has stable `id`s (`gen-001`..`gen-300`, `be-01`..`be-10`), the
original German question text and answer choices (in the official catalog's
original order — not reshuffled), a `correctIndex` into `choices`, a `scope`
(`general`/`berlin`), and auto-tagged `categories` (`staatsorgane`,
`daten-jahre`, both, or neither) for the app's spaced-repetition bias.

## Sources

- **Official question catalog (primary source for question text, choice text,
  and choice order):** BAMF, *"Gesamtfragenkatalog zum Test 'Leben in
  Deutschland' und zum 'Einbürgerungstest'"*, Stand 07.05.2025 —
  https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf
  (general questions 1–300, and the 10-question Berlin section within the
  16-state appendix).
- **Community datasets (used only to identify which choice is correct, since
  the official PDF itself does not mark answers):**
  - https://github.com/abubakr380/einbugerungtest (`questions.js`)
  - https://github.com/leben-in-deutschland/leben-in-deutschland-scrapper
    (`data/question.json`)

  Both are independently maintained and reorder/paraphrase-normalize the
  answer choices from the official catalog. They were used strictly as a
  cross-checked signal for "which of the 4 official-order choices is
  correct" — never for question or choice wording, which was taken verbatim
  from the PDF.
- **Retrieved:** 2026-09-18.

## How the data was built

A one-off script parsed the official PDF's extracted text (`pdftotext -layout`)
into per-question `{question, choices}` records preserving the PDF's original
choice order, then matched each question by content (not by number — the
community datasets use different internal numbering than the official
catalog's `Aufgabe N` labels) against both community datasets to determine
`correctIndex`. All 310 questions resolved with **zero disagreements** between
the two independent community sources. ~30 questions were additionally
hand-checked against the PDF and general civic knowledge, weighted toward
Staatsorgane (Bundestag/Bundesrat/Bundesregierung/Bundespräsident/
Bundesverfassungsgericht/Bundeskanzler) and date/year questions.

The generation script itself was a throwaway (not committed) — only
`questions.js`, `tag-review.md`, and this README are kept.

## Image-based questions

8 of the 310 questions are inherently visual in the official test (you're
shown an image and pick among 4 pictures/labels). They're flagged
`imageOnly: true` in `questions.js`; `quiz-logic.js`'s `selectSession` only
excludes one of these from the active drill pool if it *also* has no `image`
field sourced (`q.imageOnly && !q.image`).

7 of the 8 now have a real local image (`images/`) and are drillable:

- `gen-021` — Wappen der Bundesrepublik Deutschland. Originally "Bild
  1".."Bild 4"; rewritten to descriptive text (Bundesadler vs. Reichsadler vs.
  DDR-Wappen vs. Preußischer Adler), `images/wappen-brd.svg`.
- `gen-055` — "Was zeigt dieses Bild?" (den Bundestagssitz in Berlin). Choices
  were already descriptive text; unchanged. `images/reichstag.jpg`.
- `gen-209` — Wappen der DDR. Originally "Bild 1".."Bild 4"; rewritten the
  same way as gen-021. `images/wappen-ddr.svg`.
- `gen-216` — welches Symbol im Plenarsaal (der Bundesadler). Choices were
  already descriptive text; unchanged. Reuses `images/wappen-brd.svg`.
- `gen-226` — Flagge der Europäischen Union. Originally "Bild 1".."Bild 4";
  rewritten to descriptive text (EU flag's twelve gold stars vs. three
  plausible wrong flags). `images/flagge-eu.svg`.
- `be-01` — Wappen von Berlin. Originally "Bild 1".."Bild 4"; rewritten to
  descriptive text (Berlin's black bear vs. Brandenburg/Hamburg/Bremen
  wappen). `images/wappen-berlin.svg`.
- `be-08` — Welches Bundesland ist Berlin. Originally numeric "1".."4" map
  labels; rewritten to actual Bundesland names (Bayern/NRW/Sachsen/Berlin).
  `images/berlin-karte.svg`.

`correctIndex` was re-checked against the rewritten choices in every case
above (still points at the choice describing the actually-correct answer).

**`gen-130`** — "Welcher Stimmzettel wäre bei einer Bundestagswahl gültig?" —
is still `imageOnly: true` with no `image` field, so it stays excluded. The
real test shows 4 sample ballots with different markings (crosses in
different places/counts), and reproducing that faithfully needs the actual
BAMF sample-ballot images, which weren't found as a legitimately reusable
reference. There's also enough nuance in German ballot-validity rules
(blank vs. multiply-marked vs. annotated ballots) that guessing at 4 rewritten
text choices risked stating a wrong civics fact, so this one was left
unresolved rather than guessed at.

## Image credits

All images are stored locally under `images/` (no hotlinking) for offline PWA
use. Source and license for each:

- `images/wappen-brd.svg` — [Coat of Arms of Germany](https://commons.wikimedia.org/wiki/File:Coat_of_Arms_of_Germany.svg),
  Wikimedia Commons, public domain (German government work). Design: Karl-Tobias Schwab.
- `images/wappen-ddr.svg` — [Coat of arms of East Germany](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_East_Germany_(1955%E2%80%931990).svg),
  Wikimedia Commons, public domain. Design: Heinz Behling / Fritz Behrendt.
- `images/wappen-berlin.svg` — [Coat of arms of Berlin](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Berlin.svg),
  Wikimedia Commons, public domain.
- `images/flagge-eu.svg` — [Flag of Europe](https://commons.wikimedia.org/wiki/File:Flag_of_Europe.svg),
  Wikimedia Commons, public domain.
- `images/berlin-karte.svg` — [Germany Laender Berlin](https://commons.wikimedia.org/wiki/File:Germany_Laender_Berlin.svg),
  Wikimedia Commons, CC BY-SA 4.0, by User:BMacZero.
- `images/reichstag.jpg` — [Reichstagsgebäude von Westen](https://commons.wikimedia.org/wiki/File:Reichstagsgeb%C3%A4ude_von_Westen.jpg),
  Wikimedia Commons, CC BY-SA 4.0, by Jörg Braukmann. Resized to a 960px-wide
  thumbnail via Wikimedia's own thumbnailer.
