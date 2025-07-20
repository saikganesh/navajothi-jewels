
import { useState, useCallback, useEffect } from 'react';
import { CartItem, Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAppSelector((state) => state.auth);

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      console.log('Fetching cart items for user:', user.id);
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
        .eq('user_id', user.id);

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

        // Fetch net_weight and stock_quantity from karat tables
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
      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setItems([]);
    }
  }, [user]);

  // Fetch cart items when user changes
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Calculate new quantity, ensuring it doesn't exceed 10
        const newQuantity = Math.min(existingItem.quantity + quantity, 10);
        
        if (existingItem.quantity + quantity > 10) {
          toast({
            title: "Quantity Limit",
            description: `Maximum quantity of 10 allowed. Added ${newQuantity - existingItem.quantity} to cart.`,
            variant: "destructive",
          });
        }
        
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;

        toast({
          title: "Item Updated",
          description: `${product.name} quantity updated in cart.`,
        });
      } else {
        // Insert new item with the specified quantity (max 10)
        const finalQuantity = Math.min(quantity, 10);
        
        if (quantity > 10) {
          toast({
            title: "Quantity Limit",
            description: `Maximum quantity of 10 allowed. Added ${finalQuantity} to cart.`,
            variant: "destructive",
          });
        }
        
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: finalQuantity
          });

        if (error) throw error;

        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart.`,
        });
      }

      // Refresh cart items
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  }, [user, fetchCartItems]);

  const removeItem = useCallback(async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      const item = items.find(item => item.id === productId);
      if (item) {
        toast({
          title: "Item Removed",
          description: `${item.name} has been removed from your cart.`,
        });
      }

      await fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [user, items, fetchCartItems]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [user, removeItem, fetchCartItems]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [user]);

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
