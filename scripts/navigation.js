// YouTube Music Extension - Navigation
// ====================================

class NavigationManager {
  constructor(markerManager) {
    this.markerManager = markerManager;
  }

  async goToPreviousMarker() {
    const videoId = getVideoId();
    const currentTime = getCurrentTime();

    if (!videoId) return;

    try {
      const videoMarkers = await StorageManager.getVideoMarkers(videoId);
      const sortedMarkers = videoMarkers.sort(
        (a, b) => a.timecode - b.timecode
      );

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
    } catch (error) {
      console.error('Error navigating to previous marker:', error);
    }
  }

  async goToNextMarker() {
    const videoId = getVideoId();
    const currentTime = getCurrentTime();

    if (!videoId) return;

    try {
      const videoMarkers = await StorageManager.getVideoMarkers(videoId);
      const sortedMarkers = videoMarkers.sort(
        (a, b) => a.timecode - b.timecode
      );

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
    } catch (error) {
      console.error('Error navigating to next marker:', error);
    }
  }

  handleKeyboardNavigation(key) {
    switch (key) {
      case 'ArrowLeft':
        this.goToPreviousMarker();
        return true;
      case 'ArrowRight':
        this.goToNextMarker();
        return true;
      default:
        return false;
    }
  }
}
