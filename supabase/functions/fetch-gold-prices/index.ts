
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MetalPriceResponse {
  success: boolean;
  timestamp: number;
  base: string;
  rates: {
    XAU: number; // Gold price per troy ounce in USD
  };
}

interface ExchangeRateResponse {
  rates: {
    INR: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting gold price fetch process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const metalPriceApiKey = Deno.env.get('METALPRICE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch gold price from MetalPrice API
    console.log('Fetching gold price from MetalPrice API...');
    const metalPriceResponse = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${metalPriceApiKey}&base=USD&currencies=XAU`
    );

    if (!metalPriceResponse.ok) {
      throw new Error(`MetalPrice API error: ${metalPriceResponse.status}`);
    }

    const metalPriceData: MetalPriceResponse = await metalPriceResponse.json();
    console.log('MetalPrice API response:', metalPriceData);

    if (!metalPriceData.success || !metalPriceData.rates.XAU) {
      throw new Error('Invalid response from MetalPrice API');
    }

    // Get USD to INR exchange rate
    console.log('Fetching USD to INR exchange rate...');
    const exchangeRateResponse = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );

    if (!exchangeRateResponse.ok) {
      throw new Error(`Exchange rate API error: ${exchangeRateResponse.status}`);
    }

    const exchangeRateData: ExchangeRateResponse = await exchangeRateResponse.json();
    console.log('Exchange rate data:', exchangeRateData);

    const usdToInrRate = exchangeRateData.rates.INR;
    const goldPriceUsdPerOunce = 1 / metalPriceData.rates.XAU; // XAU gives ounces per USD, we need USD per ounce

    // Convert USD per troy ounce to INR per gram
    // 1 troy ounce = 31.1035 grams
    const goldPriceInrPerGram = (goldPriceUsdPerOunce * usdToInrRate) / 31.1035;
    
    // Calculate 24K gold price (rounded to nearest integer)
    const karat24Price = Math.round(goldPriceInrPerGram);
    
    // Calculate 22K and 18K prices based on purity
    // 22K = 91.67% purity, 18K = 75% purity
    const karat22Price = Math.round(karat24Price * 0.9167);
    const karat18Price = Math.round(karat24Price * 0.75);

    console.log('Calculated prices:', {
      karat24Price,
      karat22Price,
      karat18Price
    });

    // Insert into gold_price_log table
    const { data, error } = await supabase
      .from('gold_price_log')
      .insert({
        timestamp: new Date(metalPriceData.timestamp * 1000).toISOString(),
        karat_24: karat24Price,
        karat_22: karat22Price,
        karat_18: karat18Price
      })
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      throw error;
    }

    console.log('Successfully inserted gold price data:', data);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          timestamp: data.timestamp,
          karat_24: data.karat_24,
          karat_22: data.karat_22,
          karat_18: data.karat_18
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in fetch-gold-prices function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
