import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';

interface GoldPriceState {
  goldPrice22kt: number;
  goldPrice18kt: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: GoldPriceState = {
  goldPrice22kt: 5000, // Default fallback
  goldPrice18kt: 4090, // Default fallback
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk to fetch gold prices
export const fetchGoldPrices = createAsyncThunk(
  'goldPrice/fetchGoldPrices',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('gold_price_log')
        .select('kt22_price, kt18_price, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      return {
        goldPrice22kt: Number(data.kt22_price) || 5000,
        goldPrice18kt: Number(data.kt18_price) || 4090,
        lastUpdated: data.created_at,
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch gold prices');
    }
  }
);

const goldPriceSlice = createSlice({
  name: 'goldPrice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoldPrices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoldPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goldPrice22kt = action.payload.goldPrice22kt;
        state.goldPrice18kt = action.payload.goldPrice18kt;
        state.lastUpdated = action.payload.lastUpdated;
        state.error = null;
      })
      .addCase(fetchGoldPrices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default goldPriceSlice.reducer;