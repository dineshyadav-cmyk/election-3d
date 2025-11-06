// EnhancedCameraControls.jsx
// ---------------------------------------------------------------------------
// Provides smooth, user-friendly camera navigation using camera-controls:
//  - Dolly to cursor (scroll zoom centers where you point)
//  - Smooth inertial panning/orbit (damping)
//  - Seat focus on double-click (raycasts meshes tagged as focusable)
//  - ESC to reset framing
//  - Programmatic API can be extended later (expose ref)
// ---------------------------------------------------------------------------
import { useEffect, useRef, useCallback } from 'react';
import CameraControls from 'camera-controls';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { POLAR_MIN, POLAR_MAX, AZIMUTH_MIN, AZIMUTH_MAX, MIN_DISTANCE, SOFT_FLOOR, SIDE_OFFSET, CLOSE_TOGGLE_DISTANCE, FOCUS_DISTANCE, CAMERA_BOUNDARIES } from '../config/camera';

CameraControls.install({ THREE });

/**
 * @param {{ getSeatWorldMatrix: () => { matrices: import('three').Matrix4[] }|null, onReady?: (cc:any)=>void }} props
 */
export default function EnhancedCameraControls({ getSeatWorldMatrix, onReady }) {
  const { camera, gl, scene, size } = useThree();
  const controlsRef = useRef(null);
  const pointer = useRef(new THREE.Vector2());
  const focusRingRef = useRef(null);
  const focusedSeat = useRef(null);

  // Create a subtle focus ring (circle) that we can move to focused seat
  // onReady excluded from deps: we only want to call once on mount for stable camera controls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const ringGeom = new THREE.RingGeometry(0.45, 0.5, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffff66, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(ringGeom, ringMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    scene.add(mesh);
    focusRingRef.current = mesh;
    return () => {
      scene.remove(mesh);
      ringGeom.dispose();
      ringMat.dispose();
    };
  }, [scene]);

  // Initial perspective camera positioning & framing (run once; onReady intentionally excluded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Set camera to perspective values if not already
    if (camera.type !== 'PerspectiveCamera') {
      // (In Canvas we will instantiate perspective explicitly)
    }
    camera.position.set(0, 70, 78); // elevated & back a bit for opening shot
  camera.near = 0.02; // allow very close zoom without clipping (reduced for tighter hologram approach)
    camera.far = 2000;
    camera.updateProjectionMatrix();

    const cc = new CameraControls(camera, gl.domElement);
  // Re-enable user controls - allow both dots and manual navigation
  cc.enabled = true;
  cc.dollyToCursor = true;
  cc.smoothTime = 1.0; // Ultra slow, very cinematic transitions
  cc.draggingDampingFactor = 0.18;
  cc.infinityDolly = false;
    cc.minDistance = MIN_DISTANCE;  // allow much closer inspection of seats
    cc.maxDistance = 50;  // Limited zoom out (50m max distance)
    cc.polarAngleMin = POLAR_MIN;
    cc.polarAngleMax = POLAR_MAX;
    cc.azimuthAngleMin = AZIMUTH_MIN;
    cc.azimuthAngleMax = AZIMUTH_MAX;
    // Note: Azimuth angles will be updated dynamically based on camera position in useFrame
  cc.verticalDragToForward = false; // disable forward lurch
    cc.saveState();
    controlsRef.current = cc;

  // Initial framing will be set by CameraViewpoints component
  // cc.setLookAt(0, 55, 95, 0, 6, 0, false);

  if (onReady) onReady(cc);

    return () => cc.dispose();
  }, [camera, gl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-frame update
  const softAppliedRef = useRef(false);

  useFrame((_, delta) => {
    const cc = controlsRef.current;
    if (cc) {
      // Dynamic dolly-to-cursor toggle for stability when extremely close
      const dist = cc.distance;
      const shouldDolly = dist > CLOSE_TOGGLE_DISTANCE;
      if (cc.dollyToCursor !== shouldDolly) {
        cc.dollyToCursor = shouldDolly;
      }

      // Soft floor protective lateral nudge (only once per entry below threshold)
      if (dist < SOFT_FLOOR) {
        if (!softAppliedRef.current) {
          const target = new THREE.Vector3();
          if (cc.getTarget) cc.getTarget(target); else target.copy(cc._target || new THREE.Vector3()); // fallback
          const camPos = camera.position.clone();
          const dir = camPos.clone().sub(target).normalize();
          const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
          camPos.addScaledVector(right, SIDE_OFFSET);
          if (camPos.y < 0.5) camPos.y = 0.5; // keep above floor plane
          // Maintain look at target without animation (prevents perceptible snap loop)
          cc.setLookAt(camPos.x, camPos.y, camPos.z, target.x, target.y, target.z, false);
          softAppliedRef.current = true;
        }
      } else if (softAppliedRef.current) {
        // Reset flag once user pulls back out
        softAppliedRef.current = false;
      }

      // DYNAMIC ROTATION LIMITS - Restrict based on camera position
      // Prevent camera from looking through walls
      const pos = camera.position;
      
      // Calculate angle from assembly center to camera
      const dx = pos.x - CAMERA_BOUNDARIES.PERIMETER_CENTER.x;
      const dz = pos.z - CAMERA_BOUNDARIES.PERIMETER_CENTER.z;
      const angleToCamera = Math.atan2(dx, dz);
      
      // Allow ±90° rotation from facing inward (total 180° view)
      const inwardAngle = angleToCamera + Math.PI; // Angle pointing toward center
      cc.azimuthAngleMin = inwardAngle - Math.PI / 2;  // -90° from inward
      cc.azimuthAngleMax = inwardAngle + Math.PI / 2;  // +90° from inward

      cc.update(delta);
      
      // DUAL-PERIMETER BOUNDARY ENFORCEMENT
      // Visual boundaries: Where walls exist (zoom IN limit)
      // Camera boundaries: Where camera can go (zoom OUT limit)
      
      let needsCorrection = false;
      const correctedPos = pos.clone();
      
      // 1. BACKSTAGE WALL BOUNDARIES (Z-axis)
      // Zoom IN: Stop at visual wall (teal panel at -14m)
      // Zoom OUT: Stop at camera limit (-50m)
      if (correctedPos.z < CAMERA_BOUNDARIES.CAMERA_BACK_Z) {
        correctedPos.z = CAMERA_BOUNDARIES.CAMERA_BACK_Z;  // -50m limit
        needsCorrection = true;
      }
      // Note: No forward limit - camera can go in front of assembly
      
      // 2. PERIMETER WALL BOUNDARIES (Horizontal radius from center)
      // Zoom IN: Stop at visual perimeter (35m)
      // Zoom OUT: Stop at camera perimeter (80m)
      const horizontalDist = Math.sqrt(dx * dx + dz * dz);
      
      // Zoom OUT limit: Can't go beyond camera perimeter (80m)
      if (horizontalDist > CAMERA_BOUNDARIES.CAMERA_RADIUS) {
        const scale = CAMERA_BOUNDARIES.CAMERA_RADIUS / horizontalDist;
        correctedPos.x = CAMERA_BOUNDARIES.PERIMETER_CENTER.x + dx * scale;
        correctedPos.z = CAMERA_BOUNDARIES.PERIMETER_CENTER.z + dz * scale;
        needsCorrection = true;
      }
      
      // Zoom IN limit: For positions behind assembly, stop at visual perimeter (35m)
      // Only enforce when camera is in the "gallery" zone (behind assembly, Z > 10)
      if (correctedPos.z > 10 && horizontalDist < CAMERA_BOUNDARIES.VISUAL_RADIUS) {
        const scale = CAMERA_BOUNDARIES.VISUAL_RADIUS / horizontalDist;
        correctedPos.x = CAMERA_BOUNDARIES.PERIMETER_CENTER.x + dx * scale;
        correctedPos.z = CAMERA_BOUNDARIES.PERIMETER_CENTER.z + dz * scale;
        needsCorrection = true;
      }
      
      // 3. FLOOR BOUNDARY (Y minimum)
      if (correctedPos.y < CAMERA_BOUNDARIES.MIN_HEIGHT) {
        correctedPos.y = CAMERA_BOUNDARIES.MIN_HEIGHT;
        needsCorrection = true;
      }
      
      // 4. CEILING BOUNDARY (Y maximum)
      if (correctedPos.y > CAMERA_BOUNDARIES.MAX_HEIGHT) {
        correctedPos.y = CAMERA_BOUNDARIES.MAX_HEIGHT;
        needsCorrection = true;
      }
      
      // 5. PLATFORM COLLISION - Prevent camera from going inside tiered platforms
      // Calculate horizontal distance from assembly center for platform detection
      const platformDist = horizontalDist;  // Reuse calculated distance
      
      // Check if camera is within platform radius range (15.3m to VISUAL_RADIUS = 35m)
      // and in the semicircular assembly area (positive Z values, in front of backstage)
      if (platformDist >= 15.3 && platformDist <= CAMERA_BOUNDARIES.VISUAL_RADIUS && correctedPos.z > 0) {
        // Determine platform height based on radial distance
        let platformHeight = 0;
        
        if (platformDist >= 15.3 && platformDist < 18.8) {
          platformHeight = 0.3;  // Row 1
        } else if (platformDist >= 18.8 && platformDist < 22.3) {
          platformHeight = 0.7;  // Row 2
        } else if (platformDist >= 22.3 && platformDist < 25.8) {
          platformHeight = 1.1;  // Row 3
        } else if (platformDist >= 25.8 && platformDist < 29.3) {
          platformHeight = 1.5;  // Row 4
        } else if (platformDist >= 29.3 && platformDist <= CAMERA_BOUNDARIES.VISUAL_RADIUS) {
          platformHeight = 1.9;  // Row 5 + Extension (to visual perimeter at 35m)
        }
        
        // If camera is below platform top surface, push it up
        const minHeightAbovePlatform = platformHeight + 0.5;  // 0.5m clearance above platform
        if (correctedPos.y < minHeightAbovePlatform) {
          correctedPos.y = minHeightAbovePlatform;
          needsCorrection = true;
        }
      }
      
      // Apply correction if camera went out of bounds
      if (needsCorrection) {
        const target = new THREE.Vector3();
        if (cc.getTarget) cc.getTarget(target); else target.copy(cc._target || new THREE.Vector3());
        cc.setLookAt(correctedPos.x, correctedPos.y, correctedPos.z, target.x, target.y, target.z, false);
      }
    }

    // Pulse focus ring (independent of controls existence)
    const ring = focusRingRef.current;
    if (ring && ring.visible) {
      const t = performance.now() * 0.002;
      const base = 0.5;
      const scale = base + Math.sin(t) * 0.04;
      ring.scale.setScalar(scale / base);
      ring.material.opacity = 0.55 + (Math.sin(t * 2) * 0.25 + 0.25);
    }
  });

  // Utility: raycast seats plane for potential future cursor mapping.
  const updatePointer = useCallback((event) => {
    const rect = gl.domElement.getBoundingClientRect();
    pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl]);

  // Double-click seat focus logic (simple heuristic: use closest seat matrix from supplied getter)
  const handleDblClick = useCallback((e) => {
    updatePointer(e);
    if (!getSeatWorldMatrix) return;

    // Sample all seat matrices and pick nearest projected screen distance to pointer.
    const candidate = getSeatWorldMatrix(); // expected to return { matrices: Matrix4[] }
    if (!candidate || !candidate.matrices) return;

    const proj = new THREE.Vector3();
    let bestIdx = -1;
    let bestDist = Infinity;
    candidate.matrices.forEach((m, idx) => {
      proj.setFromMatrixPosition(m).project(camera);
      const dx = proj.x - pointer.current.x;
      const dy = proj.y - pointer.current.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) { bestDist = d2; bestIdx = idx; }
    });
    if (bestIdx === -1) return;

    const seatPos = new THREE.Vector3().setFromMatrixPosition(candidate.matrices[bestIdx]);
    const cc = controlsRef.current;
    if (!cc) return;

  const camDir = new THREE.Vector3(0, 0.4, 1).normalize();
    // Desired camera offset relative to seat (higher y fraction for a top perspective)
  const distance = FOCUS_DISTANCE; // closer baseline viewing distance for sharper engagement
    const target = seatPos.clone().add(new THREE.Vector3(0, 1.2, 0));
    const camPos = target.clone().add(camDir.clone().multiplyScalar(distance));

    cc.setLookAt(camPos.x, camPos.y, camPos.z, target.x, target.y, target.z, true);
    focusedSeat.current = bestIdx;
    if (focusRingRef.current) {
      focusRingRef.current.position.set(seatPos.x, 0.05, seatPos.z);
      focusRingRef.current.visible = true;
    }
  }, [camera, getSeatWorldMatrix, updatePointer]);

  // Key handling for reset (Esc)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && controlsRef.current) {
        // Reset to gallery preset rather than original raw state
        controlsRef.current.setLookAt(0, 55, 95, 0, 6, 0, true);
        if (focusRingRef.current) focusRingRef.current.visible = false;
        focusedSeat.current = null;
      }
      if (e.key === 'f' && controlsRef.current && focusedSeat.current != null && getSeatWorldMatrix) {
        // Re-focus currently selected seat if user drifted away
        const candidate = getSeatWorldMatrix();
        const m = candidate.matrices[focusedSeat.current];
        if (!m) return;
        const seatPos = new THREE.Vector3().setFromMatrixPosition(m);
        const target = seatPos.clone().add(new THREE.Vector3(0, 1.2, 0));
        const camDir = new THREE.Vector3(0, 0.4, 1).normalize();
  const distance = FOCUS_DISTANCE;
        const camPos = target.clone().add(camDir.clone().multiplyScalar(distance));
        controlsRef.current.setLookAt(camPos.x, camPos.y, camPos.z, target.x, target.y, target.z, true);
      }
      
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [camera, getSeatWorldMatrix]);

  useEffect(() => {
    const dom = gl.domElement;
    dom.addEventListener('dblclick', handleDblClick);
    return () => dom.removeEventListener('dblclick', handleDblClick);
  }, [handleDblClick, gl]);

  // Resize: update camera aspect & projection once Canvas size changes.
  useEffect(() => {
    if (camera.type === 'PerspectiveCamera') {
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);

  return null;
}
