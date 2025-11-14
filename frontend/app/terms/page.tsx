import React from "react";

export const metadata = {
  title: "Terms & Conditions | Arav Snacks",
  description:
    "Read the Terms & Conditions for using Arav Snacks — your trusted source for tasty & healthy snacks.",
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8 md:p-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Terms & Conditions
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
              Welcome to <strong>Arav Snacks</strong>. By accessing or using our
              website, you agree to be bound by these Terms & Conditions. Please
              read them carefully before using our services.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              2. Use of Our Website
            </h2>
            <p>
              You agree to use this website only for lawful purposes. You must
              not misuse, hack, or attempt to disrupt our services in any way.
              We reserve the right to restrict or terminate access for users who
              violate these terms.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              3. Product Information
            </h2>
            <p>
              We make every effort to ensure product details and pricing are
              accurate. However, errors may occasionally occur. Arav Snacks
              reserves the right to correct such inaccuracies without prior
              notice.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              4. Orders & Payments
            </h2>
            <p>
              All purchases made through our website are subject to product
              availability. We reserve the right to cancel or refuse any order
              if fraud or unauthorized activity is suspected.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              5. Shipping & Delivery
            </h2>
            <p>
              Delivery times are estimates and may vary based on location and
              availability. Arav Snacks is not responsible for delays caused by
              shipping carriers or unforeseen circumstances.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              6. Returns & Refunds
            </h2>
            <p>
              If you receive a damaged or incorrect product, please contact us
              within 3 days of delivery. Refunds or replacements will be
              processed as per our return policy.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              7. Intellectual Property
            </h2>
            <p>
              All content on this site, including text, images, and logos, is
              owned by Arav Snacks and protected by copyright law. You may not
              reproduce or use our content without prior permission.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              Arav Snacks shall not be held liable for any damages arising from
              the use or inability to use our website or products, to the extent
              permitted by law.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              9. Changes to Terms
            </h2>
            <p>
              We may update or modify these Terms & Conditions at any time. Any
              changes will be reflected on this page with a new “Last Updated”
              date.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-3">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
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
