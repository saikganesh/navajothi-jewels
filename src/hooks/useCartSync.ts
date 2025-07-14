
import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

export const useCartSync = () => {
  const { items } = useCart();

  // This hook simply ensures that cart state is synced across components
  // The actual cart updates are handled by useCart itself
  
  return { items };
};
