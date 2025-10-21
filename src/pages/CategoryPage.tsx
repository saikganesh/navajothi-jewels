import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';

interface KaratData {
  gross_weight: number | null;
  stone_weight: number | null;
  net_weight: number | null;
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
  net_weight: number | null;
  stock_quantity: number;
  making_charge_percentage?: number;
  category_id?: string;
  gross_weight?: number | null;
  discount_percentage?: number | null;
  available_karats?: string[];
  category?: {
    id: string;
    name: string;
  };
  karat_22kt?: KaratData[];
  karat_18kt?: KaratData[];
  karat_14kt?: KaratData[];
  karat_9kt?: KaratData[];
  variations?: ProductVariation[];
}

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryDisplayName, setCategoryDisplayName] = useState('');

  useEffect(() => {
    if (categoryId) {
      fetchProductsByCategory();
    }
  }, [categoryId]);

  const fetchProductsByCategory = async () => {
    try {
      console.log('Fetching products for category:', categoryId);
      
      // Handle URL-friendly category names (convert dashes to spaces and capitalize)
      const formattedCategoryName = categoryId?.replace(/-/g, ' ') || '';
      
      // First get the category by name (since the URL uses category names, not IDs)
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', formattedCategoryName)
        .maybeSingle();

      if (categoryError) {
        console.error('Error fetching category:', categoryError);
        setCategoryDisplayName(formattedCategoryName);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      if (!categoryData) {
        console.log('Category not found:', formattedCategoryName);
        setCategoryDisplayName(formattedCategoryName);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      console.log('Found category:', categoryData);
      setCategoryDisplayName(categoryData.name);

      // Get only main products (not variations) that have this category_id and join with category details
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          images,
          available_karats,
          category_id,
          making_charge_percentage,
          discount_percentage,
          type,
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
          ),
          karat_14kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          ),
          karat_9kt (
            gross_weight,
            stone_weight,
            net_weight,
            stock_quantity
          )
        `)
        .eq('category_id', categoryData.id)
        .eq('type', 'product'); // Only get main products, not variations

      if (productsError) {
        console.error('Error fetching products:', productsError);
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Found products:', products);
      
      // Transform the data and fetch variations for each product
      const transformedData: Product[] = [];
      
      for (const product of products || []) {
        // Fetch variations for this product
        const { data: variationsData } = await supabase
          .from('products')
          .select(`
            id,
            parent_product_id,
            name,
            description,
            images,
            available_karats,
            making_charge_percentage,
            discount_percentage,
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
            ),
            karat_14kt (
              gross_weight,
              stone_weight,
              net_weight,
              stock_quantity
            ),
            karat_9kt (
              gross_weight,
              stone_weight,
              net_weight,
              stock_quantity
            )
          `)
          .eq('type', 'variation')
          .eq('parent_product_id', product.id);

        const variations: ProductVariation[] = (variationsData || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          description: v.description,
          images: Array.isArray(v.images) ? v.images : (v.images ? [v.images] : []),
          making_charge_percentage: v.making_charge_percentage,
          discount_percentage: v.discount_percentage,
          karat_22kt: v.karat_22kt || [],
          karat_18kt: v.karat_18kt || [],
          karat_14kt: v.karat_14kt || [],
          karat_9kt: v.karat_9kt || []
        }));

        // Check if product or any of its variations have stock
        const parentHasStock = (product.karat_22kt?.[0]?.stock_quantity || 0) > 0 ||
          (product.karat_18kt?.[0]?.stock_quantity || 0) > 0 ||
          (product.karat_14kt?.[0]?.stock_quantity || 0) > 0 ||
          (product.karat_9kt?.[0]?.stock_quantity || 0) > 0;

        const variationsHaveStock = variations.some(v =>
          (v.karat_22kt?.[0]?.stock_quantity || 0) > 0 ||
          (v.karat_18kt?.[0]?.stock_quantity || 0) > 0 ||
          (v.karat_14kt?.[0]?.stock_quantity || 0) > 0 ||
          (v.karat_9kt?.[0]?.stock_quantity || 0) > 0
        );

        // Only include products that have stock in parent or variations
        if (parentHasStock || variationsHaveStock) {
          transformedData.push({
            id: product.id,
            name: product.name,
            description: product.description,
            images: Array.isArray(product.images) ? product.images as string[] : (product.images ? [product.images as string] : []),
            net_weight: product.karat_22kt?.[0]?.net_weight || product.karat_18kt?.[0]?.net_weight || product.karat_14kt?.[0]?.net_weight || product.karat_9kt?.[0]?.net_weight || 0,
            stock_quantity: product.karat_22kt?.[0]?.stock_quantity || product.karat_18kt?.[0]?.stock_quantity || product.karat_14kt?.[0]?.stock_quantity || product.karat_9kt?.[0]?.stock_quantity || 0,
            making_charge_percentage: product.making_charge_percentage,
            discount_percentage: product.discount_percentage,
            category_id: product.category_id,
            gross_weight: product.karat_22kt?.[0]?.gross_weight || product.karat_18kt?.[0]?.gross_weight || product.karat_14kt?.[0]?.gross_weight || product.karat_9kt?.[0]?.gross_weight || 0,
            available_karats: Array.isArray(product.available_karats) ? product.available_karats as string[] : ['22kt'],
            category: product.categories ? {
              id: product.categories.id,
              name: product.categories.name
            } : undefined,
            karat_22kt: product.karat_22kt || [],
            karat_18kt: product.karat_18kt || [],
            karat_14kt: product.karat_14kt || [],
            karat_9kt: product.karat_9kt || [],
            variations
          });
        }
      }
      
      console.log('Transformed products:', transformedData);
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
          <h1 className="text-4xl font-serif font-bold text-navy mb-4 capitalize">
            {categoryDisplayName}
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover our exquisite {categoryDisplayName} collection
          </p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">No products found in this category.</p>
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

export default CategoryPage;
