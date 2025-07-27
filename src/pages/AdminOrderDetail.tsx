import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, CreditCard, Package } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/currency';
import { useAppSelector } from '@/store';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  order_items: any;
  status: string;
  payment_status: string;
  payment_method: string | null;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
}

const AdminOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user, isLoading: authLoading, isInitialized } = useAppSelector((state) => state.auth);

  // Check authentication and admin privileges
  useEffect(() => {
    const checkAuth = async () => {
      if (!isInitialized) return;

      try {
        if (!user) {
          navigate('/admin');
          return;
        }

        // Fetch user profile from database to check admin role
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (profile && profile.role === 'admin') {
            setUserProfile(profile);
            // Fetch order details if we have orderId
            if (orderId) {
              fetchOrderDetails();
            }
          } else {
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges.",
              variant: "destructive",
            });
            navigate('/admin');
            return;
          }
        } catch (profileError) {
          // If profile doesn't exist but email is admin email, allow access
          if (user.email === 'admin@sujanajewels.com') {
            setUserProfile({
              email: user.email,
              full_name: 'Admin User',
              role: 'admin'
            });
            // Fetch order details if we have orderId
            if (orderId) {
              fetchOrderDetails();
            }
          } else {
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges.",
              variant: "destructive",
            });
            navigate('/admin');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/admin');
      }
    };

    checkAuth();
  }, [user, isInitialized, navigate, toast, orderId]);

  const fetchOrderDetails = async () => {
    try {
      console.log('Fetching order details for ID:', orderId);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('Auth error:', authError);
      
      if (!user) {
        console.log('No authenticated user found');
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Order data received:', data);
      
      if (!data) {
        console.log('No order found with ID:', orderId);
      }
      
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: `Failed to load order details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, status: newStatus });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const calculateSubtotal = () => {
    if (!Array.isArray(order?.order_items)) return 0;
    return order.order_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  };

  // Show loading while checking authentication or fetching data
  if (!isInitialized || authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not admin (redirect will handle it)
  if (!user || !userProfile || userProfile.role !== 'admin') {
    return null;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Order Not Found</h1>
          <Button asChild>
            <Link to="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const gstAmount = subtotal * 0.03; // 3% GST

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order ID: {order.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={getStatusColor(order.status)} className="text-sm">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <Select
            value={order.status}
            onValueChange={handleStatusUpdate}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer_email}</span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.shipping_address ? (
              <div className="space-y-2">
                <p className="font-medium">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.pincode}</p>
                <p>{order.shipping_address.phone}</p>
                <p>{order.shipping_address.email}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No shipping address provided</p>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Order Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Payment Status</p>
                <Badge variant={order.payment_status === 'completed' ? 'default' : 'secondary'}>
                  {order.payment_status}
                </Badge>
              </div>
            </div>
            {order.razorpay_payment_id && (
              <div>
                <p className="font-medium">Payment ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {order.razorpay_payment_id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            Items purchased in this order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(order.order_items) ? order.order_items.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.net_weight && (
                          <p className="text-sm text-muted-foreground">
                            Net Weight: {item.net_weight}g
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{formatIndianCurrency(item.price)}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{formatIndianCurrency(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Order Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span>Subtotal:</span>
                <span>₹{formatIndianCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>GST (3%):</span>
                <span>₹{formatIndianCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between py-3 text-xl font-bold border-b-2 border-gray-400">
                <span>Total Amount:</span>
                <span>₹{formatIndianCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrderDetail;