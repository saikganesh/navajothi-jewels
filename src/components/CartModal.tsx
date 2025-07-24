
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { useAppSelector } from '@/store';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '@/lib/currency';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { items } = useAppSelector((state) => state.cart);
  const { updateQuantity, removeItem } = useCart();
  const { calculatePrice } = useGoldPrice();

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onClose();
  };

  // Calculate total using gold price calculation
  const total = items.reduce((sum, item) => {
    const priceBreakdown = calculatePrice(item.net_weight || 0, item.making_charge_percentage || 0, item.karat_selected || '22kt');
    return sum + (priceBreakdown.total * item.quantity);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Add some beautiful jewelry to get started!</p>
              <Button onClick={onClose} className="bg-gold hover:bg-gold-dark text-navy">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const priceBreakdown = calculatePrice(item.net_weight || 0, item.making_charge_percentage || 0, item.karat_selected || '22kt');
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.karat_selected.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      {item.net_weight && (
                        <p className="text-sm text-muted-foreground">
                          Net Weight: {item.net_weight}g
                        </p>
                      )}
                      <p className="text-lg font-bold text-gold">
                        ₹{formatIndianCurrency(priceBreakdown.total * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="px-2 py-1 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-gold">₹{formatIndianCurrency(total)}</span>
            </div>
            
            <Link to="/checkout" onClick={handleCheckout}>
              <Button className="w-full bg-gold hover:bg-gold-dark text-navy">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
