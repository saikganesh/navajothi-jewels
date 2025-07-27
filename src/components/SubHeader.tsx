import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';

const SubHeader = () => {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

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
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SubHeader;