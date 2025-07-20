
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist, WishlistItem } from '@/hooks/useWishlist';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { useCart } from '@/hooks/useCart';
import { useAppSelector } from '@/store';
import { formatIndianCurrency } from '@/lib/currency';

interface WishlistDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDropdown: React.FC<WishlistDropdownProps> = ({ isOpen, onClose }) => {
  const { items: wishlistItems, isLoading } = useAppSelector((state) => state.wishlist);
  const { removeFromWishlist } = useWishlist();
  const { calculatePrice } = useGoldPrice();
  const { addItem } = useCart();

  if (!isOpen) return null;

  const handleAddToCart = (item: WishlistItem) => {
    const product = item.products;
    const karatData = item.karat_selected === '22kt' ? product.karat_22kt?.[0] : product.karat_18kt?.[0];
    const netWeight = karatData?.net_weight || 0;
    const makingChargePercentage = product.making_charge_percentage || 0;
    const priceBreakdown = calculatePrice(netWeight, makingChargePercentage);

    const cartProduct = {
      id: product.id,
      name: product.name,
      description: '',
      price: priceBreakdown.total,
      image: product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      category: 'Jewelry',
      inStock: true,
      net_weight: netWeight,
      making_charge_percentage: makingChargePercentage,
      stock_quantity: 1,
      category_id: null,
      collection_ids: null
    };

    addItem(cartProduct, 1);
  };

  const handleRemoveFromWishlist = (item: WishlistItem) => {
    removeFromWishlist(item.product_id, item.karat_selected);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose}>
      <div 
        className="absolute right-4 top-16 w-96 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">My Wishlist</h3>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : wishlistItems.length === 0 ? (
            <p className="text-center text-muted-foreground">Your wishlist is empty</p>
          ) : (
            <div className="space-y-3">
              {wishlistItems.map((item) => {
                const product = item.products;
                const karatData = item.karat_selected === '22kt' ? product.karat_22kt?.[0] : product.karat_18kt?.[0];
                const grossWeight = karatData?.gross_weight || 0;
                const netWeight = karatData?.net_weight || 0;
                const makingChargePercentage = product.making_charge_percentage || 0;
                const priceBreakdown = calculatePrice(netWeight, makingChargePercentage);

                return (
                  <Card key={`${item.product_id}-${item.karat_selected}`} className="p-3">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.karat_selected.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {grossWeight}g
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gold mt-1">
                            ₹{formatIndianCurrency(priceBreakdown.total)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Add to Cart
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleRemoveFromWishlist(item)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDropdown;
