import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  order_items: any;
  created_at: string;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [databaseSetup, setDatabaseSetup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Orders table not accessible:', error);
        setDatabaseSetup(false);
        setIsLoading(false);
        return;
      }
      
      setDatabaseSetup(true);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setDatabaseSetup(false);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Database setup may be required.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!databaseSetup) {
      toast({
        title: "Database Setup Required",
        description: "Please set up the database tables first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('orders' as any)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (!databaseSetup) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
          <p className="text-muted-foreground">
            Set up your database to manage orders
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Setup Required</CardTitle>
            <CardDescription>
              Please run the SQL migration commands to set up your database tables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The orders table needs to be created before you can manage customer orders.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {order.customer_name}</p>
                    <p><strong>Email:</strong> {order.customer_email}</p>
                    {order.customer_phone && (
                      <p><strong>Phone:</strong> {order.customer_phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Total Amount:</strong> ₹{order.total_amount}</p>
                    <p><strong>Items:</strong> {Array.isArray(order.order_items) ? order.order_items.length : 'N/A'} item(s)</p>
                  </div>
                </div>
              </div>

              {Array.isArray(order.order_items) && order.order_items.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{item.name || 'Unknown Item'}</span>
                        <span>Qty: {item.quantity || 1} × ₹{item.price || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Update Status:</span>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">No orders found</h3>
          <p className="text-sm text-muted-foreground">Orders will appear here when customers make purchases.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
