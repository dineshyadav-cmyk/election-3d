import React, { useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, useTexture } from '@react-three/drei';

/**
 * SeatFacesLayer
 * Renders a face card (photo + hologram panel + glow) for every seat matrix provided.
 * Optimized: loads each supplied image exactly once; reuses shared geometries & materials.
 */
function SeatFacesLayer({
  matrices,
  seatHexColors = [],
  imageSources = [],
  randomize = true,
  seed = 1337,
  expandedSeat = null,
  onFaceClick,
  constituencyData = [],
}) {
  const sources = imageSources.length ? imageSources : ['/images/leader.png'];
  const textures = useTexture(sources);
  const benchHeight = 1.2;
  const liftMargin = 0.05;
  const width = 0.95;
  const heightRatio = 1.4;
  const glowScale = 1.12;
  const glowOpacity = 0.25;
  const cornerRadius = 0.1;

  const { panelGeometry, planeGeometry, positions, imageIndexMap } = useMemo(() => {
    const cardH = width * heightRatio;
    // Rounded rectangle shape (single geometry reused)
    const shape = new THREE.Shape();
    const w = width; const h = cardH; const r = Math.min(cornerRadius, Math.min(w, h) * 0.25);
    const x0 = -w / 2; const y0 = -h / 2;
    shape.moveTo(x0 + r, y0);
    shape.lineTo(x0 + w - r, y0); shape.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    shape.lineTo(x0 + w, y0 + h - r); shape.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    shape.lineTo(x0 + r, y0 + h); shape.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    shape.lineTo(x0, y0 + r); shape.quadraticCurveTo(x0, y0, x0 + r, y0);
    const panelGeom = new THREE.ShapeGeometry(shape, 20);
    const planeGeom = new THREE.PlaneGeometry(width, cardH);

    const basePos = new THREE.Vector3();
    // Deterministic pseudo-random generator for stable shuffles per load
    function lcg(a) { return () => (a = (a * 48271) % 0x7fffffff) / 0x7fffffff; }
    const rng = lcg(seed);
    const baseIndices = matrices.map((_, i) => i);
    const shuffled = randomize ? baseIndices.sort(() => rng() - 0.5) : baseIndices;
    // Map seat index -> image index
    const imgMap = new Array(matrices.length);
    console.log('sources:', sources);
    console.log('matrices:', matrices);
    if (randomize) {
      // Original randomization logic for backward compatibility
      shuffled.forEach((seatIdx, orderIdx) => { imgMap[seatIdx] = orderIdx % sources.length; });
    } else {
      // Direct 1:1 mapping when not randomizing (for dynamic constituency images)
      matrices.forEach((_, seatIdx) => { 
        imgMap[seatIdx] = Math.min(seatIdx, sources.length - 1); 
      });
    }

    const all = matrices.map((m, idx) => {
      basePos.setFromMatrixPosition(m);
      const bottomY = basePos.y + benchHeight + liftMargin;
      return { index: idx, position: [basePos.x, bottomY + cardH / 2, basePos.z] };
    });
    return { panelGeometry: panelGeom, planeGeometry: planeGeom, positions: all, imageIndexMap: imgMap };
  }, [matrices, width, heightRatio, cornerRadius, randomize, seed, sources.length]);

console.log('11:panelGeometry:', panelGeometry);
console.log('11:planeGeometry:', planeGeometry);
console.log('11:positions:', positions);
console.log('11:imageIndexMap:', imageIndexMap);
  // Animated scale refs (only animate currently expanded seat for simplicity)
  const scaleRef = useRef(1);
  const groupRefs = useRef([]);
    const { camera, size } = useThree();

  // Imperative animation using r3f global frame loop (avoid extra dependency)
  // We'll attach a custom onUpdate function by leveraging requestAnimationFrame manually.
  // (Simpler than importing react-spring for this prototype.)
  const targetScale = expandedSeat != null ? 2.4 : 1;
  if (Math.abs(scaleRef.current - targetScale) > 0.001) {
    // schedule a micro animation step
    requestAnimationFrame(() => {
      // Ease: simple damp
      scaleRef.current += (targetScale - scaleRef.current) * 0.12;
      if (groupRefs.current[expandedSeat] && expandedSeat != null) {
        const g = groupRefs.current[expandedSeat];
        g.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
        g.renderOrder = 100; // bring to front
      } else {
        // collapse case: iterate all to normalize
        groupRefs.current.forEach(g => {
          if (!g) return;
          g.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
          g.renderOrder = 10;
        });
      }
    });
  }

  // Pointer interaction state to distinguish click vs drag
  const pointerStateRef = useRef(null);

  function computeInitialRect(obj) {
    if (!obj) return null;
    const center = new THREE.Vector3();
    obj.getWorldPosition(center);
  // Project approximate 3D quad bounds (billboard card) into screen space to
  // create a starting rectangle for the shared-element transition. We derive
  // width/height by offsetting card center along camera-facing right & up vectors
  // instead of reading geometry bounds (simpler & stable for billboards).
    const cardW = width; const cardH = width * heightRatio;
    const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    const pRight = center.clone().addScaledVector(right, cardW/2);
    const pLeft = center.clone().addScaledVector(right, -cardW/2);
    const pTop = center.clone().addScaledVector(up, cardH/2);
    const pBottom = center.clone().addScaledVector(up, -cardH/2);
    const project = (v) => { const c = v.clone().project(camera); return { x: (c.x + 1)/2 * size.width, y: (-c.y + 1)/2 * size.height }; };
    const screenRight = project(pRight); const screenLeft = project(pLeft);
    const screenTop = project(pTop); const screenBottom = project(pBottom);
    const cardWidth = Math.abs(screenRight.x - screenLeft.x);
    const cardHeight = Math.abs(screenTop.y - screenBottom.y);
    const centerScreen = project(center);
    return { x: centerScreen.x - cardWidth/2, y: centerScreen.y - cardHeight/2, width: cardWidth, height: cardHeight };
  }

  function handleSeatActivate(index, partyColor) {
    if (!onFaceClick) return;
    const obj = groupRefs.current[index];
    const initialRect = computeInitialRect(obj);
    const src =  sources[imageIndexMap[index] % textures.length];
    console.log('constituencyData[index]:', index, constituencyData[index], src, imageIndexMap);
    onFaceClick(index, { imageSrc: src, partyColor, initialRect, leaderData: constituencyData[index]});
  }

  return (
    <group>
      {positions.map(({ index, position }) => {
        const tex = textures[imageIndexMap[index] % textures.length];
        const partyColor = seatHexColors[index] || '#ffffff';
        const isExpanded = expandedSeat === index;
        return (
          <group
            key={`face-${index}`}
            position={[position[0], position[1], position[2]]}
            ref={el => { groupRefs.current[index] = el; if (el && !isExpanded) el.scale.set(1,1,1); }}
            onPointerDown={(e) => {
              pointerStateRef.current = { x: e.clientX, y: e.clientY, moved: false, index };
            }}
            onPointerMove={(e) => {
              const ps = pointerStateRef.current;
              if (!ps) return;
              if (Math.abs(e.clientX - ps.x) > 5 || Math.abs(e.clientY - ps.y) > 5) {
                ps.moved = true;
              }
            }}
            onPointerUp={(e) => {
              const ps = pointerStateRef.current;
              if (!ps || ps.index !== index) return;
              if (!ps.moved) {
                e.stopPropagation(); // treat as click
                handleSeatActivate(index, partyColor);
              }
              pointerStateRef.current = null;
            }}
            onPointerCancel={() => { pointerStateRef.current = null; }}
          >
            <Billboard follow>
              {/* Glow */}
              <mesh position={[0, 0, -0.014]} scale={[glowScale, glowScale, 1]} geometry={panelGeometry} renderOrder={isExpanded ? 101 : 10}>
                <meshBasicMaterial
                  color={partyColor}
                  transparent
                  opacity={glowOpacity}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                  depthTest
                />
              </mesh>
              {/* Panel */}
              <mesh position={[0, 0, -0.007]} geometry={panelGeometry} renderOrder={isExpanded ? 102 : 11}>
                <meshBasicMaterial
                  color={partyColor}
                  transparent
                  opacity={0.18}
                  depthWrite={false}
                  polygonOffset
                  polygonOffsetFactor={1}
                  polygonOffsetUnits={1}
                />
              </mesh>
              {/* Photo */}
              <mesh geometry={planeGeometry} position={[0,0,0.0005]} renderOrder={isExpanded ? 103 : 12}>
                <meshBasicMaterial
                  map={tex}
                  transparent
                  alphaTest={0.03}
                  depthWrite={false}
                />
              </mesh>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

export default SeatFacesLayer;
