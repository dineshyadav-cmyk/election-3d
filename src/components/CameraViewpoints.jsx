import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Use existing viewpoints from the original system
const NAV_VIEWPOINTS = {
  gallery_top: {
    position: new THREE.Vector3(-0.58, 49.90, 92.97),
    lookAt: new THREE.Vector3(-0.42, 0.53, 1.18),
    name: 'gallery_top',
    label: 'Gallery View'
  },
  speaker_left_high: {
    position: new THREE.Vector3(84.10, 69.25, -8.31),
    lookAt: new THREE.Vector3(2.73, 0.98, 10.51),
    name: 'speaker_left_high',
    label: 'Left High'
  },
  speaker_right_high: {
    position: new THREE.Vector3(-84.10, 69.25, -8.31),
    lookAt: new THREE.Vector3(-2.73, 0.98, 10.51),
    name: 'speaker_right_high',
    label: 'Right High'
  },
  speaker_left_low: {
    position: new THREE.Vector3(55.89, 16.08, -8.95),
    lookAt: new THREE.Vector3(3.51, -0.74, 11.50),
    name: 'speaker_left_low',
    label: 'Left Low'
  },
  speaker_right_low: {
    position: new THREE.Vector3(-55.89, 16.08, -8.95),
    lookAt: new THREE.Vector3(-3.51, -0.74, 11.50),
    name: 'speaker_right_low',
    label: 'Right Low'
  }
};


const CameraViewpoints = ({ cameraControls }) => {
  const { camera } = useThree();
  const [currentView, setCurrentView] = useState('gallery_top'); // Start at gallery view
  const [isAnimating, setIsAnimating] = useState(false);
  const hasInitialized = useRef(false);
  const targetPosition = useRef(null);

  // Function to set camera limits based on current viewpoint
  const setCameraLimits = useCallback((viewName) => {
    if (!cameraControls) return;
    
    const targetView = NAV_VIEWPOINTS[viewName];
    if (!targetView) return;
    
    // Calculate the azimuth angle of the target view
    const dx = targetView.position.x - targetView.lookAt.x;
    const dz = targetView.position.z - targetView.lookAt.z;
    const centerAzimuth = Math.atan2(dx, dz);
    
    // Allow ±10 degrees (convert to radians) from the center viewpoint
    const limitRange = THREE.MathUtils.degToRad(10);
    
    cameraControls.azimuthAngleMin = centerAzimuth - limitRange;
    cameraControls.azimuthAngleMax = centerAzimuth + limitRange;
    
    // Also limit polar angle to prevent extreme up/down movement
    const currentPolar = Math.acos(
      (targetView.position.y - targetView.lookAt.y) / 
      Math.sqrt(
        Math.pow(targetView.position.x - targetView.lookAt.x, 2) +
        Math.pow(targetView.position.y - targetView.lookAt.y, 2) +
        Math.pow(targetView.position.z - targetView.lookAt.z, 2)
      )
    );
    
    const polarLimitRange = THREE.MathUtils.degToRad(10);
    cameraControls.polarAngleMin = Math.max(0.1, currentPolar - polarLimitRange);
    cameraControls.polarAngleMax = Math.min(Math.PI - 0.1, currentPolar + polarLimitRange);
    
    console.log(`Set camera limits for ${viewName}: azimuth ${THREE.MathUtils.radToDeg(centerAzimuth - limitRange)}° to ${THREE.MathUtils.radToDeg(centerAzimuth + limitRange)}°`);
  }, [cameraControls]);

  // Initialize camera position on mount (with slight delay to ensure camera controls are ready)
  useEffect(() => {
    if (cameraControls && !hasInitialized.current) {
      console.log('Initializing camera to gallery view');
      // Small delay to ensure camera controls are fully initialized
      const timer = setTimeout(() => {
        const startView = NAV_VIEWPOINTS.gallery_top;
        console.log('Setting initial front view:', startView.position, startView.lookAt);
        cameraControls.setLookAt(
          startView.position.x, startView.position.y, startView.position.z,
          startView.lookAt.x, startView.lookAt.y, startView.lookAt.z,
          false
        );
        
        // Set initial camera limits for the starting view
        setCameraLimits('gallery_top');
        
        hasInitialized.current = true;
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [cameraControls, setCameraLimits]);

  // Check if camera has reached target position
  useFrame(() => {
    if (isAnimating && targetPosition.current) {
      const currentPos = camera.position;
      const target = targetPosition.current;
      
      // Calculate distance to target
      const distance = currentPos.distanceTo(target);
      
      // If very close to target (within 0.5m), animation is complete
      if (distance < 0.5) {
        setIsAnimating(false);
        targetPosition.current = null;
      }
    }
  });

  const switchToView = useCallback((viewName) => {
    console.log('switchToView called:', viewName, 'current:', currentView, 'isAnimating:', isAnimating, 'cameraControls:', !!cameraControls);
    
    if (!cameraControls) {
      console.log('switchToView blocked - no controls:', !cameraControls);
      return;
    }
    
    const targetView = NAV_VIEWPOINTS[viewName];
    if (!targetView) {
      console.log('Invalid view name:', viewName);
      return;
    }
    
    console.log('Switching to view:', viewName, 'position:', targetView.position, 'lookAt:', targetView.lookAt);
    
    setIsAnimating(true);
    targetPosition.current = targetView.position.clone();
    
    // Use camera-controls' built-in smooth animation
    cameraControls.setLookAt(
      targetView.position.x,
      targetView.position.y,
      targetView.position.z,
      targetView.lookAt.x,
      targetView.lookAt.y,
      targetView.lookAt.z,
      true
    );
    
    // Set camera limits for this viewpoint
    setCameraLimits(viewName);
    
    // Update current view
    setCurrentView(viewName);
  }, [isAnimating, currentView, cameraControls, setCameraLimits]);

  // Expose the switchToView function and state to parent component
  React.useEffect(() => {
    // Store the navigation state in window for access from HTML layer
    window.cameraNavigation = {
      switchToView,
      currentView,
      isAnimating
    };
  }, [switchToView, currentView, isAnimating]);

  return null; // No 3D objects to render
};

export default CameraViewpoints;


