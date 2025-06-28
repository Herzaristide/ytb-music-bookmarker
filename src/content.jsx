import React from 'react';
import ReactDOM from 'react-dom/client';
import ControlPanel from './components/ControlPanel';
import './styles/content.css';

// Wait for the page to load before injecting React components
const initializeExtension = () => {
  // Check if we're on YouTube Music
  if (!window.location.hostname.includes('music.youtube.com')) {
    return;
  }

  // Wait for the page to be ready
  const waitForPageReady = () => {
    if (document.readyState === 'complete') {
      injectControlPanel();
    } else {
      setTimeout(waitForPageReady, 100);
    }
  };

  const injectControlPanel = () => {
    // Remove existing extension elements
    const existingContainer = document.getElementById('ytmusic-extension-root');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create container for React app
    const container = document.createElement('div');
    container.id = 'ytmusic-extension-root';
    document.body.appendChild(container);

    // Mount React app
    const root = ReactDOM.createRoot(container);
    root.render(<ControlPanel />);

    console.log('YouTube Music Bookmarker extension loaded (React version)');
  };

  waitForPageReady();
};

// Initialize extension
initializeExtension();

// Listen for navigation changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(initializeExtension, 1000); // Delay to ensure page has loaded
  }
}).observe(document, { subtree: true, childList: true });

// Listen for YouTube's navigation events
window.addEventListener('yt-navigate-finish', () => {
  setTimeout(initializeExtension, 1000);
});
