
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface KaratData {
  net_weight: number | null;
  gross_weight: number | null;
  stock_quantity: number;
}

interface ProductVariation {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  making_charge_percentage?: number;
  discount_percentage?: number | null;
  karat_22kt?: KaratData[];
  karat_18kt?: KaratData[];
  karat_14kt?: KaratData[];
  karat_9kt?: KaratData[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  making_charge_percentage?: number;
  discount_percentage?: number | null;
  category_id?: string;
  karat_22kt?: KaratData[];
  karat_18kt?: KaratData[];
  karat_14kt?: KaratData[];
  karat_9kt?: KaratData[];
  variations?: ProductVariation[];
}

const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    // Fetch parent products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        images,
        making_charge_percentage,
        discount_percentage,
        category_id,
        type,
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
      `)
      .eq('type', 'product')
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    // For each parent product, fetch its variations
    const transformedData: Product[] = [];
    
    for (const product of products || []) {
      // Fetch variations for this product
      const { data: variations, error: variationsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          images,
          making_charge_percentage,
          discount_percentage,
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
        `)
        .eq('parent_product_id', product.id)
        .eq('type', 'variation');

      if (variationsError) {
        console.error('Error fetching variations:', variationsError);
      }

      // Transform variations data
      const transformedVariations: ProductVariation[] = (variations || []).map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        images: Array.isArray(v.images) ? v.images as string[] : (v.images ? [v.images as string] : []),
        making_charge_percentage: v.making_charge_percentage,
        discount_percentage: v.discount_percentage,
        karat_22kt: v.karat_22kt || [],
        karat_18kt: v.karat_18kt || [],
        karat_14kt: v.karat_14kt || [],
        karat_9kt: v.karat_9kt || []
      }));

      // Check if product or any of its variations have stock
      const productHasStock = 
        (product.karat_22kt?.[0]?.stock_quantity || 0) > 0 ||
        (product.karat_18kt?.[0]?.stock_quantity || 0) > 0 ||
        (product.karat_14kt?.[0]?.stock_quantity || 0) > 0 ||
        (product.karat_9kt?.[0]?.stock_quantity || 0) > 0;

      const variationsHaveStock = transformedVariations.some(v =>
        (v.karat_22kt?.[0]?.stock_quantity || 0) > 0 ||
        (v.karat_18kt?.[0]?.stock_quantity || 0) > 0 ||
        (v.karat_14kt?.[0]?.stock_quantity || 0) > 0 ||
        (v.karat_9kt?.[0]?.stock_quantity || 0) > 0
      );

      // Only include products that have stock (either in parent or variations)
      if (productHasStock || variationsHaveStock) {
        transformedData.push({
          id: product.id,
          name: product.name,
          description: product.description,
          images: Array.isArray(product.images) ? product.images as string[] : (product.images ? [product.images as string] : []),
          making_charge_percentage: product.making_charge_percentage,
          discount_percentage: product.discount_percentage,
          category_id: product.category_id,
          karat_22kt: product.karat_22kt || [],
          karat_18kt: product.karat_18kt || [],
          karat_14kt: product.karat_14kt || [],
          karat_9kt: product.karat_9kt || [],
          variations: transformedVariations
        });
      }
    }
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
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
