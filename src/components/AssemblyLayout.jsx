import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createMergedChairGeometries, WOOD_MATERIAL, FABRIC_MATERIAL } from './ParliamentChair/ParliamentChairBlueprint';
// Removed SeatHolograms & single-seat prototype after full faces layer rollout
import SeatFacesLayer from './SeatFacesLayer'; // Multi-seat faces layer
import LeaderPillar from './LeaderPillar';

/**
 * AssemblyLayout
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
function AssemblyLayout({ seatHexColors, seatImageSources, leaderSeatIndex = null, leaderFaceSrc = '/images/leader.png', onSeatMatricesReady, expandedSeat = null, onRequestExpand, constituencyData }) {
  const ROWS_50 = [8, 9, 10, 11, 12];
  const ROWS_CENTER_LEFT = [3, 4, 4, 5, 5];
  const ROWS_CENTER_RIGHT = [4, 4, 5, 5, 4];

  // Headroom for walkways
  const START_RADIUS = 16.0;        // was 15.0
  const ROW_SPACING = 3.0;

  // Widen global spoke gaps
  const OUTER_GAP_DEG = 24;         // was 22
  const CENTER_GAP_DEG = 12;        // was 10

  const BENCH_HEIGHT = 1.2;
  const BENCH_DEPTH = 1.0;
  const SEGMENTS_PER_BENCH = 12;

  // Chair footprint
  const CHAIR_LINEAR_WIDTH = 0.6;
  const CHAIR_LINEAR_GAP = 0.55;    // was 0.4
  const CHAIR_END_MARGIN_LINEAR = 0.35; // linear end margin each side
  const EDGE_END_MARGIN_LINEAR = 0.2;   // extra for spokes 1 and 6
  const SEAT_EDGE_MARGIN_LINEAR = 0.05; // tiny clearance for chair vs aisle
  const CHAIR_BACK_OFFSET = 0.7;
  const CHAIR_ELEVATION_STEP = 0.4;

  // Uniform walkway targets (linear world units)
  const WALKWAY_LINEAR_OUTER = 2.2; // recommended
  const WALKWAY_LINEAR_CENTER = 1.6; // recommended

  const SPEAKER_TARGET = new THREE.Vector3(0, 0, 0);

  const CENTER_BASE_DEG = 90;
  const ang3 = CENTER_BASE_DEG - CENTER_GAP_DEG / 2;
  const ang4 = CENTER_BASE_DEG + CENTER_GAP_DEG / 2;
  const ang2 = ang3 - OUTER_GAP_DEG;
  const ang1 = ang2 - OUTER_GAP_DEG;
  const ang5 = ang4 + OUTER_GAP_DEG;
  const ang6 = ang5 + OUTER_GAP_DEG;

  const { benches, woodMatrices, fabricMatrices } = useMemo(() => {
    const benchElems = [];
    const wood = [];
    const fabric = [];
  // markerSeq (commented): sequential seat numbering counter formerly used for rendering
  // numeric overlays above seats. Restore by uncommenting and increment within pushRow.
  // let markerSeq = 1;

    const centerAnglesDeg = [ang1, ang2, ang3, ang4, ang5, ang6];
    const centerAnglesRad = centerAnglesDeg.map(d => (d * Math.PI) / 180);
    const seatRowsBySpoke = [ROWS_50, ROWS_50, ROWS_CENTER_RIGHT, ROWS_CENTER_LEFT, ROWS_50, ROWS_50];

  const seatSpan = Array.from({ length: 6 }, () => Array(5).fill(0));        // angular width occupied by chairs (radians)
  const seatSpanLinear = Array.from({ length: 6 }, () => Array(5).fill(0));  // same but linear units for clarity/debug
  const benchSpan = Array.from({ length: 6 }, () => Array(5).fill(0));       // adjustable bench (desk) angular span
  const minBenchSpan = Array.from({ length: 6 }, () => Array(5).fill(0));    // minimum bench span (when fully trimmed)

    for (let s = 0; s < 6; s += 1) {
      for (let r = 0; r < 5; r += 1) {
        const seats = seatRowsBySpoke[s][r];
        const radius = START_RADIUS + r * ROW_SPACING;
        const seatAngW = CHAIR_LINEAR_WIDTH / radius;
        const seatAngGap = CHAIR_LINEAR_GAP / radius;
        const total = seats * seatAngW + (seats - 1) * seatAngGap;
        seatSpan[s][r] = total;
        seatSpanLinear[s][r] = seats * CHAIR_LINEAR_WIDTH + (seats - 1) * CHAIR_LINEAR_GAP;
        const endMarginLinear = CHAIR_END_MARGIN_LINEAR + ((s === 0 || s === 5) ? EDGE_END_MARGIN_LINEAR : 0);
        const endMargin = endMarginLinear / radius;
        minBenchSpan[s][r] = total + 2 * endMargin;
        benchSpan[s][r] = minBenchSpan[s][r];
      }
    }

    

  // Walkway width logic (Plain English):
  //   We aim to keep consistent physical walkway widths (in meters) between
  //   neighboring spokes across ALL rows. First we try to TRIM benches where
  //   possible; if that can't create enough clearance we very slightly
  //   "fan out" the spoke centerlines for that row only.

    // Neighbor pair specs with desired linear walkway width (explicit targets)
    const pairSpecs = [
      { a: 0, b: 1, linear: WALKWAY_LINEAR_OUTER, allowFanout: true },
      { a: 1, b: 2, linear: WALKWAY_LINEAR_OUTER, allowFanout: true },
      { a: 2, b: 3, linear: WALKWAY_LINEAR_CENTER, allowFanout: true },
      { a: 3, b: 4, linear: WALKWAY_LINEAR_OUTER, allowFanout: true },
      { a: 4, b: 5, linear: WALKWAY_LINEAR_OUTER, allowFanout: true },
    ];

    // Per-row centerline angles (start from base and adjust per row)
    const centerAnglesByRow = Array.from({ length: 5 }, () => centerAnglesRad.slice());

    for (let r = 0; r < 5; r += 1) {
      const radius = START_RADIUS + r * ROW_SPACING;

      // Phase 1: trim benches where possible to meet walkway requirement
      for (let iter = 0; iter < 8; iter += 1) {
        let adjusted = false;
        for (const { a, b, linear } of pairSpecs) {
          const required = linear / radius; // radians
          const centerGap = Math.abs(centerAnglesByRow[r][b] - centerAnglesByRow[r][a]);
          const halfA = benchSpan[a][r] / 2;
          const halfB = benchSpan[b][r] / 2;
          const current = Math.max(0, centerGap - halfA - halfB);
          const deficit = required - current;
          if (deficit > 1e-4) {
            const need = 2 * deficit;
            const availA = Math.max(0, benchSpan[a][r] - minBenchSpan[a][r]);
            const availB = Math.max(0, benchSpan[b][r] - minBenchSpan[b][r]);
            const give = Math.min(need, availA + availB);
            if (give > 0) {
              const takeA = Math.min(availA, (availA / Math.max(1e-6, availA + availB)) * give);
              const takeB = give - takeA;
              benchSpan[a][r] -= takeA;
              benchSpan[b][r] -= takeB;
              adjusted = true;
            }
          }
        }
        if (!adjusted) break;
      }

      // Phase 2: gentle per-row fan-out where trimming cannot satisfy
      // Run multiple passes to converge because moving one pair affects neighbors.
      for (let pass = 0; pass < 8; pass += 1) {
        let moved = false;
        for (const { a, b, linear, allowFanout } of pairSpecs) {
          if (!allowFanout) continue;
          const required = linear / radius;
          const centerGap = Math.abs(centerAnglesByRow[r][b] - centerAnglesByRow[r][a]);
          const halfA = benchSpan[a][r] / 2;
          const halfB = benchSpan[b][r] / 2;
          const current = Math.max(0, centerGap - halfA - halfB);
          const deficit = required - current;
          if (deficit > 1e-4) {
            const shift = deficit / 2;
            if (centerAnglesByRow[r][a] < centerAnglesByRow[r][b]) {
              centerAnglesByRow[r][a] -= shift;
              centerAnglesByRow[r][b] += shift;
            } else {
              centerAnglesByRow[r][a] += shift;
              centerAnglesByRow[r][b] -= shift;
            }
            moved = true;
          }
        }
        if (!moved) break;
      }

      // Additional seat-edge-based validation at chair radius to protect aisles
      for (const { a, b, linear } of pairSpecs) {
        const seatRadius = radius + BENCH_DEPTH / 2 + CHAIR_BACK_OFFSET;
        const seatHalfA = (seatSpan[a][r] / 2) + (SEAT_EDGE_MARGIN_LINEAR / seatRadius);
        const seatHalfB = (seatSpan[b][r] / 2) + (SEAT_EDGE_MARGIN_LINEAR / seatRadius);
        const required = linear / seatRadius;
        const centerGap = Math.abs(centerAnglesByRow[r][b] - centerAnglesByRow[r][a]);
        const current = Math.max(0, centerGap - seatHalfA - seatHalfB);
        const deficit = required - current;
        if (deficit > 1e-4) {
          const shift = deficit / 2;
          if (centerAnglesByRow[r][a] < centerAnglesByRow[r][b]) {
            centerAnglesByRow[r][a] -= shift;
            centerAnglesByRow[r][b] += shift;
          } else {
            centerAnglesByRow[r][a] += shift;
            centerAnglesByRow[r][b] -= shift;
          }
        }
      }
    }

  const pushRow = (spokeIdx, centerRad, seats, rowIdx, keyPrefix) => {
      const radius = START_RADIUS + rowIdx * ROW_SPACING;

      const bSpan = benchSpan[spokeIdx][rowIdx];
      const bHalf = bSpan / 2;
      const segLen = bSpan / SEGMENTS_PER_BENCH;
      const segWidth = Math.max(0.2, segLen * radius * 0.95);
      for (let s = 0; s < SEGMENTS_PER_BENCH; s += 1) {
        const t = -bHalf + (s + 0.5) * segLen;
        const ang = centerRad + t;
        const x = radius * Math.cos(ang);
        const z = radius * Math.sin(ang);
        const yaw = -(ang - Math.PI / 2);
        benchElems.push(
          <mesh key={`${keyPrefix}-seg-${s}`} position={[x, rowIdx * CHAIR_ELEVATION_STEP + BENCH_HEIGHT / 2, z]} rotation={[0, yaw, 0]}>
            <boxGeometry args={[segWidth, BENCH_HEIGHT, BENCH_DEPTH]} />
            <meshStandardMaterial color={0x8b5a2b} roughness={0.5} metalness={0.15} />
          </mesh>
        );
      }

      const sSpan = seatSpan[spokeIdx][rowIdx];
      const sHalf = sSpan / 2;
      const seatAngW = CHAIR_LINEAR_WIDTH / radius;
      const seatAngGap = CHAIR_LINEAR_GAP / radius;
      const seatRadius = radius + BENCH_DEPTH / 2 + CHAIR_BACK_OFFSET;
      for (let i = 0; i < seats; i += 1) {
        const ang = centerRad + (-sHalf + i * (seatAngW + seatAngGap) + seatAngW / 2);
        const x = seatRadius * Math.cos(ang);
        const z = seatRadius * Math.sin(ang);
        const y = rowIdx * CHAIR_ELEVATION_STEP;
        const yaw = Math.atan2(SPEAKER_TARGET.x - x, SPEAKER_TARGET.z - z);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
        const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
  wood.push(m.clone());
  fabric.push(m.clone());
      }
    };

    const anglesByRow = centerAnglesByRow;
    const rows = seatRowsBySpoke;
    for (let r = 0; r < 5; r += 1) pushRow(0, anglesByRow[r][0], rows[0][r], r, `S1-R${r}`);
    for (let r = 0; r < 5; r += 1) pushRow(1, anglesByRow[r][1], rows[1][r], r, `S2-R${r}`);
    for (let r = 0; r < 5; r += 1) pushRow(2, anglesByRow[r][2], rows[2][r], r, `C-R-${r}`);
    for (let r = 0; r < 5; r += 1) pushRow(3, anglesByRow[r][3], rows[3][r], r, `C-L-${r}`);
    for (let r = 0; r < 5; r += 1) pushRow(4, anglesByRow[r][4], rows[4][r], r, `S5-R${r}`);
    for (let r = 0; r < 5; r += 1) pushRow(5, anglesByRow[r][5], rows[5][r], r, `S6-R${r}`);

  // Development aid: log counts (safe for production, silent if console off)
    try {
      const perSpoke = seatRowsBySpoke.map(r => r.reduce((a, b) => a + b, 0));
      const total = perSpoke.reduce((a, b) => a + b, 0);
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('Seat counts per spoke:', perSpoke, 'Total:', total);
      }
    } catch (e) {
      // ignore
    }

  return { benches: benchElems, woodMatrices: wood, fabricMatrices: fabric };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { woodGeometry, fabricGeometry } = useMemo(() => createMergedChairGeometries(), []); // executed once
  const woodRef = useRef(null);
  const fabricRef = useRef(null);

  // onSeatMatricesReady intentionally excluded from deps to avoid re-running on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (woodRef.current && woodMatrices.length) {
      for (let i = 0; i < woodMatrices.length; i += 1) woodRef.current.setMatrixAt(i, woodMatrices[i]);
      woodRef.current.instanceMatrix.needsUpdate = true;
    }
    if (fabricRef.current && fabricMatrices.length) {
      for (let i = 0; i < fabricMatrices.length; i += 1) fabricRef.current.setMatrixAt(i, fabricMatrices[i]);
      fabricRef.current.instanceMatrix.needsUpdate = true;
    }
    if (onSeatMatricesReady) onSeatMatricesReady(fabricMatrices);
  }, [woodMatrices, fabricMatrices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract leader matrix if requested and exists
  let leaderMatrix = null;
  if (leaderSeatIndex != null && fabricMatrices[leaderSeatIndex]) leaderMatrix = fabricMatrices[leaderSeatIndex];

  return (
    <group>
      {benches}
  <instancedMesh ref={woodRef} args={[woodGeometry, WOOD_MATERIAL, woodMatrices.length]} frustumCulled={false} />
  <instancedMesh ref={fabricRef} args={[fabricGeometry, FABRIC_MATERIAL, fabricMatrices.length]} frustumCulled={false} />
      
  {/* Holograms removed: using photo face layer instead */}
      {/* Prototype single face card on seat index 0 */}
      {/* Multi-seat face layer (prototype). Provide list of image sources; cycles through them. */}
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
        />
      )}
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

export default AssemblyLayout;
