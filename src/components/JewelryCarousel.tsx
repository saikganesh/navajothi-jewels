import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const carouselSlides = [
  {
    image: '/lovable-uploads/37b8f9ae-f989-4b73-9cd0-e79a8ff8cf46.png',
    title: 'Radiant Bloom',
    subtitle: 'Diamond Flower Earrings',
    description: 'Exquisite craftsmanship meets timeless elegance'
  },
  {
    image: '/lovable-uploads/1ebcb491-152c-4d63-a65a-a0ac53f9c4ef.png',
    title: 'Golden Grace',
    subtitle: 'Traditional Nose Pin',
    description: 'Celebrate your heritage with our finest gold collection'
  },
  {
    image: '/lovable-uploads/636f1948-abd1-4971-9a0f-9daa26e9ce83.png',
    title: 'Diamond Dazzle',
    subtitle: 'Classic Nose Stud',
    description: 'Sparkle with every moment, shine with every smile'
  },
  {
    image: '/lovable-uploads/0e247638-bc55-439a-a7f8-be402e987146.png',
    title: 'Ruby Romance',
    subtitle: 'Designer Nose Pin',
    description: 'Where tradition meets contemporary design'
  },
  {
    image: '/lovable-uploads/a99174b6-5a7a-4577-a10b-28bd826ff57b.png',
    title: 'Floral Fantasy',
    subtitle: 'Gold Flower Studs',
    description: 'Handcrafted perfection for the modern woman'
  }
];

const JewelryCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    
    // Auto-play functionality
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br from-gold/10 to-navy/5 rounded-2xl">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {carouselSlides.map((slide, index) => (
            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
              <div className="relative h-[600px] flex items-center justify-between px-8 lg:px-16">
                {/* Content Side */}
                <div className="flex-1 max-w-xl z-10">
                  <div className="space-y-6 text-left">
                    <div className="inline-block px-4 py-2 bg-gold/20 rounded-full">
                      <span className="text-sm font-medium text-navy">{slide.subtitle}</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-serif font-bold text-navy leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                      {slide.description}
                    </p>
                    <div className="flex gap-4 pt-4">
                      <Button size="lg" className="bg-gold hover:bg-gold/90 text-navy font-semibold">
                        Explore Collection
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Image Side */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="relative">
                    <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-gold/20 to-transparent p-8">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover rounded-full shadow-2xl"
                      />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold/30 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-navy/20 rounded-full blur-2xl"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg z-20"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6 text-navy" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg z-20"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6 text-navy" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-gold scale-125' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default JewelryCarousel;