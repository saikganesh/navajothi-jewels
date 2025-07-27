
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  redirectAfterAuth: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  redirectAfterAuth: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.isLoading = false;
      state.isInitialized = true;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRedirectAfterAuth: (state, action: PayloadAction<string | null>) => {
      state.redirectAfterAuth = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.isLoading = false;
      state.isInitialized = true;
      state.redirectAfterAuth = null;
    },
  },
});

export const { setAuthData, setAuthLoading, setRedirectAfterAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
