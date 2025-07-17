
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
          collection_ids,
          available_karats
        `);

      if (productsError) throw productsError;

      // Filter products that contain the target collection ID
      const filteredProducts = (products || []).filter(product => {
        if (!product.collection_ids || !Array.isArray(product.collection_ids)) return false;
        return (product.collection_ids as string[]).includes(collectionId!);
      });

      // Transform the data and fetch net_weight from karat tables
      const transformedData: Product[] = [];
      
      for (const product of filteredProducts) {
        let netWeight = 0;
        let stockQuantity = 0;
        
        // Get available karats and fetch net_weight from appropriate table
        const availableKarats = Array.isArray(product.available_karats) 
          ? product.available_karats as string[]
          : ['22kt'];
        
        if (availableKarats.includes('22kt')) {
          const { data: karat22Data } = await supabase
            .from('karat_22kt')
            .select('net_weight, stock_quantity')
            .eq('product_id', product.id)
            .single();
          
          netWeight = karat22Data?.net_weight || 0;
          stockQuantity = karat22Data?.stock_quantity || 0;
        } else if (availableKarats.includes('18kt')) {
          const { data: karat18Data } = await supabase
            .from('karat_18kt')
            .select('net_weight, stock_quantity')
            .eq('product_id', product.id)
            .single();
          
          netWeight = karat18Data?.net_weight || 0;
          stockQuantity = karat18Data?.stock_quantity || 0;
        }

        // Only include products with stock
        if (stockQuantity > 0) {
          transformedData.push({
            id: product.id,
            name: product.name,
            description: product.description,
            images: Array.isArray(product.images) ? product.images as string[] : (product.images ? [product.images as string] : []),
            net_weight: netWeight
          });
        }
      }
      
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
              <ProductCard key={product.id} product={{
                ...product,
                stock_quantity: 1 // Add a default stock_quantity for the ProductCard component
              }} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductListPage;
