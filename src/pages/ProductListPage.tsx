
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
  net_weight: number | null;
  images: any;
  in_stock: boolean;
  collection_id: string | null;
  collections?: {
    name: string;
    categories?: {
      name: string;
    };
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (collectionId) {
      fetchCollectionAndProducts();
    }
  }, [collectionId]);

  const fetchCollectionAndProducts = async () => {
    try {
      console.log('Fetching collection with ID:', collectionId);
      setIsLoading(true);
      setError(null);
      
      // First, let's check if the collection exists
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .maybeSingle();

      if (collectionError) {
        console.error('Collection error:', collectionError);
        setError('Failed to load collection');
        setIsLoading(false);
        return;
      }
      
      if (!collectionData) {
        console.log('No collection found with ID:', collectionId);
        setError('Collection not found');
        setIsLoading(false);
        return;
      }
      
      console.log('Collection data:', collectionData);
      setCollection(collectionData);

      // Now fetch products in this collection including net_weight
      console.log('Fetching products for collection:', collectionId);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          net_weight,
          images,
          in_stock,
          collection_id,
          collections!inner (
            name,
            categories (
              name
            )
          )
        `)
        .eq('collection_id', collectionId);

      if (productsError) {
        console.error('Products error:', productsError);
        setError('Failed to load products');
        setIsLoading(false);
        return;
      }
      
      console.log('Products data found:', productsData?.length || 0, 'products');
      console.log('Products data:', productsData);
      
      // Transform the data to ensure images is always an array and net_weight is never null
      const transformedData = (productsData || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
        net_weight: product.net_weight || 0
      }));
      
      setProducts(transformedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching collection and products:', error);
      setError('Failed to load collection and products');
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">Collection ID: {collectionId}</p>
            <Link to="/" className="text-gold hover:underline">
              Return to Home
            </Link>
          </div>
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
            <p className="text-muted-foreground mb-2">No products found in this collection.</p>
            <p className="text-sm text-muted-foreground mb-4">Collection ID: {collectionId}</p>
            <Link to="/" className="text-gold hover:underline">
              Return to Home
            </Link>
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
