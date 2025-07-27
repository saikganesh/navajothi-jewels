import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Eye, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAppSelector } from '@/store';
import { formatIndianCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import SubHeader from '@/components/SubHeader';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  order_items: any;
}

const ProfileOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading, isInitialized } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/auth');
    }
  }, [user, isInitialized, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.email) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch orders',
            variant: 'destructive',
          });
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user?.email, toast]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Show loading state while checking authentication
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <SubHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <SubHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SubHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-muted-foreground">{orders.length} orders</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">Your order history will appear here</p>
                <Button onClick={() => navigate('/products')}>
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {order.payment_status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <p className="font-semibold text-lg mt-1">
                          ₹{formatIndianCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Items:</span> {Array.isArray(order.order_items) ? order.order_items.length : 0}
                      </p>
                      {Array.isArray(order.order_items) && order.order_items.slice(0, 2).map((item: any, index: number) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          • {item.name} (Qty: {item.quantity})
                        </p>
                      ))}
                      {Array.isArray(order.order_items) && order.order_items.length > 2 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.order_items.length - 2} more items
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOrders;