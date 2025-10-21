
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchGoldPrices } from '@/store/slices/goldPriceSlice';

export const useGoldPrice = () => {
  const dispatch = useAppDispatch();
  const { goldPrice22kt, goldPrice18kt, isLoading } = useAppSelector((state) => state.goldPrice);

  const refetch = () => {
    dispatch(fetchGoldPrices());
  };

  const calculatePrice = (netWeight: number | null, makingChargePercentage: number = 0, karat: '22kt' | '18kt' | '14kt' | '9kt' = '22kt') => {
    if (!netWeight || netWeight <= 0) return { total: 0, goldPrice: 0, makingCharge: 0, gst: 0 };
    
    // Use the appropriate price based on karat selection
    const priceMap = {
      '22kt': goldPrice22kt,
      '18kt': goldPrice18kt,
      '14kt': goldPrice22kt * 0.583, // 14kt is approximately 58.3% pure gold
      '9kt': goldPrice22kt * 0.375   // 9kt is approximately 37.5% pure gold
    };
    const pricePerGram = priceMap[karat];
    
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

  return { 
    goldPrice: goldPrice22kt, 
    goldPrice22kt, 
    goldPrice18kt, 
    isLoading, 
    calculatePrice, 
    refetch 
  };
};
