import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { PERIMETER_RADIUS } from '../config/camera';

const Floor = React.memo(function Floor() {
  // Helper to create semicircle shape
  const createSemiShape = (radius) => {
    const shape = new THREE.Shape();
    shape.moveTo(-radius, 0).absarc(0, 0, radius, Math.PI, 0, true).lineTo(-radius, 0);
    return shape;
  };

  // Helper to create rectangle shape
  const createRectShape = (width, depth) => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, 0).lineTo(width / 2, 0).lineTo(width / 2, -depth)
         .lineTo(-width / 2, -depth).lineTo(-width / 2, 0);
    return shape;
  };

  // Helper to create hole path
  const createHolePath = (width, depth) => {
    const path = new THREE.Path();
    path.moveTo(-width / 2, 0).lineTo(width / 2, 0).lineTo(width / 2, -depth)
        .lineTo(-width / 2, -depth).lineTo(-width / 2, 0);
    return path;
  };

  // Helper to rotate geometry to XZ plane
  const rotateToXZ = (geom) => {
    geom.rotateX(-Math.PI / 2);
    geom.rotateY(Math.PI);
    return geom;
  };

  const interiorFloorGeometry = useMemo(() => {
    return rotateToXZ(mergeBufferGeometries([
      new THREE.ShapeGeometry(createSemiShape(PERIMETER_RADIUS), 64),
      new THREE.ShapeGeometry(createRectShape(PERIMETER_RADIUS * 2, 16.5), 16)
    ], false));
  }, []);

  const exteriorFloorGeometry = useMemo(() => {
    const outerSemiShape = createSemiShape(300);
    outerSemiShape.holes.push(new THREE.Path().moveTo(-PERIMETER_RADIUS, 0)
        .absarc(0, 0, PERIMETER_RADIUS, Math.PI, 0, true).lineTo(-PERIMETER_RADIUS, 0));
    
    const outerRectShape = createRectShape(600, 200);
    outerRectShape.holes.push(createHolePath(PERIMETER_RADIUS * 2, 16.5));
    
    return rotateToXZ(mergeBufferGeometries([
      new THREE.ShapeGeometry(outerSemiShape, 64),
      new THREE.ShapeGeometry(outerRectShape, 16)
    ], false));
  }, []);

  return (
    <>
      {/* Exterior floor (outside the semicircle) - rendered first, slightly below */}
      <mesh position={[0, -0.001, 0]} receiveShadow geometry={exteriorFloorGeometry}>
        <meshStandardMaterial 
          color="#5A2F2F" // Gray stone
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Interior floor (inside the semicircle) - rendered on top */}
      <mesh position={[0, 0, 0]} receiveShadow geometry={interiorFloorGeometry}>
        <meshStandardMaterial 
          color={0x8B7355}  // Brown carpet
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </>
  );
});

export default Floor;

