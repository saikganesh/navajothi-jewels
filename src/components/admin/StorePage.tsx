
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StorePage = () => {
  const [goldPrice, setGoldPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [current22ktPrice, setCurrent22ktPrice] = useState<number | null>(null);
  const [calculated18ktPrice, setCalculated18ktPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoldPrice();
    fetchPriceHistory();
  }, []);

  const fetchGoldPrice = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gold_price_log')
        .select('kt22_price, kt18_price, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching gold price:', error);
        return;
      }

      if (data) {
        setCurrent22ktPrice(Number(data.kt22_price));
        setCalculated18ktPrice(Number(data.kt18_price));
      }
    } catch (error) {
      console.error('Error fetching gold price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('gold_price_log')
        .select('kt22_price, kt18_price, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching price history:', error);
        return;
      }

      setPriceHistory(data || []);
    } catch (error) {
      console.error('Error fetching price history:', error);
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

      // Set calculated 18kt price for display and clear input
      setCalculated18ktPrice(kt18Price);
      setCurrent22ktPrice(kt22Price);
      setGoldPrice('');

      toast({
        title: "Success",
        description: "Gold price saved successfully",
      });
      
      // Refresh the data to get the updated timestamp and history
      fetchGoldPrice();
      fetchPriceHistory();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gold Price</h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <Label htmlFor="goldPrice">22kt Gold Price (per gram)</Label>
                <Input
                  id="goldPrice"
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(e.target.value)}
                  placeholder="Enter 22kt gold price per gram"
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || isLoading}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>

            {/* Price Display Section */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {current22ktPrice && (
                <div className="p-4 bg-muted rounded-lg border">
                  <Label className="text-sm text-muted-foreground">Current 22kt Price</Label>
                  <div className="text-2xl font-bold text-primary mt-1">₹{current22ktPrice.toLocaleString()}</div>
                </div>
              )}
              {calculated18ktPrice && (
                <div className="p-4 bg-muted rounded-lg border">
                  <Label className="text-sm text-muted-foreground">Calculated 18kt Price</Label>
                  <div className="text-2xl font-bold text-primary mt-1">₹{calculated18ktPrice.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>22kt Price</TableHead>
                <TableHead>18kt Price</TableHead>
                <TableHead>Date Updated</TableHead>
                <TableHead>Time Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>₹{entry.kt22_price}</TableCell>
                  <TableCell>₹{entry.kt18_price}</TableCell>
                  <TableCell>{formatDate(entry.created_at)}</TableCell>
                  <TableCell>{formatTime(entry.created_at)}</TableCell>
                </TableRow>
              ))}
              {priceHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No price history available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorePage;
