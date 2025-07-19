
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

  const calculatePrice = (netWeight: number | null, makingChargePercentage: number = 0) => {
    if (!netWeight || netWeight <= 0) return { total: 0, goldPrice: 0, makingCharge: 0, gst: 0 };
    
    // Step 1: Calculate gold price (Net Weight * Gold Rate)
    const goldPriceValue = netWeight * goldPrice;
    
    // Step 2: Calculate making charge (Making Charge Percentage of the gold price)
    const makingChargeValue = (goldPriceValue * makingChargePercentage) / 100;
    
    // Step 3: Calculate subtotal (Gold Price + Making Charge)
    const subtotal = goldPriceValue + makingChargeValue;
    
    // Step 4: Calculate GST (3% of the subtotal)
    const gstValue = (subtotal * 3) / 100;
    
    // Step 5: Calculate total price
    const total = subtotal + gstValue;
    
    return {
      total,
      goldPrice: goldPriceValue,
      makingCharge: makingChargeValue,
      gst: gstValue
    };
  };

  return { goldPrice, isLoading, calculatePrice, refetch: fetchGoldPrice };
};
