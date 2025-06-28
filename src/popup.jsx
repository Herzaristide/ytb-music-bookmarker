import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { StorageManager } from './utils/storage';

const PopupApp = () => {
  const [stats, setStats] = useState({
    totalMarkers: 0,
    totalVideos: 0,
    currentSpeed: 1.0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get all storage data to count markers and videos
        const allData = await new Promise((resolve) => {
          chrome.storage.local.get(null, resolve);
        });

        let totalMarkers = 0;
        let totalVideos = 0;

        Object.keys(allData).forEach((key) => {
          if (
            key !== 'playbackSpeed' &&
            key !== 'panelVisible' &&
            key !== 'panelPosition'
          ) {
            const markers = allData[key];
            if (Array.isArray(markers) && markers.length > 0) {
              totalMarkers += markers.length;
              totalVideos += 1;
            }
          }
        });

        const currentSpeed = allData.playbackSpeed || 1.0;

        setStats({
          totalMarkers,
          totalVideos,
          currentSpeed,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  const clearAllData = async () => {
    if (confirm('This will clear ALL markers for ALL videos. Are you sure?')) {
      try {
        await new Promise((resolve) => {
          chrome.storage.local.clear(resolve);
        });
        setStats({ totalMarkers: 0, totalVideos: 0, currentSpeed: 1.0 });
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };

  const exportData = async () => {
    try {
      const allData = await new Promise((resolve) => {
        chrome.storage.local.get(null, resolve);
      });

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `youtube-music-bookmarks-${
        new Date().toISOString().split('T')[0]
      }.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  return (
    <div className='popup-container'>
      <div className='popup-header'>
        <h1>🎵 YouTube Music Bookmarker</h1>
        <p>React Edition v2.0</p>
      </div>

      <div className='popup-stats'>
        <div className='stat-item'>
          <span className='stat-number'>{stats.totalMarkers}</span>
          <span className='stat-label'>Total Markers</span>
        </div>
        <div className='stat-item'>
          <span className='stat-number'>{stats.totalVideos}</span>
          <span className='stat-label'>Videos Bookmarked</span>
        </div>
        <div className='stat-item'>
          <span className='stat-number'>{stats.currentSpeed}x</span>
          <span className='stat-label'>Current Speed</span>
        </div>
      </div>

      <div className='popup-actions'>
        <button onClick={exportData} className='export-btn'>
          📤 Export Data
        </button>
        <button onClick={clearAllData} className='clear-btn'>
          🗑️ Clear All Data
        </button>
      </div>

      <div className='popup-footer'>
        <p>Navigate to YouTube Music to use the extension</p>
      </div>
    </div>
  );
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<PopupApp />);
});
