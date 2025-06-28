// YouTube Music Timecode Markers Extension

let currentVideoId = null;
let progressBarContainer = null;
let addMarkerBtn = null;
let isInitialized = false;

function getVideoId() {
  const url = window.location.href;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

function getCurrentTime() {
  const video = document.querySelector('video');
  return video ? video.currentTime : 0;
}

function getVideoDuration() {
  const video = document.querySelector('video');
  return video ? video.duration : 0;
}

function getVideoTitle() {
  const titleElement =
    document.querySelector('.content-info-wrapper .title') ||
    document.querySelector('.ytmusic-player-bar .title') ||
    document.querySelector('#layout .title');

  return titleElement ? titleElement.textContent.trim() : 'Unknown Track';
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function createTimecodeMarker(timecode, note, percentage) {
  const marker = document.createElement('div');
  marker.className = 'ytmusic-timecode-marker';

  // Ensure percentage is within valid bounds
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  marker.style.cssText = `
    position: absolute !important;
    left: ${clampedPercentage}% !important;
    top: -15% !important;
    width: 4px !important;
    height: 130% !important;
    background: linear-gradient(to bottom, #ff1744, #d50000) !important;
    border-radius: 2px !important;
    cursor: pointer !important;
    z-index: 1000 !important;
    transform: translateX(-50%) !important;
    box-shadow: 0 0 12px rgba(255, 23, 68, 0.8), 0 0 4px rgba(0, 0, 0, 0.3) !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    pointer-events: auto !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
  `;
  marker.dataset.timecode = timecode;
  marker.dataset.percentage = clampedPercentage;
  marker.dataset.markerId = `marker-${timecode}-${Date.now()}`;

  // Create title label (always visible above marker)
  const titleLabel = document.createElement('div');
  titleLabel.className = 'ytmusic-timecode-title';
  const timeStr = formatTime(timecode);
  titleLabel.textContent = note || timeStr; // Show note if available, otherwise show time
  titleLabel.style.cssText = `
    position: absolute !important;
    bottom: 140% !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: rgba(18, 18, 18, 0.95) !important;
    color: #ffffff !important;
    padding: 6px 12px !important;
    border-radius: 8px !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    white-space: nowrap !important;
    opacity: 1 !important;
    pointer-events: none !important;
    z-index: 1002 !important;
    border: 1px solid rgba(255, 23, 68, 0.3) !important;
    text-shadow: none !important;
    max-width: 160px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(10px) !important;
    font-family: 'YouTube Sans', Roboto, Arial, sans-serif !important;
  `;
  marker.appendChild(titleLabel);

  // Create hover tooltip (shows full info on hover)
  const tooltip = document.createElement('div');
  tooltip.className = 'ytmusic-timecode-tooltip';
  tooltip.style.cssText = `
    position: absolute !important;
    bottom: 170% !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background: rgba(18, 18, 18, 0.98) !important;
    color: #ffffff !important;
    padding: 8px 12px !important;
    border-radius: 6px !important;
    font-size: 10px !important;
    font-weight: 400 !important;
    white-space: nowrap !important;
    opacity: 0 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    pointer-events: none !important;
    z-index: 1003 !important;
    border: 1px solid rgba(255, 23, 68, 0.4) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(20px) !important;
    font-family: 'YouTube Sans', Roboto, Arial, sans-serif !important;
  `;

  // Show full details in hover tooltip
  if (note && note.trim()) {
    tooltip.textContent = `${timeStr} - ${note}`;
  } else {
    tooltip.textContent = `Click to go to ${timeStr}`;
  }
  marker.appendChild(tooltip);

  // Hover effects
  marker.addEventListener('mouseenter', () => {
    marker.style.width = '6px';
    marker.style.height = '150%';
    marker.style.top = '-25%';
    marker.style.background = 'linear-gradient(to bottom, #ff1744, #b71c1c)';
    marker.style.boxShadow =
      '0 0 20px rgba(255, 23, 68, 1), 0 0 8px rgba(0, 0, 0, 0.5)';
    marker.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    tooltip.style.opacity = '1';
    titleLabel.style.background = 'rgba(255, 23, 68, 0.95)';
    titleLabel.style.transform = 'translateX(-50%) scale(1.05)';
    titleLabel.style.borderColor = 'rgba(255, 23, 68, 0.6)';
  });

  marker.addEventListener('mouseleave', () => {
    marker.style.width = '4px';
    marker.style.height = '130%';
    marker.style.top = '-15%';
    marker.style.background = 'linear-gradient(to bottom, #ff1744, #d50000)';
    marker.style.boxShadow =
      '0 0 12px rgba(255, 23, 68, 0.8), 0 0 4px rgba(0, 0, 0, 0.3)';
    marker.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    tooltip.style.opacity = '0';
    titleLabel.style.background = 'rgba(18, 18, 18, 0.95)';
    titleLabel.style.transform = 'translateX(-50%) scale(1)';
    titleLabel.style.borderColor = 'rgba(255, 23, 68, 0.3)';
  });

  // Click to seek to timecode
  marker.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = timecode;
      console.log(`Seeking to ${timeStr}`);
    }
  });

  // Double-click to remove marker
  marker.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Remove marker at ${timeStr}?`)) {
      removeMarker(timecode);
    }
  });

  return marker;
}

function findProgressBar() {
  // YouTube Music progress bar selectors - more specific and stable
  const selectors = [
    '#sliderContainer', // Most stable selector for YouTube Music
    '#progressBar',
    '.ytmusic-player-bar #sliderContainer',
    '.ytmusic-player-bar .slider-container',
    '#slider-container',
    '.progress-bar',
    '[role="slider"]',
    '.slider-container', // Additional fallback
    '.progress-container',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.offsetWidth > 0) {
      // Make sure it's visible and has reasonable dimensions
      console.log(
        `Found progress bar with selector: ${selector}, width: ${element.offsetWidth}px`
      );

      // Verify this is actually the progress bar by checking for related elements
      const hasProgressElements =
        element.querySelector('[role="slider"]') ||
        element.querySelector('.progress') ||
        element.classList.contains('slider') ||
        element.id.includes('slider') ||
        element.id.includes('progress');

      if (hasProgressElements || element.offsetWidth > 200) {
        return element;
      }
    }
  }

  // Enhanced fallback: look for any element that looks like a progress container
  const sliders = document.querySelectorAll('[role="slider"]');
  for (const slider of sliders) {
    const parent = slider.parentElement;
    if (parent && parent.offsetWidth > 200) {
      console.log(
        'Found progress bar by role=slider parent, width:',
        parent.offsetWidth
      );
      return parent;
    }
    if (slider.offsetWidth > 200) {
      console.log(
        'Found progress bar by role=slider, width:',
        slider.offsetWidth
      );
      return slider;
    }
  }

  // Last resort: look for any wide horizontal element that might be a progress bar
  const potentialBars = document.querySelectorAll('div');
  for (const bar of potentialBars) {
    if (
      bar.offsetWidth > 300 &&
      bar.offsetHeight < 50 &&
      (bar.className.includes('progress') ||
        bar.className.includes('slider') ||
        bar.id.includes('progress') ||
        bar.id.includes('slider'))
    ) {
      console.log('Found progress bar by heuristic, width:', bar.offsetWidth);
      return bar;
    }
  }

  console.log('Progress bar not found');
  return null;
}

let displayTimeout;
let isDisplaying = false;

function displayMarkersOnProgressBar() {
  if (isDisplaying) return; // Prevent multiple simultaneous calls

  const videoId = getVideoId();
  if (!videoId) {
    console.log('No video ID found');
    return;
  }

  // Clear any pending display timeout
  if (displayTimeout) {
    clearTimeout(displayTimeout);
  }

  isDisplaying = true;
  progressBarContainer = findProgressBar();

  if (!progressBarContainer) {
    console.log('Progress bar not found, retrying...');
    isDisplaying = false;
    displayTimeout = setTimeout(displayMarkersOnProgressBar, 2000);
    return;
  }

  // Remove existing markers
  const existingMarkers = progressBarContainer.querySelectorAll(
    '.ytmusic-timecode-marker'
  );
  existingMarkers.forEach((marker) => marker.remove());

  const duration = getVideoDuration();
  if (!duration || duration === 0) {
    console.log('Video duration not available, retrying...');
    isDisplaying = false;
    displayTimeout = setTimeout(displayMarkersOnProgressBar, 2000);
    return;
  }

  console.log(
    `Displaying markers for video ${videoId}, duration: ${duration}s`
  );

  // Get stored markers for this video
  chrome.storage.local.get({ markers: {} }, (data) => {
    const videoMarkers = data.markers[videoId] || [];
    console.log(`Found ${videoMarkers.length} markers for this video`);

    videoMarkers.forEach((marker, index) => {
      // More precise percentage calculation
      const percentage = Math.min(
        Math.max((marker.timecode / duration) * 100, 0),
        100
      );
      const markerElement = createTimecodeMarker(
        marker.timecode,
        marker.note,
        percentage
      );

      // Add a small delay between markers to ensure they render properly
      setTimeout(() => {
        if (progressBarContainer) {
          // Position relative to the progress bar's actual width
          const progressBarWidth = progressBarContainer.offsetWidth;
          const pixelPosition = (percentage / 100) * progressBarWidth;

          progressBarContainer.appendChild(markerElement);

          // Double-check positioning after adding to DOM
          markerElement.style.left = `${percentage}%`;

          console.log(
            `Added marker ${index + 1} at ${
              marker.timecode
            }s (${percentage.toFixed(2)}%) - ${pixelPosition.toFixed(1)}px`
          );
        }
      }, index * 50);
    });

    currentVideoId = videoId;
    isDisplaying = false;
  });
}

function addMarkerAtCurrentTime() {
  const videoId = getVideoId();
  const currentTime = getCurrentTime();
  const title = getVideoTitle();

  if (!videoId || currentTime === 0) {
    alert('Please wait for the video to load');
    return;
  }

  // Create marker without prompting - no popup
  const marker = {
    timecode: Math.floor(currentTime),
    note: '', // Empty note - no description
    timestamp: new Date().toISOString(),
    title: title,
  };

  chrome.storage.local.get({ markers: {} }, (data) => {
    const markers = data.markers;
    if (!markers[videoId]) {
      markers[videoId] = [];
    }

    // Check if marker already exists at this time (within 2 seconds)
    const existingIndex = markers[videoId].findIndex(
      (m) => Math.abs(m.timecode - marker.timecode) <= 2
    );

    if (existingIndex >= 0) {
      if (confirm('A marker already exists near this time. Replace it?')) {
        markers[videoId][existingIndex] = marker;
      } else {
        return;
      }
    } else {
      markers[videoId].push(marker);
    }

    // Sort markers by timecode
    markers[videoId].sort((a, b) => a.timecode - b.timecode);

    chrome.storage.local.set({ markers }, () => {
      displayMarkersOnProgressBar();
      updateMarkerList(); // Update the marker list
    });
  });
}

function removeMarker(timecode) {
  const videoId = getVideoId();
  if (!videoId) return;

  chrome.storage.local.get({ markers: {} }, (data) => {
    const markers = data.markers;
    if (markers[videoId]) {
      markers[videoId] = markers[videoId].filter(
        (m) => m.timecode !== timecode
      );
      chrome.storage.local.set({ markers }, () => {
        displayMarkersOnProgressBar();
      });
    }
  });
}

function createAddMarkerButton() {
  // Remove existing button if it exists
  const existingBtn = document.querySelector('.ytmusic-add-marker-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  addMarkerBtn = document.createElement('button');
  addMarkerBtn.className = 'ytmusic-add-marker-btn';
  addMarkerBtn.innerHTML = '+';
  addMarkerBtn.title = 'Add quick marker without description (M)';
  addMarkerBtn.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    width: 60px !important;
    height: 60px !important;
    background: linear-gradient(135deg, #ff1744, #d50000) !important;
    border: 2px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 50% !important;
    color: white !important;
    font-size: 24px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    z-index: 99999 !important;
    box-shadow: 0 8px 32px rgba(255, 23, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    backdrop-filter: blur(20px) !important;
    font-family: 'YouTube Sans', Roboto, Arial, sans-serif !important;
  `;

  addMarkerBtn.addEventListener('click', addMarkerAtCurrentTime);

  // Add hover effects
  addMarkerBtn.addEventListener('mouseenter', () => {
    addMarkerBtn.style.transform = 'scale(1.1)';
    addMarkerBtn.style.background = 'linear-gradient(135deg, #ff1744, #b71c1c)';
    addMarkerBtn.style.boxShadow =
      '0 12px 40px rgba(255, 23, 68, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)';
    addMarkerBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });

  addMarkerBtn.addEventListener('mouseleave', () => {
    addMarkerBtn.style.transform = 'scale(1)';
    addMarkerBtn.style.background = 'linear-gradient(135deg, #ff1744, #d50000)';
    addMarkerBtn.style.boxShadow =
      '0 8px 32px rgba(255, 23, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)';
    addMarkerBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
  });

  document.body.appendChild(addMarkerBtn);
  console.log('Add marker button created and added to page');
}

