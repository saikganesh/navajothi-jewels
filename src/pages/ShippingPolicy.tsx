
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-serif font-bold text-navy mb-6 text-center">
              Shipping Policy
            </h1>
            
            <div className="space-y-6 text-gray-700">
              <div className="border-b pb-4">
                <p><strong>Effective Date:</strong> 21-07-2025</p>
                <p><strong>Store Name:</strong> Navajothi and Co</p>
                <p><strong>Website:</strong> https://www.navajothiandco.com</p>
              </div>

              <p className="text-lg">
                Thank you for shopping at Navajothi and Co. We are committed to delivering your jewellery securely and promptly. Please read our shipping policy carefully before placing your order.
              </p>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">1. Delivery Timeline</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Orders are typically delivered within 7 to 14 business days from the date of successful payment.</li>
                  <li>• Delivery times may vary depending on the delivery location, order volume, and availability of the product.</li>
                  <li>• In case of delays due to external factors (strikes, weather, courier issues), we will notify you as soon as possible.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">2. Shipping Charges</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Shipping charges are based on the customer's delivery location and order size.</li>
                  <li>• The exact shipping cost will be calculated and displayed during checkout before you make the payment.</li>
                  <li>• Any applicable shipping fee is non-refundable once the order is dispatched.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">3. Packaging and Handling</h2>
                <ul className="space-y-2 ml-4">
                  <li>• All jewellery is packed in tamper-proof, sealed, and fully insured packaging to ensure maximum safety during transit.</li>
                  <li>• Every shipment includes the product, invoice, and certificate of authenticity (if applicable).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">4. Tracking Your Order</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Once your order is shipped, you will receive a tracking number and courier details via email/SMS.</li>
                  <li>• You can track your order on our website or directly on the courier's tracking page.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">5. Delivery Partners</h2>
                <p className="ml-4">We use trusted and insured courier services across India to ensure reliable and timely deliveries.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">6. Receiving the Order</h2>
                <ul className="space-y-2 ml-4">
                  <li>• A signature and valid ID proof may be required at the time of delivery.</li>
                  <li>• If you are unavailable, an authorized person at the delivery address may receive the package on your behalf.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">7. Failed Deliveries & Reattempts</h2>
                <ul className="space-y-2 ml-4">
                  <li>• If a delivery attempt fails due to an incorrect address or unavailability, the courier will usually attempt redelivery.</li>
                  <li>• If returned to us, reshipping will be arranged upon confirmation and may incur additional charges.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">8. International Shipping</h2>
                <p className="ml-4">We currently do not offer international shipping. Orders can only be delivered to addresses within India.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">9. Need Help?</h2>
                <p className="ml-4">If you have any questions or need help with shipping, please contact:</p>
                <div className="ml-8 mt-2 space-y-1">
                  <p><strong>Email:</strong> saikrishnang@navajothiandco.com</p>
                  <p><strong>Phone:</strong> 9344739675</p>
                  <p><strong>Address:</strong> 75, Periya Chetty Street, Trichy - 620008, Tamil Nadu, India</p>
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

export default ShippingPolicy;
