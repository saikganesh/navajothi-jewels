
import React, { useState, useRef } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-200 ${
          isZoomed ? 'scale-150' : 'scale-100'
        }`}
        style={
          isZoomed
            ? {
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
              }
            : {}
        }
      />
    </div>
  );
};

export default ImageZoom;
