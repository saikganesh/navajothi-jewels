
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-serif font-bold text-navy mb-6 text-center">
              Terms and Conditions
            </h1>
            
            <div className="space-y-6 text-gray-700">
              <div className="border-b pb-4">
                <p><strong>Effective Date:</strong> 21-07-2025</p>
                <p><strong>Store Name:</strong> Navajothi and Co</p>
                <p><strong>Website:</strong> https://www.navajothiandco.com</p>
              </div>

              <p className="text-lg">
                Please read these Terms and Conditions ("Terms") carefully before using our website or purchasing any products. By accessing this website or placing an order, you agree to be bound by these Terms.
              </p>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">1. Eligibility</h2>
                <p className="ml-4">
                  You must be at least 18 years of age to purchase from our website. By using our services, you confirm that you are of legal age and capable of entering into a binding contract.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">2. Product Information</h2>
                <ul className="space-y-2 ml-4">
                  <li>• All jewellery sold by Navajothi and Co is BIS-hallmarked and guaranteed to be genuine.</li>
                  <li>• Product images are for illustration purposes only. Actual product appearance may slightly vary due to lighting and screen resolution.</li>
                  <li>• We strive for accuracy in product descriptions, weights, and prices. However, errors may occasionally occur. We reserve the right to correct such errors without prior notice.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">3. Pricing and Payments</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Prices displayed on the website are inclusive of GST unless otherwise stated.</li>
                  <li>• Our product pricing reflects real-time market gold rates and may change without prior notice.</li>
                  <li>• Payments are accepted through secure and trusted payment gateways.</li>
                  <li>• Orders are processed only upon successful payment confirmation.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">4. Order Confirmation and Cancellation</h2>
                <ul className="space-y-2 ml-4">
                  <li>• You will receive an email confirmation after successful placement and payment of your order.</li>
                  <li>• Orders can be cancelled within 24 hours of placement by contacting our support team.</li>
                  <li>• Navajothi and Co reserves the right to cancel orders in case of stock unavailability, pricing errors, or payment issues.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">5. Shipping and Delivery</h2>
                <ul className="space-y-2 ml-4">
                  <li>• All orders are shipped securely and insured through trusted logistics partners.</li>
                  <li>• Estimated delivery time is between 7 to 14 working days, depending on your location.</li>
                  <li>• We are not liable for delivery delays caused by logistics providers, weather, or unforeseen events.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">6. Returns and Refunds</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Returns are accepted within 10 days of delivery only if the product is damaged during shipping or packaging.</li>
                  <li>• Returned items must be unused, in original condition, and accompanied by the original invoice, packaging, and certificates.</li>
                  <li>• Approved refunds will be processed within 3 to 7 business days after receiving and inspecting the returned product.</li>
                  <li>• Return shipping charges may apply unless the product was damaged due to shipping.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">7. Intellectual Property</h2>
                <p className="ml-4">
                  All content on this website, including but not limited to logos, product images, text, and layout, is the property of Navajothi and Co. Unauthorized use or reproduction is strictly prohibited.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">8. Limitation of Liability</h2>
                <p className="ml-4">
                  Navajothi and Co shall not be held liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our products or website.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">9. Privacy Policy</h2>
                <p className="ml-4">
                  Your personal data is handled with strict confidentiality and is governed by our Privacy Policy. We use secure payment methods and do not store any sensitive financial information.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">10. Governing Law and Jurisdiction</h2>
                <p className="ml-4">
                  These Terms are governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Trichy, Tamil Nadu, India.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">11. Contact Information</h2>
                <p className="ml-4">For any queries, reach out to us at:</p>
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

export default TermsAndConditions;