function handleVideoChange() {
  const newVideoId = getVideoId();
  if (newVideoId && newVideoId !== currentVideoId) {
    console.log(`Video changed from ${currentVideoId} to ${newVideoId}`);
    currentVideoId = newVideoId;
    // Add longer delay for video changes to ensure everything is loaded
    setTimeout(displayMarkersOnProgressBar, 3000);
    // Ensure button is still there after video change
    setTimeout(ensureButtonExists, 1000);
  }
}

// Ensure panel exists
function ensurePanelExists() {
  const existingPanel = document.querySelector(
    '.ytmusic-unified-control-panel'
  );
  if (!existingPanel || !document.body.contains(existingPanel)) {
    console.log('Control panel missing, recreating...');
    createUnifiedControlPanel();
  }
}

// Update panel speed UI
function updatePanelSpeedUI(speed) {
  const panel = document.querySelector('.ytmusic-unified-control-panel');
  if (!panel) return;

  const speedBtns = panel.querySelectorAll('.ytmusic-speed-btn');
  const speedSlider = panel.querySelector('.ytmusic-speed-slider');
  const speedValue = panel.querySelector('.ytmusic-speed-value');

  if (speedSlider) speedSlider.value = speed;
  if (speedValue) speedValue.textContent = `${speed.toFixed(2)}x`;

  speedBtns.forEach((btn) => {
    btn.classList.toggle(
      'active',
      Math.abs(parseFloat(btn.dataset.speed) - speed) < 0.01
    );
  });
}

