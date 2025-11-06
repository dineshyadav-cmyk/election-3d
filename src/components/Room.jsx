import React from 'react';
import * as THREE from 'three';

const Room = React.memo(function Room() {
  const roomWidth = 200;  // Much smaller room
  const roomDepth = 120;
  const wallHeight = 40;  // Lower ceiling
  
  const roomMaterial = { 
    color: "#5A2F2F",
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.2,  // Semi-transparent to allow light through
    side: THREE.DoubleSide
  };

  return (
    <>
      {/* Very distant background walls - far enough to not block light */}
      {/* Front wall */}
      <mesh position={[0, wallHeight / 2, 80]} receiveShadow castShadow={false}>
        <boxGeometry args={[roomWidth, wallHeight, 1]} />
        <meshStandardMaterial {...roomMaterial} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-roomWidth / 2, wallHeight / 2, -10]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow={false}>
        <boxGeometry args={[roomDepth, wallHeight, 1]} />
        <meshStandardMaterial {...roomMaterial} />
      </mesh>

      {/* Right wall */}
      <mesh position={[roomWidth / 2, wallHeight / 2, -10]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow={false}>
        <boxGeometry args={[roomDepth, wallHeight, 1]} />
        <meshStandardMaterial {...roomMaterial} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, wallHeight, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow={false}>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial {...roomMaterial} />
      </mesh>
    </>
  );
});

export default Room;

