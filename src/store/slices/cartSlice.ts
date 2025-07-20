
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  variation_id?: string;
  created_at: string;
  updated_at: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  total: number;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.total = action.payload.length;
    },
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => item.product_id === action.payload.product_id && 
                 item.variation_id === action.payload.variation_id
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = state.items.length;
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = state.items.length;
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { 
  setCartItems, 
  addCartItem, 
  removeCartItem, 
  updateCartItemQuantity, 
  setCartLoading, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;