// Handle URL changes
function handleUrlChange() {
  console.log('URL changed, reinitializing...');
  setTimeout(() => {
    displayMarkersOnProgressBar();
    updateMarkerList();
    ensurePanelExists();
  }, 2000);
}

// Initialize extension
function initializeExtension() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('Initializing YouTube Music Timecode Markers extension');

  // Create unified control panel (replaces separate button and speed overlay)
  createUnifiedControlPanel();

  // Apply stored playback speed
  setTimeout(applyStoredPlaybackSpeed, 1000);

  // Ensure panel stays visible - check every 5 seconds
  setInterval(ensurePanelExists, 5000);

  // Initial display of markers with longer delay
  setTimeout(displayMarkersOnProgressBar, 4000);

  // Watch for URL changes
  let currentUrl = window.location.href;
  const checkUrlChange = () => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      handleUrlChange();
    }
  };
  setInterval(checkUrlChange, 2000);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        addMarkerAtCurrentTime();
        setTimeout(updateMarkerList, 100); // Update the marker list after adding
      }
    }

    // Speed control shortcuts (Ctrl + number keys)
    if (e.ctrlKey && !e.altKey && !e.shiftKey) {
      const speedMap = {
        1: 0.5,
        2: 0.75,
        3: 1,
        4: 1.25,
        5: 1.5,
        6: 2,
      };

      if (speedMap[e.key]) {
        e.preventDefault();
        setVideoPlaybackSpeed(speedMap[e.key]);
        updatePanelSpeedUI(speedMap[e.key]);
      }
    }

    // Navigation shortcuts
    if (e.ctrlKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPreviousMarker();
    }
    if (e.ctrlKey && e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextMarker();
    }

    // Toggle panel with Ctrl+Shift+P
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
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
  });

  // Video event listeners
  const video = document.querySelector('video');
  if (video) {
    video.addEventListener('loadedmetadata', () => {
      setTimeout(displayMarkersOnProgressBar, 1000);
      setTimeout(applyStoredPlaybackSpeed, 500);
      setTimeout(updateMarkerList, 1500); // Update marker list when video loads
    });
  }
}

