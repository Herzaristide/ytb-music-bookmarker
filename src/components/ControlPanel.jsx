import React, { useState, useEffect } from 'react';
import { StorageManager } from '../utils/storage';
import ToggleButton from './ToggleButton';
import MarkerControls from './MarkerControls';
import MarkerList from './MarkerList';
import ProgressBarMarkers from './ProgressBarMarkers';
import CustomPlayerBar from './CustomPlayerBar';

const ControlPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [markersKey, setMarkersKey] = useState(0); // Force re-render of markers

  useEffect(() => {
    // Load panel visibility state
    const loadPanelState = async () => {
      try {
        const settings = await StorageManager.getPanelSettings();
        setIsVisible(settings.panelVisible || false);
      } catch (error) {
        console.error('Error loading panel state:', error);
      }
    };

    loadPanelState();
  }, []);

  const togglePanel = async () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);

    try {
      await StorageManager.savePanelSettings({ panelVisible: newVisibility });
    } catch (error) {
      console.error('Error saving panel state:', error);
    }
  };

  const handleMarkersChange = () => {
    // Force re-render of markers when they change
    setMarkersKey((prev) => prev + 1);
  };

  return (
    <>
      <ToggleButton isVisible={isVisible} onClick={togglePanel} />

      <div
        className={`ytmusic-unified-control-panel ${
          isVisible ? 'visible' : ''
        }`}
      >
        <MarkerControls onMarkersChange={handleMarkersChange} />
        <MarkerList onMarkersChange={handleMarkersChange} />
      </div>

      <ProgressBarMarkers key={markersKey} />
      <CustomPlayerBar />
    </>
  );
};

export default ControlPanel;
