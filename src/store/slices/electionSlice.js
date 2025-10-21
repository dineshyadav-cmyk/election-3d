import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBiharElectionData } from '../../services/electionAPI';
import biharTimeline from '../../data/biharElectionTimeline.json';

// Async thunk for fetching Bihar election data
export const fetchBiharElectionData = createAsyncThunk(
  'election/fetchBiharElectionData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getBiharElectionData();
      return data;
    } catch (error) {
      console.error('Failed to fetch Bihar election data:', error);
      return rejectWithValue({
        message: 'Failed to load election data. Using fallback data.',
        error: error.message
      });
    }
  }
);

// Simple initial state - only essential data
const initialState = {
  // Election data
  electionData: null,
  constituencyData: null,
  currentTimeline: biharTimeline,
  currentIndex: biharTimeline.length - 1, // LIVE by default
  
  // UI states
  expandedSeat: null,
  loading: false,
  error: null
};

const electionSlice = createSlice({
  name: 'election',
  initialState,
  reducers: {
    // Timeline controls
    setCurrentIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
    
    // Expanded seat control
    setExpandedSeat: (state, action) => {
      state.expandedSeat = action.payload;
    },
    
    clearExpandedSeat: (state) => {
      state.expandedSeat = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bihar election data
      .addCase(fetchBiharElectionData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBiharElectionData.fulfilled, (state, action) => {
        state.loading = false;
        state.electionData = action.payload;
        
        // Set constituency data if available
        if (action.payload && action.payload.cns_rslt) {
          state.constituencyData = action.payload.cns_rslt;
        }
        
        // Update timeline if available in API data
        if (action.payload && action.payload.timeline) {
          state.currentTimeline = action.payload.timeline;
        }
        
        state.error = null;
      })
      .addCase(fetchBiharElectionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load election data';
        // Keep using fallback timeline data
        state.currentTimeline = biharTimeline;
      });
  }
});

// Export actions
export const {
  setCurrentIndex,
  setExpandedSeat,
  clearExpandedSeat,
  clearError
} = electionSlice.actions;

// Simple selectors
export const selectElectionData = (state) => state.election.electionData;
export const selectConstituencyData = (state) => state.election.constituencyData;
export const selectCurrentTimeline = (state) => state.election.currentTimeline;
export const selectCurrentIndex = (state) => state.election.currentIndex;
export const selectExpandedSeat = (state) => state.election.expandedSeat;
export const selectLoading = (state) => state.election.loading;
export const selectError = (state) => state.election.error;

export default electionSlice.reducer;