// Apply stored speed when video loads
function applyStoredPlaybackSpeed() {
  chrome.storage.local.get({ playbackSpeed: 1 }, (data) => {
    const video = document.querySelector('video');
    if (video && data.playbackSpeed !== 1) {
      video.playbackRate = data.playbackSpeed;
      console.log(`Applied stored playback speed: ${data.playbackSpeed}x`);
    }
  });
}

// Create unified control panel with speed control, marker creation, and navigation
function createUnifiedControlPanel() {
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

  const panel = document.createElement('div');
  panel.className = 'ytmusic-unified-control-panel';
  panel.innerHTML = `
    <div class="ytmusic-panel-header">
      <span>🎛️ YouTube Music Controls</span>
      <button class="ytmusic-panel-toggle">−</button>
    </div>
    
    <div class="ytmusic-panel-content">
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
    </div>
    
    <div class="ytmusic-panel-collapsed-icon">🎛️</div>
  `;

  document.body.appendChild(panel);

  // Get elements
  const speedBtns = panel.querySelectorAll('.ytmusic-speed-btn');
  const speedSlider = panel.querySelector('.ytmusic-speed-slider');
  const speedValue = panel.querySelector('.ytmusic-speed-value');
  const toggleBtn = panel.querySelector('.ytmusic-panel-toggle');
  const collapsedIcon = panel.querySelector('.ytmusic-panel-collapsed-icon');
  const addMarkerBtn = panel.querySelector('.ytmusic-add-marker-btn-panel');
  const clearMarkersBtn = panel.querySelector('.ytmusic-clear-markers-btn');
  const refreshMarkersBtn = panel.querySelector('.ytmusic-refresh-markers-btn');
  const timeDisplay = panel.querySelector('.ytmusic-time-display');
  const markerList = panel.querySelector('.ytmusic-marker-list');
  const prevMarkerBtn = panel.querySelector('.ytmusic-prev-marker-btn');
  const nextMarkerBtn = panel.querySelector('.ytmusic-next-marker-btn');

  // Load and apply stored settings
  chrome.storage.local.get(
    {
      playbackSpeed: 1,
      panelCollapsed: false,
      panelPosition: { left: 20, bottom: 20 },
    },
    (data) => {
      const currentSpeed = data.playbackSpeed;
      speedSlider.value = currentSpeed;
      speedValue.textContent = `${currentSpeed.toFixed(2)}x`;

      // Update active speed button
      speedBtns.forEach((btn) => {
        btn.classList.toggle(
          'active',
          parseFloat(btn.dataset.speed) === currentSpeed
        );
      });

      // Apply collapsed state
      if (data.panelCollapsed) {
        panel.classList.add('collapsed');
        toggleBtn.textContent = '+';
      }

      // Apply saved position
      const position = data.panelPosition;
      panel.style.setProperty('left', `${position.left}px`, 'important');
      panel.style.setProperty('bottom', `${position.bottom}px`, 'important');
    }
  );

  // Speed control listeners
  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed);
      setVideoPlaybackSpeed(speed);

      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      speedSlider.value = speed;
      speedValue.textContent = `${speed.toFixed(2)}x`;
    });
  });

  speedSlider.addEventListener('input', () => {
    const speed = parseFloat(speedSlider.value);
    setVideoPlaybackSpeed(speed);
    speedValue.textContent = `${speed.toFixed(2)}x`;

    speedBtns.forEach((btn) => {
      btn.classList.toggle(
        'active',
        Math.abs(parseFloat(btn.dataset.speed) - speed) < 0.01
      );
    });
  });

  // Marker control listeners
  addMarkerBtn.addEventListener('click', addMarkerAtCurrentTime);
  clearMarkersBtn.addEventListener('click', clearAllMarkers);
  refreshMarkersBtn.addEventListener('click', () => {
    displayMarkersOnProgressBar();
    updateMarkerList();
  });

  // Navigation listeners
  prevMarkerBtn.addEventListener('click', goToPreviousMarker);
  nextMarkerBtn.addEventListener('click', goToNextMarker);

  // Toggle collapse/expand
  const togglePanel = () => {
    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');
    toggleBtn.textContent = isCollapsed ? '+' : '−';
    chrome.storage.local.set({ panelCollapsed: isCollapsed });
  };

  toggleBtn.addEventListener('click', togglePanel);
  collapsedIcon.addEventListener('click', togglePanel);

  // Make draggable
  makePanelDraggable(panel);

  // Update time display periodically
  setInterval(updateTimeDisplay, 1000);

  // Initial marker list update
  updateMarkerList();

  console.log('Unified control panel created');
  return panel;
}

