
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductVariation {
  id: string;
  variation_name: string;
  description?: string;
  gross_weight?: number;
  stone_weight?: number;
  net_weight?: number;
  carat?: string;
  images?: string[];
  in_stock: boolean;
  price?: number;
}

interface ProductVariationSelectorProps {
  variations: ProductVariation[];
  selectedVariation?: ProductVariation;
  onVariationSelect: (variation: ProductVariation) => void;
}

const ProductVariationSelector: React.FC<ProductVariationSelectorProps> = ({
  variations,
  selectedVariation,
  onVariationSelect
}) => {
  if (!variations || variations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Available Variations</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {variations.map((variation) => (
          <Card 
            key={variation.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVariation?.id === variation.id 
                ? 'ring-2 ring-gold border-gold' 
                : 'border-border hover:border-gold/50'
            }`}
            onClick={() => onVariationSelect(variation)}
          >
            <CardContent className="p-3 text-center">
              <p className="font-medium text-sm truncate">{variation.variation_name}</p>
              {variation.net_weight && (
                <p className="text-xs text-muted-foreground mt-1">
                  {variation.net_weight.toFixed(3)}g
                </p>
              )}
              <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                variation.in_stock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {variation.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductVariationSelector;
