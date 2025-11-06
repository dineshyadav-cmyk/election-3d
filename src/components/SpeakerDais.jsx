import React from 'react';

// ========================================
// SPEAKER DAIS CONFIGURATION
// ========================================
const DAIS_CONFIG = {
  // Main container position
  position: [0, 0, -6],  // Moved 4m forward toward assembly
  rotation: [0, Math.PI, 0],
  
  // Backstage wall position (matches BackstageWall.jsx wallZ)
  backstageWallZ: -16,  // Wall also moves forward by 4m (was -20, now -16)
  
  // Platform (old flat base - will be removed/replaced)
  platform: {
    width: 8.0,
    depth: 3.0,
    height: 0.15,
    color: 0x654321,
  },
  
  // Chair Platform (elevated dais)
  // Parent group at world Z=-10, wall at world Z=-20 (10m distance)
  // Due to 180° rotation: local +Z goes to world -Z
  // Platform extends 10m backward in local coords → 10m backward in world
  // Depth: 10m, Center: +5m (local)
  chairPlatform: {
    width: 8.0,       // 8m wide - stairs start at X=±4m
    depth: 10,        // Reaches backstage wall at world Z=-20 (10m from parent)
    height: 2.25,     // 2.25m tall (achieves 2.7m seat elevation)
    offsetZ: 5,       // Centered between 0 and 10
    color: 0x654321,  // Dark wood/stone color
  },
  
  // Table (solid wooden block) - STEP 1
  table: {
    width: 12.0,      // 12m wide (increased prominence)
    height: 3.0,      // 3m tall (more imposing)
    depth: 1.0,
    offsetZ: -0.5,    // Position in front of chair
    color: 0x8B5A2B,  // Wood color
  },
  
  // Screen on table
  screen: {
    width: 0.5,
    height: 0.4,
    thickness: 0.05,
    offsetY: 0.3,     // Above table top
    color: 0x111111,
  },
  
  // Staircases (left and right) - STEPS 3 & 4
  stairs: {
    stepCount: 5,          // 5 steps to reach 2.25m platform
    stepHeight: 0.45,      // 0.45m per step (5 × 0.45 = 2.25m)
    stepDepth: 0.8,        // 0.8m deep (comfortable step size)
    stairWidth: 2.0,       // 2m wide stairs
    leftStartX: -6.0,      // Left staircase starts at left edge of wider table (12m)
    rightStartX: 6.0,      // Right staircase starts at right edge of wider table (12m)
    offsetZ: 1.5,          // Same Z as platform center
    color: 0x654321,       // Same color as platform
  },
  
  // Speaker's chair
  chair: {
    seatWidth: 0.7,
    seatDepth: 0.7,
    seatHeight: 0.45,
    seatThickness: 0.15,
    
    backrestWidth: 0.9,
    backrestHeight: 1.2,
    backrestThickness: 0.1,
    
    armrestWidth: 0.12,
    armrestHeight: 0.35,
    armrestDepth: 0.5,
    
    baseWidth: 0.9,
    baseDepth: 0.8,
    baseHeight: 0.12,
    
    pedestalWidth: 0.75,
    pedestalDepth: 0.7,
    pedestalHeight: 0.25,
    
    offsetZ: 0.6,     // Chair behind table (0.6m behind table back edge)
    
    fabricColor: 0x008080,
    woodColor: 0x8B5A2B,
  }
};

