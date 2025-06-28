import React, { useState, useEffect } from 'react';
import { StorageManager } from '../utils/storage';
import ToggleButton from './ToggleButton';
import SpeedControls from './SpeedControls';
import MarkerControls from './MarkerControls';
import MarkerList from './MarkerList';
import ProgressBarMarkers from './ProgressBarMarkers';
import CustomPlayerBar from './CustomPlayerBar';

const ControlPanel = () => {
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <>
      <ToggleButton isVisible={isVisible} onClick={togglePanel} />

      <div
        className={`ytmusic-unified-control-panel ${
          isVisible ? 'visible' : ''
        }`}
      >
        <SpeedControls />
        <MarkerControls />
        <MarkerList />
      </div>

      <ProgressBarMarkers />
      <CustomPlayerBar />
    </>
  );
};

export default ControlPanel;
