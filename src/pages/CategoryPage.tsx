
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
  stock_quantity: number;
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

      // Get only main products (not variations) that have this category_id
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          images,
          available_karats,
          category_id
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
      
      // Transform the data and fetch net_weight from karat tables
      const transformedData: Product[] = [];
      
      for (const product of products || []) {
        let netWeight = 0;
        let stockQuantity = 0;
        
        // Get available karats and fetch net_weight from appropriate table
        const availableKarats = Array.isArray(product.available_karats) 
          ? product.available_karats as string[]
          : ['22kt'];
        
        // Try 22kt first, then 18kt
        if (availableKarats.includes('22kt')) {
          const { data: karat22Data } = await supabase
            .from('karat_22kt')
            .select('net_weight, stock_quantity')
            .eq('product_id', product.id)
            .maybeSingle();
          
          if (karat22Data) {
            netWeight = karat22Data.net_weight || 0;
            stockQuantity = karat22Data.stock_quantity || 0;
          }
        } else if (availableKarats.includes('18kt')) {
          const { data: karat18Data } = await supabase
            .from('karat_18kt')
            .select('net_weight, stock_quantity')
            .eq('product_id', product.id)
            .maybeSingle();
          
          if (karat18Data) {
            netWeight = karat18Data.net_weight || 0;
            stockQuantity = karat18Data.stock_quantity || 0;
          }
        }

        // Include all products, even those without stock (so users can see them)
        transformedData.push({
          id: product.id,
          name: product.name,
          description: product.description,
          images: Array.isArray(product.images) ? product.images as string[] : (product.images ? [product.images as string] : []),
          net_weight: netWeight,
          stock_quantity: stockQuantity
        });
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
