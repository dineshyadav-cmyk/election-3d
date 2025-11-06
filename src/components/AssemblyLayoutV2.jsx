import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createMergedChairGeometries, createFabricMaterial, createWoodMaterial } from './ParliamentChair/ParliamentChairBlueprint';
// Removed SeatHolograms & single-seat prototype after full faces layer rollout
import SeatFacesLayer from './SeatFacesLayer'; // Multi-seat faces layer
import LeaderPillar from './LeaderPillar';
import { DESIGN_CONFIG, getMaterialColor } from '../config/designConfig';

/**
 * DESIGN SYSTEM: Centralized Configuration
 * ========================================
 * All visual styling is now controlled through DESIGN_CONFIG in designConfig.js:
 * 
 * - Wood colors: DESIGN_CONFIG.partyColorMode.applyToWood
 * - Cushion colors: DESIGN_CONFIG.partyColorMode.applyToCushions  
 * - Bench colors: DESIGN_CONFIG.partyColorMode.applyToBenches
 * 
 * Party colors are always grouped per color for rendering efficiency.
 * Traditional appearance is achieved by disabling party colors in DESIGN_CONFIG.
 */

/**
 * AssemblyLayoutV2
 * ---------------------------------------------------------------------------
 * RESPONSIBILITY (Plain English for PMs):
 *   Places all 243 Bihar Assembly seats in 6 logical arcs (internally referred
 *   to here as spokes S1,S2,C-R (central right half), C-L (central left half),
 *   S5,S6). The order in which we PUSH seats (and therefore the global seat
 *   indices used elsewhere) is:
 *     0–49   : Spoke S1  (50 seats)
 *     50–99  : Spoke S2  (50 seats)
 *     100–121: Central Right (22 seats)  -> NDA block per current strategy
 *     122–142: Central Left  (21 seats)  -> INDIA block continuation
 *     143–192: Spoke S5  (50 seats)
 *     193–242: Spoke S6  (50 seats)
 *   This EXACT ordering is depended on by `seatBlocks.js` when allocating
 *   seat indices to alliances. If layout push order ever changes, that mapping
 *   must be updated in sync.
 *
 * PERFORMANCE NOTES:
 *   - All chair instances share two merged geometries (wood + fabric) so only
 *     TWO draw calls render all seats (plus benches & holograms).
 *   - Benches and seat transforms are computed once (empty dependency array).
 *
 * EXTERNAL INPUTS:
 *   seatHexColors[] : (optional) array of per-seat hex colors (wins / leads)
 *   leaderSeatIndex : (optional) index of seat to show leader pillar above
 *   leaderFaceSrc   : (optional) face image for leader pillar panel
 *
 * NOT USED / REMOVED: Unused legacy props (seatColors, snapshotIndex) removed
 *   to avoid confusion.
 * ---------------------------------------------------------------------------
 */
