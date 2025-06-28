import { useState, useEffect, useCallback } from 'react';
import { getCurrentTime, formatTime } from '../utils/youtube';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [formattedTime, setFormattedTime] = useState('0:00');

  const updateTime = useCallback(() => {
    const time = getCurrentTime();
    setCurrentTime(time);
    setFormattedTime(formatTime(time));
  }, []);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [updateTime]);

  return {
    currentTime,
    formattedTime,
    updateTime,
  };
};
