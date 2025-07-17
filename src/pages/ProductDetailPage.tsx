
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star, Heart, Share2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import ImageZoom from '@/components/ImageZoom';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  net_weight: number | null;
  images: string[];
  stock_quantity: number;
  category_id: string | null;
  collection_ids: string[] | null;
  categories?: {
    name: string;
  };
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { calculatePrice } = useGoldPrice();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformedProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description,
        net_weight: data.net_weight,
        images: Array.isArray(data.images) ? data.images as string[] : (data.images ? [data.images as string] : []),
        stock_quantity: data.stock_quantity,
        category_id: data.category_id,
        collection_ids: Array.isArray(data.collection_ids) ? data.collection_ids as string[] : null,
        categories: data.categories
      };

      setProduct(transformedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const calculatedPrice = calculatePrice(product.net_weight);
    
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: calculatedPrice,
      image: product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      category: product.categories?.name || 'Jewelry',
      inStock: product.stock_quantity > 0,
      net_weight: product.net_weight || 0,
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

  const displayPrice = calculatePrice(product.net_weight);
  const productImages = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {product.net_weight && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                <p className="text-muted-foreground">Net Weight: {product.net_weight}g</p>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 bg-gold hover:bg-gold-dark text-navy"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Reviews placeholder */}
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
