// YouTube Music Extension - Speed Controls
// ========================================

class SpeedController {
  constructor() {
    this.currentSpeed = 1;
  }

  async initialize() {
    try {
      this.currentSpeed = await StorageManager.getPlaybackSpeed();
      this.applyStoredPlaybackSpeed();
    } catch (error) {
      console.error('Error initializing speed controller:', error);
    }
  }

  async applyStoredPlaybackSpeed() {
    try {
      const storedSpeed = await StorageManager.getPlaybackSpeed();
      const video = document.querySelector('video');

      if (video && storedSpeed !== 1) {
        video.playbackRate = storedSpeed;
        this.currentSpeed = storedSpeed;
        console.log(`Applied stored playback speed: ${storedSpeed}x`);
      }
    } catch (error) {
      console.error('Error applying stored speed:', error);
    }
  }

  async setVideoPlaybackSpeed(speed) {
    const video = document.querySelector('video');
    if (video) {
      video.playbackRate = speed;
      this.currentSpeed = speed;
      console.log(`YouTube Music playback speed set to ${speed}x`);

      try {
        await StorageManager.savePlaybackSpeed(speed);
        this.showSpeedNotification(speed);

        // Update UI if panel exists
        if (window.uiPanel) {
          window.uiPanel.updateSpeedUI(speed);
        }
      } catch (error) {
        console.error('Error saving speed:', error);
      }
    }
  }

  showSpeedNotification(speed) {
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

  // Keyboard shortcuts mapping
  getSpeedMap() {
    return {
      1: 0.5,
      2: 0.75,
      3: 1,
      4: 1.25,
      5: 1.5,
      6: 2,
    };
  }

  handleKeyboardShortcut(key) {
    const speedMap = this.getSpeedMap();
    if (speedMap[key]) {
      this.setVideoPlaybackSpeed(speedMap[key]);
      return true;
    }
    return false;
  }
}
