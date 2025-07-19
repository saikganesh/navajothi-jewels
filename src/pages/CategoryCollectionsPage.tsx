
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const CategoryCollectionsPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categoryDisplayName, setCategoryDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryName) {
      fetchCollections();
    }
  }, [categoryName]);

  const fetchCollections = async () => {
    try {
      // Set the category display name from the URL parameter
      const formattedCategoryName = categoryName?.replace(/-/g, ' ') || '';
      setCategoryDisplayName(formattedCategoryName);

      // Fetch all collections since they are now independent of categories
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('id, name, description, image_url')
        .order('created_at', { ascending: false });

      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
      } else {
        setCollections(collectionsData || []);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-muted-foreground">Loading collections...</p>
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
            All Collections
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our exquisite jewelry collections
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No collections found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link key={collection.id} to={`/collection/${collection.id}`}>
                <Card className="group cursor-pointer overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-gold">
                  <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 relative overflow-hidden">
                    <img
                      src={collection.image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'}
                      alt={collection.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-muted-foreground line-clamp-3">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryCollectionsPage;
