
import { useCartRedux } from '@/hooks/useCartRedux';

export const useCartSync = () => {
  const { items } = useCartRedux();
  return { items };
};
