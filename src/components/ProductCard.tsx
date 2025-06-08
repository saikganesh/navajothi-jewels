
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <Card className="group cursor-pointer overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-gold">
      <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
        
        {/* Quick add button */}
        <Button
          size="sm"
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gold hover:bg-gold-dark text-navy"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
        >
          <ShoppingBag className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-gold">
              ${product.price}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.category}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
