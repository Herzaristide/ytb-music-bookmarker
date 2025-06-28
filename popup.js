function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderMarkers(markersData) {
  const container = document.getElementById('markersList');
  container.innerHTML = '';

  let totalMarkers = 0;

  if (!markersData || Object.keys(markersData).length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 48px; margin-bottom: 15px;">🎵</div>
        <p>No markers yet</p>
        <p style="font-size: 11px;">Go to YouTube Music and press 'M' or use the '+' button to add markers</p>
      </div>
    `;
    document.getElementById('markersCount').textContent = '0';
    return;
  }

  // Render markers grouped by video
  Object.entries(markersData).forEach(([videoId, markers]) => {
    if (markers.length === 0) return;

    totalMarkers += markers.length;

    const videoGroup = document.createElement('div');
    videoGroup.className = 'video-group';

    // Get video title from first marker
    const videoTitle = markers[0].title || 'Unknown Track';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'video-title';
    titleDiv.textContent = `🎵 ${videoTitle} (${markers.length} markers)`;
    videoGroup.appendChild(titleDiv);

    // Sort markers by timecode
    markers.sort((a, b) => a.timecode - b.timecode);

    markers.forEach((marker, index) => {
      const markerDiv = document.createElement('div');
      markerDiv.className = 'marker-item';

      // Time button
      const timeBtn = document.createElement('div');
      timeBtn.className = 'marker-time';
      timeBtn.textContent = formatTime(marker.timecode);
      timeBtn.title = 'Click to go to this time';
      timeBtn.addEventListener('click', () => {
        navigateToTimecode(videoId, marker.timecode);
      });

      // Note text
      const noteSpan = document.createElement('span');
      noteSpan.className = marker.note ? 'marker-note' : 'marker-note empty';
      noteSpan.textContent = marker.note || 'No description';

      // Actions
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'marker-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () =>
        editMarker(videoId, marker.timecode, marker.note)
      );

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () =>
        deleteMarker(videoId, marker.timecode)
      );

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      markerDiv.appendChild(timeBtn);
      markerDiv.appendChild(noteSpan);
      markerDiv.appendChild(actionsDiv);

      videoGroup.appendChild(markerDiv);
    });

    container.appendChild(videoGroup);
  });

  document.getElementById('markersCount').textContent = totalMarkers;
}

function editMarker(videoId, timecode, currentNote) {
  const newNote = prompt(
    `Edit note for ${formatTime(timecode)}:`,
    currentNote || ''
  );
  if (newNote === null) return; // User cancelled

  chrome.storage.local.get({ markers: {} }, (data) => {
    const markers = data.markers;
    if (markers[videoId]) {
      const markerIndex = markers[videoId].findIndex(
        (m) => m.timecode === timecode
      );
      if (markerIndex >= 0) {
        markers[videoId][markerIndex].note = newNote.trim();
        chrome.storage.local.set({ markers }, () => {
          renderMarkers(markers);
          // Refresh markers on progress bar
          refreshProgressBarMarkers();
        });
      }
    }
  });
}

function deleteMarker(videoId, timecode) {
  if (!confirm(`Delete marker at ${formatTime(timecode)}?`)) return;

  chrome.storage.local.get({ markers: {} }, (data) => {
    const markers = data.markers;
    if (markers[videoId]) {
      markers[videoId] = markers[videoId].filter(
        (m) => m.timecode !== timecode
      );
      if (markers[videoId].length === 0) {
        delete markers[videoId];
      }
      chrome.storage.local.set({ markers }, () => {
        renderMarkers(markers);
        // Refresh markers on progress bar
        refreshProgressBarMarkers();
      });
    }
  });
}

function navigateToTimecode(videoId, timecode) {
  // Construct YouTube Music URL with timecode
  const timeUrl = `https://music.youtube.com/watch?v=${videoId}&t=${timecode}s`;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.update(tabs[0].id, { url: timeUrl });
  });
}

function refreshProgressBarMarkers() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes('music.youtube.com')) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'refreshTimecodes' },
        () => {
          // Ignore response
        }
      );
    }
  });
}

