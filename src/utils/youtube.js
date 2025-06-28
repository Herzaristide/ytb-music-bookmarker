// YouTube Music API utilities
export const getVideoId = () => {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
};

export const getVideoTitle = () => {
  const titleElement =
    document.querySelector('yt-formatted-string.title') ||
    document.querySelector('.content-info-wrapper .title') ||
    document.querySelector('h1.ytmusic-player-bar-text-title');
  return titleElement ? titleElement.textContent.trim() : 'Unknown Title';
};

export const getCurrentTime = () => {
  const video = document.querySelector('video');
  return video ? video.currentTime : 0;
};

export const getDuration = () => {
  const video = document.querySelector('video');
  return video ? video.duration : 0;
};

export const seekToTime = (time) => {
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = time;
  }
};

export const setPlaybackSpeed = (speed) => {
  const video = document.querySelector('video');
  if (video) {
    video.playbackRate = speed;
  }
};

export const getProgressBar = () => {
  // Try multiple selectors for different YouTube Music layouts
  const selectors = [
    '#progress-bar',
    '.ytmusic-player-bar-progress-bar',
    '[role="slider"]',
    '.ytmusic-player-bar .slider-container',
    '.ytmusic-player-bar .progress-bar-background',
    '.progress-bar-played',
    '.ytmusic-player-bar-progress-bar-container',
    // More specific selectors
    'ytmusic-player-bar #progress-bar',
    'ytmusic-player-bar .progress-bar-background',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Verify it's actually a progress bar by checking for common attributes
      if (
        element.getAttribute('role') === 'slider' ||
        element.id === 'progress-bar' ||
        element.classList.contains('progress-bar') ||
        element.querySelector('.progress-bar-played')
      ) {
        return element;
      }
    }
  }

  return null;
};

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const parseTimeToSeconds = (timeString) => {
  const parts = timeString.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
};

// Wait for video element to be available
export const waitForVideo = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkVideo = () => {
      const video = document.querySelector('video');
      if (video) {
        resolve(video);
        return;
      }

      // Check if we've exceeded the timeout
      if (Date.now() - startTime > timeout) {
        reject(new Error('Video element not found within timeout'));
        return;
      }

      setTimeout(checkVideo, 100);
    };

    checkVideo();
  });
};

// Wait for progress bar to be available
export const waitForProgressBar = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkProgressBar = () => {
      const progressBar = getProgressBar();
      if (progressBar) {
        resolve(progressBar);
        return;
      }

      // Check if we've exceeded the timeout
      if (Date.now() - startTime > timeout) {
        reject(new Error('Progress bar not found within timeout'));
        return;
      }

      setTimeout(checkProgressBar, 100);
    };

    checkProgressBar();
  });
};

// Wait for video metadata to be loaded
export const waitForVideoMetadata = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkMetadata = async () => {
      try {
        const video = await waitForVideo(1000);

        if (video.duration && video.duration > 0 && !isNaN(video.duration)) {
          resolve(video);
          return;
        }

        // Check if we've exceeded the timeout
        if (Date.now() - startTime > timeout) {
          reject(new Error('Video metadata not loaded within timeout'));
          return;
        }

        setTimeout(checkMetadata, 200);
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(checkMetadata, 200);
        }
      }
    };

    checkMetadata();
  });
};
