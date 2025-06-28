import React, { useEffect, useState, useCallback } from 'react';
import { useMarkers } from '../hooks/useMarkers';
import { useSpeedControl } from '../hooks/useSpeedControl';

const CustomPlayerBar = () => {
  const { addMarker } = useMarkers();
  const { speed, updateSpeed } = useSpeedControl();
  const [loading, setLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(speed);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update slider when speed changes
  useEffect(() => {
    setSliderValue(speed);
  }, [speed]);

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

  const handleAddMarker = async () => {
    setLoading(true);
    try {
      await addMarker();
    } catch (error) {
      console.error('Error adding marker:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  const injectCustomPlayerBar = useCallback(() => {
    // Find the native player bar to position our custom bar above it
    const playerBar =
      document.querySelector('ytmusic-player-bar') ||
      document.querySelector('.ytmusic-player-bar') ||
      document.querySelector('#player-bar-container');

    if (!playerBar) {
      console.log('Player bar not found, retrying...');
      return false;
    }

    // Check if our custom player bar is already injected
    const existing = document.querySelector('.ytmusic-custom-player-bar');
    if (existing) {
      console.log('Custom player bar already exists');
      return true;
    }

    // Get player bar height for positioning
    const playerBarHeight = playerBar.offsetHeight || 72;

    // Create our custom player bar container
    const customPlayerBar = document.createElement('div');
    customPlayerBar.className = 'ytmusic-custom-player-bar';
    const updatePlayerBarStyle = (collapsed) => {
      if (collapsed) {
        customPlayerBar.style.cssText = `
          position: fixed;
          left: 16px;
          bottom: ${playerBarHeight + 16}px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(3, 3, 3, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 12px;
          z-index: 9999;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border-top: 2px solid rgba(255, 23, 68, 0.4);
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform: translateY(0);
          pointer-events: auto;
          font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #ffffff;
        `;
      } else {
        customPlayerBar.style.cssText = `
          position: fixed;
          left: 16px;
          bottom: ${playerBarHeight + 16}px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(3, 3, 3, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px 20px;
          z-index: 9999;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          border-top: 2px solid rgba(255, 23, 68, 0.4);
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform: translateY(0);
          pointer-events: auto;
          font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #ffffff;
          min-width: 280px;
        `;
      }
    };

    // Initialize with collapsed state
    updatePlayerBarStyle(isCollapsed);

    // Create collapsed view (add marker button + expand button)
    const createCollapsedView = () => {
      const container = document.createElement('div');
      container.className = 'ytmusic-collapsed-content';
      container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      // Create add marker button
      const addMarkerButton = document.createElement('button');
      addMarkerButton.className = 'ytmusic-collapsed-marker-btn';
      addMarkerButton.title = 'Add Marker';
      addMarkerButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #ff1744, #d50000);
        border: 1px solid rgba(255, 23, 68, 0.8);
        border-radius: 10px;
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.4);
        font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      `;

      addMarkerButton.textContent = '+';

      // Create expand button
      const expandButton = document.createElement('button');
      expandButton.className = 'ytmusic-collapsed-expand-btn';
      expandButton.title = 'Expand Controls';
      expandButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      `;

      expandButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      `;

      // Add event listeners
      addMarkerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handleMarkerAdd(addMarkerButton, null, null);
      });

      expandButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setIsCollapsed(false);
        renderExpandedView();
      });

      // Add hover effects
      addMarkerButton.addEventListener('mouseenter', () => {
        if (!addMarkerButton.disabled) {
          addMarkerButton.style.transform = 'translateY(-2px)';
          addMarkerButton.style.boxShadow = '0 6px 20px rgba(255, 23, 68, 0.5)';
        }
      });

      addMarkerButton.addEventListener('mouseleave', () => {
        if (!addMarkerButton.disabled) {
          addMarkerButton.style.transform = 'translateY(0)';
          addMarkerButton.style.boxShadow = '0 4px 16px rgba(255, 23, 68, 0.4)';
        }
      });

      expandButton.addEventListener('mouseenter', () => {
        expandButton.style.background = 'rgba(255, 255, 255, 0.12)';
        expandButton.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        expandButton.style.transform = 'translateY(-2px)';
        expandButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
      });

      expandButton.addEventListener('mouseleave', () => {
        expandButton.style.background = 'rgba(255, 255, 255, 0.08)';
        expandButton.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        expandButton.style.transform = 'translateY(0)';
        expandButton.style.boxShadow = 'none';
      });

      container.appendChild(addMarkerButton);
      container.appendChild(expandButton);

      return container;
    };

    // Create expanded view (full controls)
    const createExpandedView = () => {
      const container = document.createElement('div');
      container.className = 'ytmusic-expanded-content';
      container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      `;

      // Create collapse button
      const collapseButton = document.createElement('button');
      collapseButton.className = 'ytmusic-collapse-btn';
      collapseButton.title = 'Collapse';
      collapseButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        backdrop-filter: blur(8px);
        font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      `;

      collapseButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18,15 12,9 6,15"></polyline>
        </svg>
      `;

      collapseButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setIsCollapsed(true);
        renderCollapsedView();
      });

      // Add hover effect for collapse button
      collapseButton.addEventListener('mouseenter', () => {
        collapseButton.style.background = 'rgba(255, 255, 255, 0.12)';
        collapseButton.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        collapseButton.style.transform = 'translateY(-1px)';
        collapseButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      });

      collapseButton.addEventListener('mouseleave', () => {
        collapseButton.style.background = 'rgba(255, 255, 255, 0.08)';
        collapseButton.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        collapseButton.style.transform = 'translateY(0)';
        collapseButton.style.boxShadow = 'none';
      });

      // Create speed control container
      const speedContainer = document.createElement('div');
      speedContainer.className = 'ytmusic-custom-speed';
      speedContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      `;

      const speedLabel = document.createElement('span');
      speedLabel.textContent = 'SPEED';
      speedLabel.style.cssText = `
        font-weight: 500;
        opacity: 0.7;
        min-width: 40px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      `;

      const speedSlider = document.createElement('input');
      speedSlider.type = 'range';
      speedSlider.min = '0.5';
      speedSlider.max = '2';
      speedSlider.step = '0.25';
      speedSlider.value = speed;
      speedSlider.className = 'ytmusic-custom-speed-slider';
      speedSlider.style.cssText = `
        width: 80px;
        height: 4px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 2px;
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
      `;

      const speedValue = document.createElement('span');
      speedValue.textContent = `${speed}x`;
      speedValue.style.cssText = `
        min-width: 28px;
        font-weight: 600;
        text-align: center;
        color: #ff1744;
        font-size: 11px;
        font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      `;

      speedContainer.appendChild(speedLabel);
      speedContainer.appendChild(speedSlider);
      speedContainer.appendChild(speedValue);

      // Create separator
      const separator = document.createElement('div');
      separator.style.cssText = `
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.12);
      `;

      // Create add marker button
      const markerButton = document.createElement('button');
      markerButton.className = 'ytmusic-custom-marker-btn';
      markerButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 14px;
        background: linear-gradient(135deg, #ff1744, #d50000);
        border: 1px solid rgba(255, 23, 68, 0.8);
        border-radius: 10px;
        color: #ffffff;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(255, 23, 68, 0.4);
        position: relative;
        overflow: hidden;
        font-family: 'YouTube Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        flex: 1;
        backdrop-filter: blur(8px);
      `;

      const markerIcon = document.createElement('span');
      markerIcon.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      `;

      const markerText = document.createElement('span');
      markerText.textContent = 'Add Marker';

      markerButton.appendChild(markerIcon);
      markerButton.appendChild(markerText);

      // Add event listeners
      speedSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const value = parseFloat(e.target.value);
        speedValue.textContent = `${value}x`;
      });

      speedSlider.addEventListener('mouseup', async (e) => {
        e.stopPropagation();
        const newSpeed = parseFloat(speedSlider.value);
        try {
          await updateSpeed(newSpeed);
        } catch (error) {
          console.error('Error setting speed:', error);
        }
      });

      speedSlider.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      markerButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (markerButton.disabled) return;

        handleMarkerAdd(markerButton, markerIcon, markerText);
      });

      // Add hover effects
      markerButton.addEventListener('mouseenter', () => {
        if (!markerButton.disabled) {
          markerButton.style.transform = 'translateY(-2px)';
          markerButton.style.boxShadow = '0 6px 20px rgba(255, 23, 68, 0.5)';
          markerButton.style.background =
            'linear-gradient(135deg, #ff1744, #d50000)';
          markerButton.style.borderColor = 'rgba(255, 23, 68, 0.9)';
        }
      });

      markerButton.addEventListener('mouseleave', () => {
        if (!markerButton.disabled) {
          markerButton.style.transform = 'translateY(0)';
          markerButton.style.boxShadow = '0 4px 16px rgba(255, 23, 68, 0.4)';
          markerButton.style.background =
            'linear-gradient(135deg, #ff1744, #d50000)';
          markerButton.style.borderColor = 'rgba(255, 23, 68, 0.8)';
        }
      });

      container.appendChild(collapseButton);
      container.appendChild(speedContainer);
      container.appendChild(separator);
      container.appendChild(markerButton);

      return container;
    }; // Handle marker addition (shared between collapsed and expanded views)
    const handleMarkerAdd = async (button, icon = null, text = null) => {
      button.disabled = true;
      const originalBackground = button.style.background;
      if (text) {
        // Expanded view with text
        button.style.background = 'rgba(255, 255, 255, 0.08)';
        button.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        text.textContent = 'Adding...';
        if (icon) {
          icon.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="3">
                <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          `;
        }
      } else {
        // Collapsed view with just "+" text
        button.style.background = 'rgba(255, 255, 255, 0.08)';
        button.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        button.textContent = '...';
      }

      try {
        await addMarker();

        // Success feedback
        if (text) {
          // Expanded view success
          button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          button.style.borderColor = 'rgba(16, 185, 129, 0.8)';
          text.textContent = 'Added!';
          if (icon) {
            icon.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m9 12 2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            `;
          }
        } else {
          // Collapsed view success
          button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          button.style.borderColor = 'rgba(16, 185, 129, 0.8)';
          button.textContent = '✓';
        }

        setTimeout(() => {
          button.style.background = originalBackground;
          button.style.borderColor = 'rgba(255, 23, 68, 0.8)';
          if (text) {
            text.textContent = 'Add Marker';
            if (icon) {
              icon.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              `;
            }
          } else {
            button.textContent = '+';
          }
          button.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('Error adding marker:', error);

        if (text) {
          // Expanded view error
          button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
          button.style.borderColor = 'rgba(239, 68, 68, 0.8)';
          text.textContent = 'Error';
          if (icon) {
            icon.innerHTML = `✕`;
          }
        } else {
          // Collapsed view error
          button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
          button.style.borderColor = 'rgba(239, 68, 68, 0.8)';
          button.textContent = '✕';
        }

        setTimeout(() => {
          button.style.background = originalBackground;
          button.style.borderColor = 'rgba(255, 23, 68, 0.8)';
          if (text) {
            text.textContent = 'Add Marker';
            if (icon) {
              icon.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              `;
            }
          } else {
            button.textContent = '+';
          }
          button.disabled = false;
        }, 2000);
      }
    };

    // Render functions
    const renderCollapsedView = () => {
      customPlayerBar.innerHTML = '';
      updatePlayerBarStyle(true);
      customPlayerBar.appendChild(createCollapsedView());
    };

    const renderExpandedView = () => {
      customPlayerBar.innerHTML = '';
      updatePlayerBarStyle(false);
      customPlayerBar.appendChild(createExpandedView());
    };

    // Add custom styles for the slider thumb
    if (!document.querySelector('#custom-slider-styles')) {
      const style = document.createElement('style');
      style.id = 'custom-slider-styles';
      style.textContent = `
        .ytmusic-custom-speed-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff1744, #d50000);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(255, 23, 68, 0.4);
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 23, 68, 0.8);
        }
        .ytmusic-custom-speed-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 23, 68, 0.6);
        }
        .ytmusic-custom-speed-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff1744, #d50000);
          cursor: pointer;
          border: 1px solid rgba(255, 23, 68, 0.8);
          box-shadow: 0 2px 6px rgba(255, 23, 68, 0.4);
        }
        .ytmusic-custom-speed-slider {
          background: rgba(255, 255, 255, 0.12) !important;
        }
        .ytmusic-custom-speed-slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 2px;
        }
        .ytmusic-custom-speed-slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 2px;
        }
      `;
      document.head.appendChild(style);
    }

    // Prevent the bar from being removed when clicked
    customPlayerBar.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Add hover effect
    customPlayerBar.addEventListener('mouseenter', () => {
      customPlayerBar.style.transform = 'translateY(-2px)';
      customPlayerBar.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.5)';
    });

    customPlayerBar.addEventListener('mouseleave', () => {
      customPlayerBar.style.transform = 'translateY(0)';
      customPlayerBar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
    });

    // Initial render based on state
    if (isCollapsed) {
      renderCollapsedView();
    } else {
      renderExpandedView();
    }

    // Inject into the page
    document.body.appendChild(customPlayerBar);

    console.log('Custom player bar injected successfully');
    return true;
  }, []); // Remove dependencies to prevent re-creation

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    let injectionInterval;

    const tryInject = () => {
      if (injectCustomPlayerBar()) {
        if (injectionInterval) {
          clearInterval(injectionInterval);
          injectionInterval = null;
        }
        return true;
      }

      retryCount++;
      if (retryCount >= maxRetries) {
        if (injectionInterval) {
          clearInterval(injectionInterval);
          injectionInterval = null;
        }
        return false;
      }
      return false;
    };

    // Initial injection with interval for stability
    const startInjection = () => {
      if (!injectionInterval) {
        injectionInterval = setInterval(() => {
          tryInject();
        }, 1000);
      }
    };

    // Start initial injection
    setTimeout(startInjection, 500);

    // Handle navigation with debouncing
    let navigationTimeout;
    const handleNavigation = () => {
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }

      navigationTimeout = setTimeout(() => {
        console.log('Navigation detected, checking custom player bar...');

        // Only re-inject if the bar doesn't exist
        const existing = document.querySelector('.ytmusic-custom-player-bar');
        if (!existing) {
          console.log('Custom player bar missing, re-injecting...');
          retryCount = 0;
          startInjection();
        }
      }, 2000);
    };

    window.addEventListener('yt-navigate-finish', handleNavigation);

    return () => {
      window.removeEventListener('yt-navigate-finish', handleNavigation);

      if (injectionInterval) {
        clearInterval(injectionInterval);
      }

      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }

      // Cleanup on unmount
      const existing = document.querySelector('.ytmusic-custom-player-bar');
      if (existing) {
        existing.remove();
      }
    };
  }, []); // Empty dependency array to prevent re-runs

  return null; // This component doesn't render anything directly
};

export default CustomPlayerBar;
