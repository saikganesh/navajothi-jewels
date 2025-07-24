
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StorePage = () => {
  const [goldPrice, setGoldPrice] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [calculated18ktPrice, setCalculated18ktPrice] = useState<number | null>(null);
  const { toast } = useToast();

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
      const kt22Price = Number(goldPrice);
      const kt18Price = Math.round((kt22Price / 22) * 18);
      
      // Update globals table
      const { error: globalsError } = await supabase
        .from('globals')
        .upsert({
          variable_name: 'gold_price_per_gram',
          variable_value: goldPrice,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'variable_name'
        });

      if (globalsError) {
        console.error('Error saving gold price to globals:', globalsError);
        toast({
          title: "Error",
          description: "Failed to save gold price",
          variant: "destructive",
        });
        return;
      }

      // Save to gold_price_log table
      const { error: logError } = await supabase
        .from('gold_price_log')
        .insert({
          kt22_price: kt22Price,
          kt18_price: kt18Price
        });

      if (logError) {
        console.error('Error saving to gold price log:', logError);
        toast({
          title: "Error",
          description: "Failed to save to price log",
          variant: "destructive",
        });
        return;
      }

      // Set calculated 18kt price for display
      setCalculated18ktPrice(kt18Price);

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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-1/4 space-y-3">
              <div>
                <Label htmlFor="goldPrice">22kt Gold Price (per gram)</Label>
                <Input
                  id="goldPrice"
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(e.target.value)}
                  placeholder="Enter 22kt gold price per gram"
                  disabled={isLoading}
                />
              </div>
              {calculated18ktPrice && (
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm text-muted-foreground">Calculated 18kt Price</Label>
                  <div className="text-lg font-semibold">₹{calculated18ktPrice}</div>
                </div>
              )}
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