const SpeakerDais = React.memo(function SpeakerDais() {
  const c = DAIS_CONFIG;
  const chair = c.chair;
  
  return (
    <group position={c.position} rotation={c.rotation}>
      
      {/* ========================================
          CHAIR PLATFORM (Elevated Dais) - STEP 2
          Height: 2.0m (below table top at 2.5m)
          Chair sits on this platform
          ======================================== */}
      <mesh position={[0, c.chairPlatform.height / 2, c.chairPlatform.offsetZ]}>
        <boxGeometry args={[c.chairPlatform.width, c.chairPlatform.height, c.chairPlatform.depth]} />
        <meshStandardMaterial 
          color={c.chairPlatform.color} 
          roughness={0.5} 
          metalness={0.1} 
        />
      </mesh>
      
      {/* ========================================
          TABLE (Solid Wooden Block) - STEP 1
          Height: 2.5m (slightly above Row 5's 1.6m)
          No legs, just a solid wood block on ground
          ======================================== */}
      <mesh position={[0, c.table.height / 2, c.table.offsetZ]}>
        <boxGeometry args={[c.table.width, c.table.height, c.table.depth]} />
        <meshStandardMaterial 
          color={c.table.color} 
          roughness={0.4} 
          metalness={0.1} 
        />
      </mesh>
      
      {/* Screen on table */}
      <mesh position={[
        0,
        c.table.height + c.screen.offsetY,
        c.table.offsetZ
      ]}>
        <boxGeometry args={[c.screen.width, c.screen.height, c.screen.thickness]} />
        <meshStandardMaterial color={c.screen.color} roughness={0.2} metalness={0.0} />
      </mesh>
      
      {/* ========================================
          STAIRCASES - STEPS 3 & 4
          Steps extend along platform depth (Z direction)
          Visible as incline from assembly view
          ======================================== */}
      {/* Left Staircase (GROUNDED - like tiered platforms) */}
      {Array.from({ length: c.stairs.stepCount }).map((_, stepIndex) => {
        const stepNum = c.stairs.stepCount - stepIndex; // 4, 3, 2, 1 (reversed!)
        const totalStepHeight = stepNum * c.stairs.stepHeight; // 2.0, 1.5, 1.0, 0.5 (from ground)
        
        // Steps extend along platform depth (match platform Z range)
        const stepDepth = c.chairPlatform.depth; // Full depth of platform (3m)
        const stepZ = c.chairPlatform.offsetZ; // Same Z center as platform
        
        return (
          <mesh
            key={`left-step-${stepNum}`}
            position={[
              -c.chairPlatform.width / 2 - (stepIndex + 0.5) * c.stairs.stepDepth, // X: extend outward
              totalStepHeight / 2,                                                   // Y: center (grounded at Y=0)
              stepZ                                                                  // Z: along platform
            ]}
          >
            <boxGeometry args={[c.stairs.stepDepth, totalStepHeight, stepDepth]} />
            <meshStandardMaterial 
              color={c.stairs.color} 
              roughness={0.5} 
              metalness={0.1} 
            />
          </mesh>
        );
      })}
      
      {/* Right Staircase (GROUNDED - like tiered platforms) */}
      {Array.from({ length: c.stairs.stepCount }).map((_, stepIndex) => {
        const stepNum = c.stairs.stepCount - stepIndex; // 4, 3, 2, 1 (reversed!)
        const totalStepHeight = stepNum * c.stairs.stepHeight; // 2.0, 1.5, 1.0, 0.5 (from ground)
        
        // Steps extend along platform depth (match platform Z range)
        const stepDepth = c.chairPlatform.depth; // Full depth of platform (3m)
        const stepZ = c.chairPlatform.offsetZ; // Same Z center as platform
        
        return (
          <mesh
            key={`right-step-${stepNum}`}
            position={[
              c.chairPlatform.width / 2 + (stepIndex + 0.5) * c.stairs.stepDepth, // X: extend outward
              totalStepHeight / 2,                                                  // Y: center (grounded at Y=0)
              stepZ                                                                 // Z: along platform
            ]}
          >
            <boxGeometry args={[c.stairs.stepDepth, totalStepHeight, stepDepth]} />
            <meshStandardMaterial 
              color={c.stairs.color} 
              roughness={0.5} 
              metalness={0.1} 
            />
          </mesh>
        );
      })}
      
      {/* ========================================
          SPEAKER'S CHAIR
          Now positioned on top of elevated platform (Y=2.25m)
          Uses chair.offsetZ for proper gap from table
          ======================================== */}
      <group position={[0, c.chairPlatform.height, c.chair.offsetZ]} rotation={[0, Math.PI, 0]}>
        
        {/* Base plinth */}
        <mesh position={[0, chair.baseHeight / 2, 0]}>
          <boxGeometry args={[chair.baseWidth, chair.baseHeight, chair.baseDepth]} />
          <meshStandardMaterial color={chair.woodColor} roughness={0.4} metalness={0.1} />
        </mesh>
        
        {/* Pedestal */}
        <mesh position={[0, chair.baseHeight + chair.pedestalHeight / 2, 0]}>
          <boxGeometry args={[chair.pedestalWidth, chair.pedestalHeight, chair.pedestalDepth]} />
          <meshStandardMaterial color={chair.woodColor} roughness={0.4} metalness={0.1} />
        </mesh>
        
        {/* Seat cushion */}
        <mesh position={[0, chair.baseHeight + chair.pedestalHeight + chair.seatThickness / 2, 0]}>
          <boxGeometry args={[chair.seatWidth, chair.seatThickness, chair.seatDepth]} />
          <meshStandardMaterial color={chair.fabricColor} roughness={0.9} metalness={0.0} />
        </mesh>
        
        {/* Backrest */}
        <mesh position={[
          0,
          chair.baseHeight + chair.pedestalHeight + chair.seatThickness + chair.backrestHeight / 2,
          -chair.seatDepth / 2 + chair.backrestThickness / 2
        ]}>
          <boxGeometry args={[chair.backrestWidth, chair.backrestHeight, chair.backrestThickness]} />
          <meshStandardMaterial color={chair.fabricColor} roughness={0.9} metalness={0.0} />
        </mesh>
        
        {/* Left armrest */}
        <mesh position={[
          -chair.seatWidth / 2 - chair.armrestWidth / 2,
          chair.baseHeight + chair.pedestalHeight + chair.seatThickness + chair.armrestHeight / 2,
          0
        ]}>
          <boxGeometry args={[chair.armrestWidth, chair.armrestHeight, chair.armrestDepth]} />
          <meshStandardMaterial color={chair.woodColor} roughness={0.4} metalness={0.1} />
        </mesh>
        
        {/* Right armrest */}
        <mesh position={[
          chair.seatWidth / 2 + chair.armrestWidth / 2,
          chair.baseHeight + chair.pedestalHeight + chair.seatThickness + chair.armrestHeight / 2,
          0
        ]}>
          <boxGeometry args={[chair.armrestWidth, chair.armrestHeight, chair.armrestDepth]} />
          <meshStandardMaterial color={chair.woodColor} roughness={0.4} metalness={0.1} />
        </mesh>
        
        {/* Headrest trim on top of backrest */}
        <mesh position={[
          0,
          chair.baseHeight + chair.pedestalHeight + chair.seatThickness + chair.backrestHeight + 0.05,
          -chair.seatDepth / 2 + chair.backrestThickness / 2
        ]}>
          <boxGeometry args={[chair.backrestWidth + 0.1, 0.1, chair.backrestThickness + 0.05]} />
          <meshStandardMaterial color={chair.woodColor} roughness={0.4} metalness={0.1} />
        </mesh>
        
      </group>
      
    </group>
  );
});

export default SpeakerDais;
