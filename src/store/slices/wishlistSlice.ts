
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  karat_selected: '22kt' | '18kt' | '14kt' | '9kt';
  created_at: string;
  products: {
    id: string;
    name: string;
    images: string[];
    karat_22kt?: Array<{
      gross_weight: number | null;
      net_weight: number | null;
    }>;
    karat_18kt?: Array<{
      gross_weight: number | null;
      net_weight: number | null;
    }>;
    karat_14kt?: Array<{
      gross_weight: number | null;
      net_weight: number | null;
    }>;
    karat_9kt?: Array<{
      gross_weight: number | null;
      net_weight: number | null;
    }>;
    making_charge_percentage?: number;
  };
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
    addWishlistItem: (state, action: PayloadAction<WishlistItem>) => {
      state.items.push(action.payload);
    },
    removeWishlistItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product_id !== action.payload);
    },
    setWishlistLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { 
  setWishlistItems, 
  addWishlistItem, 
  removeWishlistItem, 
  setWishlistLoading, 
  clearWishlist 
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
