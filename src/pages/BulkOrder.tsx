
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BulkOrder = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-navy mb-4">Bulk Orders</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Special pricing and services for wholesale and bulk jewelry orders
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-navy mb-6">Why Choose Bulk Orders?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-gold mr-2">•</span>
                  Competitive wholesale pricing
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">•</span>
                  Minimum order quantities available
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">•</span>
                  Custom designs and modifications
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">•</span>
                  Dedicated account manager
                </li>
                <li className="flex items-start">
                  <span className="text-gold mr-2">•</span>
                  Flexible payment terms
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-2xl font-serif font-semibold text-navy mb-6">Contact for Bulk Orders</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Bulk Sales Team</h3>
                  <p className="text-muted-foreground">
                    Phone: +91 98765 43211<br />
                    Email: bulk@navajothi.com
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Minimum Order</h3>
                  <p className="text-muted-foreground">₹50,000 or 100 pieces</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Delivery Time</h3>
                  <p className="text-muted-foreground">15-30 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BulkOrder;
