
import React from 'react';
import { Button } from '@/components/ui/button';
import JewelryCarousel from './JewelryCarousel';

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-background via-cream/20 to-gold-light/30">
      <div className="container mx-auto px-4">
        <JewelryCarousel />
      </div>
    </section>
  );
};

export default Hero;
