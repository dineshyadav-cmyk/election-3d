// Camera configuration constants extracted from EnhancedCameraControls
// Pure constants; no side effects.
export const POLAR_MIN = 0.45;            // ~25.8°
export const POLAR_MAX = 1.15;            // ~65.9°
export const AZIMUTH_MIN = -0.17;  // ~ -10° left
export const AZIMUTH_MAX = 0.17;     // ~ -10° right
export const MIN_DISTANCE = 5;            // Minimum zoom distance (prevents zooming in too close)
export const SOFT_FLOOR = 0.6;
export const SIDE_OFFSET = 0.12;
export const CLOSE_TOGGLE_DISTANCE = 5;
export const FOCUS_DISTANCE = 6;

// DUAL PERIMETER SYSTEM
// Visual perimeter: Where walls/floor physically exist (what audience sees)
// Camera perimeter: Where camera movement is allowed (invisible boundary)

export const VISUAL_PERIMETER_RADIUS = 35;  // Floor/wall edge (visible)
export const CAMERA_PERIMETER_RADIUS = 100;  // Camera movement limit (invisible)

// Backstage boundaries
export const VISUAL_BACKSTAGE_Z = -14;  // Teal/golden wall front face (visible)
export const CAMERA_BACKSTAGE_Z = -100;  // Camera movement limit behind speaker (invisible)

// Camera boundaries (keep camera inside parliament chamber)
export const CAMERA_BOUNDARIES = {
  // Backstage wall boundaries
  VISUAL_BACK_Z: VISUAL_BACKSTAGE_Z,  // Can zoom IN to this point (wall face)
  CAMERA_BACK_Z: CAMERA_BACKSTAGE_Z,  // Can zoom OUT to this point (camera limit)
  
  // Perimeter wall boundaries (semicircular)
  VISUAL_RADIUS: VISUAL_PERIMETER_RADIUS,   // Can zoom IN to this radius (35m)
  CAMERA_RADIUS: CAMERA_PERIMETER_RADIUS,   // Can zoom OUT to this radius (80m)
  PERIMETER_CENTER: { x: 0, y: 0, z: 10 },  // Assembly center point
  
  // Vertical limits (unchanged)
  MIN_HEIGHT: 1.0,   // 1m above ground
  MAX_HEIGHT: 20.0,  // Ceiling height
};

// Legacy export for backward compatibility (use visual perimeter for floor)
export const PERIMETER_RADIUS = VISUAL_PERIMETER_RADIUS;

