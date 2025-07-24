import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { Calendar, Clock } from 'lucide-react';

interface RateDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const RateDropdown = ({ isOpen, onClose }: RateDropdownProps) => {
  const { goldPrice22kt, goldPrice18kt, isLoading } = useGoldPrice();
  const [priceData, setPriceData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchLatestPrice = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('gold_price_log')
          .select('kt22_price, kt18_price, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setPriceData(data);
        }
      } catch (error) {
        console.error('Error fetching price data:', error);
      }
    };

    if (isOpen) {
      fetchLatestPrice();
    }
  }, [isOpen]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${formattedDate} ${formattedTime}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-2 z-50">
        <Card className="w-80 shadow-lg border bg-background">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-semibold text-foreground">Current Gold Rates</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-8 w-full bg-muted animate-pulse rounded"></div>
                <div className="h-8 w-full bg-muted animate-pulse rounded"></div>
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">22 Karat Rate</span>
                  <span className="font-bold text-primary">
                    ₹{priceData?.kt22_price ? Number(priceData.kt22_price).toLocaleString() : goldPrice22kt.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">18 Karat Rate</span>
                  <span className="font-bold text-primary">
                    ₹{priceData?.kt18_price ? Number(priceData.kt18_price).toLocaleString() : goldPrice18kt.toLocaleString()}
                  </span>
                </div>
                
                {priceData?.created_at && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Calendar className="h-3 w-3" />
                    <Clock className="h-3 w-3" />
                    <span>Updated: {formatDateTime(priceData.created_at)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RateDropdown;