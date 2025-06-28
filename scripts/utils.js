// YouTube Music Extension - Utility Functions
// =============================================

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

function seekToTime(seconds) {
  const video = document.querySelector('video');
  if (video) {
    video.currentTime = seconds;
    console.log(`Seeking to ${formatTime(seconds)}`);
  }
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
