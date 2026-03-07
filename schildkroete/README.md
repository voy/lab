# Schildkröte Berlin - Mealplan Side by Side

A Tampermonkey/Greasemonkey userscript that displays the mealplan panels on [bestellung.schildkroete-berlin.de](https://bestellung.schildkroete-berlin.de) side by side instead of stacked vertically.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Firefox) or [Greasemonkey](https://www.greasespot.net/) (Firefox)
2. Open the extension dashboard and create a new script
3. Paste the contents of `schildkroete.js` and save

## Usage

Navigate to `https://bestellung.schildkroete-berlin.de/kunden/essen/` — the mealplan panels will automatically be arranged side by side using flexbox.

## How It Works

- Waits for `.panel-mealplan` elements to appear in the DOM (up to 10 seconds)
- Finds their common parent and wraps them in a flex container
- Each panel is set to `flex: 1 1 45%` with a 300px minimum width, so they stack on narrow screens
