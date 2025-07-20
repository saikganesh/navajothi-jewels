import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCartItems, addCartItem, removeCartItem, updateCartItemQuantity, setCartLoading, setAddingToCart, clearCart } from '@/store/slices/cartSlice';

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
  karat_selected: string;
  variation_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, total, addingToCart } = useAppSelector((state) => state.cart);
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
        .select(`
          *,
          products (
            id,
            name,
            description,
            images,
            making_charge_percentage,
            category_id,
            collection_ids,
            karat_22kt (
              net_weight,
              gross_weight,
              stock_quantity
            ),
            karat_18kt (
              net_weight,
              gross_weight,
              stock_quantity
            ),
            categories (
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform the data to match CartItem interface
      const cartItems: CartItem[] = (data || []).map(item => {
        const product = item.products;
        const karatData = item.karat_selected === '22kt' ? product?.karat_22kt?.[0] : product?.karat_18kt?.[0];
        const netWeight = karatData?.net_weight || 0;
        
        // Properly handle collection_ids conversion from Json[] to string[]
        let collectionIds: string[] = [];
        if (product?.collection_ids && Array.isArray(product.collection_ids)) {
          collectionIds = product.collection_ids
            .filter((id): id is string => typeof id === 'string')
            .map(id => String(id));
        }
        
        return {
          id: item.id,
          product_id: item.product_id,
          user_id: item.user_id,
          karat_selected: item.karat_selected,
          name: product?.name || '',
          description: product?.description || '',
          price: 0, // Will be calculated with gold price
          image: product?.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
          category: product?.categories?.name || 'Jewelry',
          inStock: (karatData?.stock_quantity || 0) > 0,
          quantity: item.quantity,
          net_weight: netWeight,
          making_charge_percentage: product?.making_charge_percentage || 0,
          stock_quantity: karatData?.stock_quantity || 0,
          category_id: product?.category_id,
          collection_ids: collectionIds,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      });

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

  const addItem = async (product: CartProduct, quantity: number = 1, karatSelected: string = '22kt') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    const loadingKey = `${product.id}-${karatSelected}`;
    dispatch(setAddingToCart({ key: loadingKey, loading: true }));

    try {
      // First check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('karat_selected', karatSelected)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        // Update existing item quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            karat_selected: karatSelected
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Added to Cart",
        description: `${product.name} (${karatSelected.toUpperCase()}) added to cart`,
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
    } finally {
      dispatch(setAddingToCart({ key: loadingKey, loading: false }));
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

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

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

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

  const isAddingToCart = (productId: string, karatSelected: string = '22kt') => {
    return addingToCart[`${productId}-${karatSelected}`] || false;
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
    isAddingToCart,
  };
};
