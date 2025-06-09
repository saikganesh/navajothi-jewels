
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StorePage = () => {
  const [goldPrice, setGoldPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoldPrice();
  }, []);

  const fetchGoldPrice = async () => {
    try {
      setIsLoading(true);
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
        setGoldPrice(data.variable_value);
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Store</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
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
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorePage;
