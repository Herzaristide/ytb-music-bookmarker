# YouTube Music Timecode Markers Extension

A modular Chrome extension that adds visual timecode markers to YouTube Music and provides advanced playback controls.

## 📁 Project Structure

```
/ytb-music-bookmarker/
├── scripts/
│   ├── content-main.js      # Main entry point and orchestration
│   ├── utils.js             # Utility functions (DOM, time, video)
│   ├── storage.js           # Storage management (markers, settings)
│   ├── markers.js           # Marker creation and management
│   ├── speed-controls.js    # Playback speed functionality
│   ├── navigation.js        # Marker navigation
│   └── ui-panel.js          # Unified control panel UI
├── manifest.json            # Extension manifest
├── popup.html              # Extension popup
├── popup.js                # Popup functionality
├── styles.css              # Extension styles
├── icon.png                # Extension icon
└── content-backup.js       # Backup of original monolithic file
```

## 🏗️ Architecture

### Modular Design

The extension is now organized into separate modules, each with a single responsibility:

- **utils.js**: Core utility functions for DOM manipulation, time formatting, and video queries
- **storage.js**: Centralized storage management with async/await patterns
- **markers.js**: Complete marker lifecycle management
- **speed-controls.js**: Playback speed control and notifications
- **navigation.js**: Marker navigation logic
- **ui-panel.js**: Unified control panel with all UI interactions
- **content-main.js**: Main orchestrator that ties all modules together

### Class-Based Components

Each module uses ES6 classes for better organization:

- `StorageManager`: Static methods for all storage operations
- `MarkerManager`: Instance-based marker management
- `SpeedController`: Speed control functionality
- `NavigationManager`: Navigation between markers
- `UIPanel`: Complete UI management
- `YouTubeMusicExtension`: Main extension controller

## 🎯 Features

### ⚡ Speed Control

- Speed buttons: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Fine control slider: 0.25x to 3x
- Keyboard shortcuts: Ctrl+1-6
- Visual speed notifications
- Persistent speed settings

### 🎵 Marker Management

- Quick marker creation: M key or panel button
- Visual markers on progress bar
- Hover effects with tooltips
- Double-click to remove
- Persistent storage per video

### 📍 Navigation

- Previous/Next marker buttons
- Keyboard navigation: Ctrl+Left/Right
- Click markers to jump to time
- Smart wrapping (first/last marker)

### 🎛️ Unified Control Panel

- Draggable and collapsible
- All controls in one place
- Real-time marker list
- Current time display
- Position and state persistence

## ⌨️ Keyboard Shortcuts

- **M**: Add marker at current time
- **Ctrl+1-6**: Set speed presets
- **Ctrl+Left/Right**: Navigate between markers
- **Ctrl+Shift+P**: Toggle panel collapse

## 🔧 Development

### Loading Order

Scripts are loaded in dependency order via manifest.json:

1. utils.js (foundational functions)
2. storage.js (data management)
3. markers.js (depends on utils, storage)
4. speed-controls.js (depends on storage)
5. navigation.js (depends on storage, utils)
6. ui-panel.js (depends on all above)
7. content-main.js (orchestrates everything)

### Inter-Module Communication

- Global component instances on `window` object
- Event-driven updates between components
- Async/await for storage operations
- Error handling in each module

### Extension Points

Easy to extend with new features:

- Add new UI sections to UIPanel
- Extend keyboard shortcuts in content-main.js
- Add new storage methods to StorageManager
- Create new navigation patterns in NavigationManager

## 🚀 Benefits of Modular Structure

1. **Maintainability**: Each file has a single, clear purpose
2. **Testability**: Individual modules can be tested in isolation
3. **Scalability**: Easy to add new features without affecting existing code
4. **Readability**: Smaller files are easier to understand and modify
5. **Debugging**: Issues can be traced to specific modules
6. **Collaboration**: Multiple developers can work on different modules

## 📝 Migration Notes

The original `content.js` has been backed up as `content-backup.js`. The new modular structure maintains 100% feature compatibility while providing much better code organization.
