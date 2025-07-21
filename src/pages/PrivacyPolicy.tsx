
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-navy mb-8">Privacy Policy</h1>
          
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
              At Navajothi and Co., your privacy is important to us. This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our website and services.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">1. Information We Collect</h2>
                <p className="mb-4">We collect the following types of information:</p>
                <div className="space-y-4">
                  <p><strong>Personal Information:</strong> Name, address, email, phone number, and other contact details.</p>
                  <p><strong>Payment Information:</strong> Payment method details (processed securely via third-party payment gateways; we do not store card information).</p>
                  <p><strong>Order Information:</strong> Product preferences, order history, billing/shipping address.</p>
                  <p><strong>Technical Data:</strong> IP address, browser type, device information, and cookies to improve user experience.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">We use your information for the following purposes:</p>
                <div className="space-y-2">
                  <p>• To process and fulfill your orders.</p>
                  <p>• To provide customer support and respond to queries.</p>
                  <p>• To personalize your shopping experience.</p>
                  <p>• To send updates on orders, offers, or store announcements (only with your consent).</p>
                  <p>• To improve our website, services, and marketing efforts.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">3. Data Sharing and Disclosure</h2>
                <div className="space-y-4">
                  <p>We do not sell, rent, or trade your personal information to third parties. However, we may share your data with:</p>
                  <p>• Trusted third-party service providers for order fulfillment, payment processing, and delivery.</p>
                  <p>• Law enforcement or regulatory authorities when required by law.</p>
                  <p>All third parties we work with are contractually obligated to maintain the confidentiality and security of your data.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">4. Cookies and Tracking Technologies</h2>
                <div className="space-y-4">
                  <p>Our website uses cookies to:</p>
                  <p>• Remember your preferences.</p>
                  <p>• Understand site usage patterns.</p>
                  <p>• Provide a better shopping experience.</p>
                  <p>You can manage or disable cookies through your browser settings, but some features of the site may not function properly.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes SSL encryption and secure server infrastructure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">6. Your Rights</h2>
                <div className="space-y-4">
                  <p>You have the right to:</p>
                  <p>• Access the personal information we hold about you.</p>
                  <p>• Request correction or deletion of your data.</p>
                  <p>• Withdraw consent for marketing communications at any time.</p>
                  <p>To exercise these rights, contact us using the details below.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">7. Third-Party Links</h2>
                <p>
                  Our website may contain links to external websites. We are not responsible for the privacy practices or content of those third-party sites.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">8. Policy Updates</h2>
                <p>
                  We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated effective date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-navy mb-4">9. Contact Us</h2>
                <p>If you have any questions or concerns about this Privacy Policy, contact us at:</p>
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

export default PrivacyPolicy;
