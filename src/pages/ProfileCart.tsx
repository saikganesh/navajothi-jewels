import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { formatIndianCurrency } from '@/lib/currency';
import Header from '@/components/Header';
import SubHeader from '@/components/SubHeader';

const ProfileCart = () => {
  const navigate = useNavigate();
  const { user, isLoading, isInitialized } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const { removeItem, updateQuantity } = useCart();
  const { goldPrice22kt, goldPrice18kt } = useGoldPrice();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/auth');
    }
  }, [user, isInitialized, navigate]);

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
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

  const calculateItemPrice = (item: any) => {
    if (!item.net_weight) return 0;
    
    const karatMultiplier = item.karat_selected === '22kt' ? goldPrice22kt : goldPrice18kt;
    const goldValue = item.net_weight * karatMultiplier;
    const makingCharge = goldValue * (item.making_charge_percentage / 100);
    
    return goldValue + makingCharge;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (calculateItemPrice(item) * item.quantity);
    }, 0);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

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
              <h1 className="text-3xl font-bold">My Cart</h1>
              <p className="text-muted-foreground">{cartItems.length} items</p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">Add some beautiful jewelry to get started</p>
                <Button onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Karat: {item.karat_selected}
                          </p>
                          {item.net_weight && (
                            <p className="text-sm text-muted-foreground mb-4">
                              Net Weight: {item.net_weight}g
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-semibold text-lg">
                                ₹{formatIndianCurrency(calculateItemPrice(item) * item.quantity)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Total</span>
                    <span className="text-2xl">₹{formatIndianCurrency(getTotalPrice())}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCart;