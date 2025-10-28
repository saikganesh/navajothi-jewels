
import React from 'react';
import Header from '@/components/Header';

import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <Hero />
      <FeaturedProducts />
      
      {/* Features Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-serif font-bold text-navy">Au</span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-navy mb-2">Pure Gold</h3>
              <p className="text-muted-foreground">All our jewelry is crafted with 18K-22K pure gold for lasting beauty.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-navy mb-2">Handcrafted</h3>
              <p className="text-muted-foreground">Each piece is meticulously handcrafted by skilled artisans.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-navy mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">Only the finest materials and gems are used in our designs.</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
