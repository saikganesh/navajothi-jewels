
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface SearchResult {
  type: 'category' | 'collection' | 'product';
  id: string;
  name: string;
  image?: string;
  category_id?: string;
  collection_id?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    const searchDebounce = setTimeout(async () => {
      setIsLoading(true);
      await performSearch(searchTerm);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [searchTerm]);

  const performSearch = async (term: string) => {
    try {
      const searchResults: SearchResult[] = [];

      // Search categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${term}%`);

      if (categories) {
        categories.forEach(category => {
          searchResults.push({
            type: 'category',
            id: category.id,
            name: category.name,
          });
        });
      }

      // Search collections
      const { data: collections } = await supabase
        .from('collections')
        .select('id, name, image_url, category_id')
        .ilike('name', `%${term}%`);

      if (collections) {
        collections.forEach(collection => {
          searchResults.push({
            type: 'collection',
            id: collection.id,
            name: collection.name,
            image: collection.image_url || undefined,
            category_id: collection.category_id || undefined,
          });
        });
      }

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, images, collection_id')
        .ilike('name', `%${term}%`);

      if (products) {
        products.forEach(product => {
          let image = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';
          
          if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const firstImage = product.images[0];
            if (typeof firstImage === 'string') {
              image = firstImage;
            }
          }

          searchResults.push({
            type: 'product',
            id: product.id,
            name: product.name,
            image,
            collection_id: product.collection_id || undefined,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'category':
        return `/category/${result.name.toLowerCase().replace(/\s+/g, '-')}`;
      case 'collection':
        return `/collection/${result.id}`;
      case 'product':
        return `/product/${result.id}`;
      default:
        return '/';
    }
  };

  const getResultImage = (result: SearchResult) => {
    if (result.image) return result.image;
    
    switch (result.type) {
      case 'category':
        return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop';
      case 'collection':
        return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop';
      case 'product':
        return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop';
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories, collections, and products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Searching...
            </div>
          )}
          
          {!isLoading && searchTerm && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No results found for "{searchTerm}"
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}-${index}`}
                  to={getResultLink(result)}
                  onClick={handleClose}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <img
                    src={getResultImage(result)}
                    alt={result.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{result.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {result.type}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
