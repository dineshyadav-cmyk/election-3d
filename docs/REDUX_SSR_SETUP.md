# Simple Redux Store Setup

This document explains the simplified Redux store implementation for the Bihar Elections 3D View application.

## 🏗️ Architecture Overview

### Redux Store Structure
```
src/store/
├── index.js              # Main store configuration
├── hooks.js              # Typed Redux hooks
└── slices/
    └── electionSlice.js  # Election data slice with async thunks
```


## 🚀 Quick Start

The app uses Redux for state management with client-side data fetching:

```bash
npm start
```

## 📊 Redux Store Features

### State Management (Simplified)
- **Election Data**: Bihar 2020 election results and timeline
- **Current Index**: Timeline position (which time point to display)
- **Expanded Seat**: Currently selected/expanded seat index
- **Loading State**: API loading status and error handling

**Note**: 3D scene state (camera controls, seat matrices, etc.) is managed locally in components for simplicity.

### Async Thunks
- `fetchBiharElectionData`: Fetches election data from Times of India API
- Automatic fallback to static data on failure
- Client-side data fetching with error handling

### Available Actions & Selectors
```javascript
// Actions
import { 
  fetchBiharElectionData,  // Async thunk
  setCurrentIndex,         // Change timeline position
  setExpandedSeat,         // Set expanded seat
  clearExpandedSeat,       // Clear expanded seat
  clearError              // Clear error state
} from './store/slices/electionSlice';

// Selectors
import {
  selectElectionData,      // Raw election API data
  selectConstituencyData,  // Constituency results
  selectCurrentTimeline,   // Timeline array
  selectCurrentIndex,      // Current timeline index
  selectExpandedSeat,      // Currently expanded seat
  selectLoading,           // Loading state
  selectError             // Error message
} from './store/slices/electionSlice';
```

## 🔧 Usage Examples

### Usage Examples

#### Dispatching Actions
```javascript
import { useAppDispatch } from './store/hooks';
import { setCurrentIndex, setExpandedSeat, fetchBiharElectionData } from './store/slices/electionSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  
  // Change timeline index
  dispatch(setCurrentIndex(5));
  
  // Set expanded seat
  dispatch(setExpandedSeat(42));
  
  // Clear expanded seat
  dispatch(clearExpandedSeat());
  
  // Fetch fresh data
  dispatch(fetchBiharElectionData());
}
```

#### Using Selectors
```javascript
import { useAppSelector } from './store/hooks';
import { 
  selectCurrentTimeline, 
  selectCurrentIndex,
  selectLoading,
  selectExpandedSeat 
} from './store/slices/electionSlice';

function MyComponent() {
  const timeline = useAppSelector(selectCurrentTimeline);
  const currentIndex = useAppSelector(selectCurrentIndex);
  const loading = useAppSelector(selectLoading);
  const expandedSeat = useAppSelector(selectExpandedSeat);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Timeline has {timeline.length} entries</p>
      <p>Current: {timeline[currentIndex]?.time}</p>
      {expandedSeat !== null && <p>Seat {expandedSeat} is expanded</p>}
    </div>
  );
}
```


## 🔄 Data Flow

### Data Flow
1. App starts with fallback timeline data
2. Redux dispatches `fetchBiharElectionData` thunk on component mount
3. API call fetches live data from Times of India
4. Store updates with fresh data
5. Components re-render with new data
6. All state changes are managed through Redux actions

## 🛠️ Configuration

### Environment Variables
```bash
# API Configuration
REACT_APP_API_TIMEOUT=10000
REACT_APP_CORS_PROXY_URL=your-proxy-url
```

### Store Configuration
```javascript
// Custom middleware
const store = configureStore({
  reducer: { election: electionReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['your-custom-actions']
      }
    })
});
```

## 🚨 Error Handling

### Error Handling
- API failures fall back to static timeline data
- Error messages displayed in UI
- Retry mechanisms for transient failures
- Graceful degradation with fallback state

## 📈 Performance Optimizations

### Performance Optimizations
- Memoized selectors prevent unnecessary re-renders
- Cached color calculations for seat rendering
- Efficient state updates with Immer
- Async data fetching with proper loading states

## 🔍 Debugging

### Redux DevTools
The store is configured to work with Redux DevTools:
```javascript
// In development
window.__REDUX_DEVTOOLS_EXTENSION__?.()
```

### Common Issues
1. **API Timeouts**: Adjust timeout values for slow networks
2. **Memory Leaks**: Properly dispose of Three.js objects in cleanup
3. **State Updates**: Ensure all state changes go through Redux actions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy
Use the standard React build output with any static hosting service like Netlify, Vercel, or AWS S3.

## 📚 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)

## 🤝 Contributing

When adding new features:
1. Add actions and reducers to the appropriate slice
2. Create selectors for complex state derivations
3. Update SSR utilities if server-side data is needed
4. Add proper TypeScript types (if migrating to TS)
5. Update this documentation
