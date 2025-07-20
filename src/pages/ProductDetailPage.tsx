import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Star, Heart, Share2, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartRedux } from '@/hooks/useCartRedux';
import { useWishlistRedux } from '@/hooks/useWishlistRedux';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import ImageZoom from '@/components/ImageZoom';
import { supabase } from '@/integrations/supabase/client';
import { formatIndianCurrency } from '@/lib/currency';

interface ProductVariation {
  id: string;
  name: string;
  gross_weight: number;
  stock_quantity: number;
  description: string | null;
  images: string[];
  karat_22kt?: KaratData[];
  karat_18kt?: KaratData[];
  making_charge_percentage?: number;
}

interface KaratData {
  gross_weight: number | null;
  stone_weight: number | null;
  net_weight: number | null;
  stock_quantity: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  stock_quantity: number;
  category_id: string | null;
  collection_ids: string[] | null;
  product_type: string;
  making_charge_percentage?: number;
  categories?: {
    name: string;
  };
  karat_22kt?: KaratData[];
  karat_18kt?: KaratData[];
  variations?: ProductVariation[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedKarat, setSelectedKarat] = useState<'22kt' | '18kt'>('22kt');
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | ProductVariation | null>(null);
  const { addItem } = useCartRedux();
  const { addToWishlist, removeFromWishlist, isInWishlist, user } = useWishlistRedux();
  const { calculatePrice } = useGoldPrice();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product && !selectedVariation) {
      setCurrentProduct(product);
    } else if (selectedVariation) {
      setCurrentProduct(selectedVariation);
    }
  }, [product, selectedVariation]);

  const fetchProduct = async () => {
    try {
      console.log('Fetching product with ID:', id);
      
      // Fetch main product
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          ),
          karat_22kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          ),
          karat_18kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching main product:', error);
        throw error;
      }

      if (!data) {
        console.log('No product found with ID:', id);
        setIsLoading(false);
        return;
      }

      console.log('Main product fetched:', data);

      // Fetch variations - products with parent_product_id matching this product's ID
      const { data: variations, error: variationsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          images,
          product_type,
          making_charge_percentage,
          karat_22kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          ),
          karat_18kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          )
        `)
        .eq('parent_product_id', id)
        .eq('type', 'variation');

      if (variationsError) {
        console.error('Error fetching variations:', variationsError);
      } else {
        console.log('Variations fetched:', variations);
      }

      const transformedProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description,
        images: Array.isArray(data.images) ? data.images as string[] : (data.images ? [data.images as string] : []),
        stock_quantity: 0,
        category_id: data.category_id,
        collection_ids: Array.isArray(data.collection_ids) ? data.collection_ids as string[] : null,
        product_type: data.product_type,
        making_charge_percentage: data.making_charge_percentage || 0,
        categories: data.categories,
        karat_22kt: data.karat_22kt,
        karat_18kt: data.karat_18kt,
        variations: variations?.map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          images: Array.isArray(v.images) ? v.images as string[] : (v.images ? [v.images as string] : []),
          gross_weight: v.karat_22kt?.[0]?.gross_weight || v.karat_18kt?.[0]?.gross_weight || 0,
          stock_quantity: (v.karat_22kt?.[0]?.stock_quantity || 0) + (v.karat_18kt?.[0]?.stock_quantity || 0),
          making_charge_percentage: v.making_charge_percentage || 0,
          karat_22kt: v.karat_22kt,
          karat_18kt: v.karat_18kt
        })) || []
      };

      // Calculate total stock quantity for main product
      let totalStock = 0;
      if (data.karat_22kt && data.karat_22kt.length > 0) {
        totalStock += data.karat_22kt[0].stock_quantity || 0;
      }
      if (data.karat_18kt && data.karat_18kt.length > 0) {
        totalStock += data.karat_18kt[0].stock_quantity || 0;
      }
      transformedProduct.stock_quantity = totalStock;

      console.log('Final transformed product:', transformedProduct);
      setProduct(transformedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getKaratData = (karat: '22kt' | '18kt', productData?: Product | ProductVariation): KaratData | null => {
    const targetProduct = productData || currentProduct;
    if (!targetProduct) return null;
    const karatArray = karat === '22kt' ? targetProduct.karat_22kt : targetProduct.karat_18kt;
    return karatArray && karatArray.length > 0 ? karatArray[0] : null;
  };

  const getNetWeight = () => {
    const karatData = getKaratData(selectedKarat);
    return karatData?.net_weight || 0;
  };

  const getMakingChargePercentage = () => {
    // If it's a variation, get its making charge, otherwise use main product's making charge
    if (selectedVariation && selectedVariation.making_charge_percentage !== undefined) {
      return selectedVariation.making_charge_percentage;
    }
    if (product && product.making_charge_percentage !== undefined) {
      return product.making_charge_percentage;
    }
    return 0;
  };

  const handleVariationSelect = (variation: ProductVariation) => {
    console.log('Selecting variation:', variation);
    setSelectedVariation(variation);
    setSelectedImage(0);
    
    // Auto-select available karat when variation changes
    const has22kt = getKaratData('22kt', variation);
    const has18kt = getKaratData('18kt', variation);
    
    if (!getKaratData(selectedKarat, variation)) {
      if (has22kt) {
        setSelectedKarat('22kt');
      } else if (has18kt) {
        setSelectedKarat('18kt');
      }
    }
  };

  const handleMainProductSelect = () => {
    console.log('Selecting main product');
    setSelectedVariation(null);
    setSelectedImage(0);
    
    // Auto-select available karat when switching to main product
    if (product) {
      const has22kt = getKaratData('22kt', product);
      const has18kt = getKaratData('18kt', product);
      
      if (!getKaratData(selectedKarat, product)) {
        if (has22kt) {
          setSelectedKarat('22kt');
        } else if (has18kt) {
          setSelectedKarat('18kt');
        }
      }
    }
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;
    
    const netWeight = getNetWeight();
    const makingChargePercentage = getMakingChargePercentage();
    const priceBreakdown = calculatePrice(netWeight, makingChargePercentage);
    
    const cartProduct = {
      id: currentProduct.id,
      name: currentProduct.name,
      description: currentProduct.description || '',
      price: priceBreakdown.total,
      image: currentProduct.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      category: product?.categories?.name || 'Jewelry',
      inStock: ('stock_quantity' in currentProduct ? currentProduct.stock_quantity : 0) > 0,
      net_weight: netWeight,
      making_charge_percentage: makingChargePercentage,
      stock_quantity: 'stock_quantity' in currentProduct ? currentProduct.stock_quantity : 0,
      category_id: product?.category_id,
      collection_ids: product?.collection_ids
    };
    
    addItem(cartProduct, quantity);
  };

  const handleBuyNow = () => {
    if (!currentProduct) return;
    
    const netWeight = getNetWeight();
    const makingChargePercentage = getMakingChargePercentage();
    const priceBreakdown = calculatePrice(netWeight, makingChargePercentage);
    
    const buyNowProduct = {
      id: currentProduct.id,
      name: currentProduct.name,
      description: currentProduct.description || '',
      price: priceBreakdown.total,
      image: currentProduct.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      category: product?.categories?.name || 'Jewelry',
      inStock: ('stock_quantity' in currentProduct ? currentProduct.stock_quantity : 0) > 0,
      net_weight: netWeight,
      making_charge_percentage: makingChargePercentage,
      stock_quantity: 'stock_quantity' in currentProduct ? currentProduct.stock_quantity : 0,
      category_id: product?.category_id,
      collection_ids: product?.collection_ids,
      quantity: quantity
    };
    
    // Navigate to checkout with product data in state
    navigate('/checkout', { 
      state: { 
        buyNowProduct: buyNowProduct,
        isBuyNow: true 
      } 
    });
  };

  const handleWishlistToggle = async () => {
    if (!currentProduct) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const isCurrentlyInWishlist = isInWishlist(currentProduct.id, selectedKarat);
    
    if (isCurrentlyInWishlist) {
      await removeFromWishlist(currentProduct.id, selectedKarat);
    } else {
      // Create product data for optimistic updates
      const productData = {
        id: currentProduct.id,
        name: currentProduct.name,
        images: currentProduct.images,
        making_charge_percentage: getMakingChargePercentage(),
        karat_22kt: currentProduct.karat_22kt,
        karat_18kt: currentProduct.karat_18kt
      };
      await addToWishlist(currentProduct.id, selectedKarat, productData);
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

  if (!product || !currentProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-muted-foreground">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const netWeight = getNetWeight();
  const makingChargePercentage = getMakingChargePercentage();
  const priceBreakdown = calculatePrice(netWeight, makingChargePercentage);
  const productImages = currentProduct.images.length > 0 ? currentProduct.images : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'];
  const selectedKaratData = getKaratData(selectedKarat);
  const currentStock = 'stock_quantity' in currentProduct ? currentProduct.stock_quantity : 0;
  const isCurrentlyInWishlist = isInWishlist(currentProduct.id, selectedKarat);

  // Check if we have variations or if this product can have variations
  const hasVariations = product.variations && product.variations.length > 0;
  console.log('Has variations:', hasVariations, 'Variations count:', product.variations?.length);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 rounded-lg">
              <ImageZoom
                src={productImages[selectedImage]}
                alt={currentProduct.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-gold' : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Name & Badge */}
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy mb-2">
                {currentProduct.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {product.categories?.name || 'Jewelry'}
                </Badge>
                <Badge variant={currentStock > 0 ? 'default' : 'destructive'}>
                  {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            {/* Description */}
            {currentProduct.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{currentProduct.description}</p>
              </div>
            )}

            {/* Price Section - Moved below description */}
            <div>
              <p className="text-4xl font-bold text-gold mb-4">
                ₹{formatIndianCurrency(priceBreakdown.total)}
              </p>
              
              {/* Price Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Gold Price</p>
                    <p className="text-lg font-semibold text-gold">₹{formatIndianCurrency(priceBreakdown.goldPrice)}</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Making Charge</p>
                    <p className="text-lg font-semibold text-gold">₹{formatIndianCurrency(priceBreakdown.makingCharge)}</p>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground mb-1">GST</p>
                    <p className="text-lg font-semibold text-gold">₹{formatIndianCurrency(priceBreakdown.gst)}</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Karats Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Karats</h3>
              <div className="flex gap-3">
                {getKaratData('22kt') && (
                  <button
                    onClick={() => setSelectedKarat('22kt')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedKarat === '22kt' 
                        ? 'border-gold bg-gold text-navy font-medium' 
                        : 'border-border hover:border-gold'
                    }`}
                  >
                    22KT
                  </button>
                )}
                {getKaratData('18kt') && (
                  <button
                    onClick={() => setSelectedKarat('18kt')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedKarat === '18kt' 
                        ? 'border-gold bg-gold text-navy font-medium' 
                        : 'border-border hover:border-gold'
                    }`}
                  >
                    18KT
                  </button>
                )}
              </div>
            </div>

            {/* Specifications */}
            {selectedKaratData && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Gross Weight</p>
                    <p className="font-semibold">{selectedKaratData.gross_weight || 0}g</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Stone Weight</p>
                    <p className="font-semibold">{selectedKaratData.stone_weight || 0}g</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Weight</p>
                    <p className="font-semibold">{selectedKaratData.net_weight || 0}g</p>
                  </div>
                </div>
              </div>
            )}

            {/* Other Options */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Other Options</h3>
              <div className="flex flex-wrap gap-3">
                {/* Main Product Option */}
                <button
                  onClick={handleMainProductSelect}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    !selectedVariation 
                      ? 'border-gold bg-gold-light' 
                      : 'border-border hover:border-gold'
                  }`}
                >
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getKaratData(selectedKarat, product)?.gross_weight || 0}g
                  </p>
                  <Badge 
                    variant={product.stock_quantity > 0 ? 'default' : 'secondary'}
                    className="mt-1 text-xs"
                  >
                    {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </button>

                {/* Variation Options */}
                {hasVariations && product.variations!.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => handleVariationSelect(variation)}
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      selectedVariation?.id === variation.id 
                        ? 'border-gold bg-gold-light' 
                        : 'border-border hover:border-gold'
                    }`}
                  >
                    <p className="font-medium text-sm">{variation.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getKaratData(selectedKarat, variation)?.gross_weight || variation.gross_weight}g
                    </p>
                    <Badge 
                      variant={variation.stock_quantity > 0 ? 'default' : 'secondary'}
                      className="mt-1 text-xs"
                    >
                      {variation.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantity ({product.product_type})
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="flex-1 bg-gold hover:bg-gold-dark text-navy"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={currentStock === 0}
                  className="flex-1"
                  variant="outline"
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="flex-1"
                  onClick={handleWishlistToggle}
                  title={isCurrentlyInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-4 w-4 ${isCurrentlyInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="sr-only">
                    {isCurrentlyInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </span>
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            </div>

            {/* Customer Ratings */}
            <div className="pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8 out of 5)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on verified customer reviews
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
