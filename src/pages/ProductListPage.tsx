import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: any; // Use any to handle Json type from Supabase
  in_stock: boolean;
  collection_id: string | null;
  collections?: {
    name: string;
  };
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
}

const ProductListPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (collectionId) {
      fetchCollectionAndProducts();
    }
  }, [collectionId]);

  const fetchCollectionAndProducts = async () => {
    try {
      // Fetch collection details
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (collectionError) throw collectionError;
      setCollection(collectionData);

      // Fetch products in this collection
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          collections (
            name
          )
        `)
        .eq('collection_id', collectionId)
        .eq('in_stock', true);

      if (productsError) throw productsError;
      
      // Transform the data to ensure images is always an array
      const transformedData = (productsData || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : [])
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching collection and products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-muted-foreground">Loading collection...</p>
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
            {collection?.name || 'Collection'}
          </h1>
          {collection?.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {collection.description}
            </p>
          )}
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
