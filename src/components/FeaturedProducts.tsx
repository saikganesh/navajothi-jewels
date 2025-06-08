
import React from 'react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';

const FeaturedProducts = () => {
  const featuredProducts = products.slice(0, 6);

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
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-navy px-8 py-3"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
