# Installation Instructions

## Quick Start

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your Chrome address bar
   - Or click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select the `open-google-maps-link` folder
   - Click "Select" or "Open"

4. **Done!**
   - The extension is now active
   - Try searching for "Sommerstraße 3 Berlin" on Google to test it

## Note About Icons

The extension works without custom icons. If you want to add proper icons later:
- Create three PNG files: icon16.png, icon48.png, icon128.png
- Add them to the extension folder
- Update manifest.json to include the icons section

## Troubleshooting

**Extension not showing up?**
- Make sure you selected the correct folder
- Check that all files (manifest.json, content.js, styles.css) are present

**Button not appearing?**
- Make sure you're searching for a location (e.g., an address)
- Try refreshing the Google search page
- Check that the extension is enabled in chrome://extensions/

**Works on these Google domains:**
- google.com, google.de, google.fr, google.co.uk, google.it, google.es
- google.nl, google.be, google.at, google.pl, google.se, google.dk
- google.fi, google.no, google.pt, google.gr, google.ie, google.cz
- google.ro, google.hu
