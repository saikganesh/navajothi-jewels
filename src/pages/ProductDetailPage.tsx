
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  in_stock: boolean;
  gross_weight: number | null;
  net_weight: number | null;
  stone_weight: number | null;
  carat: string | null;
  collections?: {
    name: string;
    categories?: {
      name: string;
    };
  };
}

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

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
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const cartProduct = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.images[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
        category: product.collections?.categories?.name || 'Jewelry',
        inStock: product.in_stock,
      };
      addItem(cartProduct);
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

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 rounded-lg overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
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
                      alt={`${product.name} ${index + 1}`}
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
                {product.name}
              </h1>
              <p className="text-sm text-muted-foreground mb-4">
                {product.collections?.name} • {product.collections?.categories?.name}
              </p>
              <p className="text-4xl font-bold text-gold mb-6">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {product.gross_weight && (
                  <div>
                    <span className="text-sm text-muted-foreground">Gross Weight</span>
                    <p className="font-medium">{product.gross_weight.toFixed(3)}g</p>
                  </div>
                )}
                {product.net_weight && (
                  <div>
                    <span className="text-sm text-muted-foreground">Net Weight</span>
                    <p className="font-medium">{product.net_weight.toFixed(3)}g</p>
                  </div>
                )}
                {product.stone_weight && (
                  <div>
                    <span className="text-sm text-muted-foreground">Stone Weight</span>
                    <p className="font-medium">{product.stone_weight.toFixed(3)}g</p>
                  </div>
                )}
                {product.carat && (
                  <div>
                    <span className="text-sm text-muted-foreground">Carat</span>
                    <p className="font-medium">{product.carat}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded ${
                  product.in_stock 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full bg-gold hover:bg-gold-dark text-navy py-3 text-lg font-semibold"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
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
