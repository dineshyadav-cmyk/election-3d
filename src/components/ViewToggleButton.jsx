import React from 'react';
import './ViewToggleButton.css';

const ViewToggleButton = ({ currentView, onToggleView, isAnimating }) => {
  const isBirdsEye = currentView === 'birds_eye';
  
  const handleClick = () => {
    if (isAnimating) return;
    
    const nextView = isBirdsEye ? 'gallery_top' : 'birds_eye';
    onToggleView(nextView);
  };

  return (
    <button 
      className={`view-toggle-btn ${isAnimating ? 'animating' : ''}`}
      onClick={handleClick}
      disabled={isAnimating}
      title={isBirdsEye ? "Go inside the Assembly House" : "View from above"}
    >
      {isBirdsEye ? (
        <>
          🏛️ Go inside the Assembly House
        </>
      ) : (
        <>
          🦅 Bird's-eye View
        </>
      )}
    </button>
  );
};

export default ViewToggleButton;

