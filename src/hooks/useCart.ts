
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCartItems, addCartItem, removeCartItem, updateCartItemQuantity, setCartLoading, clearCart } from '@/store/slices/cartSlice';

export interface CartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  net_weight?: number;
  making_charge_percentage?: number;
  stock_quantity?: number;
  category_id?: string | null;
  collection_ids?: string[] | null;
}

export interface CartItem extends CartProduct {
  quantity: number;
  product_id: string;
  user_id: string;
  variation_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, total } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      dispatch(setCartItems([]));
      return;
    }

    console.log('Fetching cart items for user:', user.id);
    dispatch(setCartLoading(true));
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform the data to match CartItem interface
      const cartItems: CartItem[] = (data || []).map(item => ({
        id: item.product_id,
        product_id: item.product_id,
        user_id: item.user_id,
        name: '', // These will be populated from product data
        description: '',
        price: 0,
        image: '',
        category: '',
        inStock: true,
        quantity: item.quantity,
        net_weight: 0,
        making_charge_percentage: 0,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      dispatch(setCartItems(cartItems));
      console.log('Cart items updated:', cartItems.length);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      dispatch(setCartLoading(false));
    }
  }, [user, dispatch, toast]);

  const addItem = async (product: CartProduct, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity
        });

      if (error) throw error;

      toast({
        title: "Added to Cart",
        description: `${product.name} added to cart`,
      });

      // Fetch updated cart items
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      toast({
        title: "Removed from Cart",
        description: "Item removed from cart",
      });

      // Fetch updated cart items
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      // Fetch updated cart items
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const clearCartItems = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch(clearCart());
      
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    isLoading,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart: clearCartItems,
    fetchCartItems,
  };
};
