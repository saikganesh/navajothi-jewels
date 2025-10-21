import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { useWishlist } from '@/hooks/useWishlist';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '@/lib/currency';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type KaratType = '22kt' | '18kt' | '14kt' | '9kt';

interface KaratData {
  net_weight: number | null;
  gross_weight: number | null;
  stock_quantity: number;
}

interface ProductVariation {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  making_charge_percentage?: number;
  discount_percentage?: number | null;
  karat_22kt?: KaratData[];
  karat_18kt?: KaratData[];
  karat_14kt?: KaratData[];
  karat_9kt?: KaratData[];
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    images: string[];
    making_charge_percentage?: number;
    discount_percentage?: number | null;
    category_id?: string;
    available_karats?: string[];
    karat_22kt?: KaratData[];
    karat_18kt?: KaratData[];
    karat_14kt?: KaratData[];
    karat_9kt?: KaratData[];
    variations?: ProductVariation[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, isAddingToCart } = useCart();
  const { calculatePrice } = useGoldPrice();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Get available karats: only those checked in admin AND with stock
  const getAvailableKarats = (): KaratType[] => {
    // Get karats from available_karats field (admin selection)
    const adminSelectedKarats = product.available_karats || ['22kt'];
    
    const karatsSet = new Set<KaratType>();
    
    // Check parent product
    if (product.karat_22kt?.[0]?.stock_quantity && product.karat_22kt[0].stock_quantity > 0) karatsSet.add('22kt');
    if (product.karat_18kt?.[0]?.stock_quantity && product.karat_18kt[0].stock_quantity > 0) karatsSet.add('18kt');
    if (product.karat_14kt?.[0]?.stock_quantity && product.karat_14kt[0].stock_quantity > 0) karatsSet.add('14kt');
    if (product.karat_9kt?.[0]?.stock_quantity && product.karat_9kt[0].stock_quantity > 0) karatsSet.add('9kt');
    
    // Check all variations
    product.variations?.forEach(variation => {
      if (variation.karat_22kt?.[0]?.stock_quantity && variation.karat_22kt[0].stock_quantity > 0) karatsSet.add('22kt');
      if (variation.karat_18kt?.[0]?.stock_quantity && variation.karat_18kt[0].stock_quantity > 0) karatsSet.add('18kt');
      if (variation.karat_14kt?.[0]?.stock_quantity && variation.karat_14kt[0].stock_quantity > 0) karatsSet.add('14kt');
      if (variation.karat_9kt?.[0]?.stock_quantity && variation.karat_9kt[0].stock_quantity > 0) karatsSet.add('9kt');
    });
    
    // Return only karats that are BOTH selected in admin AND have stock
    const order: KaratType[] = ['22kt', '18kt', '14kt', '9kt'];
    return order.filter(k => adminSelectedKarats.includes(k) && karatsSet.has(k));
  };

  const availableKarats = getAvailableKarats();
  const highestKarat = availableKarats[0] || '22kt'; // Default to highest available
  const [selectedKarat, setSelectedKarat] = useState<KaratType>(highestKarat);

  // Get data for specific karat (prioritize parent product, then check variations)
  const getKaratData = (karat: KaratType) => {
    const karatMap = {
      '22kt': product.karat_22kt,
      '18kt': product.karat_18kt,
      '14kt': product.karat_14kt,
      '9kt': product.karat_9kt
    };
    
    // First try parent product
    const parentData = karatMap[karat]?.[0];
    if (parentData && (parentData.stock_quantity || 0) > 0) {
      return parentData;
    }
    
    // Then check variations
    if (product.variations) {
      for (const variation of product.variations) {
        const variationKaratMap = {
          '22kt': variation.karat_22kt,
          '18kt': variation.karat_18kt,
          '14kt': variation.karat_14kt,
          '9kt': variation.karat_9kt
        };
        const variationData = variationKaratMap[karat]?.[0];
        if (variationData && (variationData.stock_quantity || 0) > 0) {
          return variationData;
        }
      }
    }
    
    return parentData; // Return even if no stock, for display purposes
  };

  const karatData = getKaratData(selectedKarat);
  const netWeight = karatData?.net_weight || 0;
  const makingChargePercentage = product.making_charge_percentage || 0;
  const discountPercentage = product.discount_percentage || 0;

  // Count available variations for the selected karat
  const getVariationsCount = (karat: KaratType): number => {
    if (!product.variations) return 0;
    
    const karatMap = {
      '22kt': 'karat_22kt',
      '18kt': 'karat_18kt',
      '14kt': 'karat_14kt',
      '9kt': 'karat_9kt'
    } as const;
    
    return product.variations.filter(variation => {
      const karatKey = karatMap[karat];
      const variationKaratData = variation[karatKey as keyof ProductVariation] as KaratData[] | undefined;
      return variationKaratData?.[0]?.stock_quantity && variationKaratData[0].stock_quantity > 0;
    }).length;
  };

  const variationsCount = getVariationsCount(selectedKarat);

  // Calculate prices
  const priceBreakdown = calculatePrice(netWeight, makingChargePercentage, selectedKarat);
  const originalPrice = priceBreakdown.total;
  const discountedPrice = discountPercentage > 0 
    ? Math.round(originalPrice * (1 - discountPercentage / 100))
    : originalPrice;
  const finalPrice = discountPercentage > 0 ? discountedPrice : originalPrice;

  const isInStock = (karatData?.stock_quantity || 0) > 0;
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';

  const isLoading = isAddingToCart(product.id, selectedKarat);
  const inWishlist = isInWishlist(product.id, selectedKarat);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: finalPrice,
      image: productImage,
      category: 'Jewelry',
      inStock: isInStock,
      net_weight: netWeight,
      making_charge_percentage: makingChargePercentage,
      stock_quantity: karatData?.stock_quantity || 0,
      category_id: product.category_id || null,
      collection_ids: null
    };
    addItem(cartProduct, 1, selectedKarat);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      await removeFromWishlist(product.id, selectedKarat);
    } else {
      await addToWishlist(product.id, selectedKarat);
    }
  };

  return (
    <Link to={`/product/${product.id}?karat=${selectedKarat}`}>
      <Card className="group cursor-pointer overflow-hidden border-border hover:shadow-xl transition-all duration-300 hover:border-primary/20 h-full flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-background to-muted overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1">
              {discountPercentage}% off on Making Charges
            </Badge>
          )}

          {/* Action Icons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full shadow-lg"
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="default"
                    className="h-9 w-9 rounded-full shadow-lg"
                    onClick={handleAddToCart}
                    disabled={!isInStock || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add to Cart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Stock Status Badge */}
          <Badge 
            variant={isInStock ? "default" : "destructive"}
            className="absolute bottom-3 left-3"
          >
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </Badge>

          {/* Variations Count Badge */}
          {variationsCount > 0 && (
            <Badge 
              variant="secondary"
              className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm"
            >
              +{variationsCount} {variationsCount === 1 ? 'option' : 'options'}
            </Badge>
          )}
        </div>
        
        {/* Content Section */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Price Section */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                ₹{formatIndianCurrency(finalPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{formatIndianCurrency(originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Price for {selectedKarat.toUpperCase()}
            </p>
          </div>

          {/* Available Karats */}
          {availableKarats.length > 1 && (
            <div className="mt-auto">
              <p className="text-xs text-muted-foreground mb-2">Also available in</p>
              <div className="flex flex-wrap gap-1.5">
                {availableKarats
                  .filter(karat => karat !== selectedKarat)
                  .map((karat) => (
                    <Badge
                      key={karat}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedKarat(karat);
                      }}
                    >
                      {karat.toUpperCase()}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
