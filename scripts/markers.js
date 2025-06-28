// YouTube Music Extension - Marker Management
// ===========================================

class MarkerManager {
  constructor() {
    this.currentVideoId = null;
    this.progressBarContainer = null;
    this.displayTimeout = null;
    this.isDisplaying = false;
  }

  createTimecodeMarker(timecode, note, percentage) {
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
    titleLabel.textContent = note || timeStr;
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

    // Create hover tooltip
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

    // Add hover effects
    this.addMarkerHoverEffects(marker, titleLabel, tooltip);

    // Add click handlers
    this.addMarkerClickHandlers(marker, timecode, timeStr);

    return marker;
  }

  addMarkerHoverEffects(marker, titleLabel, tooltip) {
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
  }

  addMarkerClickHandlers(marker, timecode, timeStr) {
    // Click to seek to timecode
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      seekToTime(timecode);
    });

    // Double-click to remove marker
    marker.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm(`Remove marker at ${timeStr}?`)) {
        this.removeMarker(timecode);
      }
    });
  }

  async displayMarkersOnProgressBar() {
    if (this.isDisplaying) return;

    const videoId = getVideoId();
    if (!videoId) {
      console.log('No video ID found');
      return;
    }

    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
    }

    this.isDisplaying = true;
    this.progressBarContainer = findProgressBar();

    if (!this.progressBarContainer) {
      console.log('Progress bar not found, retrying...');
      this.isDisplaying = false;
      this.displayTimeout = setTimeout(
        () => this.displayMarkersOnProgressBar(),
        2000
      );
      return;
    }

    // Remove existing markers
    const existingMarkers = this.progressBarContainer.querySelectorAll(
      '.ytmusic-timecode-marker'
    );
    existingMarkers.forEach((marker) => marker.remove());

    const duration = getVideoDuration();
    if (!duration || duration === 0) {
      console.log('Video duration not available, retrying...');
      this.isDisplaying = false;
      this.displayTimeout = setTimeout(
        () => this.displayMarkersOnProgressBar(),
        2000
      );
      return;
    }

    console.log(
      `Displaying markers for video ${videoId}, duration: ${duration}s`
    );

    try {
      const videoMarkers = await StorageManager.getVideoMarkers(videoId);
      console.log(`Found ${videoMarkers.length} markers for this video`);

      videoMarkers.forEach((marker, index) => {
        const percentage = Math.min(
          Math.max((marker.timecode / duration) * 100, 0),
          100
        );
        const markerElement = this.createTimecodeMarker(
          marker.timecode,
          marker.note,
          percentage
        );

        setTimeout(() => {
          if (this.progressBarContainer) {
            this.progressBarContainer.appendChild(markerElement);
            markerElement.style.left = `${percentage}%`;
            console.log(
              `Added marker ${index + 1} at ${
                marker.timecode
              }s (${percentage.toFixed(2)}%)`
            );
          }
        }, index * 50);
      });

      this.currentVideoId = videoId;
    } catch (error) {
      console.error('Error displaying markers:', error);
    }

    this.isDisplaying = false;
  }

  async addMarkerAtCurrentTime() {
    const videoId = getVideoId();
    const currentTime = getCurrentTime();
    const title = getVideoTitle();

    if (!videoId || currentTime === 0) {
      alert('Please wait for the video to load');
      return;
    }

    const marker = {
      timecode: Math.floor(currentTime),
      note: '',
      timestamp: new Date().toISOString(),
      title: title,
    };

    try {
      const success = await StorageManager.addMarker(videoId, marker);
      if (success) {
        await this.displayMarkersOnProgressBar();
        if (window.uiPanel) {
          window.uiPanel.updateMarkerList();
        }
      }
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  }

  async removeMarker(timecode) {
    const videoId = getVideoId();
    if (!videoId) return;

    try {
      await StorageManager.removeMarker(videoId, timecode);
      await this.displayMarkersOnProgressBar();
      if (window.uiPanel) {
        window.uiPanel.updateMarkerList();
      }
    } catch (error) {
      console.error('Error removing marker:', error);
    }
  }

  async clearAllMarkers() {
    const videoId = getVideoId();
    if (!videoId) return;

    if (confirm('Clear all markers for this video? This cannot be undone.')) {
      try {
        await StorageManager.clearVideoMarkers(videoId);
        await this.displayMarkersOnProgressBar();
        if (window.uiPanel) {
          window.uiPanel.updateMarkerList();
        }
      } catch (error) {
        console.error('Error clearing markers:', error);
      }
    }
  }
}
