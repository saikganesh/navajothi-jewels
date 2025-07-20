import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store';
import AddressModal from '@/components/AddressModal';

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
  const location = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  
  // Get buy now product from navigation state
  const { buyNowProduct, isBuyNow } = location.state || {};
  const [checkoutItems, setCheckoutItems] = useState([]);

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

  useEffect(() => {
    if (isBuyNow && buyNowProduct) {
      // Use buy now product for checkout
      setCheckoutItems([buyNowProduct]);
    } else {
      // Use cart items for checkout
      setCheckoutItems(items);
    }
  }, [isBuyNow, buyNowProduct, items]);

  const calculatedTotal = checkoutItems.reduce((sum, item) => {
    const priceBreakdown = calculatePrice(item.net_weight || 0, item.making_charge_percentage || 0);
    return sum + (priceBreakdown.total * item.quantity);
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

  const handleSelectAddress = (address: any) => {
    form.setValue('firstName', address.first_name);
    form.setValue('lastName', address.last_name);
    form.setValue('phone', address.phone);
    form.setValue('address', address.address);
    form.setValue('city', address.city);
    form.setValue('pincode', address.pincode);
  };

  const saveAddressToDatabase = async (data: CheckoutFormData) => {
    if (!user || !saveAddress) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          pincode: data.pincode,
        });

      if (error) throw error;

      toast({
        title: "Address Saved",
        description: "Your address has been saved for future use",
      });
    } catch (error) {
      console.error('Error saving address:', error);
      // Don't block checkout if address saving fails
      toast({
        title: "Address Save Failed",
        description: "Your order will still proceed, but the address wasn't saved",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Save address if requested and user is authenticated
      await saveAddressToDatabase(data);

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
            cartItems: checkoutItems.map(item => {
              const priceBreakdown = calculatePrice(item.net_weight || 0, item.making_charge_percentage || 0);
              return {
                id: item.id,
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                price: priceBreakdown.total,
                net_weight: item.net_weight,
                making_charge_percentage: item.making_charge_percentage,
              };
            }),
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

            // Only clear cart if it's not a buy now purchase
            if (!isBuyNow) {
              const { error: clearError } = await supabase.functions.invoke('clear-cart');
              if (clearError) {
                console.warn('Failed to clear cart:', clearError);
              } else {
                clearCart(); // Update local state
              }
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

  if (checkoutItems.length === 0) {
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
                {checkoutItems.map((item) => {
                  const priceBreakdown = calculatePrice(item.net_weight || 0, item.making_charge_percentage || 0);
                  return (
                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.karat_selected?.toUpperCase() || '22KT'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.net_weight}g
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{priceBreakdown.total.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(priceBreakdown.total * item.quantity).toFixed(2)}</p>
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
              <div className="flex justify-between items-center">
                <CardTitle>Shipping Information</CardTitle>
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    Use Existing Address
                  </Button>
                )}
              </div>
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

                  {user && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveAddress"
                        checked={saveAddress}
                        onCheckedChange={setSaveAddress}
                      />
                      <label
                        htmlFor="saveAddress"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Save Address
                      </label>
                    </div>
                  )}

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
      
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelectAddress={handleSelectAddress}
      />
      
      <Footer />
    </div>
  );
};

export default Checkout;
