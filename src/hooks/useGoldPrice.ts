
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGoldPrice = () => {
  const [goldPrice, setGoldPrice] = useState<number>(5000); // Default fallback
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoldPrice();
  }, []);

  const fetchGoldPrice = async () => {
    try {
      const { data, error } = await supabase
        .from('globals')
        .select('variable_value')
        .eq('variable_name', 'gold_price_per_gram')
        .single();

      if (error) {
        console.error('Error fetching gold price:', error);
        return;
      }

      if (data) {
        setGoldPrice(Number(data.variable_value) || 5000);
      }
    } catch (error) {
      console.error('Error fetching gold price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = (netWeight: number | null) => {
    if (!netWeight || netWeight <= 0) return 0;
    return netWeight * goldPrice;
  };

  return { goldPrice, isLoading, calculatePrice, refetch: fetchGoldPrice };
};
