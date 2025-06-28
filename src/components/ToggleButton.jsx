import React from 'react';
import { Settings, ChevronDown } from 'lucide-react';

const ToggleButton = ({ isVisible, onClick }) => {
  return (
    <div
      className='ytmusic-header-control-toggle'
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <Settings className='icon' size={16} />
      <span className='label'>YouTube Music Controls</span>
      <ChevronDown
        className={`chevron ${isVisible ? 'active' : ''}`}
        size={14}
      />
    </div>
  );
};

export default ToggleButton;
