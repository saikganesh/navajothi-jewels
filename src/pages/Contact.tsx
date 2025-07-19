
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
                    123 Jewelry Street<br />
                    Gold Market, City 123456<br />
                    India
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                  <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Email</h3>
                  <p className="text-muted-foreground">contact@navajothi.com</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-serif font-semibold text-navy mb-6">Store Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Monday - Friday</span>
                  <span className="text-muted-foreground">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Saturday</span>
                  <span className="text-muted-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Sunday</span>
                  <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
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
