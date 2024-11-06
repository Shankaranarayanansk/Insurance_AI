import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axiosConfig';

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return {
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  }
};

const initialState = loadState();

// Save state to localStorage
const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    // Handle errors
  }
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string; role?: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string) => {
    const response = await api.post(`/auth/verify-email/${token}`);
    return response.data;
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }: { token: string; password: string }) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('authState');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        saveState(state);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
        saveState(state);
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        saveState(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        saveState(state);
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        saveState(state);
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Email verification failed';
        saveState(state);
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        saveState(state);
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send reset email';
        saveState(state);
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        saveState(state);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Password reset failed';
        saveState(state);
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;