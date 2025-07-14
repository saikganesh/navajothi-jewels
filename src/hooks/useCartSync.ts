
import { useCart } from '@/hooks/useCart';

export const useCartSync = () => {
  const { items } = useCart();
  return { items };
};
