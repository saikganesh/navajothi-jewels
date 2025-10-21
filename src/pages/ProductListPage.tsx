
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  net_weight: number | null;
  making_charge_percentage?: number;
  discount_percentage?: number | null;
  category_id?: string;
  karat_22kt?: Array<{
    net_weight: number | null;
    gross_weight: number | null;
    stock_quantity: number;
  }>;
  karat_18kt?: Array<{
    net_weight: number | null;
    gross_weight: number | null;
    stock_quantity: number;
  }>;
  karat_14kt?: Array<{
    net_weight: number | null;
    gross_weight: number | null;
    stock_quantity: number;
  }>;
  karat_9kt?: Array<{
    net_weight: number | null;
    gross_weight: number | null;
    stock_quantity: number;
  }>;
}

const ProductListPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionName, setCollectionName] = useState('');

  useEffect(() => {
    if (collectionId) {
      fetchProducts();
    }
  }, [collectionId]);

  const fetchProducts = async () => {
    try {
      // First get the collection name
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('name')
        .eq('id', collectionId)
        .single();

      if (collectionError) throw collectionError;
      
      setCollectionName(collection?.name || '');

      // Then get all products that have this collection ID in their collection_ids array
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          images,
          collection_ids,
          available_karats,
          making_charge_percentage,
          discount_percentage,
          category_id,
          karat_22kt (
            net_weight,
            gross_weight,
            stock_quantity
          ),
          karat_18kt (
            net_weight,
            gross_weight,
            stock_quantity
          ),
          karat_14kt (
            net_weight,
            gross_weight,
            stock_quantity
          ),
          karat_9kt (
            net_weight,
            gross_weight,
            stock_quantity
          )
        `);

      if (productsError) throw productsError;

      // Filter products that contain the target collection ID
      const filteredProducts = (products || []).filter(product => {
        if (!product.collection_ids || !Array.isArray(product.collection_ids)) return false;
        return (product.collection_ids as string[]).includes(collectionId!);
      });

      // Transform the data
      const transformedData: Product[] = filteredProducts
        .filter(product => {
          // Check if product has at least one karat with stock
          const has22ktStock = product.karat_22kt && product.karat_22kt.length > 0 && (product.karat_22kt[0].stock_quantity || 0) > 0;
          const has18ktStock = product.karat_18kt && product.karat_18kt.length > 0 && (product.karat_18kt[0].stock_quantity || 0) > 0;
          const has14ktStock = product.karat_14kt && product.karat_14kt.length > 0 && (product.karat_14kt[0].stock_quantity || 0) > 0;
          const has9ktStock = product.karat_9kt && product.karat_9kt.length > 0 && (product.karat_9kt[0].stock_quantity || 0) > 0;
          return has22ktStock || has18ktStock || has14ktStock || has9ktStock;
        })
        .map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          images: Array.isArray(product.images) ? product.images as string[] : (product.images ? [product.images as string] : []),
          net_weight: null,
          making_charge_percentage: product.making_charge_percentage,
          discount_percentage: product.discount_percentage,
          category_id: product.category_id,
          karat_22kt: product.karat_22kt || [],
          karat_18kt: product.karat_18kt || [],
          karat_14kt: product.karat_14kt || [],
          karat_9kt: product.karat_9kt || []
        }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-muted-foreground">Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-navy mb-4">
            {collectionName}
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover our exquisite {collectionName} collection
          </p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">No products found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductListPage;
