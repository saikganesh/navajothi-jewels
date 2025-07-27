import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatIndianCurrency } from '@/lib/currency';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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
  razorpay_payment_id: string | null;
}

interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_gst: string;
  company_phone: string;
  company_email: string;
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const { toast } = useToast();
  
  // Check if user came from payment (automatic) or manual navigation
  const isFromPayment = searchParams.get('from') === 'payment';

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        setError('Order ID not provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (orderError) {
          console.error('Error fetching order:', orderError);
          setError('Order not found');
          return;
        }

        if (!orderData) {
          setError('Order not found');
          return;
        }

        // Fetch company information
        const { data: globalsData, error: globalsError } = await supabase
          .from('globals')
          .select('variable_name, variable_value')
          .in('variable_name', ['company_name', 'company_address', 'company_gst', 'company_phone', 'company_email']);

        if (globalsError) {
          console.error('Error fetching company info:', globalsError);
        }

        const companyData: CompanyInfo = {
          company_name: 'Sujana Jewels',
          company_address: 'Chennai, Tamil Nadu, India',
          company_gst: '33AGHPG0789K1Z8',
          company_phone: '+91 9876543210',
          company_email: 'info@sujanajewels.com'
        };

        if (globalsData) {
          globalsData.forEach((item) => {
            if (item.variable_name in companyData) {
              (companyData as any)[item.variable_name] = item.variable_value;
            }
          });
        }

        setOrder(orderData);
        setCompanyInfo(companyData);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading invoice...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order || !companyInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-serif font-bold text-destructive mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const calculateSubtotal = () => {
    if (!Array.isArray(order.order_items)) return 0;
    return order.order_items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    setCancellingOrder(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (error) {
        throw error;
      }

      // Update local state
      setOrder({ ...order, status: 'cancelled' });
      
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully.',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancellingOrder(false);
    }
  };

  const canCancelOrder = () => {
    return order && !isFromPayment && (order.status === 'pending' || order.status === 'processing');
  };

  const subtotal = calculateSubtotal();
  const gstAmount = subtotal * 0.03; // 3% GST
  const total = subtotal + gstAmount;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Success Message - Print Hidden */}
      <div className="container mx-auto px-4 py-8 print:hidden">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Your order has been confirmed. Please find your invoice below.</p>
        </div>
      </div>

      {/* Invoice */}
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none border">
          {/* Invoice Header */}
          <div className="border-b-2 border-gray-200 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p className="text-gray-600">Invoice #: INV-{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Date: {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                <p className="text-gray-600">Payment ID: {order.razorpay_payment_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Company and Customer Info */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* From - Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">From:</h3>
              <div className="text-gray-700">
                <p className="font-semibold text-lg">{companyInfo.company_name}</p>
                <p className="whitespace-pre-line">{companyInfo.company_address}</p>
                <p>GST: {companyInfo.company_gst}</p>
                <p>Phone: {companyInfo.company_phone}</p>
                <p>Email: {companyInfo.company_email}</p>
              </div>
            </div>

            {/* To - Customer Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">To:</h3>
              <div className="text-gray-700">
                <p className="font-semibold">{order.customer_name}</p>
                {order.shipping_address && (
                  <>
                    <p>{order.shipping_address.address}</p>
                    <p>{order.shipping_address.city}, {order.shipping_address.pincode}</p>
                  </>
                )}
                {order.customer_phone && <p>Phone: {order.customer_phone}</p>}
                <p>Email: {order.customer_email}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="px-8 pb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Payment Date:</span>
                  <p>{new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <span className="font-medium">Payment Method:</span>
                  <p className="capitalize">{order.payment_method || 'Online Payment'}</p>
                </div>
                <div>
                  <span className="font-medium">Payment ID:</span>
                  <p className="font-mono text-xs break-all">{order.razorpay_payment_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 pb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left">Item</th>
                  <th className="border border-gray-300 px-4 py-3 text-center">Qty</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Unit Price</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(order.order_items) ? order.order_items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">₹{formatIndianCurrency(item.price)}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-medium">₹{formatIndianCurrency(item.price * item.quantity)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-8 pb-8">
            <div className="flex justify-end">
              <div className="w-64">
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
          </div>

          {/* Thank You Note */}
          <div className="bg-gray-50 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Your Purchase!</h3>
            <p className="text-gray-600 mb-4">
              We appreciate your business and trust in {companyInfo.company_name}. 
              Your exquisite jewelry will be processed and delivered with the utmost care.
            </p>
            <p className="text-sm text-gray-500">
              For any queries regarding your order, please contact us at {companyInfo.company_phone} 
              or email us at {companyInfo.company_email}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons - Print Hidden */}
      <div className="text-center pb-8 space-x-4 print:hidden">
        {/* Only show Continue Shopping button if user came from payment */}
        {isFromPayment && (
          <Button asChild variant="outline">
            <Link to="/">Continue Shopping</Link>
          </Button>
        )}
        
        <Button onClick={() => window.print()}>
          Print Invoice
        </Button>
        
        {/* Show Cancel Order button for pending/processing orders when manually navigated */}
        {canCancelOrder() && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={cancellingOrder}>
                {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this order? This action cannot be undone.
                  If payment was made, refund will be processed within 5-7 business days.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Cancel Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Footer />

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { margin: 0; }
            .print\\:hidden { display: none !important; }
            .print\\:shadow-none { box-shadow: none !important; }
          }
        `
      }} />
    </div>
  );
};

export default OrderConfirmation;