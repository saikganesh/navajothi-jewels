
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  categories?: {
    name: string;
  };
}

const fetchCollections = async (): Promise<Collection[]> => {
  console.log('Fetching collections...');
  const { data, error } = await supabase
    .from('collections')
    .select(`
      id,
      name,
      description,
      image_url,
      created_at,
      categories (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
  
  console.log('Collections fetched:', data);
  return data || [];
};

const Collections = () => {
  const { data: collections = [], isLoading, error } = useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-center text-muted-foreground">Loading collections...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-center text-red-500">Error loading collections. Please try again.</p>
          </div>
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
          <h1 className="text-4xl font-serif font-bold text-navy mb-4">Our Collections</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our exquisite jewelry collections, each crafted with precision and care
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-center text-muted-foreground">No collections available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`/collection/${collection.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Card className="group cursor-pointer overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-gold">
                  <div className="aspect-square bg-gradient-to-br from-cream to-gold-light p-6 relative overflow-hidden">
                    <img
                      src={
                        collection.image_url || 
                        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop'
                      }
                      alt={collection.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                      {collection.categories && (
                        <span className="text-sm text-muted-foreground">
                          {collection.categories.name}
                        </span>
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

export default Collections;
