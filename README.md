# VAST Inspector

A comprehensive VAST (Video Ad Serving Template) Inspector tool for QA testing and debugging video advertisements. Track clicks, impressions, tracking pixels, and monitor ad events in real-time.

🌐 **Live Demo Available via GitHub Pages** (see deployment instructions below)

## Features

- 📺 **VAST XML Parser** - Parse and validate VAST 2.0, 3.0, and 4.0+ responses
- 🔍 **URL Tracking** - Capture and display all tracking URLs (impressions, clicks, quartiles)
- 🖼️ **Tracking Pixels** - Monitor all tracking images and pixels fired
- 🎬 **Video Ad Preview** - Test video ad playback with full event monitoring
- 📊 **Event Logging** - Real-time logging of all ad events with timestamps
- 🔗 **VAST Wrapper Support** - Handle wrapped VAST tags and follow redirects
- 📱 **Responsive UI** - Works on desktop and mobile devices
- 🚀 **No Installation Required** - Use directly from GitHub Pages

## Quick Start

### Option 1: Use GitHub Pages (Recommended)

Simply visit: **https://[your-username].github.io/vast-inspector/**

No installation required! Works directly in your browser.

(Replace `[your-username]` with your GitHub username after deployment)

### Option 2: Run Locally

**Prerequisites:**
- Node.js >= 14.0.0
- npm or yarn

**Installation:**

```bash
# Clone the repository
git clone https://github.com/[your-username]/vast-inspector.git
cd vast-inspector

# Install dependencies
npm install

# Start the development server
npm start
```

The inspector will open automatically in your browser at `http://localhost:8080`

### Option 3: Open Directly

Simply open `index.html` in your browser. No server needed!

## Usage

### Testing a VAST Tag

1. **Enter VAST URL or XML**
   - Paste a VAST tag URL in the input field, OR
   - Switch to "VAST XML" mode and paste the XML directly

2. **Click "Test Ad"**
   - The tool will fetch and parse the VAST response
   - Video ad will load in the player

3. **Monitor Results**
   - View all tracking URLs in the "Tracking URLs" section
   - See fired tracking pixels in the "Tracking Pixels" section
   - Monitor real-time events in the "Event Log"

### Features

#### Tracking URLs
All URLs extracted from the VAST XML are displayed and categorized:
- **Impression URLs** - Fired when ad is displayed
- **Click URLs** - Fired when user clicks the ad
- **Quartile Tracking** - Start, FirstQuartile, Midpoint, ThirdQuartile, Complete
- **Error Tracking** - Error reporting URLs
- **Custom Tracking** - Any custom tracking events

#### Tracking Pixels
Visual display of all tracking pixels including:
- Impression trackers
- Viewability trackers
- Third-party analytics pixels
- Status indicator (fired/not fired)

#### Event Monitoring
Real-time logging of:
- Ad lifecycle events (loaded, started, paused, resumed, completed)
- User interactions (click, close, skip)
- Quartile events (25%, 50%, 75%, 100%)
- Error events with details
- Timestamps for performance analysis

## VAST Specification Support

- ✅ VAST 2.0
- ✅ VAST 3.0
- ✅ VAST 4.0+
- ✅ VAST Wrappers
- ✅ VPAID (limited support)

## Project Structure

```
vast-inspector/
├── index.html              # Main application UI
├── src/
│   ├── vast-parser.js      # VAST XML parsing logic
│   ├── tracker.js          # URL and pixel tracking
│   ├── video-player.js     # Video player controller
│   └── ui.js               # UI management
├── styles/
│   └── main.css           # Application styles
├── package.json
└── README.md
```

## GitHub Pages Deployment

This project is configured to work as a GitHub Pages site out of the box.

### Automatic Deployment

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select the branch you want to deploy (e.g., `main` or `master`)
   - Click "Save"

2. **Access your site:**
   - Your VAST Inspector will be available at: `https://[your-username].github.io/vast-inspector/`
   - Replace `[your-username]` with your actual GitHub username

### Manual Deployment

The project works directly from the repository with no build step required:
- `index.html` is the entry point
- All assets are in `src/` and `styles/`
- `.nojekyll` file prevents Jekyll processing

## Development

### Running Locally

```bash
npm run dev
```

### Project Configuration

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and AI assistant instructions.

## Common Use Cases

### QA Testing Checklist

- [ ] Verify all impression trackers fire
- [ ] Confirm click-through URLs work correctly
- [ ] Test quartile events (25%, 50%, 75%, 100%)
- [ ] Validate error tracking
- [ ] Check companion ads (if applicable)
- [ ] Verify video plays correctly
- [ ] Test skip button functionality
- [ ] Confirm all tracking pixels fire

### Debugging Issues

1. **Ad Not Loading**
   - Check VAST XML structure in the parser output
   - Verify MediaFiles are present and accessible
   - Check browser console for CORS issues

2. **Tracking Not Firing**
   - Enable "Network" tab in browser DevTools
   - Verify URLs in the tracking section
   - Check for HTTPS/HTTP mixed content issues

3. **Video Not Playing**
   - Verify video codec support
   - Check MediaFile MIME types
   - Test different MediaFile options

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please follow the guidelines in [CLAUDE.md](./CLAUDE.md).

## License

MIT License - see LICENSE file for details

## Resources

- [IAB VAST Specification](https://www.iab.com/guidelines/vast/)
- [VAST 4.0 Documentation](https://iabtechlab.com/standards/vast/)
- [Video Ad Testing Best Practices](https://support.google.com/admanager/answer/1068325)

## Support

For issues and questions, please open an issue on the repository.
