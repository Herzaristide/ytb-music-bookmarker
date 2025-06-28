// YouTube Music Extension - UI Panel
// ===================================

class UIPanel {
  constructor(markerManager, speedController, navigationManager) {
    this.markerManager = markerManager;
    this.speedController = speedController;
    this.navigationManager = navigationManager;
    this.panel = null;
    this.timeUpdateInterval = null;
  }

  async create() {
    // Remove existing overlays if any
    const existingOverlay = document.querySelector(
      '.ytmusic-speed-control-overlay'
    );
    if (existingOverlay) {
      existingOverlay.remove();
    }
    const existingBtn = document.querySelector('.ytmusic-add-marker-btn');
    if (existingBtn) {
      existingBtn.remove();
    }
    const existingToggle = document.querySelector(
      '.ytmusic-header-control-toggle'
    );
    if (existingToggle) {
      existingToggle.remove();
    }

    // Create toggle button
    this.createToggleButton();

    // Create main panel
    this.panel = document.createElement('div');
    this.panel.className = 'ytmusic-unified-control-panel';
    this.panel.innerHTML = this.getHTMLTemplate();

    document.body.appendChild(this.panel);

    await this.initialize();
    this.attachEventListeners();
    this.startTimeUpdates();
    this.updateMarkerList();

    console.log('Unified control panel created');
    return this.panel;
  }

  createToggleButton() {
    this.toggleButton = document.createElement('div');
    this.toggleButton.className = 'ytmusic-header-control-toggle';
    this.toggleButton.innerHTML = `
      <span class="icon">🎛️</span>
      <span class="label">YouTube Music Controls</span>
    `;

    this.toggleButton.addEventListener('click', () => {
      this.togglePanel();
    });

    document.body.appendChild(this.toggleButton);
  }

  togglePanel() {
    const isVisible = this.panel.classList.contains('visible');

    if (isVisible) {
      this.panel.classList.remove('visible');
      this.toggleButton.classList.remove('active');
    } else {
      this.panel.classList.add('visible');
      this.toggleButton.classList.add('active');
    }
  }

  getHTMLTemplate() {
    return `
      <!-- Speed Control Section -->
      <div class="ytmusic-section">
        <div class="ytmusic-section-title">⚡ Speed Control</div>
        <div class="ytmusic-speed-controls">
          <button class="ytmusic-speed-btn" data-speed="0.5">0.5x</button>
          <button class="ytmusic-speed-btn" data-speed="0.75">0.75x</button>
          <button class="ytmusic-speed-btn active" data-speed="1">1x</button>
          <button class="ytmusic-speed-btn" data-speed="1.25">1.25x</button>
          <button class="ytmusic-speed-btn" data-speed="1.5">1.5x</button>
          <button class="ytmusic-speed-btn" data-speed="2">2x</button>
        </div>
        <div class="ytmusic-speed-slider-container">
          <input type="range" class="ytmusic-speed-slider" min="0.25" max="3" step="0.05" value="1">
          <span class="ytmusic-speed-value">1.00x</span>
        </div>
      </div>

      <!-- Marker Control Section -->
      <div class="ytmusic-section">
        <div class="ytmusic-section-title">🎵 Markers</div>
        <div class="ytmusic-marker-controls">
          <button class="ytmusic-add-marker-btn-panel">+ Add Marker</button>
          <button class="ytmusic-clear-markers-btn">🗑️ Clear All</button>
          <button class="ytmusic-refresh-markers-btn">🔄 Refresh</button>
        </div>
        <div class="ytmusic-current-time">
          <span class="ytmusic-time-display">0:00</span>
        </div>
      </div>

      <!-- Marker Navigation Section -->
      <div class="ytmusic-section">
        <div class="ytmusic-section-title">📍 Navigation</div>
        <div class="ytmusic-marker-list">
          <div class="ytmusic-no-markers">No markers for this video</div>
        </div>
        <div class="ytmusic-navigation-controls">
          <button class="ytmusic-prev-marker-btn">⏮️ Previous</button>
          <button class="ytmusic-next-marker-btn">⏭️ Next</button>
        </div>
      </div>
    `;
  }

  async initialize() {
    try {
      // Load and apply stored settings
      const speedSettings = await StorageManager.getPlaybackSpeed();

      // Set speed UI
      this.updateSpeedUI(speedSettings);
    } catch (error) {
      console.error('Error initializing panel:', error);
    }
  }

