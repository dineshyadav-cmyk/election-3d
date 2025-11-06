import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { DESIGN_CONFIG } from '../../config/designConfig';

/**
 * ParliamentChairBlueprint - 3D Chair Geometry Factory
 * ====================================================
 * 
 * This module provides the 3D geometry and material definitions for parliament chairs.
 * It's designed for efficient rendering of 243 chairs using InstancedMesh.
 * 
 * Key Features:
 * - Merged geometries for performance (wood + fabric parts)
 * - Dynamic material creation for party colors
 * - Realistic chair proportions and details
 * - Optimized for mobile and web rendering
 * 
 * Usage:
 * - Call createMergedChairGeometries() to get wood/fabric geometries
 * - Use createFabricMaterial(hexColor) for party-colored fabric
 * - Use createWoodMaterial(hexColor) for party-colored wood
 */

/**
 * DEFAULT MATERIALS (Traditional Mode)
 * ====================================
 * These materials are used when PARTY_MAPPING_WITH_SEAT_COLOR is false.
 * They provide the traditional assembly hall appearance.
 * Now using centralized DESIGN_CONFIG for consistency.
 */
export const WOOD_MATERIAL = new THREE.MeshStandardMaterial({
  color: DESIGN_CONFIG.wood.color,
  roughness: DESIGN_CONFIG.wood.roughness,
  metalness: DESIGN_CONFIG.wood.metalness,
});

export const FABRIC_MATERIAL = new THREE.MeshStandardMaterial({
  color: DESIGN_CONFIG.cushionTraditional.color,
  roughness: DESIGN_CONFIG.cushionTraditional.roughness,
  metalness: DESIGN_CONFIG.cushionTraditional.metalness,
});

/**
 * DYNAMIC MATERIAL CREATION (Party Color Mode)
 * ============================================
 * These functions create materials with party colors when PARTY_MAPPING_WITH_SEAT_COLOR is true.
 * They maintain the same physical properties as default materials but with custom colors.
 */

/**
 * createFabricMaterial - Creates fabric material with DESIGN_CONFIG control
 * 
 * Used for seat cushions and backrests.
 * Respects DESIGN_CONFIG.partyColorMode.applyToCushions setting.
 * 
 * @param {string} hexColor - Party color (e.g., '#FFB347' for NDA saffron)
 * @returns {THREE.MeshStandardMaterial} Fabric material
 */
export function createFabricMaterial(hexColor) {
  // Apply party color only if DESIGN_CONFIG allows it
  const color = (DESIGN_CONFIG.partyColorMode.applyToCushions && hexColor) 
    ? hexColor 
    : DESIGN_CONFIG.cushionTraditional.color;
  
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: DESIGN_CONFIG.cushionTraditional.roughness,
    metalness: DESIGN_CONFIG.cushionTraditional.metalness,
  });
}

/**
 * createWoodMaterial - Creates wood material with DESIGN_CONFIG control
 * 
 * Used for chair wood parts (plinth, pedestal, armrests, head trim).
 * Respects DESIGN_CONFIG.partyColorMode.applyToWood setting.
 * 
 * @param {string} hexColor - Party color (e.g., '#FFB347' for NDA saffron)
 * @returns {THREE.MeshStandardMaterial} Wood material
 */
export function createWoodMaterial(hexColor) {
  // Apply party color only if DESIGN_CONFIG allows it
  const color = (DESIGN_CONFIG.partyColorMode.applyToWood && hexColor)
    ? hexColor 
    : DESIGN_CONFIG.wood.color;
  
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: DESIGN_CONFIG.wood.roughness,
    metalness: DESIGN_CONFIG.wood.metalness,
  });
}

/**
 * createMergedChairGeometries
 * Returns { woodGeometry, fabricGeometry } where each is a BufferGeometry
 * composed of box parts positioned in local chair space with base at Y=0 (ground level).
 * 
 * COORDINATE SYSTEM (after fix):
 * - Y=0: Ground level (plinth base bottom)
 * - Y=0.67: Seat cushion center (standard chair height)
 * - All parts offset +0.37 to ground the chair properly
 */
