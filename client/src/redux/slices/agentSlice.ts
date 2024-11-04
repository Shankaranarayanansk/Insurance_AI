import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosConfig';

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
  isActive: boolean;
}

interface AgentState {
  availability: AgentAvailability | null;
  loading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  availability: null,
  loading: false,
  error: null,
};

export const fetchAvailability = createAsyncThunk(
  'agent/fetchAvailability',
  async () => {
    const response = await axios.get('/api/agent/availability');
    return response.data;
  }
);

export const updateAvailability = createAsyncThunk(
  'agent/updateAvailability',
  async (data: { availabilitySlots: TimeSlot[], maxAppointmentsPerDay?: number }) => {
    const response = await axios.post('/api/agent/availability', data);
    return response.data;
  }
);

export const addOutOfOffice = createAsyncThunk(
  'agent/addOutOfOffice',
  async (data: { startDate: string; endDate: string; reason: string }) => {
    const response = await axios.post('/api/agent/out-of-office', data);
    return response.data;
  }
);

export const removeOutOfOffice = createAsyncThunk(
  'agent/removeOutOfOffice',
  async (id: string) => {
    const response = await axios.delete(`/api/agent/out-of-office/${id}`);
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
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch availability';
      })
      // Update Availability
      .addCase(updateAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update availability';
      })
      // Add Out of Office
      .addCase(addOutOfOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOutOfOffice.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(addOutOfOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add out of office';
      })
      // Remove Out of Office
      .addCase(removeOutOfOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeOutOfOffice.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(removeOutOfOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove out of office';
      });
  },
});

export const { clearError } = agentSlice.actions;
export default agentSlice.reducer;