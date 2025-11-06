import React, { useState, useEffect } from 'react';
import './NavigationDots.css';

// Use existing viewpoints from the original system
const NAV_VIEWPOINTS = {
  gallery_top: {
    position: { x: -0.58, y: 49.90, z: 92.97 },
    lookAt: { x: -0.42, y: 0.53, z: 1.18 },
    name: 'gallery_top',
    label: 'Gallery View'
  },
  speaker_left_high: {
    position: { x: 84.10, y: 69.25, z: -8.31 },
    lookAt: { x: 2.73, y: 0.98, z: 10.51 },
    name: 'speaker_left_high',
    label: 'Left High'
  },
  speaker_right_high: {
    position: { x: -84.10, y: 69.25, z: -8.31 },
    lookAt: { x: -2.73, y: 0.98, z: 10.51 },
    name: 'speaker_right_high',
    label: 'Right High'
  },
  speaker_left_low: {
    position: { x: 55.89, y: 16.08, z: -8.95 },
    lookAt: { x: 3.51, y: -0.74, z: 11.50 },
    name: 'speaker_left_low',
    label: 'Left Low'
  },
  speaker_right_low: {
    position: { x: -55.89, y: 16.08, z: -8.95 },
    lookAt: { x: -3.51, y: -0.74, z: 11.50 },
    name: 'speaker_right_low',
    label: 'Right Low'
  }
};

// Navigation dot component
const NavigationDot = ({ direction, onClick, isActive, isAnimating }) => {
  const [hovered, setHovered] = useState(false);
  
  // Position dots around the screen edges
  const getScreenPosition = () => {
    switch (direction) {
      case 'gallery_top': return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'speaker_left_high': return { top: '20px', left: '20px' };
      case 'speaker_right_high': return { top: '20px', right: '20px' };
      case 'speaker_left_low': return { bottom: '20px', left: '20px' };
      case 'speaker_right_low': return { bottom: '20px', right: '20px' };
      default: return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const getIcon = () => {
    switch (direction) {
      case 'gallery_top': return '🏛️';
      case 'speaker_left_high': return '↖️';
      case 'speaker_right_high': return '↗️';
      case 'speaker_left_low': return '↙️';
      case 'speaker_right_low': return '↘️';
      default: return '📍';
    }
  };

  return (
    <div
      className={`nav-dot ${isActive ? 'active' : ''} ${isAnimating ? 'animating' : ''} ${hovered ? 'hovered' : ''}`}
      style={getScreenPosition()}
      onClick={() => onClick(direction)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={NAV_VIEWPOINTS[direction]?.label}
    >
      {getIcon()}
    </div>
  );
};

const NavigationDots = () => {
  const [currentView, setCurrentView] = useState('gallery_top');
  const [isAnimating, setIsAnimating] = useState(false);

  // Listen for updates from the camera navigation system
  useEffect(() => {
    const checkNavigation = () => {
      if (window.cameraNavigation) {
        setCurrentView(window.cameraNavigation.currentView);
        setIsAnimating(window.cameraNavigation.isAnimating);
      }
    };

    // Check immediately and then poll for updates
    checkNavigation();
    const interval = setInterval(checkNavigation, 100);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (direction) => {
    if (window.cameraNavigation && window.cameraNavigation.switchToView) {
      window.cameraNavigation.switchToView(direction);
    }
  };

  return (
    <div className="navigation-dots-container">
      {Object.keys(NAV_VIEWPOINTS).map((direction) => (
        <NavigationDot
          key={direction}
          direction={direction}
          onClick={handleDotClick}
          isActive={currentView === direction}
          isAnimating={isAnimating}
        />
      ))}
    </div>
  );
};

export default NavigationDots;
