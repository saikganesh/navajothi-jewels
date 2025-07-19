
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchWishlistItems();
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchWishlistItems();
        } else {
          setWishlistItems([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchWishlistItems = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
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
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string, karatSelected: '22kt' | '18kt') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId,
          karat_selected: karatSelected
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in Wishlist",
            description: "This item is already in your wishlist",
            variant: "default",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Added to Wishlist",
        description: "Item added to your wishlist successfully",
      });
      
      fetchWishlistItems(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string, karatSelected: '22kt' | '18kt') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('karat_selected', karatSelected);

      if (error) throw error;

      toast({
        title: "Removed from Wishlist",
        description: "Item removed from your wishlist",
      });
      
      fetchWishlistItems(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  const isInWishlist = (productId: string, karatSelected: '22kt' | '18kt') => {
    return wishlistItems.some(
      item => item.product_id === productId && item.karat_selected === karatSelected
    );
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: wishlistItems.length,
    user
  };
};
