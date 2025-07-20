
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector } from '@/store';

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
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const fetchWishlistItems = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

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
      
      setWishlistItems(transformedData);
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
  }, [user, toast]);

  // Fetch wishlist items when user changes
  useEffect(() => {
    fetchWishlistItems();
  }, [fetchWishlistItems]);

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
      
      await fetchWishlistItems(); // Refresh the list
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
      
      await fetchWishlistItems(); // Refresh the list
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
