import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
}

const SubHeader = () => {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [directCategories, setDirectCategories] = useState<Category[]>([]);
  
  console.log('SubHeader - Categories:', categories, 'Loading:', categoriesLoading);

  // Fallback direct fetch
  useEffect(() => {
    const fetchDirect = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        console.log('Direct fetch result:', data, error);
        if (data) {
          setDirectCategories(data);
        }
      } catch (err) {
        console.error('Direct fetch error:', err);
      }
    };
    
    fetchDirect();
  }, []);

  const categoriesToShow = categories.length > 0 ? categories : directCategories;

  return (
    <div className="bg-muted/50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-10 overflow-x-auto">
          <nav className="flex space-x-6">
            {categoriesLoading ? (
              // Show skeleton loading for categories
              <>
                <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-14 bg-muted animate-pulse rounded"></div>
              </>
            ) : categoriesToShow.length > 0 ? (
              categoriesToShow.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No categories available</div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SubHeader;