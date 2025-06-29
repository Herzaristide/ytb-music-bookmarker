import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { StorageManager } from './utils/storage';

const PopupApp = () => {
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVideos, setExpandedVideos] = useState(new Set());

  useEffect(() => {
    const loadBookmarkedVideos = async () => {
      try {
        setLoading(true);
        // Get all storage data
        const allData = await new Promise((resolve) => {
          chrome.storage.local.get(null, resolve);
        });

        const videos = [];
        Object.keys(allData).forEach((key) => {
          if (
            key !== 'playbackSpeed' &&
            key !== 'panelVisible' &&
            key !== 'panelPosition'
          ) {
            const markers = allData[key];
            if (Array.isArray(markers) && markers.length > 0) {
              // Sort markers by timecode
              const sortedMarkers = markers.sort(
                (a, b) => a.timecode - b.timecode
              );

              // Get the most recent title (from the latest marker)
              const latestMarker = markers.reduce((latest, current) =>
                new Date(current.timestamp) > new Date(latest.timestamp)
                  ? current
                  : latest
              );

              videos.push({
                videoId: key,
                title:
                  latestMarker?.title ||
                  sortedMarkers[0]?.title ||
                  'Unknown Video',
                markers: sortedMarkers,
                totalMarkers: sortedMarkers.length,
                lastUpdated: Math.max(
                  ...sortedMarkers.map((m) => new Date(m.timestamp).getTime())
                ),
              });
            }
          }
        });

        // Sort videos by last updated (most recent first)
        videos.sort((a, b) => b.lastUpdated - a.lastUpdated);
        setBookmarkedVideos(videos);
      } catch (error) {
        console.error('Error loading bookmarked videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarkedVideos();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const toggleVideoExpansion = (videoId) => {
    setExpandedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const openVideoAtMarker = (videoId, timecode) => {
    const url = `https://music.youtube.com/watch?v=${videoId}&t=${timecode}s`;
    chrome.tabs.create({ url });
  };

  const openVideo = (videoId) => {
    const url = `https://music.youtube.com/watch?v=${videoId}`;
    chrome.tabs.create({ url });
  };

  const clearVideoMarkers = async (videoId) => {
    if (confirm('Remove all markers for this video?')) {
      try {
        await new Promise((resolve) => {
          chrome.storage.local.remove([videoId], resolve);
        });
        setBookmarkedVideos((prev) =>
          prev.filter((video) => video.videoId !== videoId)
        );
      } catch (error) {
        console.error('Error clearing video markers:', error);
        alert('Error removing markers. Please try again.');
      }
    }
  };

  const clearAllData = async () => {
    if (confirm('This will clear ALL markers for ALL videos. Are you sure?')) {
      try {
        await new Promise((resolve) => {
          chrome.storage.local.clear(resolve);
        });
        setBookmarkedVideos([]);
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
        <div className='popup-stats'>
          <span>
            {bookmarkedVideos.length} videos •{' '}
            {bookmarkedVideos.reduce(
              (sum, video) => sum + video.totalMarkers,
              0
            )}{' '}
            markers
          </span>
        </div>
      </div>

      {loading ? (
        <div className='loading'>Loading bookmarks...</div>
      ) : bookmarkedVideos.length === 0 ? (
        <div className='empty-state'>
          <p>No bookmarked videos yet!</p>
          <p>Navigate to YouTube Music and add some markers to get started.</p>
        </div>
      ) : (
        <div className='videos-list'>
          {bookmarkedVideos.map((video) => (
            <div key={video.videoId} className='video-item'>
              <div
                className='video-header'
                onClick={() => toggleVideoExpansion(video.videoId)}
              >
                <div className='video-info'>
                  <h3 className='video-title'>{video.title}</h3>
                  <div className='video-meta'>
                    <span className='marker-count'>
                      {video.totalMarkers} markers
                    </span>
                    <span className='last-updated'>
                      Updated {formatDate(video.lastUpdated)}
                    </span>
                  </div>
                </div>
                <div className='video-actions'>
                  <button
                    className='play-btn'
                    onClick={(e) => {
                      e.stopPropagation();
                      openVideo(video.videoId);
                    }}
                    title='Open video'
                  >
                    ▶️
                  </button>
                  <button
                    className='delete-btn'
                    onClick={(e) => {
                      e.stopPropagation();
                      clearVideoMarkers(video.videoId);
                    }}
                    title='Delete all markers'
                  >
                    🗑️
                  </button>
                  <span className='expand-arrow'>
                    {expandedVideos.has(video.videoId) ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {expandedVideos.has(video.videoId) && (
                <div className='markers-list'>
                  {video.markers.map((marker, index) => (
                    <div key={index} className='marker-item'>
                      <div className='marker-time'>
                        {formatTime(marker.timecode)}
                      </div>
                      <div className='marker-note'>
                        {marker.note || 'No description'}
                      </div>
                      <button
                        className='jump-btn'
                        onClick={() =>
                          openVideoAtMarker(video.videoId, marker.timecode)
                        }
                        title='Jump to this marker'
                      >
                        🎯
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className='popup-actions'>
        <button onClick={exportData} className='action-btn export-btn'>
          📤 Export Data
        </button>
        <button onClick={clearAllData} className='action-btn clear-btn'>
          🗑️ Clear All
        </button>
      </div>
    </div>
  );
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<PopupApp />);
});
