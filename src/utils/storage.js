// Storage utilities for Chrome extension
export class StorageManager {
  static async getVideoMarkers(videoId) {
    return new Promise((resolve) => {
      chrome.storage.local.get([videoId], (result) => {
        resolve(result[videoId] || []);
      });
    });
  }

  static async addMarker(videoId, marker) {
    try {
      const existingMarkers = await this.getVideoMarkers(videoId);

      // Check if marker already exists at this timecode
      const existingIndex = existingMarkers.findIndex(
        (m) => m.timecode === marker.timecode
      );

      if (existingIndex !== -1) {
        // Update existing marker
        existingMarkers[existingIndex] = {
          ...existingMarkers[existingIndex],
          ...marker,
        };
      } else {
        // Add new marker
        existingMarkers.push(marker);
        existingMarkers.sort((a, b) => a.timecode - b.timecode);
      }

      return new Promise((resolve) => {
        chrome.storage.local.set({ [videoId]: existingMarkers }, () => {
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Error adding marker:', error);
      return false;
    }
  }

  static async updateMarker(videoId, updatedMarker) {
    try {
      const existingMarkers = await this.getVideoMarkers(videoId);
      const markerIndex = existingMarkers.findIndex(
        (m) => m.timecode === updatedMarker.timecode
      );

      if (markerIndex !== -1) {
        existingMarkers[markerIndex] = updatedMarker;

        return new Promise((resolve) => {
          chrome.storage.local.set({ [videoId]: existingMarkers }, () => {
            resolve(true);
          });
        });
      }
      return false;
    } catch (error) {
      console.error('Error updating marker:', error);
      return false;
    }
  }

  static async removeMarker(videoId, timecode) {
    try {
      const existingMarkers = await this.getVideoMarkers(videoId);
      const filteredMarkers = existingMarkers.filter(
        (marker) => marker.timecode !== timecode
      );

      return new Promise((resolve) => {
        chrome.storage.local.set({ [videoId]: filteredMarkers }, () => {
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Error removing marker:', error);
      return false;
    }
  }

  static async clearVideoMarkers(videoId) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([videoId], () => {
        resolve(true);
      });
    });
  }

  static async getPlaybackSpeed() {
    return new Promise((resolve) => {
      chrome.storage.local.get({ playbackSpeed: 1.0 }, (result) => {
        resolve(result.playbackSpeed);
      });
    });
  }

  static async setPlaybackSpeed(speed) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ playbackSpeed: speed }, resolve);
    });
  }

  static async getPanelSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        {
          panelVisible: false,
          panelPosition: { left: 180, top: 60 },
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
