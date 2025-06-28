import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useMarkers } from '../hooks/useMarkers';
import {
  getProgressBar,
  formatTime,
  waitForVideoMetadata,
  waitForProgressBar,
} from '../utils/youtube';

const ProgressBarMarkers = () => {
  // DISABLED: Direct DOM manipulation is now handled in useMarkers hook
  // This component is temporarily disabled to prevent conflicts

  useEffect(() => {
    console.log(
      'ProgressBarMarkers: Component disabled - using direct DOM manipulation instead'
    );

    // Clean up any test markers or conflicting elements
    const cleanup = () => {
      document.querySelectorAll('.test-marker').forEach((el) => el.remove());
    };

    cleanup();

    // Also clean up on navigation
    const handleNavigation = () => {
      setTimeout(cleanup, 100);
    };

    window.addEventListener('yt-navigate-finish', handleNavigation);

    return () => {
      window.removeEventListener('yt-navigate-finish', handleNavigation);
    };
  }, []);

  return null; // Component disabled
};

export default ProgressBarMarkers;
