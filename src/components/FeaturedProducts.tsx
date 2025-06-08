
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  categories?: {
    name: string;
  };
}

// Placeholder images for collections
const collectionImages = [
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop'
];

const FeaturedProducts = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-navy mb-4">
              Featured Collection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Loading collections...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-navy mb-4">
            Featured Collection
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked pieces that showcase the finest in traditional gold craftsmanship
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {collections.map((collection, index) => (
            <Card key={collection.id} className="group cursor-pointer overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-gold">
              <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 relative overflow-hidden">
                <img
                  src={collection.image_url || collectionImages[index % collectionImages.length]}
                  alt={collection.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                
                {/* Quick add button */}
                <Button
                  size="sm"
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gold hover:bg-gold-dark text-navy"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle add to cart functionality
                  }}
                >
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {collection.description || 'Beautiful handcrafted jewelry collection'}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-gold">
                      $0
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {collection.categories?.name || 'Collection'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {collections.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">No collections available yet.</p>
          </div>
        ) : (
          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-navy px-8 py-3"
            >
              View All Collections
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
