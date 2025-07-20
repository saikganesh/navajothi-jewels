
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CartItem } from '@/types/product';

interface CartState {
  items: CartItem[];
  pendingOperations: string[]; // product IDs being processed
  isLoading: boolean;
  user: any | null;
}

const initialState: CartState = {
  items: [],
  pendingOperations: [],
  isLoading: false,
  user: null,
};

// Async thunk for adding to cart
export const addToCartAsync = createAsyncThunk(
  'cart/addAsync',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const user = state.cart.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Calculate new quantity, ensuring it doesn't exceed 10
        const newQuantity = Math.min(existingItem.quantity + quantity, 10);
        
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;

        return { productId, quantity: newQuantity, isUpdate: true };
      } else {
        // Insert new item with the specified quantity (max 10)
        const finalQuantity = Math.min(quantity, 10);
        
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: finalQuantity
          });

        if (error) throw error;

        return { productId, quantity: finalQuantity, isUpdate: false };
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to cart');
    }
  }
);

// Async thunk for removing from cart
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeAsync',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const user = state.cart.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from cart');
    }
  }
);

// Async thunk for updating cart quantity
export const updateCartQuantityAsync = createAsyncThunk(
  'cart/updateQuantityAsync',
  async ({ productId, quantity }: { productId: string; quantity: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const user = state.cart.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        return { productId, quantity: 0, removed: true };
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        return { productId, quantity, removed: false };
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    setItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    optimisticAddToCart: (state, action: PayloadAction<{ item: CartItem; quantity: number }>) => {
      const { item, quantity } = action.payload;
      if (!state.pendingOperations.includes(item.id)) {
        state.pendingOperations.push(item.id);
      }
      
      const existingIndex = state.items.findIndex(cartItem => cartItem.id === item.id);
      if (existingIndex >= 0) {
        // Update existing item
        state.items[existingIndex].quantity = Math.min(state.items[existingIndex].quantity + quantity, 10);
      } else {
        // Add new item
        state.items.push({ ...item, quantity: Math.min(quantity, 10) });
      }
    },
    optimisticRemoveFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (!state.pendingOperations.includes(productId)) {
        state.pendingOperations.push(productId);
      }
      state.items = state.items.filter(item => item.id !== productId);
    },
    optimisticUpdateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      if (!state.pendingOperations.includes(productId)) {
        state.pendingOperations.push(productId);
      }
      
      if (quantity <= 0) {
        state.items = state.items.filter(item => item.id !== productId);
      } else {
        const itemIndex = state.items.findIndex(item => item.id === productId);
        if (itemIndex >= 0) {
          state.items[itemIndex].quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        const { productId } = action.payload;
        state.pendingOperations = state.pendingOperations.filter(op => op !== productId);
        
        toast({
          title: "Added to Cart",
          description: "Item added to your cart successfully",
        });
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        const { productId } = action.meta.arg;
        state.pendingOperations = state.pendingOperations.filter(op => op !== productId);
        
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      })
      // Remove from cart
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        const productId = action.payload;
        state.pendingOperations = state.pendingOperations.filter(op => op !== productId);
        
        toast({
          title: "Item Removed",
          description: "Item removed from your cart",
        });
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        const productId = action.meta.arg;
        state.pendingOperations = state.pendingOperations.filter(op => op !== productId);
        
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
      })
      // Update quantity
      .addCase(updateCartQuantityAsync.fulfilled, (state, action) => {
        const { productId } = action.payload;
        state.pendingOperations = state.pendingOperations.filter(op => op !== productId);
      })
      .addCase(updateCartQuantityAsync.rejected, (state, action) => {
        const { productId } = action.meta.arg;
        state.pendingOperations = state.pendingOperations.filter(op => op !== productId);
        
        toast({
          title: "Error",
          description: "Failed to update cart quantity",
          variant: "destructive",
        });
      });
  },
});

export const {
  setUser,
  setItems,
  optimisticAddToCart,
  optimisticRemoveFromCart,
  optimisticUpdateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