function updateCurrentVideo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes('music.youtube.com')) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'getVideoInfo' },
        (response) => {
          if (response && response.title) {
            document.getElementById('currentVideo').style.display = 'block';
            document.getElementById('noVideo').style.display = 'none';
            document.getElementById('videoTitle').textContent = response.title;
            document.getElementById('currentTime').textContent = formatTime(
              response.currentTime
            );

            // Store current video info for adding markers
            window.currentVideoInfo = response;
          } else {
            document.getElementById('currentVideo').style.display = 'none';
            document.getElementById('noVideo').style.display = 'block';
          }
        }
      );
    } else {
      document.getElementById('currentVideo').style.display = 'none';
      document.getElementById('noVideo').style.display = 'block';
    }
  });
}

// Event listeners
document.getElementById('addTimecodeBtn').addEventListener('click', () => {
  if (!window.currentVideoInfo) return;

  // Create marker without prompting for description
  const marker = {
    timecode: Math.floor(window.currentVideoInfo.currentTime),
    note: '', // Empty note - no description
    timestamp: new Date().toISOString(),
    title: window.currentVideoInfo.title,
  };

  const videoId = window.currentVideoInfo.videoId;

  chrome.storage.local.get({ markers: {} }, (data) => {
    const markers = data.markers;
    if (!markers[videoId]) {
      markers[videoId] = [];
    }

    // Check if marker already exists at this time (within 2 seconds)
    const existingIndex = markers[videoId].findIndex(
      (m) => Math.abs(m.timecode - marker.timecode) <= 2
    );

    if (existingIndex >= 0) {
      if (confirm('A marker already exists near this time. Replace it?')) {
        markers[videoId][existingIndex] = marker;
      } else {
        return;
      }
    } else {
      markers[videoId].push(marker);
    }

    // Sort markers by timecode
    markers[videoId].sort((a, b) => a.timecode - b.timecode);

    chrome.storage.local.set({ markers }, () => {
      renderMarkers(markers);
      updateCurrentVideo();
      refreshProgressBarMarkers();
    });
  });
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  updateCurrentVideo();
  // Reload markers
  chrome.storage.local.get({ markers: {} }, (data) => {
    renderMarkers(data.markers);
  });
});

document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (
    confirm(
      'Are you sure you want to delete ALL markers? This cannot be undone.'
    )
  ) {
    chrome.storage.local.set({ markers: {} }, () => {
      renderMarkers({});
      refreshProgressBarMarkers();
    });
  }
});

// Add speed control functionality
function initializeSpeedControls() {
  const speedBtns = document.querySelectorAll('.speed-btn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');

  // Get current speed from storage
  chrome.storage.local.get({ playbackSpeed: 1 }, (data) => {
    const currentSpeed = data.playbackSpeed;
    speedSlider.value = currentSpeed;
    speedValue.textContent = `${currentSpeed.toFixed(2)}x`;

    // Update active button
    speedBtns.forEach((btn) => {
      btn.classList.toggle(
        'active',
        parseFloat(btn.dataset.speed) === currentSpeed
      );
    });
  });

  // Speed button listeners
  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed);
      setPlaybackSpeed(speed);

      // Update UI
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      speedSlider.value = speed;
      speedValue.textContent = `${speed.toFixed(2)}x`;
    });
  });

  // Speed slider listener
  speedSlider.addEventListener('input', () => {
    const speed = parseFloat(speedSlider.value);
    setPlaybackSpeed(speed);
    speedValue.textContent = `${speed.toFixed(2)}x`;

    // Update active button if it matches a preset
    speedBtns.forEach((btn) => {
      btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
    });
  });
}

function setPlaybackSpeed(speed) {
  // Store speed in local storage
  chrome.storage.local.set({ playbackSpeed: speed });

  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes('music.youtube.com')) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'setPlaybackSpeed', speed: speed },
        () => {
          // Ignore response
        }
      );
    }
  });
}

// Initialize
chrome.storage.local.get({ markers: {} }, (data) => {
  renderMarkers(data.markers);
});

updateCurrentVideo();

// Initialize speed controls when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSpeedControls);
} else {
  initializeSpeedControls();
}