// Make panel draggable
function makePanelDraggable(element) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  const header = element.querySelector('.ytmusic-panel-header');
  const collapsedIcon = element.querySelector('.ytmusic-panel-collapsed-icon');

  function startDrag(e) {
    if (
      e.target.closest('.ytmusic-panel-toggle') ||
      e.target.closest('.ytmusic-speed-btn') ||
      e.target.closest('.ytmusic-speed-slider') ||
      e.target.closest('button')
    ) {
      return;
    }

    isDragging = true;
    element.classList.add('dragging');

    startX = e.clientX || (e.touches && e.touches[0].clientX);
    startY = e.clientY || (e.touches && e.touches[0].clientY);

    const rect = element.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    element.style.setProperty('position', 'fixed', 'important');
    element.style.setProperty('top', `${startTop}px`, 'important');
    element.style.setProperty('left', `${startLeft}px`, 'important');
    element.style.removeProperty('bottom');

    e.preventDefault();
    e.stopPropagation();
  }

  function drag(e) {
    if (!isDragging) return;

    const currentX = e.clientX || (e.touches && e.touches[0].clientX);
    const currentY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!currentX || !currentY) return;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    let newLeft = startLeft + deltaX;
    let newTop = startTop + deltaY;

    const padding = 10;
    const rect = element.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - padding;
    const maxTop = window.innerHeight - rect.height - padding;

    newLeft = Math.max(padding, Math.min(newLeft, maxLeft));
    newTop = Math.max(padding, Math.min(newTop, maxTop));

    element.style.setProperty('left', `${newLeft}px`, 'important');
    element.style.setProperty('top', `${newTop}px`, 'important');

    e.preventDefault();
    e.stopPropagation();
  }

  function stopDrag() {
    if (!isDragging) return;

    isDragging = false;
    element.classList.remove('dragging');

    const rect = element.getBoundingClientRect();
    const finalLeft = rect.left;
    const finalBottom = window.innerHeight - rect.bottom;

    element.style.setProperty('bottom', `${finalBottom}px`, 'important');
    element.style.setProperty('left', `${finalLeft}px`, 'important');
    element.style.removeProperty('top');

    chrome.storage.local.set({
      panelPosition: { left: finalLeft, bottom: finalBottom },
    });
  }

  if (header) {
    header.addEventListener('mousedown', startDrag, { passive: false });
    header.addEventListener('touchstart', startDrag, { passive: false });
  }
  if (collapsedIcon) {
    collapsedIcon.addEventListener('mousedown', startDrag, { passive: false });
    collapsedIcon.addEventListener('touchstart', startDrag, { passive: false });
  }

  document.addEventListener('mousemove', drag, { passive: false });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', stopDrag);
}

