
import React from 'react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-cream via-background to-gold-light min-h-[70vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-serif font-bold text-navy mb-6 leading-tight">
              Timeless
              <span className="block text-gold">Elegance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover our exquisite collection of traditional gold jewelry, 
              where each piece tells a story of heritage, craftsmanship, and timeless beauty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-navy font-semibold px-8 py-3">
                Shop Collection
              </Button>
              <Button variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-navy px-8 py-3">
                View Catalog
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-gold-light to-gold rounded-full p-8 shadow-2xl">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gold rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-serif font-bold text-navy">Au</span>
                  </div>
                  <p className="text-gold font-serif text-lg">Crafted with Love</p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gold rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gold-light rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
