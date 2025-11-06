# Quick Reference Guide - Bihar Assembly 3D

## 🚀 Getting Started (5 minutes)

```bash
# Clone and start
cd "bihar-assembly-new-stable-layout-hologram-party-color"
npm install
npm start
# Open http://localhost:3000
```

## 🎨 Toggle Party Colors

```javascript
// AssemblyLayout.jsx - Line 25
const PARTY_MAPPING_WITH_SEAT_COLOR = true;  // Party-colored mode
const PARTY_MAPPING_WITH_SEAT_COLOR = false; // Traditional mode
```

## 🎯 Key Files & Their Purpose

| File | Purpose | Key Features |
|------|---------|--------------|
| `AssemblyLayout.jsx` | Main layout engine | 243 seats, party grouping, conditional rendering |
| `ParliamentChairBlueprint.js` | Chair geometry factory | Dynamic materials, merged geometries |
| `SeatFacesLayer.jsx` | Photo management | Hologram toggle, billboard rendering |
| `alliances.js` | Party configuration | Colors, alliances, utility functions |

## 🔧 Common Tasks

### Change Party Colors
```javascript
// alliances.js
export const ALLIANCES = [
  { id: 'NDA', name: 'NDA', color: '#FFB347' },       // Change this
  { id: 'INDIA', name: 'INDIA Bloc', color: '#2ECC40' }, // Change this
  { id: 'OTHERS', name: 'Others', color: '#B39DFF' }   // Change this
];
```

### Add New Party
```javascript
// 1. Add to alliances.js
{ id: 'NEW_PARTY', name: 'New Party', color: '#FF0000' }

// 2. Update seatHexColors array in parent component
const seatHexColors = ['#FFB347', '#FF0000', ...]; // Add new color
```

### Disable Holograms
```javascript
// SeatFacesLayer.jsx - Already handled by flag
disableHolograms={true}  // No glow/panel effects
disableHolograms={false} // Full hologram effects
```

## 📊 Seat Layout Reference

```
Seat Index Mapping (243 total):
┌─────────────────────────────────────────┐
│ Spoke 1: 0-49   (50 seats)             │
│ Spoke 2: 50-99  (50 seats)             │
│ Central R: 100-121 (22 seats)          │
│ Central L: 122-142 (21 seats)          │
│ Spoke 5: 143-192 (50 seats)            │
│ Spoke 6: 193-242 (50 seats)            │
└─────────────────────────────────────────┘
```

## 🎨 Color Reference

| Party | Hex Color | Usage |
|-------|-----------|-------|
| NDA | `#FFB347` | Saffron (BJP/NDA) |
| INDIA | `#2ECC40` | Green (Opposition) |
| Others | `#B39DFF` | Lavender (Third parties) |
| Undecided | `#777777` | Gray (No data) |

## 🔍 Debugging Quick Fixes

### Colors Not Showing
```javascript
// Check feature flag
const PARTY_MAPPING_WITH_SEAT_COLOR = true;

// Check seatHexColors array length (should be 243)
console.log(seatHexColors?.length); // Should log 243
```

### Performance Issues
```javascript
// Check draw calls in browser DevTools
// Traditional mode: 2 draw calls
// Party mode: 2N draw calls (N = number of parties)
```

### Holograms Not Disabling
```javascript
// Check disableHolograms prop
<SeatFacesLayer disableHolograms={true} />
```

## 📱 Mobile Testing

```bash
# Test on mobile device
npm start
# Access via network IP: http://192.168.x.x:3000
```

## 🚀 Deployment Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Netlify
npm run deploy:preview  # Preview deployment
npm run deploy:prod     # Production deployment
```

## 🐛 Common Error Solutions

### "Cannot read properties of undefined"
```javascript
// Add null checks
const hexColor = (seatHexColors && seatHexColors[i]) || '#777777';
```

### "InstancedMesh not rendering"
```javascript
// Check matrix updates
useEffect(() => {
  if (ref.current && matrices.length) {
    for (let i = 0; i < matrices.length; i += 1) {
      ref.current.setMatrixAt(i, matrices[i]);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }
}, [matrices]);
```

### "Feature flag not working"
```javascript
// Ensure flag is used in conditional rendering
{PARTY_MAPPING_WITH_SEAT_COLOR ? (
  // Party-colored rendering
) : (
  // Traditional rendering
)}
```

## 📞 Need Help?

1. **Check README.md** - Comprehensive documentation
2. **Check TECHNICAL_DOCS.md** - Deep technical details
3. **Check inline comments** - Detailed code explanations
4. **Check browser console** - Error messages and logs

---

**This quick reference gets you up and running in minutes!**







