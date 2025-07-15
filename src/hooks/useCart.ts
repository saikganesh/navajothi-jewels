
import { useState, useCallback, useEffect, useRef } from 'react';
import { CartItem, Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Global subscription management to prevent multiple subscriptions
let globalSubscription: any = null;
let globalUser: any = null;
let subscriptionCount = 0;

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const isInitialized = useRef(false);

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

      console.log('Cart items updated:', cartItems.length);
      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, []);

  // Initialize user and subscription management
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      globalUser = user;
      if (user) {
        fetchCartItems(user.id);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        globalUser = newUser;
        
        if (newUser) {
          fetchCartItems(newUser.id);
        } else {
          setItems([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchCartItems]);

  // Manage real-time subscription globally
  useEffect(() => {
    subscriptionCount++;
    console.log('Subscription count increased to:', subscriptionCount);

    const setupRealtimeSubscription = () => {
      if (!globalUser?.id) {
        // Clean up global subscription if no user
        if (globalSubscription) {
          console.log('Cleaning up global subscription due to no user');
          supabase.removeChannel(globalSubscription);
          globalSubscription = null;
        }
        return;
      }

      // Only create subscription if it doesn't exist
      if (!globalSubscription) {
        const channelName = `cart_changes_${globalUser.id}`;
        console.log('Setting up global real-time subscription for:', channelName);
        
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cart_items',
              filter: `user_id=eq.${globalUser.id}`
            },
            (payload) => {
              console.log('Real-time cart change detected:', payload);
              fetchCartItems(globalUser.id);
            }
          )
          .subscribe((status) => {
            console.log('Global subscription status:', status);
          });

        globalSubscription = channel;
      }
    };

    setupRealtimeSubscription();

    return () => {
      subscriptionCount--;
      console.log('Subscription count decreased to:', subscriptionCount);
      
      // Only clean up subscription when no components are using it
      if (subscriptionCount === 0 && globalSubscription) {
        console.log('Cleaning up global subscription - no active components');
        supabase.removeChannel(globalSubscription);
        globalSubscription = null;
      }
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

      // Refresh cart items immediately
      await fetchCartItems(user.id);
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

      await fetchCartItems(user.id);
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

      await fetchCartItems(user.id);
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
