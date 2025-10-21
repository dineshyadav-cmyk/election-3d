import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import EnhancedCameraControls from './components/EnhancedCameraControls';
import './App.css';
import StudioEnvironment from './components/StudioEnvironment';
import SpeakerDais from './components/SpeakerDais';
import AssemblyLayout from './components/AssemblyLayout';
import ResultsLegend from './components/ResultsLegend';
import LeaderDetailOverlay from './components/LeaderDetailOverlay';
import SpeakerChairIcon from './components/icons/SpeakerChairIcon';
import TimelineBar from './components/TimelineBar'; // Time seek bar
// OLD imports (before Redux migration):
// import biharTimeline from './data/biharElectionTimeline.json';
// import { getBiharElectionData } from './services/electionAPI';

// NEW Redux imports:
import { 
  fetchBiharElectionData,
  selectElectionData,
  selectConstituencyData,
  selectCurrentTimeline,
  selectCurrentIndex,
  selectExpandedSeat,
  selectLoading,
  selectError,
  setCurrentIndex,
  setExpandedSeat,
  clearExpandedSeat
} from './store/slices/electionSlice';
import { ALLIANCES, UNDECLARED_COLOR, lighterShade } from './config/alliances';
import { SEAT_BLOCKS, TOTAL_SEATS } from './config/seatBlocks';

// Removed old orthographic CameraController; using EnhancedCameraControls + perspective camera instead.

// redux store
// assembly members node to be integrated 
// seat number dynamic from ttl_seats
// in the overaly add the constituency details leave out the member names and stuff
// performance perspective image load and display in the overlay


