
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-navy mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch with us for any queries or assistance
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-navy mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Address</h3>
                  <p className="text-muted-foreground">
                    75 Periya Chetty Street<br />
                    Big Bazaar, Trichy 620008<br />
                    Tamil Nadu, India
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                  <p className="text-muted-foreground">+91 93447 39675</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Email</h3>
                  <p className="text-muted-foreground">saikrishnang@navajothiandco.com</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-serif font-semibold text-navy mb-6">Contact Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Monday - Saturday</span>
                  <span className="text-muted-foreground">10:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Sunday</span>
                  <span className="text-muted-foreground">Holiday</span>
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

export default Contact;
