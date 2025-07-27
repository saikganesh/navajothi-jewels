import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { clearWishlist } from '@/store/slices/wishlistSlice';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Clear all user-related data from Redux store
      dispatch(clearAuth());
      dispatch(clearCart());
      dispatch(clearWishlist());

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while signing out.",
        variant: "destructive",
      });
    }
  }, [dispatch, toast, navigate]);

  return {
    signOut,
  };
};