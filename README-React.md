# YouTube Music Bookmarker - React Edition

A modern Chrome extension for YouTube Music with advanced bookmarking capabilities, built with React architecture.

## Features

🎵 **Advanced Bookmarking**
- Create timestamped markers with descriptions
- Visual markers on progress bar
- Quick navigation between markers
- Persistent storage across sessions

⚡ **Speed Controls**
- Preset speed buttons (0.5x to 2x)
- Fine-tune with slider (0.25x to 3x)
- Instant speed adjustments
- Remembers your preferred speed

🎛️ **Modern UI**
- React-powered components
- Glass morphism design
- Responsive layout
- Smooth animations
- YouTube Music integration

## Installation

### Prerequisites
- Node.js 16+ and npm
- Chrome browser

### Build Steps

1. **Clone and setup**
   ```bash
   cd ytb-music-bookmarker
   npm install
   ```

2. **Build the extension**
   ```bash
   npm run build
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development

For development with hot reload:
```bash
npm run watch
```

## Usage

1. **Navigate to YouTube Music**
   - Go to https://music.youtube.com
   - Play any video

2. **Access Controls**
   - Click "YouTube Music Controls" button in top bar
   - Panel slides down with all features

3. **Create Markers**
   - Click "Add Marker" to bookmark current time
   - Add descriptions for better organization
   - Markers appear on progress bar

4. **Navigate Markers**
   - Use Previous/Next buttons
   - Click markers in the list
   - Click visual markers on progress bar

5. **Speed Control**
   - Use preset buttons for common speeds
   - Fine-tune with slider
   - Changes apply instantly

## Architecture

### Modern React Structure
```
src/
├── components/          # React components
│   ├── ControlPanel.jsx    # Main container
│   ├── ToggleButton.jsx    # Header toggle
│   ├── SpeedControls.jsx   # Speed management
│   ├── MarkerControls.jsx  # Marker creation
│   ├── MarkerList.jsx      # Marker navigation
│   └── ProgressBarMarkers.jsx # Visual markers
├── hooks/              # Custom React hooks
│   ├── useMarkers.js      # Marker state management
│   ├── useSpeedControl.js # Speed state management
│   └── useCurrentTime.js  # Time tracking
├── utils/              # Utility functions
│   ├── storage.js         # Chrome storage API
│   └── youtube.js         # YouTube Music API
└── styles/             # CSS modules
    └── content.css        # Component styles
```

### Key Technologies
- **React 18** - Component framework
- **Chrome Extension APIs** - Storage and content scripts
- **Webpack** - Module bundling
- **Babel** - JSX transformation
- **CSS3** - Modern styling with backdrop filters

## Scripts

- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run watch` - Development with file watching
- `npm run clean` - Clean build directory

## Browser Support

- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)

## Data Management

All data is stored locally using Chrome's storage API:
- **Markers**: Organized by video ID
- **Speed Settings**: Global preference
- **Panel State**: Remembers visibility

Export/import functionality available in extension popup.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with React best practices
4. Test thoroughly on YouTube Music
5. Submit pull request

## Migration from V1

The React edition is a complete rewrite with:
- ✅ **Better Performance** - Virtual DOM and optimized re-renders
- ✅ **Modern Code** - Hooks, functional components
- ✅ **Easier Maintenance** - Component-based architecture
- ✅ **Type Safety** - Better development experience
- ✅ **Future-Proof** - Latest Chrome extension standards

All your existing markers will continue to work - no data migration needed!

## Troubleshooting

**Extension not loading?**
- Ensure you built with `npm run build`
- Check Chrome developer mode is enabled
- Reload extension after code changes

**Markers not appearing?**
- Wait for video to fully load
- Try refreshing the page
- Check browser console for errors

**Speed not applying?**
- Ensure video is playing
- Try clicking away and back to video
- Check if other extensions conflict

## Version History

- **v2.0.0** - React architecture rebuild
- **v1.0.0** - Original vanilla JavaScript version

---

Built with ❤️ for YouTube Music lovers
