# Bihar Assembly V1 - Developer Changelog

**Branch:** `v1`  
**Base:** `main`  
**Date:** October 12, 2025  
**Status:** ✅ Production Ready

---

## 📊 Summary

**17 files changed:** +2,581 insertions, -1,102 deletions

### Quick Stats:
- **New Components:** 5 (AssemblyLayoutV2, BackstageWall, Floor, TieredPlatforms, designConfig)
- **Deleted:** 2 (Old AssemblyLayout, OPEN_LAYOUT_ISSUES)
- **Modified:** 10 (Major refactors to chair, speaker, party colors)

---

## 🆕 New Components

### 1. `AssemblyLayoutV2.jsx` (592 lines)
**Purpose:** Complete redesign of assembly layout with protractor geometry

**Key Features:**
- 243 seats in 6 spokes with fixed parallel walkways
- Continuous curved benches (not segmented boxes)
- 3D realistic desk geometry (desktop, front panel, back panel, side supports)
- Party color system via `DESIGN_CONFIG`
- Seat distribution: [40, 40, 42, 41, 40, 40] across 6 spokes
- 5 rows per spoke with variable seat counts

**Configuration:**
```javascript
START_RADIUS: 16.0m
ROW_SPACING: 3.5m
BENCH_HEIGHT: 1.25m
BENCH_DEPTH: 1.4m
CHAIR_BACK_OFFSET: 0.9m
WALKWAY_ANGULAR: 5° (parallel walkways)
FURNITURE_ELEVATIONS: [0.3, 0.7, 1.1, 1.5, 1.9]m
```

**Replaces:** `AssemblyLayout.jsx` (deleted)

---

### 2. `designConfig.js` (71 lines)
**Purpose:** Centralized design system for all materials and colors

**Configuration:**
```javascript
DESIGN_CONFIG = {
  wood: {
    color: '#6B4423',     // Indian teak brown
    roughness: 0.4,
    metalness: 0.1
  },
  cushionTraditional: {
    color: '#2C5F2D',     // Deep agave green
    roughness: 0.9,
    metalness: 0.0
  },
  partyColorMode: {
    applyToWood: false,
    applyToCushions: true,
    applyToBenches: false
  }
}
```

**Usage:** Import and use `getMaterialColor()` helper function

---

### 3. `TieredPlatforms.jsx` (139 lines)
**Purpose:** Stadium-style tiered platforms for row elevations

**Implementation:**
- Uses `ExtrudeGeometry` for solid semicircular blocks
- 5 tiers matching 5 rows
- Heights: 0.3m, 0.7m, 1.1m, 1.5m, 1.9m
- Radii calculated to fit between desk rows
- Grounded at Y=0, no z-fighting with furniture

---

### 4. `Floor.jsx` (55 lines)
**Purpose:** Seamless combined floor (semicircle + rectangle)

**Design:**
- **Assembly area:** 54.5m radius semicircle (180° protractor)
- **Backstage area:** 109m × 20.5m rectangle
- **Merged geometry:** Single mesh, no visible seam
- **Material:** Brown carpet (0x8B7355), matte finish

---

### 5. `BackstageWall.jsx` (132 lines)
**Purpose:** Inverted-U frame wall behind speaker

**Design:**
- **Teal center panel:** 32m × 18m × 2m (protruding forward)
- **Golden frame:** 2m border (top, left, right - no bottom)
- **Back panel:** Full wall coverage
- **Position:** Z=-20m (10m behind speaker)
- **Colors:** Centralized in `COLORS` object

---

## ✏️ Major Modifications

### 1. `ParliamentChairBlueprint.js` (+256 changes)
**Improvements:**
- Rounded seat cushion (merged geometries with cylinders)
- Reclined backrest (10° backward tilt)
- Rounded top/bottom edges on backrest
- Ergonomic armrests (reduced width: 0.14m → 0.10m)
- Proper grounding (GROUND_OFFSET: 0.37m)
- Head trim aligned with reclined backrest
- Uses `DESIGN_CONFIG` for materials

