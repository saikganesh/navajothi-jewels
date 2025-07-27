import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { formatIndianCurrency } from '@/lib/currency';

const ProfileWishlist = () => {
  const navigate = useNavigate();
  const { user, isLoading, isInitialized } = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  const calculateItemPrice = (item: any) => {
    if (!item.products?.karat_22kt?.[0]?.net_weight && !item.products?.karat_18kt?.[0]?.net_weight) return 0;
    
    const weight = item.karat_selected === '22kt' 
      ? item.products.karat_22kt?.[0]?.net_weight 
      : item.products.karat_18kt?.[0]?.net_weight;
    
    if (!weight) return 0;
    
    const karatMultiplier = item.karat_selected === '22kt' ? goldPrice22kt : goldPrice18kt;
    const goldValue = weight * karatMultiplier;
    const makingCharge = goldValue * ((item.products.making_charge_percentage || 0) / 100);
    
    return goldValue + makingCharge;
  };

  const handleAddToCart = async (item: any) => {
    const weight = item.karat_selected === '22kt' 
      ? item.products.karat_22kt?.[0]?.net_weight 
      : item.products.karat_18kt?.[0]?.net_weight;

    const cartProduct = {
      id: item.product_id,
      name: item.products.name,
      description: item.products.description || '',
      price: calculateItemPrice(item),
      image: item.products.images?.[0] || '',
      category: 'Jewelry',
      inStock: true,
      net_weight: weight,
      making_charge_percentage: item.products.making_charge_percentage || 0,
      category_id: null,
      collection_ids: null
    };

    await addItem(cartProduct, 1, item.karat_selected);
  };

  const handleRemoveFromWishlist = async (item: any) => {
    await removeFromWishlist(item.product_id, item.karat_selected);
  };

  return (
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
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">{wishlistItems.length} items</p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">Save your favorite jewelry pieces here</p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={item.products.images?.[0] || '/placeholder.svg'}
                    alt={item.products.name}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => handleRemoveFromWishlist(item)}
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </Button>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{item.products.name}</CardTitle>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Karat: {item.karat_selected}
                    </p>
                    <p className="font-semibold text-lg">
                      ₹{formatIndianCurrency(calculateItemPrice(item))}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileWishlist;