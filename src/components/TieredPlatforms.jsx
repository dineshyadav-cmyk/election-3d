import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PERIMETER_RADIUS } from '../config/camera';

// Each tier is a SOLID BLOCK from ground up to its height
// Platform dimensions: Cover ENTIRE row area (desks + chairs + walking space)
// Each platform extends from slightly BEFORE the row furniture to well AFTER it
// START_RADIUS=16.0, ROW_SPACING=3.5, BENCH_DEPTH=1.4, CHAIR_ELEVATION_STEP=0.4
// 
// CRITICAL: Platforms must be SHORTER than elevation height so furniture sits ON TOP
// Row elevations: 0.0, 0.4, 0.8, 1.2, 1.6
// Platform heights: 5cm gap below elevation, so furniture rests on the platform surface
//
// SPECIAL CASE - Row 1: Since elevation is 0.0m, we position it differently
// Platform extends DOWN from Y=-0.05 to create a raised surface at ground level
// Platform dimensions calculated from AssemblyLayoutV2 furniture positions:
// START_RADIUS=16.0, ROW_SPACING=3.5, BENCH_DEPTH=1.4
// 
// CRITICAL: Platform must support ALL furniture (desk + chairs + walking space)
// For each row:
//   - Desk center at: START_RADIUS + rowIdx * ROW_SPACING
//   - Desk FRONT edge at: deskCenter - BENCH_DEPTH/2 = deskCenter - 0.7
//   - Platform starts at DESK FRONT (entire furniture sits on platform)
//   - Platform extends to just before next row's desk front
const TIERS = [
  // Row 1: Desk center 16.0m, DESK FRONT at 15.3m
  // Platform: 15.3m (desk front) to 18.8m (before Row 2 desk front at 19.5-0.7)
  { innerR: 15.3, outerR: 18.8, height: 0.3, yOffset: 0.3 },
  
  // Row 2: Desk center 19.5m, DESK FRONT at 18.8m
  // Platform: 18.8m (desk front) to 22.3m (before Row 3 desk front at 23.0-0.7)
  { innerR: 18.8, outerR: 22.3, height: 0.7, yOffset: 0.7 },
  
  // Row 3: Desk center 23.0m, DESK FRONT at 22.3m
  // Platform: 22.3m (desk front) to 25.8m (before Row 4 desk front at 26.5-0.7)
  { innerR: 22.3, outerR: 25.8, height: 1.1, yOffset: 1.1 },
  
  // Row 4: Desk center 26.5m, DESK FRONT at 25.8m
  // Platform: 25.8m (desk front) to 29.3m (before Row 5 desk front at 30.0-0.7)
  { innerR: 25.8, outerR: 29.3, height: 1.5, yOffset: 1.5 },
  
  // Row 5: Desk center 30.0m, DESK FRONT at 29.3m
  // Platform: 29.3m (desk front) to end of seating area
  { innerR: 29.3, outerR: 35.0, height: 1.9, yOffset: 1.9 },
  
  // Row 5 Extension: Gallery walkway from seating area to perimeter wall
  // ONLY extends the back semicircle arc (not the sides near Spoke 1/6)
  // Dynamic: automatically adjusts when PERIMETER_RADIUS changes
  { innerR: 35.0, outerR: PERIMETER_RADIUS, height: 1.9, yOffset: 1.9 },
];

const START_ANGLE = 0;
const END_ANGLE = Math.PI;
const PLATFORM_COLOR = 0x654321;

const TieredPlatforms = React.memo(function TieredPlatforms() {
  return (
    <group>
      {TIERS.map((tier, idx) => (
        <SolidTierBlock
          key={`tier-${idx}`}
          innerRadius={tier.innerR}
          outerRadius={tier.outerR}
          height={tier.height}
          yOffset={tier.yOffset}
          startAngle={START_ANGLE}
          endAngle={END_ANGLE}
          color={PLATFORM_COLOR}
        />
      ))}
    </group>
  );
});

// Creates a SOLID extruded semicircular ring from ground (Y=0) up to height
const SolidTierBlock = ({ innerRadius, outerRadius, height, yOffset, startAngle, endAngle, color }) => {
  const geometry = useMemo(() => {
    // Create semicircular ring shape
    const shape = new THREE.Shape();
    const segments = 64;
    const angleStep = (endAngle - startAngle) / segments;
    
    // Start at inner radius, start angle
    let angle = startAngle;
    shape.moveTo(
      innerRadius * Math.cos(angle),
      innerRadius * Math.sin(angle)
    );
    
    // Draw inner arc
    for (let i = 1; i <= segments; i++) {
      angle = startAngle + i * angleStep;
      shape.lineTo(
        innerRadius * Math.cos(angle),
        innerRadius * Math.sin(angle)
      );
    }
    
    // Draw radial line to outer radius
    shape.lineTo(
      outerRadius * Math.cos(endAngle),
      outerRadius * Math.sin(endAngle)
    );
    
    // Draw outer arc backwards
    for (let i = segments - 1; i >= 0; i--) {
      angle = startAngle + i * angleStep;
      shape.lineTo(
        outerRadius * Math.cos(angle),
        outerRadius * Math.sin(angle)
      );
    }
    
    // Close back to start
    shape.lineTo(
      innerRadius * Math.cos(startAngle),
      innerRadius * Math.sin(startAngle)
    );
    
    // Extrude UP to create solid block
    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [innerRadius, outerRadius, height, startAngle, endAngle]);

  return (
    <mesh 
      geometry={geometry}
      rotation={[Math.PI / 2, 0, 0]}   // Rotate +90° around X: Z-axis becomes +Y-axis
      position={[0, yOffset, 0]}        // Position platform top at yOffset
    >
      <meshStandardMaterial 
        color={color} 
        roughness={0.8} 
        metalness={0.1}
        side={THREE.DoubleSide}         // Visible from both sides
      />
    </mesh>
  );
};

export default TieredPlatforms;