**Key Dimensions:**
```javascript
Seat: 1.0m × 1.0m × 0.12m
Backrest: 1.0m × 1.1m × 0.12m (reclined 10°)
Armrests: 0.10m × 0.18m × 0.8m
```

---

### 2. `SpeakerDais.jsx` (Complete Rebuild)
**New Design:**

**Table:**
- Solid wood block: 12m × 1m × 3m (no legs)
- Height: 3.0m (above Row 5's 1.6m)
- Position: Z=-0.5m (front of speaker area)

**Chair Platform:**
- Elevated dais: 8m × 3m × 2.25m
- Height: 2.25m → Chair seat at ~2.7m elevation
- Touches table front edge at Z=0

**Chair:**
- Position: 0.6m behind table (Z=0.6m)
- Sits on 2.25m platform
- Uses existing simple chair geometry

**Staircases:**
- 5 grounded steps (like tiered platforms)
- Step height: 0.45m each (5 × 0.45 = 2.25m)
- Step depth: 0.8m per step
- Left stairs: X=-6m to X=-10m
- Right stairs: X=+6m to X=+10m
- Extend along platform depth (3m wide)

---

### 3. `SeatFacesLayer.jsx` (95 changes)
**Updates:**
- Fixed image loading and texture handling
- Improved hologram rendering
- Better card expansion/interaction
- Cleanup of unused code

---

### 4. `alliances.js` (83 changes)
**Updates:**
- Updated party color mappings
- Refined alliance groupings
- Better color consistency

---

## 🎨 Design System

### Centralized Configuration
All visual styling controlled through `src/config/designConfig.js`:

**Party Color Modes:**
```javascript
applyToWood: false       // Wood stays brown (recommended)
applyToCushions: true    // Cushions get party colors
applyToBenches: false    // Benches stay brown (recommended)
```

**Material Properties:**
- Wood: Teak brown, low roughness (0.4)
- Cushions: Deep green or party colors, high roughness (0.9)

---

## 🗂️ File Organization

### New Structure:
```
src/
├── components/
│   ├── AssemblyLayoutV2.jsx      ← Main assembly (replaces old)
│   ├── BackstageWall.jsx         ← New backdrop
│   ├── Floor.jsx                 ← New seamless floor
│   ├── TieredPlatforms.jsx       ← New stadium seating
│   ├── SpeakerDais.jsx           ← Redesigned speaker area
│   └── ParliamentChair/
│       └── ParliamentChairBlueprint.js  ← Enhanced ergonomics
├── config/
│   ├── designConfig.js           ← New design system
│   └── alliances.js              ← Updated party colors
```

### Deleted:
```
src/components/AssemblyLayout.jsx     ← Replaced by V2
docs/OPEN_LAYOUT_ISSUES.md           ← Issues resolved
```

---

## 🔧 Configuration Reference

### Assembly Layout (`AssemblyLayoutV2.jsx`)

**Geometry:**
- `START_RADIUS`: 16.0m
- `ROW_SPACING`: 3.5m
- `BENCH_HEIGHT`: 1.25m
- `BENCH_DEPTH`: 1.4m
- `CHAIR_BACK_OFFSET`: 0.9m

**Spoke Distribution:**
```javascript
SPOKE_SEAT_TOTALS = [40, 40, 42, 41, 40, 40]
ROWS_PER_SPOKE = [
  [6, 7, 8, 9, 10],  // Spoke 1: 40 seats
  [6, 7, 8, 9, 10],  // Spoke 2: 40 seats
  [6, 8, 9, 9, 10],  // Spoke 3: 42 seats
  [6, 7, 9, 9, 10],  // Spoke 4: 41 seats
  [6, 7, 8, 9, 10],  // Spoke 5: 40 seats
  [6, 7, 8, 9, 10],  // Spoke 6: 40 seats
]
```

### Speaker Dais (`SpeakerDais.jsx`)

**Table:**
```javascript
width: 12.0m
height: 3.0m
depth: 1.0m
```

**Platform:**
```javascript
width: 8.0m
depth: 3.0m
height: 2.25m
```

**Stairs:**
```javascript
stepCount: 5
stepHeight: 0.45m
stepDepth: 0.8m
```

### Backstage Wall (`BackstageWall.jsx`)

**Dimensions:**
```javascript
Full wall: 109m × 20m × 0.3m
Teal panel: 32m × 18m × 2m (protruding)
Golden border: 2m thick
Position: Z=-20m
```

---

## 🎯 Key Improvements

### Performance
- ✅ Removed all console.log statements
- ✅ Optimized geometry merging
- ✅ Single draw call for all chairs (instanced mesh)
- ✅ Clean build with no warnings

### Visual Quality
- ✅ Continuous curved benches (not segmented)
- ✅ Realistic 3D desk geometry
- ✅ Ergonomic chair design with rounded edges
- ✅ Grounded staircases and platforms
- ✅ Seamless floor integration

### Code Quality
- ✅ Centralized design configuration
- ✅ No unused variables
- ✅ Clear component separation
- ✅ Comprehensive documentation

---

## 🚀 Deployment

### URLs:
- **Main (production):** https://bihar-assembly.netlify.app/
- **V1 (preview):** https://v1--bihar-assembly.netlify.app/

### Build Requirements:
- **Node.js:** v18 (specified in `.nvmrc`)
- **Build command:** `npm run build`
- **Deploy:** Automatic on push to v1 branch

---

## 🔄 Migration Guide

### From `main` to `v1`:

**If merging v1 → main:**
1. All old `AssemblyLayout.jsx` references are now `AssemblyLayoutV2.jsx`
2. Import `DESIGN_CONFIG` from `config/designConfig.js`
3. New components auto-imported in `App.js`
4. No breaking changes to data flow or props

**Component Mapping:**
```
OLD                          NEW
AssemblyLayout.jsx    →      AssemblyLayoutV2.jsx
(no floor component)  →      Floor.jsx
(no wall component)   →      BackstageWall.jsx
(inline platforms)    →      TieredPlatforms.jsx
(scattered config)    →      designConfig.js
```

---

## 📝 Notes for Developers

### Party Color System:
- Toggle via `DESIGN_CONFIG.partyColorMode`
- Apply to: wood, cushions, benches (independently)
- Colors sourced from `alliances.js`

### Chair Geometry:
- Single blueprint generates all 243 chairs
- Merged wood + fabric geometries
- Instanced rendering for performance

### Coordinate System:
- Ground: Y=0
- Speaker at: [0, 0, -10] (world space)
- Assembly fans from 0° to 180° (semicircle)
- All furniture properly grounded (no floating elements)

---

## ✅ Testing Checklist

- [x] Build completes without warnings
- [x] All 243 seats render correctly
- [x] Party colors apply properly
- [x] Speaker dais visible and positioned
- [x] Staircases grounded and functional
- [x] Backstage wall renders with teal panel
- [x] Floor seamless (no gaps)
- [x] Camera controls work
- [x] Leader images display
- [x] No console errors

---

## 🐛 Known Issues (None)

All issues from `OPEN_LAYOUT_ISSUES.md` have been resolved:
- ✅ Benches now continuous curved surfaces
- ✅ Chairs properly grounded
- ✅ Platforms aligned with furniture
- ✅ No z-fighting or flickering
- ✅ Clean console output

---

## 📞 Support

For questions about this v1 implementation:
- Review `TECHNICAL_DOCS.md` for detailed architecture
- Check `QUICK_REFERENCE.md` for quick code snippets
- See git history: `git log main..v1`

---

**End of V1 Changelog**



