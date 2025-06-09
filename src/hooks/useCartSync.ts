
import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';

export const useCartSync = () => {
  const { items } = useCart();

  useEffect(() => {
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items'
        },
        () => {
          // Cart changes will trigger a re-fetch in useCart
          console.log('Cart updated via real-time');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { items };
};
