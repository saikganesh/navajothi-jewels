
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setUser, 
  optimisticAdd, 
  optimisticRemove, 
  addToWishlistAsync, 
  removeFromWishlistAsync, 
  fetchWishlistItems 
} from '@/store/slices/wishlistSlice';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useWishlistRedux = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isLoading, user, pendingOperations } = useAppSelector(state => state.wishlist);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      dispatch(setUser(currentUser));
      if (currentUser) {
        dispatch(fetchWishlistItems());
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        dispatch(setUser(currentUser));
        if (currentUser) {
          dispatch(fetchWishlistItems());
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);

  // Set up real-time subscription for cross-device sync
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `wishlist_changes_${user.id}`;
    console.log('Setting up wishlist subscription for:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time wishlist change detected:', payload);
          // Refetch wishlist data when changes occur from other devices
          dispatch(fetchWishlistItems());
        }
      )
      .subscribe((status) => {
        console.log('Wishlist subscription status:', status);
      });

    return () => {
      console.log('Cleaning up wishlist subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, dispatch]);

  const addToWishlist = async (productId: string, karatSelected: '22kt' | '18kt', productData?: any) => {
    if (!user) {
      navigate('/auth');
      return false;
    }

    // Optimistic update
    dispatch(optimisticAdd({ productId, karatSelected, productData }));
    
    // Background API call
    const result = await dispatch(addToWishlistAsync({ productId, karatSelected }));
    
    return addToWishlistAsync.fulfilled.match(result);
  };

  const removeFromWishlist = async (productId: string, karatSelected: '22kt' | '18kt') => {
    if (!user) return false;

    // Optimistic update
    dispatch(optimisticRemove({ productId, karatSelected }));
    
    // Background API call
    const result = await dispatch(removeFromWishlistAsync({ productId, karatSelected }));
    
    return removeFromWishlistAsync.fulfilled.match(result);
  };

  const isInWishlist = (productId: string, karatSelected: '22kt' | '18kt') => {
    return items.some(
      item => item.product_id === productId && item.karat_selected === karatSelected
    );
  };

  const isPending = (productId: string, karatSelected: '22kt' | '18kt') => {
    const key = `${productId}-${karatSelected}`;
    return pendingOperations.includes(key);
  };

  return {
    wishlistItems: items,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isPending,
    wishlistCount: items.length,
    user
  };
};