function AssemblyLayoutV2({ seatHexColors, leaderSeatIndex = null, leaderFaceSrc = '/images/leader.png', onSeatMatricesReady, expandedSeat = null, onRequestExpand, seatImageSources, constituencyData }) {
  // New balanced seat distribution: 243 seats total
  const SPOKE_SEAT_TOTALS = [40, 40, 42, 41, 40, 40];

  const ROWS_PER_SPOKE = [
    [6, 7, 8, 9, 10],  // Spoke 1: 40 seats
    [6, 7, 8, 9, 10],  // Spoke 2: 40 seats
    [6, 8, 9, 9, 10],  // Spoke 3: 42 seats
    [6, 7, 9, 9, 10],  // Spoke 4: 41 seats
    [6, 7, 8, 9, 10],  // Spoke 5: 40 seats
    [6, 7, 8, 9, 10],  // Spoke 6: 40 seats
  ];

  // Parallel walkways (fixed angular width)
  const WALKWAY_ANGULAR = 5 * Math.PI / 180; // 5 degrees

  // Validate total seats (243 expected)
  // eslint-disable-next-line no-unused-vars
  const totalSeats = ROWS_PER_SPOKE.reduce((total, spoke) => 
    total + spoke.reduce((a,b) => a+b, 0), 0
  );

  // Calculate FIXED spoke positions (same angles for all rows = parallel walkways)
  const calculateSpokePositions = () => {
    const totalWalkwayAngular = 5 * WALKWAY_ANGULAR; // 25 degrees total
    const availableForBenches = Math.PI - totalWalkwayAngular; // ~155 degrees for seats
    
    // Distribute bench space proportionally to spoke seat totals
    const spokeBenchSpans = SPOKE_SEAT_TOTALS.map(seats => 
      availableForBenches * (seats / 243)
    );
    
    // Calculate spoke edges and centers (FIXED ANGLES)
    let currentAngle = 0; // Start at 0°
    const positions = [];
    
    for (let s = 0; s < 6; s++) {
      const leftEdge = currentAngle;
      const rightEdge = currentAngle + spokeBenchSpans[s];
      const center = (leftEdge + rightEdge) / 2;
      
      positions.push({
        spokeIndex: s,
        leftEdge,
        rightEdge,
        center,
        angularSpan: spokeBenchSpans[s]
      });
      
      currentAngle = rightEdge + WALKWAY_ANGULAR; // Add 5° walkway gap
    }
    
    return positions;
  };

  const SPOKE_POSITIONS = calculateSpokePositions();

  // Layout dimensions
  const START_RADIUS = 16.0;
  const ROW_SPACING = 3.5;
  const BENCH_HEIGHT = 1.25;       // Desktop height: ~28cm above armrests (prominent parliamentary desk)
  const BENCH_DEPTH = 1.4;
  const CHAIR_BACK_OFFSET = 0.9;
  const SPEAKER_TARGET = new THREE.Vector3(0, 0, 0);

  // PLATFORM DIMENSIONS FOR EACH ROW (for reference)
  // These calculations are kept for documentation but not actively used
  // eslint-disable-next-line no-lone-blocks
  {
    // Platform dimension calculations moved to TieredPlatforms.jsx
    // Keeping this block as reference for future modifications
  }

  const { benches, woodMatrices, fabricMatrices} = useMemo(() => {
    const benchElems = [];
    const wood = [];
    const fabric = [];

    // Furniture elevations matching platform heights: 0.3, 0.7, 1.1, 1.5, 1.9
    const FURNITURE_ELEVATIONS = [0.3, 0.7, 1.1, 1.5, 1.9];

    // Helper function to get global seat index
    function getSeatIndexForSpoke(spokeIdx, rowIdx) {
      let index = 0;
      for (let s = 0; s < spokeIdx; s++) {
        for (let r = 0; r < 5; r++) {
          index += ROWS_PER_SPOKE[s][r];
        }
      }
      for (let r = 0; r < rowIdx; r++) {
        index += ROWS_PER_SPOKE[spokeIdx][r];
      }
      return index;
    }

    // Helper function to get global seat index including seat position in row
    function getSeatIndexForSeat(spokeIdx, rowIdx, seatIdx) {
      let index = getSeatIndexForSpoke(spokeIdx, rowIdx);
      index += seatIdx;
      return index;
    }

    // For each spoke and row, create benches and seats
    for (let spokeIdx = 0; spokeIdx < 6; spokeIdx++) {
      const spokePos = SPOKE_POSITIONS[spokeIdx];
      
      for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
      const radius = START_RADIUS + rowIdx * ROW_SPACING;
        const seatsInRow = ROWS_PER_SPOKE[spokeIdx][rowIdx];
        
        // Bench positioning (use fixed spoke center and span)
        const benchCenter = spokePos.center;
        const benchSpan = spokePos.angularSpan;
        const benchHalfSpan = benchSpan / 2;
        
        // Create realistic 3D desk geometry (not a flat slab)
        const DESK_THICKNESS = 0.08;  // 8cm thick desktop
        const DESK_PANEL_HEIGHT = BENCH_HEIGHT - DESK_THICKNESS;  // Front panel height

        // 1. DESKTOP SURFACE (top flat surface)
        const desktopSegments = 48;
        const desktopVertices = [];
        const desktopIndices = [];

        for (let i = 0; i <= desktopSegments; i++) {
          const t = i / desktopSegments;
          const angle = benchCenter - benchHalfSpan + t * benchSpan;
          
          const innerRadius = radius - BENCH_DEPTH / 2;
          const outerRadius = radius + BENCH_DEPTH / 2;
          
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          
          // Top surface vertices
          const xInner = innerRadius * cos;
          const zInner = innerRadius * sin;
          const xOuter = outerRadius * cos;
          const zOuter = outerRadius * sin;
          
          const topY = BENCH_HEIGHT - DESK_THICKNESS;
          
          desktopVertices.push(
            xInner, topY, zInner,
            xOuter, topY, zOuter,
            xInner, topY + DESK_THICKNESS, zInner,
            xOuter, topY + DESK_THICKNESS, zOuter
          );
          
          if (i < desktopSegments) {
            const base = i * 4;
            const next = (i + 1) * 4;
            
            // Top face
            desktopIndices.push(base + 2, next + 2, base + 3);
            desktopIndices.push(base + 3, next + 2, next + 3);
            
            // Outer edge (rounded lip)
            desktopIndices.push(base + 1, next + 1, base + 3);
            desktopIndices.push(base + 3, next + 1, next + 3);
            
            // Inner edge
            desktopIndices.push(base + 0, base + 2, next + 0);
            desktopIndices.push(next + 0, base + 2, next + 2);
            
            // Bottom
            desktopIndices.push(base + 0, next + 0, base + 1);
            desktopIndices.push(base + 1, next + 0, next + 1);
          }
        }

        const desktopGeometry = new THREE.BufferGeometry();
        desktopGeometry.setAttribute('position', new THREE.Float32BufferAttribute(desktopVertices, 3));
        desktopGeometry.setIndex(desktopIndices);
        desktopGeometry.computeVertexNormals();

        // 2. FRONT PANEL (INNER RADIUS - visible from speaker's position) - platform top to desktop
        const frontPanelVertices = [];
        const frontPanelIndices = [];
        const frontRadius = radius - BENCH_DEPTH / 2 + 0.02; // INNER edge (facing speaker) - slightly inset

        for (let i = 0; i <= desktopSegments; i++) {
          const t = i / desktopSegments;
          const angle = benchCenter - benchHalfSpan + t * benchSpan;
          
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          
          const x = frontRadius * cos;
          const z = frontRadius * sin;
          
          frontPanelVertices.push(
            x, 0, z,                    // Bottom at platform top (local Y=0)
            x, DESK_PANEL_HEIGHT, z     // Top at desktop bottom
          );
          
          if (i < desktopSegments) {
            const base = i * 2;
            const next = (i + 1) * 2;
            
            frontPanelIndices.push(base, next, base + 1);
            frontPanelIndices.push(base + 1, next, next + 1);
          }
        }

        const frontPanelGeometry = new THREE.BufferGeometry();
        frontPanelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(frontPanelVertices, 3));
        frontPanelGeometry.setIndex(frontPanelIndices);
        frontPanelGeometry.computeVertexNormals();

        // 2B. BACK PANEL (continuous panel along back edge)
        const backPanelVertices = [];
        const backPanelIndices = [];
        const backRadius = radius - BENCH_DEPTH / 2 + 0.02; // Slightly inset from back

        for (let i = 0; i <= desktopSegments; i++) {
          const t = i / desktopSegments;
          const angle = benchCenter - benchHalfSpan + t * benchSpan;
          
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          
          const x = backRadius * cos;
          const z = backRadius * sin;
          
          backPanelVertices.push(
            x, 0, z,
            x, DESK_PANEL_HEIGHT, z
          );
          
          if (i < desktopSegments) {
            const base = i * 2;
            const next = (i + 1) * 2;
            
            // Reverse winding for back face
            backPanelIndices.push(base, base + 1, next);
            backPanelIndices.push(base + 1, next + 1, next);
          }
        }

        const backPanelGeometry = new THREE.BufferGeometry();
        backPanelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(backPanelVertices, 3));
        backPanelGeometry.setIndex(backPanelIndices);
        backPanelGeometry.computeVertexNormals();

        // 3. SIDE SUPPORTS (left and right ends)
        const leftAngle = benchCenter - benchHalfSpan;
        const rightAngle = benchCenter + benchHalfSpan;

        function createSideSupport(angle) {
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          
          const innerR = radius - BENCH_DEPTH / 2;
          const outerR = radius + BENCH_DEPTH / 2;
          
          const bottomY = 0;
          const topY = BENCH_HEIGHT - DESK_THICKNESS;
          
          const vertices = new Float32Array([
            // Bottom face (at ground)
            innerR * cos, bottomY, innerR * sin,  // Vertex 0: inner bottom
            outerR * cos, bottomY, outerR * sin,  // Vertex 1: outer bottom
            // Top face (at desktop bottom)
            innerR * cos, topY, innerR * sin,     // Vertex 2: inner top
            outerR * cos, topY, outerR * sin,     // Vertex 3: outer top
          ]);
          
          const indices = [
            0, 1, 2,  2, 1, 3,  // Front face (2 triangles)
            2, 1, 0,  3, 1, 2,  // Back face (2 triangles, correct winding)
          ];
          
          const geom = new THREE.BufferGeometry();
          geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geom.setIndex(indices);
          geom.computeVertexNormals();
          return geom;
        }

        const leftSupportGeometry = createSideSupport(leftAngle);
        const rightSupportGeometry = createSideSupport(rightAngle);

        // Bench color using centralized config
        const seatIndex = getSeatIndexForSpoke(spokeIdx, rowIdx);
        const partyColor = seatHexColors && seatIndex < seatHexColors.length ? seatHexColors[seatIndex] : null;
        const deskColor = getMaterialColor('bench', partyColor);
        
        // individual mousepads for each seat
        const mousepadMeshes = [];
        if (DESIGN_CONFIG.mousepad.enabled) {
          const halfSize = DESIGN_CONFIG.mousepad.size / 2;
          const mousepadY = BENCH_HEIGHT + DESIGN_CONFIG.mousepad.thickness / 2; // Sits on top of desktop
          
          // mousepad positions
          const seatAngularSpacing = benchSpan / seatsInRow;
          
          for (let seatIdx = 0; seatIdx < seatsInRow; seatIdx++) {
            // seat angle
            const seatAngle = benchCenter - benchHalfSpan + (seatIdx + 0.5) * seatAngularSpacing;
            
            const mousepadRadius = radius + BENCH_DEPTH * 0.3; // 30% towards the outer edge ( to be modified )
            const centerX = mousepadRadius * Math.cos(seatAngle);
            const centerZ = mousepadRadius * Math.sin(seatAngle);
            
            // square vertices
            const mousepadVertices = [
              // bottom face
              centerX - halfSize, mousepadY - DESIGN_CONFIG.mousepad.thickness / 2, centerZ - halfSize,
              centerX + halfSize, mousepadY - DESIGN_CONFIG.mousepad.thickness / 2, centerZ - halfSize,
              centerX + halfSize, mousepadY - DESIGN_CONFIG.mousepad.thickness / 2, centerZ + halfSize,
              centerX - halfSize, mousepadY - DESIGN_CONFIG.mousepad.thickness / 2, centerZ + halfSize,
              
              // top face
              centerX - halfSize, mousepadY + DESIGN_CONFIG.mousepad.thickness / 2, centerZ - halfSize,
              centerX + halfSize, mousepadY + DESIGN_CONFIG.mousepad.thickness / 2, centerZ - halfSize,
              centerX + halfSize, mousepadY + DESIGN_CONFIG.mousepad.thickness / 2, centerZ + halfSize,
              centerX - halfSize, mousepadY + DESIGN_CONFIG.mousepad.thickness / 2, centerZ + halfSize,
            ];
            
            const mousepadIndices = [
              // top face
              4, 5, 6,  4, 6, 7,
              // bottom face
              0, 2, 1,  0, 3, 2,
              // side faces
              0, 1, 5,  0, 5, 4,  // front
              2, 3, 7,  2, 7, 6,  // back
              3, 0, 4,  3, 4, 7,  // left
              1, 2, 6,  1, 6, 5,  // right
            ];

            const mousepadGeometry = new THREE.BufferGeometry();
            mousepadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(mousepadVertices, 3));
            mousepadGeometry.setIndex(mousepadIndices);
            mousepadGeometry.computeVertexNormals();
            
            // Get seat color for this mousepad
            const globalSeatIndex = getSeatIndexForSeat(spokeIdx, rowIdx, seatIdx);
            const mousepadColor = (seatHexColors && seatHexColors[globalSeatIndex]) || DESIGN_CONFIG.mousepad.color;
            
            // mousepad mesh 
            mousepadMeshes.push(
              <mesh 
                key={`S${spokeIdx}-R${rowIdx}-mousepad-${seatIdx}`}
                position={[0, FURNITURE_ELEVATIONS[rowIdx], 0]}
                geometry={mousepadGeometry}
              >
                <meshStandardMaterial 
                  color={mousepadColor}
                  roughness={DESIGN_CONFIG.mousepad.roughness} 
                  metalness={DESIGN_CONFIG.mousepad.metalness}
                />
              </mesh>
            );
          }
        }

        // Create desk meshes
        benchElems.push(
          <mesh 
            key={`S${spokeIdx}-R${rowIdx}-desktop`}
            position={[0, FURNITURE_ELEVATIONS[rowIdx], 0]}
            geometry={desktopGeometry}
          >
            <meshStandardMaterial 
              color={deskColor} 
              roughness={DESIGN_CONFIG.wood.roughness} 
              metalness={DESIGN_CONFIG.wood.metalness}
            />
          </mesh>,
          
          // Add individual mousepads for each seat
          ...mousepadMeshes,
          <mesh 
            key={`S${spokeIdx}-R${rowIdx}-panel`}
            position={[0, FURNITURE_ELEVATIONS[rowIdx], 0]}
            geometry={frontPanelGeometry}
          >
            <meshStandardMaterial 
              color={deskColor} 
              roughness={DESIGN_CONFIG.wood.roughness} 
              metalness={DESIGN_CONFIG.wood.metalness}
            />
          </mesh>,
          <mesh 
            key={`S${spokeIdx}-R${rowIdx}-left`}
            position={[0, FURNITURE_ELEVATIONS[rowIdx], 0]}
            geometry={leftSupportGeometry}
          >
            <meshStandardMaterial 
              color={deskColor}
              roughness={DESIGN_CONFIG.wood.roughness} 
              metalness={DESIGN_CONFIG.wood.metalness}
            />
          </mesh>,
          <mesh 
            key={`S${spokeIdx}-R${rowIdx}-right`}
            position={[0, FURNITURE_ELEVATIONS[rowIdx], 0]}
            geometry={rightSupportGeometry}
          >
            <meshStandardMaterial 
              color={deskColor}
              roughness={DESIGN_CONFIG.wood.roughness} 
              metalness={DESIGN_CONFIG.wood.metalness}
            />
          </mesh>,
          <mesh 
            key={`S${spokeIdx}-R${rowIdx}-back`}
            position={[0, FURNITURE_ELEVATIONS[rowIdx], 0]}
            geometry={backPanelGeometry}
          >
            <meshStandardMaterial 
              color={deskColor} 
              roughness={DESIGN_CONFIG.wood.roughness} 
              metalness={DESIGN_CONFIG.wood.metalness}
            />
          </mesh>
        );

        // Seat positioning (distribute evenly within bench span)
      const seatRadius = radius + BENCH_DEPTH / 2 + CHAIR_BACK_OFFSET;
        const seatAngularSpacing = benchSpan / seatsInRow;
        
        for (let i = 0; i < seatsInRow; i++) {
          const ang = benchCenter - benchHalfSpan + (i + 0.5) * seatAngularSpacing;
        const x = seatRadius * Math.cos(ang);
        const z = seatRadius * Math.sin(ang);
        const y = FURNITURE_ELEVATIONS[rowIdx];
        const yaw = Math.atan2(SPEAKER_TARGET.x - x, SPEAKER_TARGET.z - z);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
        const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
  wood.push(m.clone());
  fabric.push(m.clone());
      }
      }
    }

  return { benches: benchElems, woodMatrices: wood, fabricMatrices: fabric };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seatHexColors]); // Only recompute if colors change (SPOKE_POSITIONS, ROWS_PER_SPOKE are constants)

  const { woodGeometry, fabricGeometry } = useMemo(() => createMergedChairGeometries(), []); // executed once
  
  /**
   * PARTY COLOR GROUPING SYSTEM
   * ===========================
   * Seats are grouped by party color for efficient rendering.
   * Instead of one InstancedMesh per material type, we create multiple
   * InstancedMeshes - one per unique party color.
   * 
   * Benefits:
   * - Each color gets its own InstancedMesh (typically 5-10 total)
   * - No per-instance material updates (better performance)
   * - Easy to add/remove parties without affecting others
   * - Material appearance controlled by DESIGN_CONFIG
   */
  
  // Reference maps to store InstancedMesh refs for each party color
  const partyFabricRefs = useRef(new Map()); // Map<hexColor, InstancedMesh>
  const partyWoodRefs = useRef(new Map()); // Map<hexColor, InstancedMesh>
  
  /**
   * FABRIC GROUPING: Groups seat fabric parts (cushion + backrest) by party color
   * Creates one group per unique party color, each with its own material
   * Material creation respects DESIGN_CONFIG.partyColorMode.applyToCushions
   */
  const partyFabricGroups = useMemo(() => {
    if (!fabricMatrices.length) return [];
    
    const groups = new Map();
    
    // Iterate through all fabric matrices and group by party color
    for (let i = 0; i < fabricMatrices.length; i += 1) {
      // Get party color for this seat (default to gray if undefined)
      const hexColor = (seatHexColors && seatHexColors[i]) || '#777777';
      
      // Create group for this color if it doesn't exist
      if (!groups.has(hexColor)) {
        groups.set(hexColor, []);
      }
      
      // Add this seat's matrix to the appropriate color group
      groups.get(hexColor).push({ matrix: fabricMatrices[i], index: i });
    }
    
    // Convert Map to array of objects for rendering
    return Array.from(groups.entries()).map(([hexColor, items]) => ({
      hexColor,                                    // Party color (e.g., '#FFB347')
      matrices: items.map(item => item.matrix),    // All matrices for this color
      indices: items.map(item => item.index),      // Original seat indices
      material: createFabricMaterial(hexColor)     // Respects DESIGN_CONFIG
    }));
  }, [fabricMatrices, seatHexColors]);
  
  /**
   * WOOD GROUPING: Groups seat wood parts (plinth, pedestal, armrests, head trim) by party color
   * Same logic as fabric grouping but for wood components
   * Material creation respects DESIGN_CONFIG.partyColorMode.applyToWood
   */
  const partyWoodGroups = useMemo(() => {
    if (!woodMatrices.length) return [];
    
    const groups = new Map();
    
    // Iterate through all wood matrices and group by party color
    for (let i = 0; i < woodMatrices.length; i += 1) {
      // Get party color for this seat (default to gray if undefined)
      const hexColor = (seatHexColors && seatHexColors[i]) || '#777777';
      
      // Create group for this color if it doesn't exist
      if (!groups.has(hexColor)) {
        groups.set(hexColor, []);
      }
      
      // Add this seat's matrix to the appropriate color group
      groups.get(hexColor).push({ matrix: woodMatrices[i], index: i });
    }
    
    // Convert Map to array of objects for rendering
    return Array.from(groups.entries()).map(([hexColor, items]) => ({
      hexColor,                                    // Party color (e.g., '#FFB347')
      matrices: items.map(item => item.matrix),    // All matrices for this color
      indices: items.map(item => item.index),      // Original seat indices
      material: createWoodMaterial(hexColor)       // Respects DESIGN_CONFIG
    }));
  }, [woodMatrices, seatHexColors]);

  // onSeatMatricesReady intentionally excluded from deps to avoid re-running on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
      // Update party-colored fabric meshes
      partyFabricGroups.forEach(({ hexColor, matrices }) => {
        const ref = partyFabricRefs.current.get(hexColor);
        if (ref && matrices.length) {
          for (let i = 0; i < matrices.length; i += 1) {
            ref.setMatrixAt(i, matrices[i]);
          }
          ref.instanceMatrix.needsUpdate = true;
        }
      });
      
      // Update party-colored wood meshes
      partyWoodGroups.forEach(({ hexColor, matrices }) => {
        const ref = partyWoodRefs.current.get(hexColor);
        if (ref && matrices.length) {
          for (let i = 0; i < matrices.length; i += 1) {
            ref.setMatrixAt(i, matrices[i]);
          }
          ref.instanceMatrix.needsUpdate = true;
        }
      });
    
    if (onSeatMatricesReady) onSeatMatricesReady(fabricMatrices);
  }, [woodMatrices, fabricMatrices, partyFabricGroups, partyWoodGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract leader matrix if requested and exists
  let leaderMatrix = null;
  if (leaderSeatIndex != null && fabricMatrices[leaderSeatIndex]) leaderMatrix = fabricMatrices[leaderSeatIndex];

  return (
    <group>
      {benches}
      
      {/* 
        SEAT RENDERING SYSTEM
        ====================
        - Seats grouped by party color for efficient rendering
        - One InstancedMesh per unique color (typically 5-10 meshes total)
        - Material appearance controlled by DESIGN_CONFIG settings
      */}
      
          {/* Render one InstancedMesh per party color for wood parts */}
          {partyWoodGroups.map(({ hexColor, matrices, material }) => (
            <instancedMesh
              key={`wood-${hexColor}`}
              ref={(ref) => { if (ref) partyWoodRefs.current.set(hexColor, ref); }}
              args={[woodGeometry, material, matrices.length]}
              frustumCulled={false}
            />
          ))}
          
          {/* Render one InstancedMesh per party color for fabric parts */}
          {partyFabricGroups.map(({ hexColor, matrices, material }) => (
            <instancedMesh
              key={`fabric-${hexColor}`}
              ref={(ref) => { if (ref) partyFabricRefs.current.set(hexColor, ref); }}
              args={[fabricGeometry, material, matrices.length]}
              frustumCulled={false}
            />
          ))}
          
      {/* Leader photographs (always disabled holograms) */}
          {fabricMatrices.length > 0 && (
            <SeatFacesLayer
              matrices={fabricMatrices}
              seatHexColors={seatHexColors}
              imageSources={seatImageSources || ['/images/leader.png']}
              randomize={false}
              seed={20250904}
              expandedSeat={expandedSeat}
              constituencyData={constituencyData}
              onFaceClick={(idx, meta) => { if (onRequestExpand) onRequestExpand(idx, meta); }}
              disableHolograms={true}
            />
          )}
      
      {/* Leader pillar marker */}
  {leaderMatrix && (
    <LeaderPillar
      matrix={leaderMatrix}
      partyColor={(seatHexColors && seatHexColors[leaderSeatIndex]) || '#ffffff'}
      faceSrc={leaderFaceSrc}
    />
  )}
    </group>
  );
}

export default AssemblyLayoutV2;