function App() {
  const dispatch = useDispatch();
  
  // OLD local state (before Redux migration):
  // const [currentIndex, setCurrentIndex] = useState(biharTimeline.length - 1); // LIVE by default
  // const [constituencyData, setConstituencyData] = useState(null);
  // const [electionData, setElectionData] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // NEW Redux state:
  const electionData = useSelector(selectElectionData);
  const constituencyData = useSelector(selectConstituencyData);
  const currentTimeline = useSelector(selectCurrentTimeline);
  const currentIndex = useSelector(selectCurrentIndex);
  const expandedSeat = useSelector(selectExpandedSeat);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // OLD data fetching logic (before Redux migration):
  // useEffect(() => {
  //   const loadElectionData = async () => {
  //     try {
  //       setLoading(true);
  //       const data = await getBiharElectionData();
  //       console.log('data:', data);
  //       setElectionData(data);
  //       if(data && data.cns_rslt) {
  //         setConstituencyData(data.cns_rslt);
  //       }
  //       setError(null);
  //     } catch (err) {
  //       console.error('Failed to load election data:', err);
  //       setError('Failed to load election data. Using fallback data.');
  //       // Continue with static timeline data as fallback
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   loadElectionData();
  // }, []);

  // NEW Redux data fetching:
  useEffect(() => {
    dispatch(fetchBiharElectionData());
  }, [dispatch]);

  const seatMap = useMemo(() => SEAT_BLOCKS, []);

  const shadeCache = useRef(new Map());
  const seatHexColors = useMemo(() => {
    // Use API data timeline if available, otherwise fallback to static data
    // const timelineData = electionData?.timeline || biharTimeline;
    // const snap = timelineData[currentIndex];
    
    // Use Redux timeline data
    const snap = currentTimeline[currentIndex];
    const seatCount = TOTAL_SEATS;
    const seatColorHex = new Array(seatCount).fill(UNDECLARED_COLOR);
    const counts = {};
    for (const a of snap.alliances) counts[a.id] = a;
    for (const { id, color } of ALLIANCES) {
      const block = seatMap[id] || [];
      const data = counts[id];
      if (!data) continue;
      const { wins, leads } = data;
      const cacheKey = color + '|0.65';
      let leadShade = shadeCache.current.get(cacheKey);
      if (!leadShade) {
        leadShade = lighterShade(color, 0.65);
        shadeCache.current.set(cacheKey, leadShade);
      }
      for (let i = 0; i < block.length; i += 1) {
        const seatIdx = block[i];
        if (i < wins) seatColorHex[seatIdx] = color;
        else if (i < wins + leads) seatColorHex[seatIdx] = leadShade;
      }
    }
    return seatColorHex;
  }, [currentIndex, seatMap, currentTimeline]);
  // , electionData

  // Generate dynamic image sources based on constituency data (cns_rslt)
  const seatImageSources = useMemo(() => {
    if (!constituencyData || !Array.isArray(constituencyData)) {
      // Fallback to default images if no constituency data
      return Array(TOTAL_SEATS).fill('/images/leader.png');
    }

    const seatCount = TOTAL_SEATS;
    const seatImages = new Array(seatCount).fill('/images/leader.png');
    
    // Map constituency data to seat images using cns_id as seat index and lwpl as image ID
    constituencyData.forEach(constituency => {
      const seatIndex = constituency.cns_id - 1; // Convert to 0-based index (assuming cns_id is 1-based)
      const imageId = constituency.lwpl;
      
      if (seatIndex >= 0 && seatIndex < seatCount && imageId) {
        seatImages[seatIndex] = `https://static.toiimg.com/photo/${imageId}.cms`;
      }
    });

    return seatImages;
  }, [constituencyData]);

  // Store seat matrices for camera focus (populated via callback from layout later if needed)
  const [seatMatrices, setSeatMatrices] = useState([]);
  const [sphere, setSphere] = useState(null);
  const [camControls, setCamControls] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  // const [expandedSeat, setExpandedSeat] = useState(null); // OLD - Now using Redux state
  const [expandedMeta, setExpandedMeta] = useState(null); // { imageSrc, partyColor }

  const computeSphere = (mats) => {
    if (!mats || !mats.length) return null;
    const tmp = new THREE.Vector3();
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    mats.forEach(m => {
      tmp.setFromMatrixPosition(m);
      min.min(tmp); max.max(tmp);
    });
    const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
    // radius = max distance from center
    let r = 0; mats.forEach(m => { tmp.setFromMatrixPosition(m); r = Math.max(r, tmp.distanceTo(center)); });
    return { center, radius: r };
  };

  const applyPreset = (preset) => {
    if (!camControls || !sphere) return;
    const { center, radius } = sphere;
    const aspect = window.innerWidth / window.innerHeight;
    const fov = THREE.MathUtils.degToRad(26);
    const horizFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    const limitingFov = Math.min(fov, horizFov); // ensure fits within both axes
    const margin = 1.10; // requested margin
    const requiredDist = (radius * margin) / Math.sin(limitingFov / 2);

    if (preset === 'gallery') {
      const elevAngle = THREE.MathUtils.degToRad(55);
      const y = Math.sin(elevAngle) * requiredDist;
      const z = Math.cos(elevAngle) * requiredDist;
      camControls.setLookAt(center.x, center.y + y, center.z + z, center.x, center.y + 6, center.z, true);
      setActivePreset('gallery');
      return;
    }

    if (preset === 'speaker') {
      // Dais world position (from SpeakerDais placement assumptions)
      const daisPos = new THREE.Vector3(0, 0, -10);
      // Forward vector from dais toward assembly center (flattened to XZ plane)
      const forward = new THREE.Vector3().subVectors(center, daisPos);
      forward.y = 0;
      if (forward.lengthSq() < 1e-5) forward.set(0, 0, 1); else forward.normalize();
      // Desired downward pitch ~30°: raise eye height to achieve that angle relative to target point
      const targetY = center.y + 1.2;
      const angle = THREE.MathUtils.degToRad(30);
      const eyeHeight = targetY + requiredDist * Math.tan(angle); // ensures ~30° look-down
      const initialForwardOffset = 1.6; // small push out from dais toward seats
      const eye = new THREE.Vector3().copy(daisPos).add(new THREE.Vector3(0, eyeHeight, 0)).add(new THREE.Vector3().copy(forward).multiplyScalar(initialForwardOffset));
      // Ensure we are far enough back so that whole layout fits inside frustum
      const centerDir = new THREE.Vector3().subVectors(center, eye);
      const projDist = centerDir.dot(forward);
      if (projDist < requiredDist) {
        // Move backward along -forward to satisfy required distance
        eye.addScaledVector(forward, -(requiredDist - projDist));
      }
      camControls.setLookAt(eye.x, eye.y, eye.z, center.x, targetY, center.z, true);
      setActivePreset('speaker');
    }
  };

  // Auto-apply gallery preset on first availability (default view)
  useEffect(() => {
    if (camControls && sphere && activePreset == null) {
      applyPreset('gallery');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camControls, sphere, activePreset]);

  // Get current timeline data for UI components (OLD - now using Redux)
  // const currentTimeline = electionData?.timeline || biharTimeline;

  // Show loading state
  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="header-title">Bihar Elections 2020</h1>
        </header>
        <div className="canvas-container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '80vh',
          fontSize: '18px',
          color: '#fff'
        }}>
          Loading Bihar Election Data...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="header-title" style={{whiteSpace:'nowrap'}}>
          Bihar Elections 2020
          {error && <span style={{fontSize: '12px', color: '#ffaa00', display: 'block'}}>({error})</span>}
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className={`cam-icon-btn ${activePreset === 'speaker' ? 'active' : ''}`} title="Speaker POV" onClick={() => applyPreset('speaker')}><SpeakerChairIcon active={activePreset === 'speaker'} /></button>
          <button type="button" className={`cam-icon-btn ${activePreset === 'gallery' ? 'active' : ''}`} title="Gallery View" onClick={() => applyPreset('gallery')}>🏛</button>
        </div>
      </header>
      
      <div className="canvas-container" style={{ position: 'relative' }}>
  {/* Colors recomputed each time slider changes; passed to AssemblyLayout */}
            <Canvas
            // Increase device pixel ratio for sharper zoom (caps at 2 for perf)
            dpr={[1, 2]}
            shadows
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance'
            }}
            camera={{ fov: 26, near: 0.02, far: 2000, position: [0,70,120] }}
            onCreated={({ scene, gl }) => {
              scene.background = new THREE.Color(0x000000);
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              // Ensure pixel ratio matches Canvas prop in some browsers
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }}
          >
            {/* Enhanced camera controls (dolly to cursor, focus) */}
            <EnhancedCameraControls getSeatWorldMatrix={() => ({ matrices: seatMatrices })} onReady={(cc) => setCamControls(cc)} />
            {/* Professional Studio Environment */}
            <StudioEnvironment />
            {/* Speaker's Dais */}
            <SpeakerDais />
            {/* Seat / benches assembly (takes computed per-seat colors for wins/leads) */}
            {/* Vertical offset wrapper to nudge assembly upward visually */}
            <group position={[0,5,0]}>
              <AssemblyLayout
                seatHexColors={seatHexColors}
                seatImageSources={seatImageSources}
                onSeatMatricesReady={(mats) => { setSeatMatrices(mats); const sp = computeSphere(mats); setSphere(sp); }}
                expandedSeat={expandedSeat}
                // onRequestExpand={(idx, meta) => { setExpandedSeat(idx); setExpandedMeta(meta); }}
                onRequestExpand={(idx, meta) => { dispatch(setExpandedSeat(idx)); setExpandedMeta(meta); }}
                constituencyData={constituencyData}
              />
            </group>
          </Canvas>
          {/* Timeline UI overlay (HTML) */}
          {/* <TimelineBar timeline={currentTimeline} currentIndex={currentIndex} onChange={setCurrentIndex} /> */}
          <TimelineBar timeline={currentTimeline} currentIndex={currentIndex} onChange={(index) => dispatch(setCurrentIndex(index))} />
          <ResultsLegend currentIndex={currentIndex} timeline={currentTimeline} />
          {expandedSeat != null && (
            <LeaderDetailOverlay
              // onClose={() => { setExpandedSeat(null); setExpandedMeta(null); }}  
              onClose={() => { dispatch(clearExpandedSeat()); setExpandedMeta(null); }}
              imageSrc={expandedMeta?.imageSrc}
              partyColor={expandedMeta?.partyColor}
              leaderData={expandedMeta?.leaderData}
            />
          )}
      </div>

    </div>
  );
}

export default App;
