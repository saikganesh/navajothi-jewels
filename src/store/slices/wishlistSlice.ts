
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
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
