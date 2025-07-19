
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    net_weight: number | null;
    images: string[];
    stock_quantity: number;
    collections?: {
      name: string;
      categories?: {
        name: string;
      };
    };
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { calculatePrice } = useGoldPrice();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const calculatedPrice = calculatePrice(product.net_weight);
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: calculatedPrice,
      image: product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      category: product.collections?.categories?.name || 'Jewelry',
      inStock: product.stock_quantity > 0,
      net_weight: product.net_weight || 0
    };
    addItem(cartProduct);
  };

  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';

  const displayPrice = calculatePrice(product.net_weight);
  const isInStock = product.stock_quantity > 0;

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group cursor-pointer overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-gold">
        <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 relative overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
          
          {/* Quick add button */}
          <Button
            size="sm"
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gold hover:bg-gold-dark text-navy"
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            <p className="text-2xl font-bold text-gold">
              ₹{displayPrice.toFixed(2)}
            </p>
            {product.net_weight && (
              <p className="text-sm text-muted-foreground">
                Net Weight: {product.net_weight}g
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className={`text-sm px-2 py-1 rounded ${
                isInStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isInStock ? `In Stock` : 'Out of Stock'}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.collections?.categories?.name || 'Jewelry'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
