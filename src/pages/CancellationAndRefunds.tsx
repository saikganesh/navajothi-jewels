
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CancellationAndRefunds = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-serif font-bold text-navy mb-6 text-center">
              Cancellation and Refunds
            </h1>
            
            <div className="space-y-6 text-gray-700">
              <div className="border-b pb-4">
                <p><strong>Effective Date:</strong> 21-07-2025</p>
                <p><strong>Store Name:</strong> Navajothi and Co</p>
                <p><strong>Website:</strong> https://www.navajothiandco.com</p>
              </div>

              <p className="text-lg">
                At Navajothi and Co, we are committed to providing you with a transparent and fair cancellation and refund experience. Please read the following policy carefully before making a purchase.
              </p>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">1. Order Cancellation Policy</h2>
                <ul className="space-y-2 ml-4">
                  <li>• You may cancel your order within 24 hours of placing it.</li>
                  <li>• To request a cancellation, please contact our customer support at saikrishnang@navajothiandco.com or call us at 9344739675 within the specified timeframe.</li>
                  <li>• Orders cannot be cancelled after 24 hours, as processing and dispatch may have already begun.</li>
                  <li>• Refunds for cancelled orders will be initiated within 3 to 7 business days after approval.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">2. Return Policy</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Products can be returned only if damaged during shipping or packaging.</li>
                  <li>• Return requests must be raised within 10 days of receiving the product.</li>
                  <li>• The returned product must be:</li>
                  <ul className="ml-6 space-y-1">
                    <li>- Unused and unworn.</li>
                    <li>- In original packaging with invoice and authenticity certificate.</li>
                  </ul>
                  <li>• Returns are not accepted for any reason other than verified transit damage.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">3. Refund Process</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Once your return is received and inspected, we will notify you of the approval or rejection of your refund.</li>
                  <li>• If approved, your refund will be processed within 3 to 7 business days.</li>
                  <li>• Refunds will be made via the original method of payment.</li>
                  <li>• If the payment gateway or bank requires additional time, we are not liable for such external delays.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">4. Non-Refundable Situations</h2>
                <p className="mb-4 ml-4">Refunds will not be provided in the following cases:</p>
                <ul className="space-y-2 ml-4">
                  <li>• If the product is damaged after delivery.</li>
                  <li>• If the return is requested after the 10-day return window.</li>
                  <li>• If the product has been used, altered, or tampered with.</li>
                  <li>• If the product was delivered in good condition and no valid return reason (shipping damage) is provided.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">5. How to Initiate a Return or Cancellation</h2>
                <p className="mb-4 ml-4">To raise a return or cancellation request, please contact:</p>
                <div className="ml-8 mt-2 space-y-1">
                  <p><strong>Email:</strong> saikrishnang@navajothiandco.com</p>
                  <p><strong>Phone:</strong> 9344739675</p>
                  <p><strong>Address:</strong> 75, Periya Chetty Street, Trichy - 620008, Tamil Nadu, India</p>
                </div>
                <p className="mt-4 ml-4">Please include:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Your order number</li>
                  <li>• Photos of the damaged product (if applicable)</li>
                  <li>• A brief description of the issue</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationAndRefunds;
