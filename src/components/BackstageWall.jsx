import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame, useLoader } from '@react-three/fiber';

const BackstageWall = React.memo(function BackstageWall() {
  const { camera } = useThree();
  const groupRef = useRef();
  
  // Load pattern texture
  const patternTexture = useLoader(THREE.TextureLoader, '/images/pattern3.png');
  
  // Configure texture
  useEffect(() => {
    if (patternTexture) {
      patternTexture.wrapS = THREE.RepeatWrapping;
      patternTexture.wrapT = THREE.RepeatWrapping;
      patternTexture.repeat.set(4, 4); // Repeat pattern 4x4 times
    }
  }, [patternTexture]);
  
  // Dynamic visibility based on camera position
  // Hide backstage wall when camera is in gallery zone (behind wall)
  // This prevents wall from obstructing assembly view
  useFrame(() => {
    if (groupRef.current) {
      const cameraZ = camera.position.z;
      const BACKSTAGE_THRESHOLD = -14; // Backstage wall position
      
      // Show wall when camera is IN FRONT of wall (Z > -14)
      // Hide wall when camera is BEHIND wall in gallery zone (Z < -14)
      groupRef.current.visible = cameraZ > BACKSTAGE_THRESHOLD;
    }
  });
  const width = 800;  // Span entire room width (left to right walls)
  const height = 50;  // Extend to ceiling
  const thickness = 2;
  const borderWidth = 2;  // 2m thick border
  const centerPanelThickness = 2;  // 2m thick protruding teal panel
  
  // Center panel width - matches Row 1 span
  // Row 1 radius = 16m, spanning 180° semicircle
  // Straight-line distance (chord) = 2 × radius = 32m
  const tealPanelWidth = 32;  // Original size - covers center chair/stage area
  
  // Color configuration (match room color)
  const COLORS = {
    frame: {
      color: "#d4a76a",  // Room wall color
      roughness: 0.6,
      metalness: 0.2,
      // transparent: true,
      // opacity: 0.3  // Match room opacity
    },
    center: {
      color: "#5a8a7a",  // Room wall color
      roughness: 0.8,
      metalness: 0.1,
      // transparent: true,
      // opacity: 0.3  // Match room opacity
    }
  };
  
  // Center panel - PROTRUDING 2m thick
  const centerPanelGeometry = useMemo(() => {
    const centerHeight = height - borderWidth;       // 48m (50 - 2, no border at bottom)
    return new THREE.BoxGeometry(tealPanelWidth, centerHeight, centerPanelThickness);
  }, [tealPanelWidth, height, centerPanelThickness]);
  
  // Golden/brown border pieces
  const topBorderGeometry = useMemo(() => {
    return new THREE.BoxGeometry(width, borderWidth, thickness);  // Full width, 2m tall
  }, [width, borderWidth, thickness]);

  const sideBorderGeometry = useMemo(() => {
    const sideHeight = height - borderWidth;  // 48m tall (no border at bottom)
    return new THREE.BoxGeometry(borderWidth, sideHeight, thickness);  // 2m wide
  }, [height, borderWidth, thickness]);
  
  // Back panel (full wall, same color as frame)
  const backPanelGeometry = useMemo(() => {
    return new THREE.BoxGeometry(width, height, thickness);
  }, [width, height, thickness]);

  const wallZ = -16;  // 10m behind speaker chair (which is now at Z=-6)
  
  return (
    <group ref={groupRef}>
      {/* FRONT SIDE (facing speaker/assembly) */}
      
      {/* Center panel - PROTRUDING 2m forward */}
      <mesh 
        position={[0, 24, wallZ + centerPanelThickness / 2]}  // Y=24m (center of 48m tall panel)
        geometry={centerPanelGeometry}
        castShadow={false}
        receiveShadow
      >
        <meshStandardMaterial 
          {...COLORS.center}
        />
      </mesh>
      
      {/* Top border */}
      <mesh 
        position={[0, 49, wallZ]}  // Y=49m (top, 1m from ceiling)
        geometry={topBorderGeometry}
        castShadow={false}
        receiveShadow
      >
        <meshStandardMaterial 
          {...COLORS.frame}
        />
      </mesh>
      
      {/* Left border */}
      <mesh 
        position={[-width / 2, 24, wallZ]}  // X=-400m (left edge)
        geometry={sideBorderGeometry}
        castShadow={false}
        receiveShadow
      >
        <meshStandardMaterial 
          {...COLORS.frame}
        />
      </mesh>
      
      {/* Right border */}
      <mesh 
        position={[width / 2, 24, wallZ]}  // X=400m (right edge)
        geometry={sideBorderGeometry}
        castShadow={false}
        receiveShadow
      >
        <meshStandardMaterial 
          {...COLORS.frame}
        />
      </mesh>
      
      {/* BACK SIDE (behind wall) */}
      <mesh 
        position={[0, 25, wallZ - thickness]}  // Y=25m (center of full 50m wall)
        geometry={backPanelGeometry}
        castShadow={false}
        receiveShadow
      >
        <meshStandardMaterial 
          map={patternTexture}
          {...COLORS.frame}
        />
      </mesh>
    </group>
  );
});

export default BackstageWall;

