
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setUser,
  setItems,
  optimisticAddToCart,
  optimisticRemoveFromCart,
  optimisticUpdateQuantity,
  addToCartAsync,
  removeFromCartAsync,
  updateCartQuantityAsync,
  clearCart as clearCartAction
} from '@/store/slices/cartSlice';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';

export const useCartRedux = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, user, pendingOperations } = useAppSelector(state => state.cart);

  // Fetch cart items from database
  const fetchCartItems = useCallback(async (userId: string) => {
    try {
      console.log('Fetching cart items for user:', userId);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            description,
            images,
            category_id,
            available_karats,
            categories (
              name
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const cartItems: CartItem[] = [];
      
      for (const item of data || []) {
        // Safely extract the first image from the images array
        let imageUrl = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';
        
        if (item.products.images) {
          if (Array.isArray(item.products.images) && item.products.images.length > 0) {
            const firstImage = item.products.images[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            }
          } else if (typeof item.products.images === 'string') {
            imageUrl = item.products.images;
          }
        }

        // Get net_weight and stock_quantity from karat tables
        let netWeight = 0;
        let stockQuantity = 0;
        let availableKarats: string[] = ['22kt']; // default fallback
        
        if (item.products.available_karats) {
          if (Array.isArray(item.products.available_karats)) {
            availableKarats = item.products.available_karats.filter((k): k is string => typeof k === 'string');
          }
        }
        
        // Try to get net_weight and stock_quantity from the first available karat
        if (availableKarats.includes('22kt')) {
          const { data: karat22Data } = await supabase
            .from('karat_22kt')
            .select('net_weight, stock_quantity')
            .eq('product_id', item.products.id)
            .single();
          
          netWeight = karat22Data?.net_weight || 0;
          stockQuantity = karat22Data?.stock_quantity || 0;
        } else if (availableKarats.includes('18kt')) {
          const { data: karat18Data } = await supabase
            .from('karat_18kt')
            .select('net_weight, stock_quantity')
            .eq('product_id', item.products.id)
            .single();
          
          netWeight = karat18Data?.net_weight || 0;
          stockQuantity = karat18Data?.stock_quantity || 0;
        }

        cartItems.push({
          id: item.products.id,
          name: item.products.name,
          description: item.products.description || '',
          price: 0, // Will be calculated by useGoldPrice
          image: imageUrl,
          category: item.products.categories?.name || 'Jewelry',
          inStock: stockQuantity > 0,
          quantity: item.quantity,
          net_weight: netWeight,
          available_karats: availableKarats,
          stock_quantity: stockQuantity,
          category_id: item.products.category_id
        });
      }

      console.log('Cart items updated:', cartItems.length);
      dispatch(setItems(cartItems));
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, [dispatch]);

  // Initialize user and auth state
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      dispatch(setUser(user));
      if (user) {
        fetchCartItems(user.id);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user ?? null;
        dispatch(setUser(newUser));
        
        if (newUser) {
          fetchCartItems(newUser.id);
        } else {
          dispatch(setItems([]));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch, fetchCartItems]);

  // Set up real-time subscription for cross-device sync
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `cart_changes_${user.id}`;
    console.log('Setting up cart subscription for:', channelName);

    // Check if channel already exists
    const existingChannel = supabase.getChannels().find(ch => ch.topic === channelName);
    if (existingChannel) {
      console.log('Cart channel already exists, skipping subscription');
      return;
    }
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time cart change detected:', payload);
          fetchCartItems(user.id);
        }
      )
      .subscribe((status) => {
        console.log('Cart subscription status:', status);
      });

    return () => {
      console.log('Cleaning up cart subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchCartItems]);

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    // Create cart item from product
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price || 0,
      image: product.image,
      category: product.category,
      inStock: product.inStock,
      quantity: 0, // Will be set by optimistic update
      net_weight: product.net_weight,
      available_karats: product.available_karats,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      collection_ids: product.collection_ids
    };

    // Optimistic update
    dispatch(optimisticAddToCart({ item: cartItem, quantity }));
    
    // Background API call
    await dispatch(addToCartAsync({ productId: product.id, quantity }));
  }, [user, dispatch]);

  const removeItem = useCallback(async (productId: string) => {
    if (!user) return;

    // Optimistic update
    dispatch(optimisticRemoveFromCart(productId));
    
    // Background API call
    await dispatch(removeFromCartAsync(productId));
  }, [user, dispatch]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!user) return;

    // Optimistic update
    dispatch(optimisticUpdateQuantity({ productId, quantity }));
    
    // Background API call
    await dispatch(updateCartQuantityAsync({ productId, quantity }));
  }, [user, dispatch]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch(clearCartAction());
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [user, dispatch]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
  };
};
