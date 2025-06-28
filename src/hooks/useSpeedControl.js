import { useState, useEffect, useCallback } from 'react';
import { StorageManager } from '../utils/storage';
import { setPlaybackSpeed as setVideoSpeed } from '../utils/youtube';

export const useSpeedControl = () => {
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);

  const loadSpeed = useCallback(async () => {
    try {
      const savedSpeed = await StorageManager.getPlaybackSpeed();
      setSpeed(savedSpeed);
      setVideoSpeed(savedSpeed);
    } catch (error) {
      console.error('Error loading speed:', error);
    }
  }, []);

  const updateSpeed = useCallback(async (newSpeed) => {
    setLoading(true);
    try {
      await StorageManager.setPlaybackSpeed(newSpeed);
      setSpeed(newSpeed);
      setVideoSpeed(newSpeed);
    } catch (error) {
      console.error('Error updating speed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSpeed = useCallback(async () => {
    await updateSpeed(1.0);
  }, [updateSpeed]);

  useEffect(() => {
    loadSpeed();
  }, [loadSpeed]);

  // Apply speed when video changes
  useEffect(() => {
    const applySpeedToNewVideo = () => {
      setTimeout(() => {
        setVideoSpeed(speed);
      }, 1000);
    };

    window.addEventListener('yt-navigate-finish', applySpeedToNewVideo);

    return () => {
      window.removeEventListener('yt-navigate-finish', applySpeedToNewVideo);
    };
  }, [speed]);

  return {
    speed,
    loading,
    updateSpeed,
    resetSpeed,
    loadSpeed,
  };
};
