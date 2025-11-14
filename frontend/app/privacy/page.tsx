import React from "react";

export const metadata = {
  title: "Privacy Policy | Arav Snacks",
  description:
    "Read Arav Snacks' Privacy Policy to understand how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8 md:p-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              1. Introduction
            </h2>
            <p>
              At <strong>Arav Snacks</strong>, your privacy is very important to us.
              This Privacy Policy explains how we collect, use, and protect your
              personal information when you visit our website or make a purchase.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              2. Information We Collect
            </h2>
            <p>
              We may collect personal information such as your name, email address,
              phone number, shipping address, and payment details when you make a
              purchase or sign up for our newsletter.
            </p>
            <p className="mt-2">
              We also collect non-personal data such as browser type, device
              information, and IP address for analytics and website improvements.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              3. How We Use Your Information
            </h2>
            <p>Your data helps us to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Send updates, promotions, and newsletters</li>
              <li>Improve our website and customer experience</li>
              <li>Respond to your queries and customer service requests</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              4. Data Protection & Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your data from unauthorized access, loss, or misuse.  
              However, please note that no method of online transmission is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              5. Cookies
            </h2>
            <p>
              Our website uses cookies to enhance user experience and analyze
              traffic. You can choose to disable cookies through your browser
              settings, but some features of our site may not function properly
              without them.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              6. Third-Party Services
            </h2>
            <p>
              We may use trusted third-party services such as payment gateways or
              analytics tools. These third parties have access to your data only
              to perform their specific functions and are obligated not to disclose
              or use it for any other purpose.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access the data we hold about you</li>
              <li>Request corrections or updates to your information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of receiving marketing emails</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. Any changes will be
              reflected on this page with a revised "Last Updated" date. We
              encourage you to review it regularly.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              9. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy,
              please contact us at{" "}
              <a
                href="mailto:support@aravsnacks.com"
                className="text-orange-500 hover:underline"
              >
                support@aravsnacks.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
