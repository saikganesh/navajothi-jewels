
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  making_charge_percentage: number;
  created_at: string;
  category_id: string | null;
  net_weight: number | null; // Added this property
  category?: {
    id: string;
    name: string;
  };
  collections?: {
    name: string;
    categories?: {
      name: string;
    };
  };
  karat_22kt?: Array<{
    gross_weight: number | null;
    stone_weight: number | null;
    net_weight: number | null;
    stock_quantity: number;
  }>;
  karat_18kt?: Array<{
    gross_weight: number | null;
    stone_weight: number | null;
    net_weight: number | null;
    stock_quantity: number;
  }>;
  stock_quantity: number;
}

const fetchAllProducts = async (): Promise<Product[]> => {
  console.log('Fetching all products...');
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      images,
      making_charge_percentage,
      created_at,
      category_id,
      categories:category_id (
        id,
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
    .eq('type', 'product')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  // Calculate stock quantity from karat data and ensure proper typing
  const productsWithStock = (data || []).map(product => {
    // Get net weight from karat data
    const netWeight = product.karat_22kt?.[0]?.net_weight || 
                     product.karat_18kt?.[0]?.net_weight || 
                     0;

    return {
      ...product,
      images: Array.isArray(product.images) ? product.images as string[] : [],
      net_weight: netWeight,
      stock_quantity: Math.max(
        (product.karat_22kt?.[0]?.stock_quantity || 0),
        (product.karat_18kt?.[0]?.stock_quantity || 0)
      )
    };
  });

  console.log('All products fetched:', productsWithStock);
  return productsWithStock;
};

const Products = () => {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['all-products'],
    queryFn: fetchAllProducts,
  });

  if (error) {
    console.error('Error in Products component:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            All Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover our complete collection of exquisite jewelry pieces
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
