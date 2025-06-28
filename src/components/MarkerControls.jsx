import React, { useState } from 'react';
import { useMarkers } from '../hooks/useMarkers';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { Plus, Trash2, RefreshCw, CheckCircle } from 'lucide-react';

const MarkerControls = () => {
  const { addMarker, clearAllMarkers, loadMarkers, markers } = useMarkers();
  const { formattedTime } = useCurrentTime();
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddMarker = async () => {
    setLoading(true);
    try {
      console.log('MarkerControls: Adding marker...');
      console.log(
        'MarkerControls: Current markers before add:',
        markers.length
      );

      const marker = await addMarker();
      console.log('MarkerControls: Marker added successfully:', marker);
      console.log('MarkerControls: Current markers after add:', markers.length);

      // Show success feedback
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('MarkerControls: Error adding marker:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all markers for this video?')) {
      setLoading(true);
      try {
        await clearAllMarkers();
      } catch (error) {
        console.error('Error clearing markers:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      console.log('MarkerControls: Manual refresh triggered');
      await loadMarkers();
      console.log('MarkerControls: Refresh completed');
    } catch (error) {
      console.error('Error refreshing markers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='ytmusic-section'>
      <div className='ytmusic-section-title'>
        <span>🎵</span>
        Markers
      </div>

      <div className='ytmusic-marker-controls'>
        <button
          className={`ytmusic-add-marker-btn-panel ${
            justAdded ? 'success' : ''
          }`}
          onClick={handleAddMarker}
          disabled={loading}
        >
          {justAdded ? <CheckCircle size={14} /> : <Plus size={14} />}
          {justAdded ? 'Added!' : 'Add Marker'}
        </button>

        <button
          className='ytmusic-clear-markers-btn'
          onClick={handleClearAll}
          disabled={loading}
        >
          <Trash2 size={14} />
          Clear All
        </button>

        <button
          className='ytmusic-refresh-markers-btn'
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className='ytmusic-current-time'>
        <span className='ytmusic-time-display'>{formattedTime}</span>
        {markers.length > 0 && (
          <span className='ytmusic-marker-count'>
            {markers.length} marker{markers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default MarkerControls;
