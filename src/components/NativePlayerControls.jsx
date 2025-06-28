import React, { useEffect, useState, useCallback } from 'react';
import { useMarkers } from '../hooks/useMarkers';
import { useSpeedControl } from '../hooks/useSpeedControl';
import { Plus, CheckCircle } from 'lucide-react';

const NativePlayerControls = () => {
  const { addMarker } = useMarkers();
  const { speed, updateSpeed } = useSpeedControl();
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sliderValue, setSliderValue] = useState(speed);

  // Update slider when speed changes
  useEffect(() => {
    setSliderValue(speed);
  }, [speed]);

  const handleAddMarker = async () => {
    setLoading(true);
    try {
      await addMarker();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Error adding marker:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSliderValue(newSpeed);
  };

  const handleSpeedMouseUp = async () => {
    try {
      await updateSpeed(sliderValue);
    } catch (error) {
      console.error('Error setting speed:', error);
    }
  };

  const injectControls = useCallback(() => {
    // First, hide video information to make space
    const videoInfo =
      document.querySelector('ytmusic-player-bar .content-info-wrapper') ||
      document.querySelector('.ytmusic-player-bar .title') ||
      document.querySelector('.content-info-wrapper') ||
      document.querySelector('yt-formatted-string.title');

    if (videoInfo) {
      videoInfo.style.display = 'none';
      console.log('Video info hidden to make space for controls');
    }

    // Find the native player controls container
    const playerBar =
      document.querySelector('ytmusic-player-bar') ||
      document.querySelector('.ytmusic-player-bar') ||
      document.querySelector('#player-bar-container');

    if (!playerBar) {
      console.log('Player bar not found, retrying...');
      return false;
    }

    // Find the center controls area (where play/pause buttons are) to place our controls there
    const centerControls =
      playerBar.querySelector('.middle-controls') ||
      playerBar.querySelector('.center-controls') ||
      playerBar.querySelector('[slot="middle-controls"]') ||
      playerBar.querySelector('.ytmusic-player-bar-middle') ||
      playerBar;

    if (!centerControls) {
      console.log('Center controls not found, retrying...');
      return false;
    }

    // Check if our controls are already injected
    if (document.querySelector('.ytmusic-native-controls')) {
      return true;
    }

    // Create container for our controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'ytmusic-native-controls';
    controlsContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 8px;
      height: 100%;
      font-size: 10px;
      flex-shrink: 0;
    `;

    // Create compact speed control
    const speedContainer = document.createElement('div');
    speedContainer.className = 'ytmusic-native-speed';
    speedContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 9px;
      color: var(--yt-spec-text-secondary);
      background: rgba(0,0,0,0.1);
      padding: 2px 4px;
      border-radius: 8px;
      backdrop-filter: blur(4px);
    `;

    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0.5';
    speedSlider.max = '2';
    speedSlider.step = '0.25';
    speedSlider.value = speed;
    speedSlider.className = 'ytmusic-native-speed-slider';
    speedSlider.style.cssText = `
      width: 40px;
      height: 2px;
      background: var(--yt-spec-outline);
      border-radius: 1px;
      outline: none;
      cursor: pointer;
      margin: 0 2px;
    `;

    const speedValue = document.createElement('span');
    speedValue.textContent = `${speed}x`;
    speedValue.style.cssText = `
      min-width: 20px;
      font-weight: 600;
      text-align: center;
      font-size: 8px;
    `;

    speedContainer.appendChild(speedSlider);
    speedContainer.appendChild(speedValue);

    // Create compact add marker button (icon only)
    const markerButton = document.createElement('button');
    markerButton.className = 'ytmusic-native-marker-btn';
    markerButton.title = 'Add Marker'; // Tooltip
    markerButton.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 20px;
      background: rgba(0,0,0,0.1);
      border: none;
      border-radius: 8px;
      color: var(--yt-spec-text-primary);
      font-size: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(4px);
    `;

    const markerIcon = document.createElement('span');
    markerIcon.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;

    markerButton.appendChild(markerIcon);

    // Add event listeners
    speedSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      speedValue.textContent = `${value}x`;
    });

    speedSlider.addEventListener('mouseup', async () => {
      const newSpeed = parseFloat(speedSlider.value);
      try {
        await updateSpeed(newSpeed);
      } catch (error) {
        console.error('Error setting speed:', error);
      }
    });

    markerButton.addEventListener('click', async () => {
      markerButton.disabled = true;
      markerText.textContent = 'Adding...';

      try {
        await addMarker();

        // Success feedback
        markerIcon.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 12 2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        `;
        markerText.textContent = 'Added!';
        markerButton.style.background = 'var(--yt-spec-brand-button-text)';
        markerButton.style.color = 'var(--yt-spec-general-background-a)';

        setTimeout(() => {
          markerIcon.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          `;
          markerText.textContent = 'Marker';
          markerButton.style.background =
            'var(--yt-spec-button-chip-background-hover)';
          markerButton.style.color = 'var(--yt-spec-text-primary)';
          markerButton.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('Error adding marker:', error);
        markerIcon.innerHTML = `✕`;
        setTimeout(() => {
          markerIcon.innerHTML = `
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          `;
          markerButton.disabled = false;
        }, 2000);
      }
    });

    // Add hover effects
    markerButton.addEventListener('mouseenter', () => {
      if (!markerButton.disabled) {
        markerButton.style.background = 'rgba(0,0,0,0.2)';
      }
    });

    markerButton.addEventListener('mouseleave', () => {
      if (!markerButton.disabled) {
        markerButton.style.background = 'rgba(0,0,0,0.1)';
      }
    });

    // Assemble the controls
    controlsContainer.appendChild(speedContainer);
    controlsContainer.appendChild(markerButton);

    // Inject into the center controls area (where video info was)
    centerControls.appendChild(controlsContainer);

    console.log('Native player controls injected successfully');
    return true;
  }, [addMarker, updateSpeed, speed]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const tryInject = () => {
      if (injectControls()) {
        return; // Success
      }

      retryCount++;
      if (retryCount < maxRetries) {
        setTimeout(tryInject, 1000);
      }
    };

    // Initial injection
    setTimeout(tryInject, 1000);

    // Re-inject on navigation
    const handleNavigation = () => {
      setTimeout(() => {
        // Remove existing controls first
        const existing = document.querySelector('.ytmusic-native-controls');
        if (existing) {
          existing.remove();
        }

        // Retry injection
        retryCount = 0;
        setTimeout(tryInject, 1000);
      }, 2000);
    };

    window.addEventListener('yt-navigate-finish', handleNavigation);

    return () => {
      window.removeEventListener('yt-navigate-finish', handleNavigation);

      // Cleanup on unmount
      const existing = document.querySelector('.ytmusic-native-controls');
      if (existing) {
        existing.remove();
      }
    };
  }, [injectControls]);

  return null; // This component doesn't render anything directly
};

export default NativePlayerControls;
