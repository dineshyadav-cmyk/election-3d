import { configureStore } from '@reduxjs/toolkit';
import electionReducer from './slices/electionSlice';

export const store = configureStore({
  reducer: {
    election: electionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});
