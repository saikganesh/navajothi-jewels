
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-navy mb-8">Terms and Conditions</h1>
          
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
              Please read these Terms and Conditions ("Terms") carefully before using our website or purchasing any products. By accessing this website or placing an order, you agree to be bound by these Terms.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">1. Eligibility</h2>
                <p>
                  You must be at least 18 years of age to purchase from our website. By using our services, you confirm that you are of legal age and capable of entering into a binding contract.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">2. Product Information</h2>
                <div className="space-y-4">
                  <p>All jewellery sold by Navajothi and Co is BIS-hallmarked and guaranteed to be genuine.</p>
                  <p>Product images are for illustration purposes only. Actual product appearance may slightly vary due to lighting and screen resolution.</p>
                  <p>We strive for accuracy in product descriptions, weights, and prices. However, errors may occasionally occur. We reserve the right to correct such errors without prior notice.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">3. Pricing and Payments</h2>
                <div className="space-y-4">
                  <p>Prices displayed on the website are inclusive of GST unless otherwise stated.</p>
                  <p>Our product pricing reflects real-time market gold rates and may change without prior notice.</p>
                  <p>Payments are accepted through secure and trusted payment gateways.</p>
                  <p>Orders are processed only upon successful payment confirmation.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">4. Order Confirmation and Cancellation</h2>
                <div className="space-y-4">
                  <p>You will receive an email confirmation after successful placement and payment of your order.</p>
                  <p>Orders can be cancelled within 24 hours of placement by contacting our support team.</p>
                  <p>Navajothi and Co reserves the right to cancel orders in case of stock unavailability, pricing errors, or payment issues.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">5. Shipping and Delivery</h2>
                <div className="space-y-4">
                  <p>All orders are shipped securely and insured through trusted logistics partners.</p>
                  <p>Estimated delivery time is between 7 to 14 working days, depending on your location.</p>
                  <p>We are not liable for delivery delays caused by logistics providers, weather, or unforeseen events.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">6. Returns and Refunds</h2>
                <div className="space-y-4">
                  <p>Returns are accepted within 10 days of delivery only if the product is damaged during shipping or packaging.</p>
                  <p>Returned items must be unused, in original condition, and accompanied by the original invoice, packaging, and certificates.</p>
                  <p>Approved refunds will be processed within 3 to 7 business days after receiving and inspecting the returned product.</p>
                  <p>Return shipping charges may apply unless the product was damaged due to shipping.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">7. Intellectual Property</h2>
                <p>
                  All content on this website, including but not limited to logos, product images, text, and layout, is the property of Navajothi and Co. Unauthorized use or reproduction is strictly prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">8. Limitation of Liability</h2>
                <p>
                  Navajothi and Co shall not be held liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our products or website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">9. Privacy Policy</h2>
                <p>
                  Your personal data is handled with strict confidentiality and is governed by our Privacy Policy. We use secure payment methods and do not store any sensitive financial information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">10. Governing Law and Jurisdiction</h2>
                <p>
                  These Terms are governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Trichy, Tamil Nadu, India.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">11. Contact Information</h2>
                <p>For any queries, reach out to us at:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> saikrishnang@navajothiandco.com</p>
                  <p><strong>Phone:</strong> 9344739675</p>
                  <p><strong>Address:</strong> 75, Periya Chetty Street, Trichy - 620008, Tamil Nadu, India</p>
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

export default TermsAndConditions;
