import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axiosConfig';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface OutOfOffice {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface AgentAvailability {
  availabilitySlots: TimeSlot[];
  outOfOffice: OutOfOffice[];
  maxAppointmentsPerDay: number;
  timezone: string;
  isActive: boolean;
}

interface AgentState {
  availability: AgentAvailability | null;
  loading: boolean;
  error: string | null;
}

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('agentState');
    if (serializedState === null) {
      return {
        availability: null,
        loading: false,
        error: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      availability: null,
      loading: false,
      error: null,
    };
  }
};

const initialState: AgentState = loadState();

// Save state to localStorage
const saveState = (state: AgentState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('agentState', serializedState);
  } catch (err) {
    // Handle errors
  }
};

export const fetchAvailability = createAsyncThunk(
  'agent/fetchAvailability',
  async () => {
    const response = await api.get('/api/agent/availability');
    return response.data;
  }
);

export const updateAvailability = createAsyncThunk(
  'agent/updateAvailability',
  async (data: { availabilitySlots: TimeSlot[], maxAppointmentsPerDay?: number, timezone: string }) => {
    const response = await api.post('/api/agent/availability', data);
    return response.data;
  }
);

export const addOutOfOffice = createAsyncThunk(
  'agent/addOutOfOffice',
  async (data: { startDate: string; endDate: string; reason: string }) => {
    const response = await api.post('/api/agent/out-of-office', data);
    return response.data;
  }
);

export const removeOutOfOffice = createAsyncThunk(
  'agent/removeOutOfOffice',
  async (id: string) => {
    const response = await api.delete(`/api/agent/out-of-office/${id}`);
    return response.data;
  }
);

export const getAvailableSlots = createAsyncThunk(
  'agent/getAvailableSlots',
  async ({ agentId, date }: { agentId: string; date: string }) => {
    const response = await api.get(`/api/agent/available-slots/${agentId}?date=${date}`);
    return response.data;
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Availability
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
        saveState(state);
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch availability';
        saveState(state);
      })
      // Update Availability
      .addCase(updateAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
        saveState(state);
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update availability';
        saveState(state);
      })
      // Add Out of Office
      .addCase(addOutOfOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOutOfOffice.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
        saveState(state);
      })
      .addCase(addOutOfOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add out of office';
        saveState(state);
      })
      // Remove Out of Office
      .addCase(removeOutOfOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeOutOfOffice.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
        saveState(state);
      })
      .addCase(removeOutOfOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove out of office';
        saveState(state);
      })
      // Get Available Slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch available slots';
        saveState(state);
      });
  },
});

export const { clearError } = agentSlice.actions;
export default agentSlice.reducer;