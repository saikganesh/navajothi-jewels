
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-serif font-bold text-navy mb-6 text-center">
              Privacy Policy
            </h1>
            
            <div className="space-y-6 text-gray-700">
              <div className="border-b pb-4">
                <p><strong>Effective Date:</strong> 21-07-2025</p>
                <p><strong>Store Name:</strong> Navajothi and Co</p>
                <p><strong>Website:</strong> https://www.navajothiandco.com</p>
              </div>

              <p className="text-lg">
                At Navajothi and Co., your privacy is important to us. This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our website and services.
              </p>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">1. Information We Collect</h2>
                <p className="mb-4 ml-4">We collect the following types of information:</p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Personal Information:</strong> Name, address, email, phone number, and other contact details.</li>
                  <li>• <strong>Payment Information:</strong> Payment method details (processed securely via third-party payment gateways; we do not store card information).</li>
                  <li>• <strong>Order Information:</strong> Product preferences, order history, billing/shipping address.</li>
                  <li>• <strong>Technical Data:</strong> IP address, browser type, device information, and cookies to improve user experience.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">2. How We Use Your Information</h2>
                <p className="mb-4 ml-4">We use your information for the following purposes:</p>
                <ul className="space-y-2 ml-4">
                  <li>• To process and fulfill your orders.</li>
                  <li>• To provide customer support and respond to queries.</li>
                  <li>• To personalize your shopping experience.</li>
                  <li>• To send updates on orders, offers, or store announcements (only with your consent).</li>
                  <li>• To improve our website, services, and marketing efforts.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">3. Data Sharing and Disclosure</h2>
                <p className="mb-4 ml-4">We do not sell, rent, or trade your personal information to third parties. However, we may share your data with:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Trusted third-party service providers for order fulfillment, payment processing, and delivery.</li>
                  <li>• Law enforcement or regulatory authorities when required by law.</li>
                </ul>
                <p className="mt-4 ml-4">All third parties we work with are contractually obligated to maintain the confidentiality and security of your data.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">4. Cookies and Tracking Technologies</h2>
                <p className="mb-4 ml-4">Our website uses cookies to:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Remember your preferences.</li>
                  <li>• Understand site usage patterns.</li>
                  <li>• Provide a better shopping experience.</li>
                </ul>
                <p className="mt-4 ml-4">You can manage or disable cookies through your browser settings, but some features of the site may not function properly.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">5. Data Security</h2>
                <p className="ml-4">
                  We implement appropriate technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction. This includes SSL encryption and secure server infrastructure.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">6. Your Rights</h2>
                <p className="mb-4 ml-4">You have the right to:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Access the personal information we hold about you.</li>
                  <li>• Request correction or deletion of your data.</li>
                  <li>• Withdraw consent for marketing communications at any time.</li>
                </ul>
                <p className="mt-4 ml-4">To exercise these rights, contact us using the details below.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">7. Third-Party Links</h2>
                <p className="ml-4">
                  Our website may contain links to external websites. We are not responsible for the privacy practices or content of those third-party sites.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">8. Policy Updates</h2>
                <p className="ml-4">
                  We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated effective date.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-navy mb-3">9. Contact Us</h2>
                <p className="ml-4">If you have any questions or concerns about this Privacy Policy, contact us at:</p>
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

export default PrivacyPolicy;