// Update time display
function updateTimeDisplay() {
  const timeDisplay = document.querySelector('.ytmusic-time-display');
  if (timeDisplay) {
    const currentTime = getCurrentTime();
    timeDisplay.textContent = formatTime(currentTime);
  }
}

// Update marker list in the panel
function updateMarkerList() {
  const videoId = getVideoId();
  const markerList = document.querySelector('.ytmusic-marker-list');

  if (!markerList || !videoId) return;

  chrome.storage.local.get({ markers: {} }, (data) => {
    const videoMarkers = data.markers[videoId] || [];

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
          }">▶️</button>
          <button class="ytmusic-delete-marker" data-timecode="${
            marker.timecode
          }">🗑️</button>
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

    markerList.querySelectorAll('.ytmusic-delete-marker').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const timecode = parseInt(e.target.dataset.timecode);
        if (confirm(`Remove marker at ${formatTime(timecode)}?`)) {
          removeMarker(timecode);
          updateMarkerList();
        }
      });
    });
  });
}

// Clear all markers for current video
function clearAllMarkers() {
  const videoId = getVideoId();
  if (!videoId) return;

  if (confirm('Clear all markers for this video? This cannot be undone.')) {
    chrome.storage.local.get({ markers: {} }, (data) => {
      const markers = data.markers;
      delete markers[videoId];
      chrome.storage.local.set({ markers }, () => {
        displayMarkersOnProgressBar();
        updateMarkerList();
      });
    });
  }
}

