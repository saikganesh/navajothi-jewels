
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-navy text-cream">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-gold mb-4">
              Navajothi & Co
            </h3>
            <p className="text-cream/80 mb-6 leading-relaxed">
              We specialize in traditional gold jewelry that celebrates heritage 
              and craftsmanship. Each piece is carefully curated to bring you 
              timeless elegance and unmatched quality.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cream/60 hover:text-gold transition-colors">
                Facebook
              </a>
              <a href="#" className="text-cream/60 hover:text-gold transition-colors">
                Instagram
              </a>
              <a href="#" className="text-cream/60 hover:text-gold transition-colors">
                Pinterest
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-cream/80 hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-cream/80 hover:text-gold transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-cream/80 hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-cream/80 hover:text-gold transition-colors">Contact</Link></li>
              <li><Link to="/terms-and-conditions" className="text-cream/80 hover:text-gold transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-gold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/shipping-policy" className="text-cream/80 hover:text-gold transition-colors">Shipping Policy</Link></li>
              <li><a href="#" className="text-cream/80 hover:text-gold transition-colors">Returns</a></li>
              <li><a href="#" className="text-cream/80 hover:text-gold transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-cream/80 hover:text-gold transition-colors">Care Instructions</a></li>
              <li><Link to="/privacy-policy" className="text-cream/80 hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cancellation-and-refunds" className="text-cream/80 hover:text-gold transition-colors">Cancellation and Refunds</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-8 pt-8 text-center">
          <p className="text-cream/60">
            © 2024 Navajothi & Co. All rights reserved. | Crafted with love for timeless jewelry.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
