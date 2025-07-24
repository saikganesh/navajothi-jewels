
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
        .from('gold_price_log')
        .select('kt22_price, kt18_price')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching gold price:', error);
        return;
      }

      if (data) {
        setGoldPrice(Number(data.kt22_price) || 5000);
      }
    } catch (error) {
      console.error('Error fetching gold price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = (netWeight: number | null, makingChargePercentage: number = 0, karat: string = '22kt') => {
    if (!netWeight || netWeight <= 0) return { total: 0, goldPrice: 0, makingCharge: 0, gst: 0 };
    
    // Use the appropriate price based on karat selection
    const pricePerGram = karat === '18kt' ? Math.round((goldPrice / 22) * 18) : goldPrice;
    
    // Step 1: Calculate gold price (Net Weight * Gold Rate)
    const goldPriceValue = netWeight * pricePerGram;
    
    // Step 2: Calculate making charge (Making Charge Percentage of the gold price)
    const makingChargeValue = (goldPriceValue * makingChargePercentage) / 100;
    
    // Step 3: Calculate subtotal (Gold Price + Making Charge)
    const subtotal = goldPriceValue + makingChargeValue;
    
    // Step 4: Calculate GST (3% of the subtotal)
    const gstValue = (subtotal * 3) / 100;
    
    // Step 5: Calculate total price and round all values to nearest integer
    const total = Math.round(subtotal + gstValue);
    
    return {
      total,
      goldPrice: Math.round(goldPriceValue),
      makingCharge: Math.round(makingChargeValue),
      gst: Math.round(gstValue)
    };
  };

  return { goldPrice, isLoading, calculatePrice, refetch: fetchGoldPrice };
};
