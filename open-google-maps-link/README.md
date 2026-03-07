# Direct Google Maps Link - Chrome Extension

This Chrome extension adds a direct "Open in Google Maps" button to Google search results, bypassing the EU restriction that removes direct links to Google Maps.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked"
4. Select the folder containing this extension
5. The extension is now installed and active

## Usage

Simply search for any location on Google (e.g., "Sommerstraße 3 Berlin"). When Google detects it's a location search, you'll see a blue "🗺️ Open in Google Maps" button that links directly to Google Maps.

## How It Works

The extension:
- Detects when you're searching for locations on Google
- Injects a styled button into the search results
- Links directly to Google Maps with your search query

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main logic for detecting location searches and injecting the button
- `styles.css` - Styling for the Maps button
- Icon files (you'll need to add your own 16x16, 48x48, and 128x128 PNG icons)

## Notes

The extension works on all European Google domains (.de, .fr, .co.uk, etc.) where this restriction applies.
