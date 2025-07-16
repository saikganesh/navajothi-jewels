
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageZoom from '@/components/ImageZoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Minus, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';

interface ProductVariation {
  id: string;
  variation_name: string;
  description: string | null;
  price: number | null;
  net_weight: number | null;
  images: any;
  in_stock: boolean;
  gross_weight: number | null;
  stone_weight: number | null;
  carat: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  net_weight: number | null;
  images: any;
  in_stock: boolean;
  gross_weight: number | null;
  stone_weight: number | null;
  carat: string | null;
  collections?: {
    name: string;
    categories?: {
      name: string;
    };
  };
  variations?: ProductVariation[];
}

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const variationId = searchParams.get('variation');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const { addItem } = useCart();
  const { calculatePrice } = useGoldPrice();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product && variationId) {
      const variation = product.variations?.find(v => v.id === variationId);
      if (variation) {
        setSelectedVariation(variation);
        setSelectedImageIndex(0);
      }
    }
  }, [product, variationId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          collections (
            name,
            categories (
              name
            )
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      // Fetch variations
      const { data: variationsData, error: variationsError } = await supabase
        .from('product_variations')
        .select('*')
        .eq('parent_product_id', productId);

      if (variationsError) throw variationsError;
      
      // Transform the data to ensure images is always an array and handle null values
      const transformedData = {
        ...data,
        images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
        price: data.price || 0,
        net_weight: data.net_weight || 0,
        gross_weight: data.gross_weight || 0,
        stone_weight: data.stone_weight || 0,
        variations: variationsData?.map(v => ({
          ...v,
          images: Array.isArray(v.images) ? v.images : (v.images ? [v.images] : []),
          price: v.price || 0,
          net_weight: v.net_weight || 0,
          gross_weight: v.gross_weight || 0,
          stone_weight: v.stone_weight || 0
        })) || []
      };
      
      setProduct(transformedData);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariationSelect = (variation: ProductVariation | null) => {
    setSelectedVariation(variation);
    setSelectedImageIndex(0);
    setQuantity(1);
    
    if (variation) {
      setSearchParams({ variation: variation.id });
    } else {
      setSearchParams({});
    }
  };

  const getCurrentItem = () => {
    return selectedVariation || product;
  };

  const handleAddToCart = () => {
    const currentItem = getCurrentItem();
    if (currentItem && product) {
      const calculatedPrice = calculatePrice(currentItem.net_weight);
      
      const cartProduct = {
        id: selectedVariation ? selectedVariation.id : product.id,
        name: selectedVariation ? `${product.name} - ${selectedVariation.variation_name}` : product.name,
        description: currentItem.description || '',
        price: calculatedPrice,
        image: currentItem.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
        category: product.collections?.categories?.name || 'Jewelry',
        inStock: currentItem.in_stock,
        net_weight: currentItem.net_weight || 0
      };
      addItem(cartProduct, quantity);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-muted-foreground">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-muted-foreground">Product not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const currentItem = getCurrentItem();
  const images = currentItem && currentItem.images && currentItem.images.length > 0 ? currentItem.images : [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop'
  ];

  const displayPrice = calculatePrice(currentItem?.net_weight || 0);
  const totalPrice = displayPrice * quantity;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 rounded-lg overflow-hidden">
              <ImageZoom
                src={images[selectedImageIndex]}
                alt={selectedVariation ? `${product.name} - ${selectedVariation.variation_name}` : product.name}
                className="w-full h-full rounded-lg"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-gold' : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${selectedVariation ? `${product.name} - ${selectedVariation.variation_name}` : product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy mb-2">
                {selectedVariation ? `${product.name} - ${selectedVariation.variation_name}` : product.name}
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                {product.collections?.name} • {product.collections?.categories?.name}
              </p>
              <p className="text-4xl font-bold text-gold mb-6">
                ₹{totalPrice.toFixed(2)}
              </p>
              {quantity > 1 && (
                <p className="text-lg text-muted-foreground mb-4">
                  ₹{displayPrice.toFixed(2)} each
                </p>
              )}
            </div>

            {/* Variation Cards */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Available Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Main Product Card */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !selectedVariation ? 'ring-2 ring-gold' : 'hover:ring-1 hover:ring-border'
                  }`}
                  onClick={() => handleVariationSelect(null)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Gross Weight: {product.gross_weight?.toFixed(3)}g
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Variation Cards */}
                {product.variations?.map((variation) => (
                  <Card 
                    key={variation.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedVariation?.id === variation.id ? 'ring-2 ring-gold' : 'hover:ring-1 hover:ring-border'
                    }`}
                    onClick={() => handleVariationSelect(variation)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">{variation.variation_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Gross Weight: {variation.gross_weight?.toFixed(3)}g
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          variation.in_stock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {variation.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {currentItem?.description && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentItem.description}
                </p>
              </div>
            )}

            {/* Product Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {currentItem?.gross_weight && currentItem.gross_weight > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Gross Weight</span>
                    <p className="font-medium">{currentItem.gross_weight.toFixed(3)}g</p>
                  </div>
                )}
                {currentItem?.net_weight && currentItem.net_weight > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Net Weight</span>
                    <p className="font-medium">{currentItem.net_weight.toFixed(3)}g</p>
                  </div>
                )}
                {currentItem?.stone_weight && currentItem.stone_weight > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Stone Weight</span>
                    <p className="font-medium">{currentItem.stone_weight.toFixed(3)}g</p>
                  </div>
                )}
                {currentItem?.carat && (
                  <div>
                    <span className="text-sm text-muted-foreground">Carat</span>
                    <p className="font-medium">{currentItem.carat}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded ${
                  currentItem?.in_stock 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentItem?.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-1 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">(Max: 10)</span>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={!currentItem?.in_stock}
                className="w-full bg-gold hover:bg-gold-dark text-navy py-3 text-lg font-semibold"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={!currentItem?.in_stock}
                variant="outline"
                className="w-full border-gold text-gold hover:bg-gold hover:text-navy py-3 text-lg font-semibold"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
