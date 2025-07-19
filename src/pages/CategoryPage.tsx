
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
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryDisplayName, setCategoryDisplayName] = useState('');

  useEffect(() => {
    if (categoryName) {
      fetchProductsByCategory();
    }
  }, [categoryName]);

  const fetchProductsByCategory = async () => {
    try {
      const formattedCategoryName = categoryName?.replace(/-/g, ' ') || '';
      
      // First get the category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', formattedCategoryName)
        .single();

      if (categoryError || !categoryData) {
        console.error('Category not found:', categoryError);
        setCategoryDisplayName(formattedCategoryName);
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setCategoryDisplayName(categoryData.name);

      // Now get all products that have this category_id
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
        .eq('category_id', categoryData.id);

      if (productsError) throw productsError;
      
      // Transform the data and fetch net_weight from karat tables
      const transformedData: Product[] = [];
      
      for (const product of products || []) {
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
            net_weight: netWeight,
            stock_quantity: stockQuantity
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