export function createMergedChairGeometries() {
  const woodParts = [];
  const fabricParts = [];

  // VERTICAL OFFSET: Shift entire chair up so plinth base sits at Y=0
  const GROUND_OFFSET = 0.37;

  // Fabric: rounded seat cushion with soft edges (matching backrest dimensions)
  {
    const cushionWidth = 1.0;
    const cushionDepth = 1.0;
    const cushionHeight = 0.12;  // Thin cushion for realistic parliament chair
    
    // Create rounded cushion using multiple geometries for smooth edges
    // Main body uses FULL width/depth, cylinders add rounded edges
    const mainCushion = new THREE.BoxGeometry(cushionWidth, cushionHeight, cushionDepth);
    
    // Front rounded edge - positioned at front edge
    const frontEdge = new THREE.CylinderGeometry(cushionHeight/2, cushionHeight/2, cushionWidth, 8);
    frontEdge.rotateZ(Math.PI / 2);
    frontEdge.translate(0, 0, cushionDepth * 0.5);  // At the front edge
    
    // Back rounded edge - positioned at back edge
    const backEdge = new THREE.CylinderGeometry(cushionHeight/2, cushionHeight/2, cushionWidth, 8);
    backEdge.rotateZ(Math.PI / 2);
    backEdge.translate(0, 0, -cushionDepth * 0.5);  // At the back edge
    
    // Merge for single smooth cushion mesh
    const cushionGeometry = mergeGeometries([mainCushion, frontEdge, backEdge], false);
    // Position: seat bottom at proper height, centered horizontally
    cushionGeometry.translate(0, 0.3 + GROUND_OFFSET, 0);
    fabricParts.push(cushionGeometry);
  }

  // Fabric: reclined backrest with rounded edges (10° tilt for ergonomic comfort)
  {
    const backWidth = 1.0;
    const backHeight = 1.1;
    const backThickness = 0.12;
    const cushionDepth = 1.0;
    const backrestReclineAngle = 10 * Math.PI / 180; // 10 degrees backward tilt
    
    // Position backrest so its bottom edge connects to back of seat
    // With recline, we need to move it back and up slightly
    const backrestZ = -(cushionDepth / 2) + 0.05; // Slightly behind seat back edge
    // Backrest bottom edge starts at seat CENTER (Y=0.3 before GROUND_OFFSET)
    // Backrest center = seat center + half of backrest height (using 90% height for main body)
    const backrestY = 0.3 + (backHeight * 0.9) / 2;
    
    // Create rounded backrest using multiple geometries for smooth edges
    // Use 90% height for main body, making it taller
    const mainBackrest = new THREE.BoxGeometry(backWidth, backHeight * 0.9, backThickness);
    
    // Top rounded edge at +45%, reaches actual top
    const topEdge = new THREE.CylinderGeometry(backThickness/2, backThickness/2, backWidth, 8);
    topEdge.rotateZ(Math.PI / 2);
    topEdge.translate(0, backHeight * 0.45, 0);
    
    // Bottom rounded edge at -45%, reaches actual bottom
    const bottomEdge = new THREE.CylinderGeometry(backThickness/2, backThickness/2, backWidth, 8);
    bottomEdge.rotateZ(Math.PI / 2);
    bottomEdge.translate(0, -backHeight * 0.45, 0);
    
    // Merge for single smooth backrest
    const backrestGeometry = mergeGeometries([mainBackrest, topEdge, bottomEdge], false);
    
    // Apply recline (rotate backward around X-axis) then position
    backrestGeometry.rotateX(-backrestReclineAngle); // Negative = recline backward
    backrestGeometry.translate(0, backrestY + GROUND_OFFSET, backrestZ);
    
    fabricParts.push(backrestGeometry);
  }


  // Wood: plinth base (full base, grounded at Y=0)
  {
    const baseWidth = 1.12;  // slightly wider than seat for stability
    const baseDepth = 1.0;   // align with seat depth
    const baseHeight = 0.14; // low profile plinth
    const base = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    base.translate(0, -0.3 - baseHeight / 2 + GROUND_OFFSET, 0); // Base bottom at Y=0
    woodParts.push(base);
  }

  // Wood: solid pedestal from seat underside to base top
  {
    const pedestalWidth = 1.0;  // align roughly with seat width
    const pedestalDepth = 0.92; // slightly inset from base edges
    const seatBottomY = (0.3 - 0.2 / 2) + GROUND_OFFSET; // seat center + offset, minus half height
    const baseTopY = -0.3 + GROUND_OFFSET;                // top of plinth base + offset
    const pedestalHeight = seatBottomY - baseTopY;        // expected ~0.5
    const centerY = baseTopY + pedestalHeight / 2;        // center between base and seat
    const pedestal = new THREE.BoxGeometry(pedestalWidth, pedestalHeight, pedestalDepth);
    pedestal.translate(0, centerY, 0);
    woodParts.push(pedestal);
  }

  // Wood: armrests with rounded tops for comfort
  {
    const armWidth = 0.10;  // Reduced from 0.14 to prevent overlaps
    const armHeight = 0.18;
    const armDepth = 0.8;
    
    // Left armrest with rounded top
    const leftArm = new THREE.BoxGeometry(armWidth, armHeight * 0.8, armDepth);
    const leftTop = new THREE.CylinderGeometry(armWidth/2, armWidth/2, armDepth, 8);
    leftTop.rotateX(Math.PI / 2);
    leftTop.translate(0, armHeight * 0.4, 0);
    const leftArmMerged = mergeGeometries([leftArm, leftTop], false);
    leftArmMerged.translate(-0.55, 0.6 + GROUND_OFFSET, 0);  // Moved closer (was -0.58)
    woodParts.push(leftArmMerged);
    
    // Right armrest with rounded top (mirror)
    const rightArm = new THREE.BoxGeometry(armWidth, armHeight * 0.8, armDepth);
    const rightTop = new THREE.CylinderGeometry(armWidth/2, armWidth/2, armDepth, 8);
    rightTop.rotateX(Math.PI / 2);
    rightTop.translate(0, armHeight * 0.4, 0);
    const rightArmMerged = mergeGeometries([rightArm, rightTop], false);
    rightArmMerged.translate(0.55, 0.6 + GROUND_OFFSET, 0);   // Moved closer (was 0.58)
    woodParts.push(rightArmMerged);
  }

  // Wood: head trim with rounded top (matching armrest style, adjusted for reclined backrest)
  {
    const trimWidth = 1.1;
    const trimHeight = 0.1;
    const trimDepth = 0.15;
    const backrestHeight = 1.1;
    const cushionDepth = 1.0;
    const backrestReclineAngle = 10 * Math.PI / 180; // Same as backrest
    
    // Calculate position to sit exactly on top of reclined backrest
    // Use the SAME backrestY calculation as the actual backrest (line 152)
    const backrestZ = -(cushionDepth / 2) + 0.05;
    const backrestY = 0.3 + (backrestHeight * 0.9) / 2; // Must match actual backrest position!
    
    // Head trim sits at TOP of reclined backrest
    // After backrest reclines, its top edge moves up and back
    const backrestTopY = backrestY + GROUND_OFFSET + (backrestHeight * 0.9 / 2) * Math.cos(backrestReclineAngle);
    const backrestTopZ = backrestZ - (backrestHeight * 0.9 / 2) * Math.sin(backrestReclineAngle);
    
    // Position trim at backrest top edge
    const headTrimY = backrestTopY + trimHeight / 2;
    // Center trim on the reclined backrest top position
    const headTrimZ = backrestTopZ;
    
    // Main trim body
    const trimBody = new THREE.BoxGeometry(trimWidth, trimHeight * 0.7, trimDepth);
    
    // Rounded top edge
    const trimTop = new THREE.CylinderGeometry(trimDepth/2, trimDepth/2, trimWidth, 8);
    trimTop.rotateZ(Math.PI / 2);
    trimTop.translate(0, trimHeight * 0.35, 0);
    
    // Merge for smooth rounded top
    const headTrimGeometry = mergeGeometries([trimBody, trimTop], false);
    
    // Rotate to match backrest recline, then position
    headTrimGeometry.rotateX(-backrestReclineAngle);
    headTrimGeometry.translate(0, headTrimY, headTrimZ);
    
    woodParts.push(headTrimGeometry);
  }

  const woodGeometry = mergeGeometries(woodParts, true);
  const fabricGeometry = mergeGeometries(fabricParts, true);

  return { woodGeometry, fabricGeometry };
}
