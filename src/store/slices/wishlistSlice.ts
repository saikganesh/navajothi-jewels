
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WishlistItem {
  id: string;
  product_id: string;
  karat_selected: '22kt' | '18kt';
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
    making_charge_percentage?: number;
  };
}

interface WishlistState {
  items: WishlistItem[];
  pendingOperations: Set<string>; // product_id + karat combinations
  isLoading: boolean;
  user: any | null;
}

const initialState: WishlistState = {
  items: [],
  pendingOperations: new Set(),
  isLoading: false,
  user: null,
};

// Async thunk for adding to wishlist
export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addAsync',
  async ({ productId, karatSelected }: { productId: string; karatSelected: '22kt' | '18kt' }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wishlist: WishlistState };
      const user = state.wishlist.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId,
          karat_selected: karatSelected
        });

      if (error) {
        if (error.code === '23505') {
          return rejectWithValue('Item already in wishlist');
        }
        throw error;
      }

      return { productId, karatSelected };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to wishlist');
    }
  }
);

// Async thunk for removing from wishlist
export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeAsync',
  async ({ productId, karatSelected }: { productId: string; karatSelected: '22kt' | '18kt' }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wishlist: WishlistState };
      const user = state.wishlist.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('karat_selected', karatSelected);

      if (error) throw error;

      return { productId, karatSelected };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from wishlist');
    }
  }
);

// Async thunk for fetching wishlist items
export const fetchWishlistItems = createAsyncThunk(
  'wishlist/fetchItems',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wishlist: WishlistState };
      const user = state.wishlist.user;

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          karat_selected,
          created_at,
          products (
            id,
            name,
            images,
            making_charge_percentage,
            karat_22kt (
              gross_weight,
              net_weight
            ),
            karat_18kt (
              gross_weight,
              net_weight
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: WishlistItem[] = (data || []).map(item => ({
        ...item,
        karat_selected: item.karat_selected as '22kt' | '18kt',
        products: {
          ...item.products,
          images: Array.isArray(item.products.images) 
            ? item.products.images.map(img => String(img)).filter(img => img && img !== 'null')
            : []
        }
      }));

      return transformedData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist items');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    optimisticAdd: (state, action: PayloadAction<{ productId: string; karatSelected: '22kt' | '18kt'; productData?: any }>) => {
      const { productId, karatSelected, productData } = action.payload;
      const key = `${productId}-${karatSelected}`;
      
      // Add to pending operations
      state.pendingOperations.add(key);
      
      // Add optimistic item if we have product data
      if (productData) {
        const optimisticItem: WishlistItem = {
          id: `temp-${Date.now()}`,
          product_id: productId,
          karat_selected: karatSelected,
          created_at: new Date().toISOString(),
          products: productData
        };
        state.items.unshift(optimisticItem);
      }
    },
    optimisticRemove: (state, action: PayloadAction<{ productId: string; karatSelected: '22kt' | '18kt' }>) => {
      const { productId, karatSelected } = action.payload;
      const key = `${productId}-${karatSelected}`;
      
      // Add to pending operations
      state.pendingOperations.add(key);
      
      // Remove item optimistically
      state.items = state.items.filter(
        item => !(item.product_id === productId && item.karat_selected === karatSelected)
      );
    },
    revertOptimisticAdd: (state, action: PayloadAction<{ productId: string; karatSelected: '22kt' | '18kt' }>) => {
      const { productId, karatSelected } = action.payload;
      // Remove the optimistic item
      state.items = state.items.filter(
        item => !(item.product_id === productId && item.karat_selected === karatSelected && item.id.startsWith('temp-'))
      );
    },
    revertOptimisticRemove: (state, action: PayloadAction<{ productId: string; karatSelected: '22kt' | '18kt'; originalItem: WishlistItem }>) => {
      const { originalItem } = action.payload;
      // Add the item back
      state.items.unshift(originalItem);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist items
      .addCase(fetchWishlistItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlistItems.rejected, (state) => {
        state.isLoading = false;
      })
      // Add to wishlist
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        const { productId, karatSelected } = action.payload;
        const key = `${productId}-${karatSelected}`;
        state.pendingOperations.delete(key);
        
        toast({
          title: "Added to Wishlist",
          description: "Item added to your wishlist successfully",
        });
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        const { productId, karatSelected } = action.meta.arg;
        const key = `${productId}-${karatSelected}`;
        state.pendingOperations.delete(key);
        
        // Revert optimistic change
        state.items = state.items.filter(
          item => !(item.product_id === productId && item.karat_selected === karatSelected && item.id.startsWith('temp-'))
        );
        
        const errorMessage = action.payload as string;
        toast({
          title: errorMessage === 'Item already in wishlist' ? "Already in Wishlist" : "Error",
          description: errorMessage,
          variant: errorMessage === 'Item already in wishlist' ? "default" : "destructive",
        });
      })
      // Remove from wishlist
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        const { productId, karatSelected } = action.payload;
        const key = `${productId}-${karatSelected}`;
        state.pendingOperations.delete(key);
        
        toast({
          title: "Removed from Wishlist",
          description: "Item removed from your wishlist",
        });
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        const { productId, karatSelected } = action.meta.arg;
        const key = `${productId}-${karatSelected}`;
        state.pendingOperations.delete(key);
        
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist",
          variant: "destructive",
        });
        
        // Note: We would need to store the original item to revert removal
        // For now, we'll just refetch the data
      });
  },
});

export const {
  setUser,
  optimisticAdd,
  optimisticRemove,
  revertOptimisticAdd,
  revertOptimisticRemove,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
