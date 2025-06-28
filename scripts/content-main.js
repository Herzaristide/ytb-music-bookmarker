// YouTube Music Extension - Main Content Script
// ==============================================

class YouTubeMusicExtension {
  constructor() {
    this.isInitialized = false;
    this.currentVideoId = null;
    this.currentUrl = window.location.href;

    // Initialize components
    this.markerManager = new MarkerManager();
    this.speedController = new SpeedController();
    this.navigationManager = new NavigationManager(this.markerManager);
    this.uiPanel = new UIPanel(
      this.markerManager,
      this.speedController,
      this.navigationManager
    );

    // Make components globally accessible for cross-component communication
    window.markerManager = this.markerManager;
    window.speedController = this.speedController;
    window.navigationManager = this.navigationManager;
    window.uiPanel = this.uiPanel;
  }

  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('Initializing YouTube Music Timecode Markers extension');

    try {
      // Initialize speed controller
      await this.speedController.initialize();

      // Create unified control panel
      await this.uiPanel.create();

      // Initial display of markers
      setTimeout(() => this.markerManager.displayMarkersOnProgressBar(), 4000);

      // Setup event listeners
      this.setupEventListeners();

      // Setup periodic checks
      this.setupPeriodicChecks();

      // Setup video event listeners
      this.setupVideoEventListeners();

      console.log('YouTube Music extension initialized successfully');
    } catch (error) {
      console.error('Error initializing extension:', error);
    }
  }

  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts when not typing in input fields
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      // Marker creation shortcut: M key
      if (
        e.key.toLowerCase() === 'm' &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        this.markerManager.addMarkerAtCurrentTime();
        return;
      }

      // Speed control shortcuts (Ctrl + number keys)
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (this.speedController.handleKeyboardShortcut(e.key)) {
          e.preventDefault();
          return;
        }
      }

      // Navigation shortcuts (Ctrl + arrow keys)
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (this.navigationManager.handleKeyboardNavigation(e.key)) {
          e.preventDefault();
          return;
        }
      }

      // Toggle panel with Ctrl+Shift+P
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        this.togglePanel();
      }
    });

    // Message listener for popup communication
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getVideoInfo':
          const videoInfo = {
            videoId: getVideoId(),
            title: getVideoTitle(),
            currentTime: getCurrentTime(),
            duration: getVideoDuration(),
            url: window.location.href,
          };
          sendResponse(videoInfo);
          break;

        case 'refreshTimecodes':
          await this.markerManager.displayMarkersOnProgressBar();
          this.uiPanel.updateMarkerList();
          sendResponse({ success: true });
          break;

        case 'setPlaybackSpeed':
          await this.speedController.setVideoPlaybackSpeed(request.speed);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  setupPeriodicChecks() {
    // Ensure panel stays visible
    setInterval(() => this.uiPanel.ensureExists(), 5000);

    // Check for URL changes
    setInterval(() => this.checkUrlChange(), 2000);
  }

  setupVideoEventListeners() {
    const checkForVideo = () => {
      const video = document.querySelector('video');
      if (video && !video.hasAttribute('data-markers-initialized')) {
        video.setAttribute('data-markers-initialized', 'true');

        video.addEventListener('loadedmetadata', () => {
          setTimeout(
            () => this.markerManager.displayMarkersOnProgressBar(),
            1000
          );
          setTimeout(
            () => this.speedController.applyStoredPlaybackSpeed(),
            500
          );
          setTimeout(() => this.uiPanel.updateMarkerList(), 1500);
        });

        video.addEventListener('durationchange', () => {
          setTimeout(
            () => this.markerManager.displayMarkersOnProgressBar(),
            1000
          );
        });

        video.addEventListener('loadstart', () => {
          setTimeout(
            () => this.speedController.applyStoredPlaybackSpeed(),
            200
          );
        });
      }
    };

    // Initial check
    checkForVideo();

    // Periodic check for video element
    setInterval(checkForVideo, 5000);
  }

  checkUrlChange() {
    if (window.location.href !== this.currentUrl) {
      this.currentUrl = window.location.href;
      this.handleUrlChange();
    }
  }

  handleUrlChange() {
    console.log('URL changed, reinitializing...');
    setTimeout(async () => {
      await this.markerManager.displayMarkersOnProgressBar();
      this.uiPanel.updateMarkerList();
      this.uiPanel.ensureExists();
    }, 2000);
  }

  handleVideoChange() {
    const newVideoId = getVideoId();
    if (newVideoId && newVideoId !== this.currentVideoId) {
      console.log(`Video changed from ${this.currentVideoId} to ${newVideoId}`);
      this.currentVideoId = newVideoId;

      setTimeout(() => this.markerManager.displayMarkersOnProgressBar(), 3000);
      setTimeout(() => this.uiPanel.ensureExists(), 1000);
      setTimeout(() => this.uiPanel.updateMarkerList(), 2000);
    }
  }

  togglePanel() {
    const panel = document.querySelector('.ytmusic-unified-control-panel');
    if (panel) {
      const toggleBtn = panel.querySelector('.ytmusic-panel-toggle');
      const collapsedIcon = panel.querySelector(
        '.ytmusic-panel-collapsed-icon'
      );
      if (toggleBtn) {
        toggleBtn.click();
      } else if (collapsedIcon) {
        collapsedIcon.click();
      }
    }
  }
}

// Initialize extension
let extensionInstance = null;

function initializeExtension() {
  if (!extensionInstance) {
    extensionInstance = new YouTubeMusicExtension();
  }
  extensionInstance.initialize();
}

// Initialize when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Also initialize after a delay to handle YouTube Music's dynamic loading
setTimeout(initializeExtension, 3000);
