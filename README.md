# Bihar Assembly 3D Visualization

A real-time 3D visualization of the Bihar Legislative Assembly for election result tracking and live broadcasting.

## 🏛️ Features

### Core Assembly Layout
- **243 Seats**: Accurately positioned in 6-spoke radial arc layout
- **Speaker's Dais**: Central podium with elevated chair
- **5-Spoke Radial Design**: 
  - Spokes 1 & 6: 50 seats each (outer wings)
  - Spokes 2 & 5: 50 seats each (inner wings) 
  - Central split: 22 seats (right) + 21 seats (left)
- **Walkways**: Consistent spacing between spokes for realistic assembly hall feel

### Party Color Visualization
- **Dynamic Theming**: Complete party-based color coding system
- **Flag-Controlled**: Toggle between hologram and party-colored modes
- **Comprehensive Coverage**: Wood, fabric, and bench materials all themed by party
- **Mobile-Optimized**: Touch-friendly interface for mobile devices

### Timeline Controls
- **Seek Bar**: Navigate through election timeline
- **Live/Replay Modes**: Switch between real-time and historical data
- **Responsive Design**: Mobile-first approach with touch controls

## 🎨 Party Color System

### When `PARTY_MAPPING_WITH_SEAT_COLOR = true`:
- **NDA Alliance**: Saffron (#FFB347) - Complete seat theming
- **INDIA Bloc**: Green (#2ECC40) - Complete seat theming  
- **Others**: Lavender (#B39DFF) - Complete seat theming
- **Undecided**: Gray (#777777) - Complete seat theming
- **Photographs**: Preserved with hologram effects removed

### When `PARTY_MAPPING_WITH_SEAT_COLOR = false`:
- **Original Mode**: Brown wood, teal fabric, hologram effects
- **Hologram Effects**: Glow and panel effects around leader photos

## 🏗️ Technical Architecture

### Key Components

#### `AssemblyLayout.jsx`
- **Main Layout Engine**: Generates 243 seats with precise positioning
- **Party Grouping Logic**: Groups seats by alliance for efficient rendering
- **Material Management**: Creates dynamic materials per party color
- **Bench Integration**: Extends party colors to desk surfaces

#### `ParliamentChairBlueprint.js`
- **Geometry Factory**: Creates merged geometries for wood and fabric parts
- **Material Creation**: Dynamic material generation for party colors
- **Performance Optimized**: Uses InstancedMesh for 243 seats with minimal draw calls

#### `SeatFacesLayer.jsx`
- **Photo Management**: Renders leader photographs on each seat
- **Hologram Control**: Conditional rendering of glow and panel effects
- **Interactive Features**: Click handlers for seat expansion

#### `SpeakerDais.jsx`
- **Central Podium**: Speaker's elevated platform and chair
- **Consistent Theming**: Matches assembly chair design language

### Performance Optimizations
- **InstancedMesh Rendering**: Single draw call per party color group
- **Geometry Merging**: Combined wood/fabric parts for efficiency
- **Conditional Rendering**: Flag-based optimization paths
- **Memory Management**: Efficient material and geometry reuse

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x (see package.json engines)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
cd "bihar-assembly-new-stable-layout-hologram-party-color"

# Install dependencies
npm install

# Start development server
npm start
```

### Development Commands
```bash
# Start development server
npm start

# Build for production
npm run build

# Preview production build locally
npm run preview

# Validate seat layout logic
npm run validate:seats

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Data Structure

### Alliance Configuration (`src/config/alliances.js`)
```javascript
export const ALLIANCES = [
  { id: 'NDA', name: 'NDA', color: '#FFB347' },       // Saffron
  { id: 'INDIA', name: 'INDIA Bloc', color: '#2ECC40' }, // Green  
  { id: 'OTHERS', name: 'Others', color: '#B39DFF' }   // Lavender
];
```

### Seat Layout Mapping
- **Seat Indices 0-49**: Spoke 1 (50 seats)
- **Seat Indices 50-99**: Spoke 2 (50 seats)
- **Seat Indices 100-121**: Central Right (22 seats)
- **Seat Indices 122-142**: Central Left (21 seats)
- **Seat Indices 143-192**: Spoke 5 (50 seats)
- **Seat Indices 193-242**: Spoke 6 (50 seats)

## 🎯 Election Day Usage

### Real-Time Updates
1. **Data Integration**: Connect to election result APIs
2. **Timeline Scrubbing**: Navigate through election progression
3. **Party Color Updates**: Dynamic seat coloring based on results
4. **Live Broadcasting**: Optimized for TV/web streaming

### Mobile Experience
- **Touch Controls**: Swipe timeline, pinch zoom
- **Responsive UI**: Adaptive layout for all screen sizes
- **Performance**: Optimized for mobile devices

## 🔧 Configuration

### Feature Flags
```javascript
// AssemblyLayout.jsx - Line 9
const PARTY_MAPPING_WITH_SEAT_COLOR = true; // Toggle party coloring
```

### Customization Points
- **Colors**: Modify alliance colors in `alliances.js`
- **Layout**: Adjust spoke angles and spacing in `AssemblyLayout.jsx`
- **Materials**: Customize wood/fabric properties in `ParliamentChairBlueprint.js`
- **Timeline**: Configure seek bar behavior in `TimelineBar.jsx`

## 📱 Deployment

### Local Development
- **Development Server**: http://localhost:3000
- **Hot Reload**: Automatic refresh on code changes
- **Debug Tools**: React DevTools integration

### Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Hosting Options
- **Netlify**: `npm run deploy:preview` / `npm run deploy:prod`
- **Vercel**: Automatic deployment from Git
- **Static Hosting**: Any CDN supporting SPA routing

## 🐛 Troubleshooting

### Common Issues
1. **Compilation Errors**: Check Node.js version (requires 20.x)
2. **Performance Issues**: Verify InstancedMesh usage and geometry merging
3. **Color Not Updating**: Check `PARTY_MAPPING_WITH_SEAT_COLOR` flag
4. **Mobile Issues**: Test touch events and responsive breakpoints

### Debug Mode
- **Console Logging**: Enable detailed seat positioning logs
- **Visual Markers**: Temporary numbered dots for seat verification
- **Performance Metrics**: Monitor draw calls and frame rates

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time data integration
- [ ] Advanced animations (confetti, transitions)
- [ ] Sound effects for major wins
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Advanced camera controls

### Technical Improvements
- [ ] WebGL optimization for older devices
- [ ] Progressive loading for large datasets
- [ ] Enhanced mobile touch controls
- [ ] Performance monitoring dashboard

## 🤝 Contributing

### Code Standards
- **ESLint**: Enforced code style and error detection
- **Prettier**: Automatic code formatting
- **Comments**: Comprehensive inline documentation
- **TypeScript**: Consider migration for better type safety

### Development Workflow
1. **Feature Branch**: Create branch for new features
2. **Documentation**: Update README and inline comments
3. **Testing**: Validate on multiple devices/browsers
4. **Performance**: Check draw calls and frame rates
5. **Review**: Code review before merge

## 📄 License

This project is developed for Bihar Assembly election visualization and broadcasting.

---

**Built with React Three Fiber, Three.js, and modern web technologies for immersive 3D election result visualization.**