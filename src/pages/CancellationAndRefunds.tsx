
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CancellationAndRefunds = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-navy mb-8">Cancellation and Refunds</h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Effective Date:</strong> 21-07-2025
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Store Name:</strong> Navajothi and Co
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                <strong>Website:</strong> https://www.navajothiandco.com
              </p>
            </div>

            <p className="mb-8">
              At Navajothi and Co, we are committed to providing you with a transparent and fair cancellation and refund experience. Please read the following policy carefully before making a purchase.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">1. Order Cancellation Policy</h2>
                <div className="space-y-4">
                  <p>You may cancel your order within 24 hours of placing it.</p>
                  <p>To request a cancellation, please contact our customer support at saikrishnang@navajothiandco.com or call us at 9344739675 within the specified timeframe.</p>
                  <p>Orders cannot be cancelled after 24 hours, as processing and dispatch may have already begun.</p>
                  <p>Refunds for cancelled orders will be initiated within 3 to 7 business days after approval.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">2. Return Policy</h2>
                <div className="space-y-4">
                  <p>Products can be returned only if damaged during shipping or packaging.</p>
                  <p>Return requests must be raised within 10 days of receiving the product.</p>
                  <p>The returned product must be:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Unused and unworn.</li>
                    <li>In original packaging with invoice and authenticity certificate.</li>
                  </ul>
                  <p>Returns are not accepted for any reason other than verified transit damage.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">3. Refund Process</h2>
                <div className="space-y-4">
                  <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund.</p>
                  <p>If approved, your refund will be processed within 3 to 7 business days.</p>
                  <p>Refunds will be made via the original method of payment.</p>
                  <p>If the payment gateway or bank requires additional time, we are not liable for such external delays.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">4. Non-Refundable Situations</h2>
                <div className="space-y-4">
                  <p>Refunds will not be provided in the following cases:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>If the product is damaged after delivery.</li>
                    <li>If the return is requested after the 10-day return window.</li>
                    <li>If the product has been used, altered, or tampered with.</li>
                    <li>If the product was delivered in good condition and no valid return reason (shipping damage) is provided.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">5. How to Initiate a Return or Cancellation</h2>
                <div className="space-y-4">
                  <p>To raise a return or cancellation request, please contact:</p>
                  <div className="mt-4 space-y-2">
                    <p><strong>Email:</strong> saikrishnang@navajothiandco.com</p>
                    <p><strong>Phone:</strong> 9344739675</p>
                    <p><strong>Address:</strong> 75, Periya Chetty Street, Trichy - 620008, Tamil Nadu, India</p>
                  </div>
                  <p className="mt-4">Please include:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Your order number</li>
                    <li>Photos of the damaged product (if applicable)</li>
                    <li>A brief description of the issue</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CancellationAndRefunds;
