# markdown-slate

A minimal Markdown slate — read it, write it, or both. Two panes, one divider, no mode switches.

## The divider is the only control

Drag it to resize. Drag it into the left edge and the source collapses: rendered
Markdown in a centred reading column. Drag it into the right edge and the
preview collapses: a full-width, distraction-free editor. Click a parked divider
to pull the pane back out, double-click to reset the split, or cycle all three
states with `⌘\`.

## Reading measure

One measure, 720px, no narrow/wide toggle. Tables size to their content and
scroll horizontally rather than squeezing columns into unreadable wrapping;
code blocks already did. Everything keeps a single left edge.

## Features

- Drag and drop a file to load it, `⌘O` or the Open button to pick one
- Live preview as you type
- Files opened via the picker re-read themselves when you refocus the tab, so
  editing in another editor just works — skipped when you have unsaved edits
- Content and layout are persisted in `localStorage`

## Printing

`⌘P` prints the rendered document from any of the three layout states — there's
no print button. The stylesheet unwinds the app shell (the `100vh` flex body,
the grid, the pane's own scroll container) back into normal flow, so the whole
document paginates instead of one clipped screenful.

- Header, source pane and divider are hidden; colours forced to black on white
- A4 margins of 20/24mm at 12pt land the measure near 75 characters
- Tables switch back from the scrolling `display: block` to a real table, so
  they paginate and repeat their header row
- Code wraps rather than clipping, since paper can't scroll sideways
- Headings use `break-after: avoid`; body text sets `orphans`/`widows`
- External links print their URL in grey after the link text

## Privacy

Yes, there are a million Markdown viewers out there. Built this one because
everything runs locally in your browser — no content is ever sent anywhere, so
sensitive documents stay on your machine.

## Usage

Open `index.html` in a browser. No build step, no dependencies beyond a
CDN-loaded [marked.js](https://marked.js.org/).
