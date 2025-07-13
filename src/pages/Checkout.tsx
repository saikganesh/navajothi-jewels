
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Form schema
const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a complete address'),
  city: z.string().min(2, 'Please enter a valid city'),
  pincode: z.string().min(6, 'Please enter a valid pincode').max(6, 'Pincode must be 6 digits'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Declare Razorpay interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { calculatePrice } = useGoldPrice();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
    },
  });

  const calculatedTotal = items.reduce((sum, item) => {
    const itemPrice = calculatePrice(item.net_weight || 0);
    return sum + (itemPrice * item.quantity);
  }, 0);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Failed to load payment gateway');
        }
      }

      // Prepare order data
      const orderData = {
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_email: data.email,
        customer_phone: data.phone,
        total_amount: calculatedTotal,
        shipping_address: {
          address: data.address,
          city: data.city,
          pincode: data.pincode,
        },
      };

      // Create Razorpay order
      const { data: orderResponse, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            orderData,
            cartItems: items.map(item => ({
              id: item.id,
              name: item.name,
              image: item.image,
              quantity: item.quantity,
              price: calculatePrice(item.net_weight || 0),
              net_weight: item.net_weight,
            })),
          },
        }
      );

      if (orderError || !orderResponse.success) {
        throw new Error(orderResponse?.error || 'Failed to create order');
      }

      // Configure Razorpay payment
      const options = {
        key: 'rzp_test_4RcooWopReRcUO', // Your Razorpay key ID
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Navajothi & Co',
        description: 'Jewellery Commerce',
        image: '/lovable-uploads/636f1948-abd1-4971-9a0f-9daa26e9ce83.png', // Your logo
        order_id: orderResponse.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const { data: verifyResponse, error: verifyError } = await supabase.functions.invoke(
              'verify-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderResponse.orderId,
                  payment_method: 'razorpay',
                },
              }
            );

            if (verifyError || !verifyResponse.success) {
              throw new Error('Payment verification failed');
            }

            // Clear cart
            const { error: clearError } = await supabase.functions.invoke('clear-cart');
            if (clearError) {
              console.warn('Failed to clear cart:', clearError);
            } else {
              clearCart(); // Update local state
            }

            // Redirect to success page
            navigate(`/order-confirmation/${orderResponse.orderId}`);
            
            toast({
              title: "Payment Successful",
              description: "Your order has been placed successfully!",
            });

          } catch (error) {
            console.error('Payment verification error:', error);
            navigate(`/order-failed?error=${encodeURIComponent(error instanceof Error ? error.message : 'Payment verification failed')}&orderId=${orderResponse.orderId}`);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again when ready.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          address: data.address,
          city: data.city,
          pincode: data.pincode,
        },
        theme: {
          color: '#D4AF37', // Gold color to match your theme
        },
        method: {
          netbanking: true,
          card: true,
          wallet: true,
          upi: true,
          paylater: false,
          emi: true,
        },
      };

      const paymentGateway = new window.Razorpay(options);
      
      paymentGateway.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        navigate(`/order-failed?error=${encodeURIComponent(response.error.description)}&orderId=${orderResponse.orderId}`);
      });

      paymentGateway.open();

    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-navy mb-4">Checkout</h1>
            <p className="text-muted-foreground mb-8">Your cart is empty.</p>
            <Button asChild>
              <a href="/">Continue Shopping</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-serif font-bold text-navy mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => {
                  const itemPrice = calculatePrice(item.net_weight || 0);
                  return (
                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{itemPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(itemPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>₹{calculatedTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
