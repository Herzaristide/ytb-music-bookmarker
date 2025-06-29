import React, { useState } from 'react';
import { useMarkers } from '../hooks/useMarkers';
import { seekToTime, formatTime } from '../utils/youtube';
import { Play, Edit, Trash2, SkipBack, SkipForward } from 'lucide-react';
import { useCurrentTime } from '../hooks/useCurrentTime';

const MarkerList = ({ onMarkersChange }) => {
  const {
    markers,
    updateMarker,
    removeMarker,
    getNextMarker,
    getPreviousMarker,
  } = useMarkers();
  const { currentTime } = useCurrentTime();
  const [editingMarker, setEditingMarker] = useState(null);
  const [editDescription, setEditDescription] = useState('');

  const handleSeekToMarker = (timecode) => {
    seekToTime(timecode);
  };

  const handleEditMarker = (marker) => {
    setEditingMarker(marker.timecode);
    setEditDescription(marker.note || '');
  };

  const handleSaveEdit = async () => {
    try {
      await updateMarker(editingMarker, { note: editDescription });
      setEditingMarker(null);
      setEditDescription('');

      // Notify parent component
      if (onMarkersChange) {
        onMarkersChange();
      }
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMarker(null);
    setEditDescription('');
  };

  const handleDeleteMarker = async (timecode) => {
    if (confirm(`Remove marker at ${formatTime(timecode)}?`)) {
      try {
        await removeMarker(timecode);

        // Notify parent component
        if (onMarkersChange) {
          onMarkersChange();
        }
      } catch (error) {
        console.error('Error removing marker:', error);
      }
    }
  };

  const handlePreviousMarker = () => {
    const prevMarker = getPreviousMarker(currentTime);
    if (prevMarker) {
      seekToTime(prevMarker.timecode);
    }
  };

  const handleNextMarker = () => {
    const nextMarker = getNextMarker(currentTime);
    if (nextMarker) {
      seekToTime(nextMarker.timecode);
    }
  };

  return (
    <div className='ytmusic-section'>
      <div className='ytmusic-section-title'>
        <span>📍</span>
        Navigation
      </div>

      <div className='ytmusic-marker-list'>
        {markers.length === 0 ? (
          <div className='ytmusic-no-markers'>No markers for this video</div>
        ) : (
          markers.map((marker) => (
            <div key={marker.timecode} className='ytmusic-marker-item'>
              <div className='ytmusic-marker-time'>
                {formatTime(marker.timecode)}
              </div>

              <div className='ytmusic-marker-note'>
                {editingMarker === marker.timecode ? (
                  <div className='edit-container'>
                    <input
                      type='text'
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      placeholder='Enter description...'
                      autoFocus
                    />
                    <div className='edit-actions'>
                      <button onClick={handleSaveEdit}>✓</button>
                      <button onClick={handleCancelEdit}>✕</button>
                    </div>
                  </div>
                ) : (
                  marker.note || 'No description'
                )}
              </div>

              <div className='ytmusic-marker-actions'>
                <button
                  className='ytmusic-goto-marker'
                  onClick={() => handleSeekToMarker(marker.timecode)}
                  title='Go to marker'
                >
                  <Play size={12} />
                </button>

                <button
                  className='ytmusic-edit-marker'
                  onClick={() => handleEditMarker(marker)}
                  title='Edit description'
                >
                  <Edit size={12} />
                </button>

                <button
                  className='ytmusic-delete-marker'
                  onClick={() => handleDeleteMarker(marker.timecode)}
                  title='Delete marker'
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className='ytmusic-navigation-controls'>
        <button
          className='ytmusic-prev-marker-btn'
          onClick={handlePreviousMarker}
          disabled={!getPreviousMarker(currentTime)}
        >
          <SkipBack size={14} />
          Previous
        </button>

        <button
          className='ytmusic-next-marker-btn'
          onClick={handleNextMarker}
          disabled={!getNextMarker(currentTime)}
        >
          <SkipForward size={14} />
          Next
        </button>
      </div>
    </div>
  );
};

export default MarkerList;
