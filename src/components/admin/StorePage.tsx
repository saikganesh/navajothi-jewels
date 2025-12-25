
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const StorePage = () => {
  const [goldPrice, setGoldPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [current22ktPrice, setCurrent22ktPrice] = useState<number | null>(null);
  const [calculated18ktPrice, setCalculated18ktPrice] = useState<number | null>(null);
  const [calculated14ktPrice, setCalculated14ktPrice] = useState<number | null>(null);
  const [calculated9ktPrice, setCalculated9ktPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [karatVisibility, setKaratVisibility] = useState<Record<string, boolean>>({
    '22kt': true,
    '18kt': true,
    '14kt': true,
    '9kt': true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchGoldPrice();
    fetchPriceHistory();
    fetchKaratVisibility();
  }, []);

  const fetchKaratVisibility = async () => {
    try {
      const { data, error } = await supabase
        .from('karat_visibility')
        .select('karat_type, is_visible');

      if (error) {
        console.error('Error fetching karat visibility:', error);
        return;
      }

      if (data) {
        const visibility: Record<string, boolean> = {};
        data.forEach((item) => {
          visibility[item.karat_type] = item.is_visible;
        });
        setKaratVisibility(visibility);
      }
    } catch (error) {
      console.error('Error fetching karat visibility:', error);
    }
  };

  const toggleKaratVisibility = async (karat: string) => {
    const newVisibility = !karatVisibility[karat];
    
    try {
      const { error } = await supabase
        .from('karat_visibility')
        .update({ is_visible: newVisibility, updated_at: new Date().toISOString() })
        .eq('karat_type', karat);

      if (error) {
        console.error('Error updating karat visibility:', error);
        toast({
          title: "Error",
          description: "Failed to update visibility",
          variant: "destructive",
        });
        return;
      }

      setKaratVisibility(prev => ({ ...prev, [karat]: newVisibility }));
      toast({
        title: "Success",
        description: `${karat} is now ${newVisibility ? 'visible' : 'hidden'} in the store`,
      });
    } catch (error) {
      console.error('Error updating karat visibility:', error);
    }
  };

  const fetchGoldPrice = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gold_price_log')
        .select('kt22_price, kt18_price, kt14_price, kt9_price, created_at')
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
        setCalculated14ktPrice(Number(data.kt14_price));
        setCalculated9ktPrice(Number(data.kt9_price));
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
        .select('kt22_price, kt18_price, kt14_price, kt9_price, created_at')
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
      const kt14Price = Math.round((kt22Price / 22) * 14);
      const kt9Price = Math.round((kt22Price / 22) * 9);
      

      // Save to gold_price_log table
      const { error: logError } = await supabase
        .from('gold_price_log')
        .insert({
          kt22_price: kt22Price,
          kt18_price: kt18Price,
          kt14_price: kt14Price,
          kt9_price: kt9Price
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

      // Set calculated prices for display and clear input
      setCalculated18ktPrice(kt18Price);
      setCalculated14ktPrice(kt14Price);
      setCalculated9ktPrice(kt9Price);
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
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {current22ktPrice !== null && (
                <div className={`p-4 bg-muted rounded-lg border ${!karatVisibility['22kt'] ? 'opacity-50' : ''}`}>
                  <Label className="text-sm text-muted-foreground">22kt Price</Label>
                  <div className="text-2xl font-bold text-primary mt-1">₹{current22ktPrice.toLocaleString()}</div>
                  <button
                    onClick={() => toggleKaratVisibility('22kt')}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {karatVisibility['22kt'] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {karatVisibility['22kt'] ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              )}
              {calculated18ktPrice !== null && (
                <div className={`p-4 bg-muted rounded-lg border ${!karatVisibility['18kt'] ? 'opacity-50' : ''}`}>
                  <Label className="text-sm text-muted-foreground">18kt Price</Label>
                  <div className="text-2xl font-bold text-primary mt-1">₹{calculated18ktPrice.toLocaleString()}</div>
                  <button
                    onClick={() => toggleKaratVisibility('18kt')}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {karatVisibility['18kt'] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {karatVisibility['18kt'] ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              )}
              {calculated14ktPrice !== null && (
                <div className={`p-4 bg-muted rounded-lg border ${!karatVisibility['14kt'] ? 'opacity-50' : ''}`}>
                  <Label className="text-sm text-muted-foreground">14kt Price</Label>
                  <div className="text-2xl font-bold text-primary mt-1">₹{calculated14ktPrice.toLocaleString()}</div>
                  <button
                    onClick={() => toggleKaratVisibility('14kt')}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {karatVisibility['14kt'] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {karatVisibility['14kt'] ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              )}
              {calculated9ktPrice !== null && (
                <div className={`p-4 bg-muted rounded-lg border ${!karatVisibility['9kt'] ? 'opacity-50' : ''}`}>
                  <Label className="text-sm text-muted-foreground">9kt Price</Label>
                  <div className="text-2xl font-bold text-primary mt-1">₹{calculated9ktPrice.toLocaleString()}</div>
                  <button
                    onClick={() => toggleKaratVisibility('9kt')}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {karatVisibility['9kt'] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {karatVisibility['9kt'] ? 'Visible' : 'Hidden'}
                  </button>
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
                <TableHead>14kt Price</TableHead>
                <TableHead>9kt Price</TableHead>
                <TableHead>Date Updated</TableHead>
                <TableHead>Time Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistory.map((entry, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>₹{entry.kt22_price}</TableCell>
                    <TableCell>₹{entry.kt18_price}</TableCell>
                    <TableCell>₹{Number(entry.kt14_price).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(entry.kt9_price).toLocaleString()}</TableCell>
                    <TableCell>{formatDate(entry.created_at)}</TableCell>
                    <TableCell>{formatTime(entry.created_at)}</TableCell>
                  </TableRow>
                );
              })}
              {priceHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
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