// Navigate to previous marker
function goToPreviousMarker() {
  const videoId = getVideoId();
  const currentTime = getCurrentTime();

  if (!videoId) return;

  chrome.storage.local.get({ markers: {} }, (data) => {
    const videoMarkers = data.markers[videoId] || [];
    const sortedMarkers = videoMarkers.sort((a, b) => a.timecode - b.timecode);

    // Find the last marker before current time
    let targetMarker = null;
    for (let i = sortedMarkers.length - 1; i >= 0; i--) {
      if (sortedMarkers[i].timecode < currentTime - 1) {
        targetMarker = sortedMarkers[i];
        break;
      }
    }

    if (targetMarker) {
      seekToTime(targetMarker.timecode);
    } else if (sortedMarkers.length > 0) {
      // Go to last marker if no previous marker found
      seekToTime(sortedMarkers[sortedMarkers.length - 1].timecode);
    }
  });
}

// Navigate to next marker
function goToNextMarker() {
  const videoId = getVideoId();
  const currentTime = getCurrentTime();

  if (!videoId) return;

  chrome.storage.local.get({ markers: {} }, (data) => {
    const videoMarkers = data.markers[videoId] || [];
    const sortedMarkers = videoMarkers.sort((a, b) => a.timecode - b.timecode);

    // Find the first marker after current time
    const targetMarker = sortedMarkers.find(
      (marker) => marker.timecode > currentTime + 1
    );

    if (targetMarker) {
      seekToTime(targetMarker.timecode);
    } else if (sortedMarkers.length > 0) {
      // Go to first marker if no next marker found
      seekToTime(sortedMarkers[0].timecode);
    }
  });
}

// Seek to specific time
function seekToTime(seconds) {
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = seconds;
    console.log(`Seeking to ${formatTime(seconds)}`);
  }
}

// Initialize the extension
initializeExtension();
