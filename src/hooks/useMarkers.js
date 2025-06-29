import { useState, useEffect, useCallback } from 'react';
import { StorageManager } from '../utils/storage';
import { getVideoId, getCurrentTime, getVideoTitle } from '../utils/youtube';

export const useMarkers = () => {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for global marker updates from other hook instances
  useEffect(() => {
    const handleGlobalMarkerUpdate = (event) => {
      console.log('Global marker update received:', event.detail);
      setRefreshKey((prev) => prev + 1);
      setTimeout(() => {
        loadMarkers();
      }, 50);
    };

    window.addEventListener(
      'ytmusic-markers-updated',
      handleGlobalMarkerUpdate
    );

    return () => {
      window.removeEventListener(
        'ytmusic-markers-updated',
        handleGlobalMarkerUpdate
      );
    };
  }, []);

  // Function to broadcast marker updates to all hook instances
  const broadcastMarkerUpdate = useCallback((action, data) => {
    const event = new CustomEvent('ytmusic-markers-updated', {
      detail: { action, data, timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }, []);

  const loadMarkers = useCallback(async () => {
    const videoId = getVideoId();
    if (!videoId) {
      console.log('No video ID found, clearing markers');
      setMarkers([]);
      // Clean up any existing markers from DOM
      document
        .querySelectorAll(
          '.ytmusic-timecode-marker, .test-marker, .ytmusic-marker-overlay'
        )
        .forEach((m) => m.remove());
      return;
    }

    setLoading(true);
    try {
      console.log('Loading markers for video:', videoId);
      const videoMarkers = await StorageManager.getVideoMarkers(videoId);
      console.log('Loaded markers:', videoMarkers);
      setMarkers([...videoMarkers]); // Force new array reference

      // Redraw markers on the progress bar when loading
      setTimeout(() => {
        redrawMarkers(videoMarkers);
      }, 200);
    } catch (error) {
      console.error('Error loading markers:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshKey, redrawMarkers]); // Add redrawMarkers as dependency

  // Helper function to redraw all markers
  const redrawMarkers = useCallback((markersToRedraw) => {
    // First, clean up any test elements and reset progress bar modifications
    document.querySelectorAll('.test-marker').forEach((el) => el.remove());

    // Reset any progress bar positioning that might have been modified by tests
    const progressBars = document.querySelectorAll(
      '#progress-bar, .ytmusic-player-bar-progress-bar, [role="slider"]'
    );
    progressBars.forEach((bar) => {
      if (bar.style.position === 'relative') {
        bar.style.position = '';
      }
    });

    const progressBar =
      document.querySelector('#progress-bar') ||
      document.querySelector('.ytmusic-player-bar-progress-bar') ||
      document.querySelector('[role="slider"]');

    if (progressBar) {
      const video = document.querySelector('video');
      if (video && video.duration && markersToRedraw.length > 0) {
        // Clean up ALL existing markers
        document
          .querySelectorAll(
            '.ytmusic-timecode-marker, .test-marker, .ytmusic-marker-overlay'
          )
          .forEach((m) => m.remove());

        // Find or create a proper container without modifying the progress bar
        let markerContainer = document.querySelector('.ytmusic-marker-overlay');

        if (!markerContainer) {
          markerContainer = document.createElement('div');
          markerContainer.className = 'ytmusic-marker-overlay';
          markerContainer.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            width: 100%;
            height: 40px;
            pointer-events: none;
            z-index: 1000;
          `;

          // Find the best parent container (usually the progress bar's parent)
          const progressBarParent = progressBar.parentElement;
          if (progressBarParent) {
            // Ensure parent has relative positioning without affecting the progress bar
            const parentStyle = window.getComputedStyle(progressBarParent);
            if (parentStyle.position === 'static') {
              progressBarParent.style.position = 'relative';
            }
            progressBarParent.appendChild(markerContainer);
          } else {
            // Fallback: use the progress bar itself but don't modify its positioning
            progressBar.appendChild(markerContainer);
          }
        }

        // Add all markers to the overlay container
        markersToRedraw.forEach((m) => {
          const markerElement = document.createElement('div');
          markerElement.className = 'ytmusic-timecode-marker';

          const percentage = (m.timecode / video.duration) * 100;
          markerElement.style.cssText = `
            position: absolute;
            left: ${percentage}%;
            top: 20px;
            width: 6px;
            height: 20px;
            background: linear-gradient(180deg, #ff4757 0%, #ff3742 50%, #ff1e2d 100%);
            border-radius: 3px 3px 0 0;
            z-index: 1001;
            cursor: pointer;
            transform: translateX(-50%);
            box-shadow: 0 3px 12px rgba(255, 71, 87, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2);
            pointer-events: auto;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255, 255, 255, 0.3);
          `;

          // Create description tooltip
          const description = document.createElement('div');
          description.className = 'ytmusic-marker-description';
          description.textContent =
            m.note ||
            `${Math.floor(m.timecode / 60)}:${String(m.timecode % 60).padStart(
              2,
              '0'
            )}`;
          
          // Check if marker has a description to determine initial visibility
          const hasDescription = m.note && m.note.trim() !== '';
          
          description.style.cssText = `
            position: absolute;
            bottom: 25px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: ${hasDescription ? '1' : '0'};
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1002;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          `;

          markerElement.appendChild(description);

          // Add hover effect
          markerElement.addEventListener('mouseenter', () => {
            markerElement.style.width = '8px';
            markerElement.style.height = '24px';
            markerElement.style.top = '16px';
            markerElement.style.boxShadow =
              '0 5px 20px rgba(255, 71, 87, 0.7), 0 0 0 2px rgba(255, 255, 255, 0.4)';
            markerElement.style.background =
              'linear-gradient(180deg, #ff6b6b 0%, #ff4757 50%, #ff3742 100%)';
            description.style.opacity = '1';
          });

          markerElement.addEventListener('mouseleave', () => {
            markerElement.style.width = '6px';
            markerElement.style.height = '20px';
            markerElement.style.top = '20px';
            markerElement.style.boxShadow =
              '0 3px 12px rgba(255, 71, 87, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)';
            markerElement.style.background =
              'linear-gradient(180deg, #ff4757 0%, #ff3742 50%, #ff1e2d 100%)';
            // Only hide description on mouse leave if marker doesn't have a description
            description.style.opacity = hasDescription ? '1' : '0';
          });

          // Add click handler
          markerElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            video.currentTime = m.timecode;
            console.log(`Jumped to marker at ${m.timecode}s`);
          });

          markerContainer.appendChild(markerElement);
        });

        console.log(
          'Redrew',
          markersToRedraw.length,
          'markers in overlay container'
        );
      }
    }
  }, []);

  const addMarker = useCallback(
    async (description = '') => {
      const videoId = getVideoId();
      const currentTime = getCurrentTime();
      const title = getVideoTitle();

      if (!videoId || currentTime === 0) {
        throw new Error('Please wait for the video to load');
      }

      const marker = {
        timecode: Math.floor(currentTime),
        note: description,
        timestamp: new Date().toISOString(),
        title: title,
      };

      try {
        console.log('Adding marker:', marker);

        // Update storage first
        await StorageManager.addMarker(videoId, marker);
        console.log('Marker added successfully to storage');

        // Then update the UI state immediately
        setMarkers((prevMarkers) => {
          const newMarkers = [...prevMarkers];
          const existingIndex = newMarkers.findIndex(
            (m) => m.timecode === marker.timecode
          );

          if (existingIndex !== -1) {
            newMarkers[existingIndex] = marker;
          } else {
            newMarkers.push(marker);
            newMarkers.sort((a, b) => a.timecode - b.timecode);
          }

          console.log('Updated markers state:', newMarkers);
          console.log(
            'Previous markers length:',
            prevMarkers.length,
            'New markers length:',
            newMarkers.length
          );

          // IMMEDIATE DOM UPDATE: Create marker directly on progress bar
          setTimeout(() => {
            console.log('Direct DOM update: Creating marker immediately');
            redrawMarkers(newMarkers);
          }, 100); // Small delay to ensure state update is complete

          return newMarkers;
        });

        // Force refresh to ensure all components see the new marker
        setRefreshKey((prev) => prev + 1);

        // Broadcast the update to all other hook instances
        broadcastMarkerUpdate('add', marker);

        return marker;
      } catch (error) {
        console.error('Error adding marker:', error);
        // Reload markers from storage in case of error
        await loadMarkers();
        throw error;
      }
    },
    [loadMarkers, redrawMarkers, broadcastMarkerUpdate]
  );

  const updateMarker = useCallback(
    async (timecode, updatedData) => {
      const videoId = getVideoId();
      if (!videoId) return;

      try {
        const existingMarkers = await StorageManager.getVideoMarkers(videoId);
        const marker = existingMarkers.find((m) => m.timecode === timecode);

        if (marker) {
          const updatedMarker = { ...marker, ...updatedData };
          await StorageManager.updateMarker(videoId, updatedMarker);
          setRefreshKey((prev) => prev + 1); // Force refresh
          broadcastMarkerUpdate('update', updatedMarker);
          await loadMarkers();
        }
      } catch (error) {
        console.error('Error updating marker:', error);
        throw error;
      }
    },
    [loadMarkers, broadcastMarkerUpdate]
  );

  const removeMarker = useCallback(
    async (timecode) => {
      const videoId = getVideoId();
      if (!videoId) return;

      try {
        await StorageManager.removeMarker(videoId, timecode);
        setRefreshKey((prev) => prev + 1); // Force refresh
        broadcastMarkerUpdate('remove', { timecode });
        await loadMarkers();
      } catch (error) {
        console.error('Error removing marker:', error);
        throw error;
      }
    },
    [loadMarkers, broadcastMarkerUpdate]
  );

  const clearAllMarkers = useCallback(async () => {
    const videoId = getVideoId();
    if (!videoId) return;

    try {
      await StorageManager.clearVideoMarkers(videoId);
      setRefreshKey((prev) => prev + 1); // Force refresh
      broadcastMarkerUpdate('clear', {});
      await loadMarkers();
    } catch (error) {
      console.error('Error clearing markers:', error);
      throw error;
    }
  }, [loadMarkers, broadcastMarkerUpdate]);

  const getNextMarker = useCallback(
    (currentTime) => {
      const sortedMarkers = [...markers].sort(
        (a, b) => a.timecode - b.timecode
      );
      return sortedMarkers.find((marker) => marker.timecode > currentTime);
    },
    [markers]
  );

  const getPreviousMarker = useCallback(
    (currentTime) => {
      const sortedMarkers = [...markers].sort(
        (a, b) => b.timecode - a.timecode
      );
      return sortedMarkers.find((marker) => marker.timecode < currentTime);
    },
    [markers]
  );

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  // Watch for markers changes and redraw them
  useEffect(() => {
    if (markers.length > 0) {
      console.log('Markers changed, redrawing:', markers.length);
      setTimeout(() => {
        redrawMarkers(markers);
      }, 100);
    }
  }, [markers, redrawMarkers]);

  // Listen for URL changes to reload markers
  useEffect(() => {
    const handleUrlChange = () => {
      console.log('URL changed, reloading markers...');
      setRefreshKey((prev) => prev + 1);
      setTimeout(() => {
        loadMarkers();
        // Also redraw existing markers after navigation
        setTimeout(() => {
          if (markers.length > 0) {
            console.log('Redrawing markers after navigation');
            redrawMarkers(markers);
          }
        }, 500);
      }, 1000); // Delay to ensure video has loaded
    };

    // Listen for navigation events
    window.addEventListener('yt-navigate-finish', handleUrlChange);

    return () => {
      window.removeEventListener('yt-navigate-finish', handleUrlChange);
    };
  }, [loadMarkers, markers, redrawMarkers]);

  // Expose global refresh function for debugging
  useEffect(() => {
    window.ytMusicExtensionDebug = {
      refreshMarkers: () => {
        console.log('Manual marker refresh triggered');
        setRefreshKey((prev) => prev + 1);
        loadMarkers();
      },
      getMarkers: () => markers,
      getVideoId: getVideoId,
    };
  }, [markers, loadMarkers]);

  return {
    markers,
    loading,
    addMarker,
    updateMarker,
    removeMarker,
    clearAllMarkers,
    loadMarkers,
    getNextMarker,
    getPreviousMarker,
  };
};
