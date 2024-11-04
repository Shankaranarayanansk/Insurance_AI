import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import agentReducer from './slices/agentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agent: agentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;