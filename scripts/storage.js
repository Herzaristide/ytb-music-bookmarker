// YouTube Music Extension - Storage Management
// ============================================

class StorageManager {
  static async getMarkers() {
    return new Promise((resolve) => {
      chrome.storage.local.get({ markers: {} }, (data) => {
        resolve(data.markers);
      });
    });
  }

  static async getVideoMarkers(videoId) {
    const markers = await this.getMarkers();
    return markers[videoId] || [];
  }

  static async saveMarkers(markers) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ markers }, resolve);
    });
  }

  static async addMarker(videoId, marker) {
    const allMarkers = await this.getMarkers();
    if (!allMarkers[videoId]) {
      allMarkers[videoId] = [];
    }

    // Check if marker already exists at this time (within 2 seconds)
    const existingIndex = allMarkers[videoId].findIndex(
      (m) => Math.abs(m.timecode - marker.timecode) <= 2
    );

    if (existingIndex >= 0) {
      if (confirm('A marker already exists near this time. Replace it?')) {
        allMarkers[videoId][existingIndex] = marker;
      } else {
        return false;
      }
    } else {
      allMarkers[videoId].push(marker);
    }

    // Sort markers by timecode
    allMarkers[videoId].sort((a, b) => a.timecode - b.timecode);

    await this.saveMarkers(allMarkers);
    return true;
  }

  static async removeMarker(videoId, timecode) {
    const allMarkers = await this.getMarkers();
    if (allMarkers[videoId]) {
      allMarkers[videoId] = allMarkers[videoId].filter(
        (m) => m.timecode !== timecode
      );
      await this.saveMarkers(allMarkers);
      return true;
    }
    return false;
  }

  static async clearVideoMarkers(videoId) {
    const allMarkers = await this.getMarkers();
    delete allMarkers[videoId];
    await this.saveMarkers(allMarkers);
  }

  static async getPlaybackSpeed() {
    return new Promise((resolve) => {
      chrome.storage.local.get({ playbackSpeed: 1 }, (data) => {
        resolve(data.playbackSpeed);
      });
    });
  }

  static async savePlaybackSpeed(speed) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ playbackSpeed: speed }, resolve);
    });
  }

  static async getPanelSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        {
          panelCollapsed: false,
          panelPosition: { left: 20, bottom: 20 },
        },
        resolve
      );
    });
  }

  static async savePanelSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set(settings, resolve);
    });
  }
}