  attachEventListeners() {
    // Speed control listeners
    const speedBtns = this.panel.querySelectorAll('.ytmusic-speed-btn');
    speedBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        this.speedController.setVideoPlaybackSpeed(speed);
      });
    });

    const speedSlider = this.panel.querySelector('.ytmusic-speed-slider');
    speedSlider.addEventListener('input', () => {
      const speed = parseFloat(speedSlider.value);
      this.speedController.setVideoPlaybackSpeed(speed);
    });

    // Marker control listeners
    this.panel
      .querySelector('.ytmusic-add-marker-btn-panel')
      .addEventListener('click', () =>
        this.markerManager.addMarkerAtCurrentTime()
      );

    this.panel
      .querySelector('.ytmusic-clear-markers-btn')
      .addEventListener('click', () => this.markerManager.clearAllMarkers());

    this.panel
      .querySelector('.ytmusic-refresh-markers-btn')
      .addEventListener('click', () => {
        this.markerManager.displayMarkersOnProgressBar();
        this.updateMarkerList();
      });

    // Navigation listeners
    this.panel
      .querySelector('.ytmusic-prev-marker-btn')
      .addEventListener('click', () =>
        this.navigationManager.goToPreviousMarker()
      );

    this.panel
      .querySelector('.ytmusic-next-marker-btn')
      .addEventListener('click', () => this.navigationManager.goToNextMarker());
  }

  updateSpeedUI(speed) {
    const speedBtns = this.panel.querySelectorAll('.ytmusic-speed-btn');
    const speedSlider = this.panel.querySelector('.ytmusic-speed-slider');
    const speedValue = this.panel.querySelector('.ytmusic-speed-value');

    if (speedSlider) speedSlider.value = speed;
    if (speedValue) speedValue.textContent = `${speed.toFixed(2)}x`;

    speedBtns.forEach((btn) => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
    });
  }

  updateTimeDisplay() {
    const timeDisplay = this.panel.querySelector('.ytmusic-time-display');
    if (timeDisplay) {
      const currentTime = getCurrentTime();
      timeDisplay.textContent = formatTime(currentTime);
    }
  }

  async updateMarkerList() {
    const videoId = getVideoId();
    const markerList = this.panel.querySelector('.ytmusic-marker-list');

    if (!markerList || !videoId) return;

    try {
      const videoMarkers = await StorageManager.getVideoMarkers(videoId);

      if (videoMarkers.length === 0) {
        markerList.innerHTML =
          '<div class="ytmusic-no-markers">No markers for this video</div>';
        return;
      }

      markerList.innerHTML = videoMarkers
        .map(
          (marker, index) => `
        <div class="ytmusic-marker-item" data-timecode="${marker.timecode}">
          <div class="ytmusic-marker-time">${formatTime(marker.timecode)}</div>
          <div class="ytmusic-marker-note">${
            marker.note || 'No description'
          }</div>
          <div class="ytmusic-marker-actions">
            <button class="ytmusic-goto-marker" data-timecode="${
              marker.timecode
            }" title="Go to marker">▶️</button>
            <button class="ytmusic-edit-marker" data-timecode="${
              marker.timecode
            }" title="Edit description">✏️</button>
            <button class="ytmusic-delete-marker" data-timecode="${
              marker.timecode
            }" title="Delete marker">🗑️</button>
          </div>
        </div>
      `
        )
        .join('');

      // Add event listeners for marker actions
      markerList.querySelectorAll('.ytmusic-goto-marker').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const timecode = parseInt(e.target.dataset.timecode);
          seekToTime(timecode);
        });
      });

      markerList.querySelectorAll('.ytmusic-edit-marker').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const timecode = parseInt(e.target.dataset.timecode);
          this.markerManager.editMarkerDescription(timecode);
        });
      });

      markerList.querySelectorAll('.ytmusic-delete-marker').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const timecode = parseInt(e.target.dataset.timecode);
          if (confirm(`Remove marker at ${formatTime(timecode)}?`)) {
            this.markerManager.removeMarker(timecode);
          }
        });
      });
    } catch (error) {
      console.error('Error updating marker list:', error);
    }
  }

  startTimeUpdates() {
    this.timeUpdateInterval = setInterval(() => {
      this.updateTimeDisplay();
    }, 1000);
  }

  ensureExists() {
    if (!this.panel || !document.body.contains(this.panel)) {
      console.log('Control panel missing, recreating...');
      this.create();
    }
  }

  destroy() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    if (this.panel) {
      this.panel.remove();
    }
    if (this.toggleButton) {
      this.toggleButton.remove();
    }
  }
}
