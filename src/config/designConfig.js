/**
 * CENTRALIZED DESIGN CONFIGURATION
 * =================================
 * Change these values to experiment with different aesthetics instantly.
 * Based on authentic Indian Parliament (Lok Sabha) design principles.
 * 
 * Reference: Indian Parliament uses Indian teak wood, agave green cushions,
 * peacock motifs, and rich formal traditional aesthetic.
 */
export const DESIGN_CONFIG = {
  // WOOD FURNITURE (chairs + benches)
  wood: {
    color: '#6B4423',        // Rich Indian teak brown (authentic)
    // Alternatives to try:
    // '#8B5A2B' - Medium brown (lighter, modern)
    // '#4A2511' - Dark mahogany (very formal)
    // '#7B5D3F' - Light teak (contemporary)
    roughness: 0.4,
    metalness: 0.1,
  },
  
  // CUSHIONS - Traditional Mode (no party colors)
  cushionTraditional: {
    color: '#2C5F2D',        // Deep agave green (Lok Sabha authentic)
    // Alternatives to try:
    // '#008080' - Teal (current, keep if you like)
    // '#722F37' - Burgundy (Rajya Sabha style)
    // '#1B4D3E' - Forest green (darker)
    // '#4A7C59' - Sage green (lighter)
    roughness: 0.9,          // High roughness for leather/fabric
    metalness: 0.0,
  },
  
  // PARTY COLOR MODE
  partyColorMode: {
    applyToWood: false,      // false = wood stays brown (RECOMMENDED)
    applyToCushions: true,   // true = cushions get party colors
    applyToBenches: false,   // false = benches stay brown (RECOMMENDED)
    // When true, these parts get party-colored based on seatHexColors array
  },
  
  // MOUSEPAD CONFIGURATION
  mousepad: {
    color: '#2C5F2D',
    roughness: 0.6,          // Mousepad texture
    metalness: 0.0,
    thickness: 0.004,        // 4mm thick mousepad
    size: 0.25,             // 25cm x 25cm square
    enabled: true,           // Set to false to hide mousepads
  },

  // VISUAL REFINEMENTS
  aesthetics: {
    benchSmoothness: 48,     // Higher = smoother benches (24-64 recommended)
    chairRoundedEdges: false, // true = add rounded corners (future feature)
    showPeacockMotifs: false, // true = add peacock patterns (future feature)
  }
};

// Helper function to get material color based on DESIGN_CONFIG
export function getMaterialColor(materialType, partyColor = null) {
  // Check if we should apply party color based on material type
  if (partyColor) {
    if (materialType === 'cushion' && DESIGN_CONFIG.partyColorMode.applyToCushions) {
      return partyColor;
    }
    if (materialType === 'wood' && DESIGN_CONFIG.partyColorMode.applyToWood) {
      return partyColor;
    }
    if (materialType === 'bench' && DESIGN_CONFIG.partyColorMode.applyToBenches) {
      return partyColor;
    }
  }
  
  // Traditional/default colors
  if (materialType === 'cushion') return DESIGN_CONFIG.cushionTraditional.color;
  if (materialType === 'wood' || materialType === 'bench') return DESIGN_CONFIG.wood.color;
  
  return '#8B5A2B'; // fallback
}

