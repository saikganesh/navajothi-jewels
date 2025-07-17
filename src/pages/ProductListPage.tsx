
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
  stock_quantity: number;
  collections?: {
    name: string;
    categories?: {
      name: string;
    };
  };
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
          stock_quantity,
          collection_ids
        `)
        .gt('stock_quantity', 0);

      if (productsError) throw productsError;

      // Filter products that contain the target collection ID
      const filteredProducts = (products || []).filter(product => {
        if (!product.collection_ids || !Array.isArray(product.collection_ids)) return false;
        return (product.collection_ids as string[]).includes(collectionId!);
      });

      // Transform the data to ensure images is always an array
      const transformedData = filteredProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        images: Array.isArray(product.images) ? product.images as string[] : (product.images ? [product.images as string] : []),
        stock_quantity: product.stock_quantity
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
