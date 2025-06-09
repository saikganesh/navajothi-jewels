
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Checkout = () => {
  const { items, total } = useCart();
  const { calculatePrice } = useGoldPrice();

  const calculatedTotal = items.reduce((sum, item) => {
    const itemPrice = calculatePrice(item.net_weight || 0);
    return sum + (itemPrice * item.quantity);
  }, 0);

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
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full border border-border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full border border-border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea
                    className="w-full border border-border rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode</label>
                    <input
                      type="text"
                      className="w-full border border-border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-navy">
                  Place Order
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
