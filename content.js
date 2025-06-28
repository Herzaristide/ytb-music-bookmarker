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
    top: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
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
    addMarkerBtn.style.transform = 'translateX(-50%) scale(1.1)';
    addMarkerBtn.style.background = 'linear-gradient(135deg, #ff1744, #b71c1c)';
    addMarkerBtn.style.boxShadow =
      '0 12px 40px rgba(255, 23, 68, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)';
    addMarkerBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });

  addMarkerBtn.addEventListener('mouseleave', () => {
    addMarkerBtn.style.transform = 'translateX(-50%) scale(1)';
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

let urlChangeTimeout;
function handleUrlChange() {
  // Debounce URL changes to prevent excessive calls
  if (urlChangeTimeout) {
    clearTimeout(urlChangeTimeout);
  }

  urlChangeTimeout = setTimeout(() => {
    const newVideoId = getVideoId();
    if (newVideoId && newVideoId !== currentVideoId) {
      handleVideoChange();
    }
  }, 1000);
}

function ensureButtonExists() {
  const existingBtn = document.querySelector('.ytmusic-add-marker-btn');
  if (!existingBtn || !document.body.contains(existingBtn)) {
    console.log('Button missing, recreating...');
    createAddMarkerButton();
  }
}

function initializeExtension() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('Initializing YouTube Music Timecode Markers extension');

  // Create add marker button
  createAddMarkerButton();

  // Apply stored playback speed
  setTimeout(applyStoredPlaybackSpeed, 1000);

  // Ensure button stays visible - check every 5 seconds
  setInterval(ensureButtonExists, 5000);

  // Initial display of markers with longer delay
  setTimeout(displayMarkersOnProgressBar, 4000);

  // Watch for URL changes (more efficient than watching DOM changes)
  let currentUrl = window.location.href;
  const checkUrlChange = () => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      handleUrlChange();
    }
  };

  // Check URL changes every 2 seconds instead of using MutationObserver
  setInterval(checkUrlChange, 2000);

  // Keyboard shortcut: M key to add marker
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      // Only if not typing in an input field
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        addMarkerAtCurrentTime();
      }
    }
  });

  // Listen for video events to refresh markers when needed
  const video = document.querySelector('video');
  if (video) {
    video.addEventListener('loadedmetadata', () => {
      console.log('Video metadata loaded, refreshing markers');
      setTimeout(displayMarkersOnProgressBar, 1000);
      setTimeout(applyStoredPlaybackSpeed, 500);
    });

    video.addEventListener('durationchange', () => {
      console.log('Video duration changed, refreshing markers');
      setTimeout(displayMarkersOnProgressBar, 1000);
    });

    video.addEventListener('loadstart', () => {
      console.log('Video load started, applying stored speed');
      setTimeout(applyStoredPlaybackSpeed, 200);
    });
  }

  // Fallback: check for video element periodically
  const checkForVideo = () => {
    const video = document.querySelector('video');
    if (video && !video.hasAttribute('data-markers-initialized')) {
      video.setAttribute('data-markers-initialized', 'true');
      video.addEventListener('loadedmetadata', () => {
        setTimeout(displayMarkersOnProgressBar, 1000);
        setTimeout(applyStoredPlaybackSpeed, 500);
      });
      video.addEventListener('loadstart', () => {
        setTimeout(applyStoredPlaybackSpeed, 200);
      });
    }
  };

  setInterval(checkForVideo, 5000);
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoInfo') {
    const videoInfo = {
      videoId: getVideoId(),
      title: getVideoTitle(),
      currentTime: getCurrentTime(),
      duration: getVideoDuration(),
      url: window.location.href,
    };
    sendResponse(videoInfo);
  } else if (request.action === 'refreshTimecodes') {
    displayMarkersOnProgressBar();
    sendResponse({ success: true });
  } else if (request.action === 'setPlaybackSpeed') {
    setVideoPlaybackSpeed(request.speed);
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

// Playback speed functionality
function setVideoPlaybackSpeed(speed) {
  const video = document.querySelector('video');
  if (video) {
    video.playbackRate = speed;
    console.log(`YouTube Music playback speed set to ${speed}x`);

    // Store the speed preference
    chrome.storage.local.set({ playbackSpeed: speed });

    // Show a temporary notification
    showSpeedNotification(speed);
  }
}

function showSpeedNotification(speed) {
  // Remove existing notification if any
  const existingNotification = document.querySelector(
    '.ytmusic-speed-notification'
  );
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'ytmusic-speed-notification';
  notification.textContent = `Speed: ${speed}x`;
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: rgba(0, 0, 0, 0.9) !important;
    color: #ffffff !important;
    padding: 12px 20px !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    z-index: 10000 !important;
    border: 1px solid rgba(255, 23, 68, 0.3) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
    backdrop-filter: blur(10px) !important;
    opacity: 0 !important;
    transform: translateY(-10px) !important;
    transition: all 0.3s ease !important;
    pointer-events: none !important;
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 2000);
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

// Keyboard shortcuts for speed control
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
    // Only if not typing in an input field
    if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      addMarkerAtCurrentTime();
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
    }
  }
});

// Initialize when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Also initialize after a delay to handle YouTube Music's dynamic loading
setTimeout(initializeExtension, 3000);
