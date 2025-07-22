
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoldPrices {
  karat_24: number;
  karat_22: number;
  karat_18: number;
  timestamp: string;
}

export const useLatestGoldPrices = () => {
  const [goldPrices, setGoldPrices] = useState<GoldPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestGoldPrices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('gold_price_log')
        .select('karat_24, karat_22, karat_18, timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest gold prices:', error);
        setError('Failed to fetch gold prices');
        return;
      }

      if (data) {
        setGoldPrices(data);
      }
    } catch (err) {
      console.error('Error in fetchLatestGoldPrices:', err);
      setError('Failed to fetch gold prices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestGoldPrices();
  }, []);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return {
    goldPrices,
    isLoading,
    error,
    refetch: fetchLatestGoldPrices,
    formatLastUpdated
  };
};
