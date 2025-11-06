/**
 * Alliance Configuration - Political Party Color System
 * =====================================================
 * 
 * This file defines the political alliances and their associated colors
 * for the Bihar Assembly 3D visualization. Colors are optimized for
 * clear visibility in both hologram and party-colored modes.
 * 
 * Color Design Principles:
 * - High contrast for mobile viewing
 * - Distinctive colors to avoid confusion
 * - Politically neutral color choices
 * - Optimized for 3D rendering performance
 */

/**
 * POLITICAL ALLIANCES
 * ===================
 * Defines the major political alliances participating in Bihar elections.
 * Each alliance gets a unique color for visualization.
 * 
 * Color Palette:
 * - NDA: Saffron (#FFB347) - Traditional BJP/NDA color
 * - INDIA: Green (#2ECC40) - Common opposition color
 * - Others: Lavender (#B39DFF) - Neutral third-party color
 */
export const ALLIANCES = [
  { 
    id: 'NDA', 
    name: 'NDA', 
    color: '#FFB347'    // Light saffron - traditional NDA/BJP color
  },
  { 
    id: 'INDIA', 
    name: 'INDIA Bloc', 
    color: '#2ECC40'    // Bright green - common opposition color
  },
  { 
    id: 'OTHERS', 
    name: 'Others', 
    color: '#B39DFF'    // Soft lavender - neutral third-party color
  }
];


// Party-specific colors for detailed visualization
export const PARTY_COLORS = {
  'BJP': '#ff9650',    // Saffron
  'JD(U)': '#00AA5A',  // Green
  'RJD': '#008000',    // Dark Green  
  'INC': '#4ba9f0',    // Blue
  'CPI(ML)(L)': '#84898B', // Gray
  'AIMIM': '#84898B',  // Gray
  'HAM-S': '#84898b',  // Gray
  'VIP': '#84898B',    // Gray
  'CPI': '#84898B',    // Gray
  'CPM': '#84898B',    // Gray
  'BSP': '#84898B',    // Gray
  'LJP': '#1a64f5',    // Blue
  'IND': '#84898B'     // Gray
};


/**
 * UNDECLARED SEAT COLOR
 * =====================
 * Color used for seats where election results are not yet available
 * or candidate information is pending.
 */
export const UNDECLARED_COLOR = '#777777'; // Neutral gray

/**
 * COLOR UTILITY FUNCTIONS
 * =======================
 * Helper functions for color manipulation and variation.
 */

/**
 * lighterShade - Creates a lighter version of a hex color
 * 
 * Used to create "leading" vs "winning" color variations.
 * Blends the original color with white to create a lighter shade.
 * 
 * @param {string} hex - Original hex color (e.g., '#FFB347')
 * @param {number} factor - Blend factor (0-1, default 0.35)
 * @returns {string} Lighter hex color
 * 
 * Example:
 *   lighterShade('#FFB347', 0.35) // Returns lighter saffron for "leading" state
 */
export function lighterShade(hex, factor = 0.35) {
  // Remove '#' and parse RGB components
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  
  // Blend with white (255, 255, 255)
  const nr = Math.round(r + (255 - r) * factor);
  const ng = Math.round(g + (255 - g) * factor);
  const nb = Math.round(b + (255 - b) * factor);
  
  // Convert back to hex string
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}
