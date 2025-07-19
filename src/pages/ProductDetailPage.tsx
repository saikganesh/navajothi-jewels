import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Star, Heart, Share2, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import ImageZoom from '@/components/ImageZoom';
import { supabase } from '@/integrations/supabase/client';

interface ProductVariation {
  id: string;
  name: string;
  gross_weight: number;
  stock_quantity: number;
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
  categories?: {
    name: string;
  };
  karat_22kt?: KaratData[];
  karat_18kt?: KaratData[];
  variations?: ProductVariation[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedKarat, setSelectedKarat] = useState<'22kt' | '18kt'>('22kt');
  const { addItem } = useCart();
  const { calculatePrice } = useGoldPrice();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
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
        .single();

      if (error) throw error;

      // Fetch variations
      const { data: variations, error: variationsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          karat_22kt (
            gross_weight,
            stock_quantity
          ),
          karat_18kt (
            gross_weight,
            stock_quantity
          )
        `)
        .eq('parent_product_id', id)
        .eq('type', 'variation');

      if (variationsError) {
        console.error('Error fetching variations:', variationsError);
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
        categories: data.categories,
        karat_22kt: data.karat_22kt,
        karat_18kt: data.karat_18kt,
        variations: variations?.map(v => ({
          id: v.id,
          name: v.name,
          gross_weight: v.karat_22kt?.[0]?.gross_weight || v.karat_18kt?.[0]?.gross_weight || 0,
          stock_quantity: (v.karat_22kt?.[0]?.stock_quantity || 0) + (v.karat_18kt?.[0]?.stock_quantity || 0)
        })) || []
      };

      // Calculate total stock quantity
      let totalStock = 0;
      if (data.karat_22kt && data.karat_22kt.length > 0) {
        totalStock += data.karat_22kt[0].stock_quantity || 0;
      }
      if (data.karat_18kt && data.karat_18kt.length > 0) {
        totalStock += data.karat_18kt[0].stock_quantity || 0;
      }
      transformedProduct.stock_quantity = totalStock;

      setProduct(transformedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getKaratData = (karat: '22kt' | '18kt'): KaratData | null => {
    if (!product) return null;
    const karatArray = karat === '22kt' ? product.karat_22kt : product.karat_18kt;
    return karatArray && karatArray.length > 0 ? karatArray[0] : null;
  };

  const getNetWeight = () => {
    const karatData = getKaratData(selectedKarat);
    return karatData?.net_weight || 0;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const netWeight = getNetWeight();
    const calculatedPrice = calculatePrice(netWeight);
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: calculatedPrice,
      image: product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      category: product.categories?.name || 'Jewelry',
      inStock: product.stock_quantity > 0,
      net_weight: netWeight,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      collection_ids: product.collection_ids
    };
    
    addItem(cartProduct, quantity);
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
          <p className="text-center text-muted-foreground">Product not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const netWeight = getNetWeight();
  const displayPrice = calculatePrice(netWeight);
  const productImages = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'];
  const selectedKaratData = getKaratData(selectedKarat);

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
                alt={product.name}
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
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Name & Price */}
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {product.categories?.name || 'Jewelry'}
                </Badge>
                <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                </Badge>
              </div>
              <p className="text-4xl font-bold text-gold mb-4">
                ₹{displayPrice.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

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
                  disabled={product.stock_quantity === 0}
                  className="flex-1 bg-gold hover:bg-gold-dark text-navy"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  disabled={product.stock_quantity === 0}
                  className="flex-1"
                  variant="outline"
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Add to Wishlist</span>
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

        {/* Karats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-navy mb-6">Available Karats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 22 Karat Card */}
            {product.karat_22kt && product.karat_22kt.length > 0 && (
              <Card 
                className={`cursor-pointer transition-all ${selectedKarat === '22kt' ? 'ring-2 ring-gold' : ''}`}
                onClick={() => setSelectedKarat('22kt')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>22 Karat Gold</span>
                    <Badge variant={product.karat_22kt[0].stock_quantity > 0 ? 'default' : 'secondary'}>
                      {product.karat_22kt[0].stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Gross Weight:</span> {product.karat_22kt[0].gross_weight || 0}g</p>
                    <p><span className="font-medium">Stone Weight:</span> {product.karat_22kt[0].stone_weight || 0}g</p>
                    <p><span className="font-medium">Net Weight:</span> {product.karat_22kt[0].net_weight || 0}g</p>
                    <p><span className="font-medium">Stock:</span> {product.karat_22kt[0].stock_quantity || 0} units</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 18 Karat Card */}
            {product.karat_18kt && product.karat_18kt.length > 0 && (
              <Card 
                className={`cursor-pointer transition-all ${selectedKarat === '18kt' ? 'ring-2 ring-gold' : ''}`}
                onClick={() => setSelectedKarat('18kt')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>18 Karat Gold</span>
                    <Badge variant={product.karat_18kt[0].stock_quantity > 0 ? 'default' : 'secondary'}>
                      {product.karat_18kt[0].stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-medium">Gross Weight:</span> {product.karat_18kt[0].gross_weight || 0}g</p>
                    <p><span className="font-medium">Stone Weight:</span> {product.karat_18kt[0].stone_weight || 0}g</p>
                    <p><span className="font-medium">Net Weight:</span> {product.karat_18kt[0].net_weight || 0}g</p>
                    <p><span className="font-medium">Stock:</span> {product.karat_18kt[0].stock_quantity || 0} units</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Other Options (Variations) */}
        {product.variations && product.variations.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-navy mb-6">Other Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.variations.map((variation) => (
                <Card key={variation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{variation.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><span className="font-medium">Gross Weight:</span> {variation.gross_weight}g</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Stock Status:</span>
                        <Badge variant={variation.stock_quantity > 0 ? 'default' : 'secondary'}>
                          {variation.stock_quantity > 0 ? `${variation.stock_quantity} Available` : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
