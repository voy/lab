# Jira Copy Issue Key

A Chrome extension that adds a convenient "Copy Issue Key" button next to Jira's copy link button, allowing you to quickly copy just the issue key (e.g., "SLIDES-1636") to your clipboard.

## Features

- 🔑 **One-click copying** of Jira issue keys
- 🎯 **Works everywhere** - both issue detail pages and modal dialogs
- ⚡ **Dynamic injection** - automatically appears when navigating between issues
- ✨ **Seamless integration** - matches Jira's native button styling
- 🔄 **Smart detection** - uses multiple methods to find the issue key
- ✓ **Visual feedback** - shows confirmation when key is copied

## Installation

### From Source (Development)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd jira-copy-issue-key
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Or click the three-dot menu → More tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `jira-copy-issue-key` directory
   - The extension should now appear in your extensions list

5. **Verify installation**
   - The extension icon should appear in your extensions toolbar
   - Navigate to any Jira issue page to test

## Usage

### On Issue Detail Pages

1. Navigate to any Jira issue page (e.g., `https://your-domain.atlassian.net/browse/PROJ-123`)
2. Look for the 🔑 button next to the "Copy link" button in the issue header
3. Click the 🔑 button to copy the issue key
4. The button will show a ✓ checkmark briefly to confirm the copy

### On Board Modal Dialogs

1. Open your Scrum or Kanban board
2. Click any issue to open the modal dialog
3. The 🔑 button will appear next to the copy link button
4. Click to copy the issue key

### Keyboard Shortcut

After clicking the button, simply press **Cmd+V** (Mac) or **Ctrl+V** (Windows/Linux) to paste the issue key anywhere.

## How It Works

The extension uses multiple strategies to reliably extract issue keys:

1. **URL Parsing** - Extracts from `/browse/KEY-123` URLs
2. **Document Title** - Parses the page title for issue keys
3. **DOM Metadata** - Checks for Jira's internal data attributes
4. **DOM Content** - Searches breadcrumbs and headers as fallback

The button injection system:
- Uses **MutationObserver** to detect dynamic content changes
- Implements **debouncing** (300ms) to prevent excessive injections
- Runs **polling** (every 3 seconds) as a safety net
- Listens for **SPA navigation** events (back/forward buttons)

## Compatibility

- **Chrome/Edge**: Manifest V3 (Chrome 88+, Edge 88+)
- **Jira**: All Atlassian Cloud Jira instances (`*.atlassian.net`)
- **Jira Products**: Software, Service Desk, Work Management

## Project Structure

```
jira-copy-issue-key/
├── manifest.json              # Extension configuration
├── icons/                     # Extension icons
│   ├── icon16.png            # Toolbar icon
│   ├── icon48.png            # Extensions page icon
│   └── icon128.png           # Chrome Web Store icon
├── content/                   # Content scripts
│   ├── content.js            # Entry point
│   ├── issue-key-finder.js   # Issue key extraction logic
│   ├── button-injector.js    # Button creation & injection
│   ├── observers.js          # MutationObserver setup
│   └── styles.css            # Minimal custom styles
└── README.md                  # This file
```

## Development

### Testing Locally

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload your Jira page to test changes

### Debugging

1. Open Chrome DevTools (F12) on any Jira page
2. Go to the Console tab
3. Look for logs prefixed with `[Jira Copy Key]`
4. Check for any errors in red

### Key Files to Modify

- **Button styling**: Edit `content/styles.css`
- **Selectors**: Modify `COPY_LINK_SELECTORS` in `button-injector.js`
- **Issue detection**: Add methods to `issue-key-finder.js`
- **Timing**: Adjust `DEBOUNCE_DELAY` and `POLL_INTERVAL` in `observers.js`

## Troubleshooting

### Button doesn't appear

1. **Check if you're on a Jira page** - The extension only runs on `*.atlassian.net` domains
2. **Look for console errors** - Open DevTools and check for errors
3. **Verify issue key detection** - The button won't appear if no issue key is found
4. **Try refreshing the page** - Sometimes a hard refresh (Cmd+Shift+R) helps

### Copy doesn't work

1. **Check browser permissions** - Make sure the extension has clipboard permissions
2. **Try the fallback** - The extension uses `execCommand` as a fallback if the Clipboard API fails
3. **Check for conflicts** - Other extensions might interfere with clipboard operations

### Button appears multiple times

1. **Report as a bug** - This shouldn't happen due to deduplication logic
2. **Include details** - Which page, what actions led to duplication

## Privacy

This extension:
- ✅ Runs entirely locally (no data sent to external servers)
- ✅ Only accesses Jira pages you visit
- ✅ Only reads issue keys from the page
- ✅ Only writes to clipboard when you click the button
- ❌ Does NOT collect analytics
- ❌ Does NOT track your browsing
- ❌ Does NOT store any data

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on real Jira instances
5. Submit a pull request

## Roadmap

Future enhancements could include:

- [ ] Configurable button text/icon
- [ ] Keyboard shortcut for copying
- [ ] Copy in different formats (markdown link, HTML, etc.)
- [ ] Options page for customization
- [ ] Support for Jira Server/Data Center (on-premise)
- [ ] Context menu integration (right-click to copy)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review console logs for errors
3. Create an issue with details about your Jira instance and the problem

---

Made with ❤️ for Jira users who want to quickly copy issue keys
