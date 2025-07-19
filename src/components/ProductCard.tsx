
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '@/lib/currency';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    net_weight: number | null;
    images: string[];
    stock_quantity: number;
    making_charge_percentage?: number;
    collections?: {
      name: string;
      categories?: {
        name: string;
      };
    };
    karat_22kt?: Array<{
      gross_weight: number | null;
      stone_weight: number | null;
      net_weight: number | null;
      stock_quantity: number;
    }>;
    karat_18kt?: Array<{
      gross_weight: number | null;
      stone_weight: number | null;
      net_weight: number | null;
      stock_quantity: number;
    }>;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { calculatePrice } = useGoldPrice();

  // Get net weight from karat data (same logic as ProductDetailPage)
  const getNetWeight = () => {
    // Try 22kt first, then 18kt
    if (product.karat_22kt && product.karat_22kt.length > 0 && product.karat_22kt[0].net_weight) {
      return product.karat_22kt[0].net_weight;
    }
    if (product.karat_18kt && product.karat_18kt.length > 0 && product.karat_18kt[0].net_weight) {
      return product.karat_18kt[0].net_weight;
    }
    return product.net_weight || 0;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const netWeight = getNetWeight();
    const priceBreakdown = calculatePrice(netWeight, product.making_charge_percentage || 0);
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: priceBreakdown.total,
      image: product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      category: product.collections?.categories?.name || 'Jewelry',
      inStock: product.stock_quantity > 0,
      net_weight: netWeight
    };
    addItem(cartProduct);
  };

  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';

  const netWeight = getNetWeight();
  const priceBreakdown = calculatePrice(netWeight, product.making_charge_percentage || 0);
  const isInStock = product.stock_quantity > 0;

  // Get gross weight from 22kt first, then 18kt as fallback
  const getGrossWeight = () => {
    if (product.karat_22kt && product.karat_22kt.length > 0 && product.karat_22kt[0].gross_weight) {
      return product.karat_22kt[0].gross_weight;
    }
    if (product.karat_18kt && product.karat_18kt.length > 0 && product.karat_18kt[0].gross_weight) {
      return product.karat_18kt[0].gross_weight;
    }
    return null;
  };

  const grossWeight = getGrossWeight();

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
              ₹{formatIndianCurrency(priceBreakdown.total)}
            </p>
            {grossWeight && (
              <p className="text-sm text-muted-foreground">
                Gross Weight: {grossWeight}g
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className={`text-sm px-2 py-1 rounded ${
                isInStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isInStock ? 'In Stock' : 'Out of Stock'}
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
