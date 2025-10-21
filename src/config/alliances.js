// alliances.js
// ---------------------------------------------------------------------------
// Alliance + color configuration for Bihar 2020 Election Results
// Based on actual Times of India data for Bihar Assembly Elections 2020
// ---------------------------------------------------------------------------

// Bihar 2020 Alliance colors (from actual election data)
export const ALLIANCES = [
  { id: 'NDA', name: 'NDA', color: '#ff9650' },        // BJP saffron (from API)
  { id: 'MGB', name: 'Mahagathbandhan', color: '#008000' }, // RJD green (from API) 
  { id: 'OTH', name: 'Others', color: '#84898B' }      // Others gray (from API)
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

export const UNDECLARED_COLOR = '#777777'; // Neutral gray (brightened for visibility)

// Lighter lead shade helper (simple linear blend to white)
export function lighterShade(hex, factor = 0.35) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const nr = Math.round(r + (255 - r) * factor);
  const ng = Math.round(g + (255 - g) * factor);
  const nb = Math.round(b + (255 - b) * factor);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}
