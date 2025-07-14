
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCartSync = () => {
  const refetchCart = useCallback(() => {
    // Trigger a custom event that useCart can listen to
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }, []);

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
          console.log('Cart updated via real-time');
          refetchCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchCart]);

  return {};
};
