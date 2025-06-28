import React, { useState } from 'react';
import { useSpeedControl } from '../hooks/useSpeedControl';

const SpeedControls = () => {
  const { speed, loading, updateSpeed } = useSpeedControl();
  const [sliderValue, setSliderValue] = useState(speed);

  const speedPresets = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handlePresetClick = async (newSpeed) => {
    try {
      await updateSpeed(newSpeed);
      setSliderValue(newSpeed);
    } catch (error) {
      console.error('Error setting speed:', error);
    }
  };

  const handleSliderChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSliderValue(newSpeed);
  };

  const handleSliderMouseUp = async () => {
    try {
      await updateSpeed(sliderValue);
    } catch (error) {
      console.error('Error setting speed:', error);
    }
  };

  return (
    <div className='ytmusic-section'>
      <div className='ytmusic-section-title'>
        <span>⚡</span>
        Speed Control
      </div>

      <div className='ytmusic-speed-controls'>
        {speedPresets.map((preset) => (
          <button
            key={preset}
            className={`ytmusic-speed-btn ${speed === preset ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset)}
            disabled={loading}
          >
            {preset}x
          </button>
        ))}
      </div>

      <div className='ytmusic-speed-slider-container'>
        <input
          type='range'
          className='ytmusic-speed-slider'
          min='0.25'
          max='3'
          step='0.05'
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderMouseUp}
          disabled={loading}
        />
        <span className='ytmusic-speed-value'>{speed.toFixed(2)}x</span>
      </div>
    </div>
  );
};

export default SpeedControls;
