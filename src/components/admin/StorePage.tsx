
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLatestGoldPrices } from '@/hooks/useLatestGoldPrices';
import { Separator } from '@/components/ui/separator';

const StorePage = () => {
  const [goldPrice, setGoldPrice] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { goldPrices, isLoading: goldPricesLoading, formatLastUpdated } = useLatestGoldPrices();

  useEffect(() => {
    fetchGoldPrice();
  }, []);

  const fetchGoldPrice = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('globals')
        .select('variable_value, updated_at')
        .eq('variable_name', 'gold_price_per_gram')
        .single();

      if (error) {
        console.error('Error fetching gold price:', error);
        return;
      }

      if (data) {
        setGoldPrice(data.variable_value);
        setLastUpdated(data.updated_at);
      }
    } catch (error) {
      console.error('Error fetching gold price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!goldPrice || isNaN(Number(goldPrice)) || Number(goldPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid gold price",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('globals')
        .upsert({
          variable_name: 'gold_price_per_gram',
          variable_value: goldPrice,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'variable_name'
        });

      if (error) {
        console.error('Error saving gold price:', error);
        toast({
          title: "Error",
          description: "Failed to save gold price",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Gold price saved successfully",
      });
      
      // Refresh the data to get the updated timestamp
      fetchGoldPrice();
    } catch (error) {
      console.error('Error saving gold price:', error);
      toast({
        title: "Error",
        description: "Failed to save gold price",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastUpdatedLocal = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Store</h1>
        
        {/* Latest Gold Prices Display */}
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Latest Gold Prices (₹/gram)</CardTitle>
          </CardHeader>
          <CardContent>
            {goldPricesLoading ? (
              <div className="text-sm text-muted-foreground">Loading prices...</div>
            ) : goldPrices ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">24K:</span>
                  <span className="font-bold text-lg">₹{goldPrices.karat_24}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">22K:</span>
                  <span className="font-bold text-lg">₹{goldPrices.karat_22}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">18K:</span>
                  <span className="font-bold text-lg">₹{goldPrices.karat_18}</span>
                </div>
                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground">
                  Last updated: {formatLastUpdated(goldPrices.timestamp)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No price data available</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-1/4">
              <Label htmlFor="goldPrice">Gold Price (per gram)</Label>
              <Input
                id="goldPrice"
                type="number"
                value={goldPrice}
                onChange={(e) => setGoldPrice(e.target.value)}
                placeholder="Enter gold price per gram"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {formatLastUpdatedLocal(lastUpdated)}
                </span>
              )}
              <Button 
                onClick={handleSave} 
                disabled={isSaving || isLoading}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorePage;
