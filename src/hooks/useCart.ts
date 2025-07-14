
import { useState, useCallback, useEffect } from 'react';
import { CartItem, Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchCartItems(user.id);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchCartItems(session.user.id);
        } else {
          setItems([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Listen for cart updates from real-time sync
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user) {
        fetchCartItems(user.id);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [user]);

  const fetchCartItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            description,
            net_weight,
            images,
            in_stock,
            collections (
              name,
              categories (
                name
              )
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map(item => {
        // Safely extract the first image from the images array
        let imageUrl = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';
        
        if (item.products.images) {
          if (Array.isArray(item.products.images) && item.products.images.length > 0) {
            // Type-cast the Json to string since we know it should be a string URL
            const firstImage = item.products.images[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            }
          } else if (typeof item.products.images === 'string') {
            imageUrl = item.products.images;
          }
        }

        return {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description || '',
          price: 0, // Will be calculated by useGoldPrice
          image: imageUrl,
          category: item.products.collections?.categories?.name || 'Jewelry',
          inStock: item.products.in_stock,
          quantity: item.quantity,
          net_weight: item.products.net_weight || 0
        };
      });

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

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
      fetchCartItems(user.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  }, [user]);

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

      fetchCartItems(user.id);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [user, items]);

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

      fetchCartItems(user.id);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [user, removeItem]);

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
