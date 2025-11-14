import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-orange-500 tracking-wide">
            Arav Snacks
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Tasty & healthy snacks delivered to your doorstep.  
            Crafted with care, made to share.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Quick Links
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <Link href="/" className="hover:text-orange-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-orange-400 transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-orange-400 transition-colors"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-orange-400 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal Links */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Legal
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <Link
                href="/terms"
                className="hover:text-orange-400 transition-colors"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-orange-400 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Social Media */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Follow Us
          </h3>
          <p className="text-gray-400 mb-4">
            Stay connected with us on social media for latest offers & updates.
          </p>
          <div className="flex gap-5 mt-3">
            <Link
              href="https://facebook.com/aravsnacks"
              target="_blank"
              className="hover:text-orange-400 transform hover:scale-110 transition-all duration-300"
            >
              <Facebook size={26} />
            </Link>
            <Link
              href="https://instagram.com/aravsnacks"
              target="_blank"
              className="hover:text-orange-400 transform hover:scale-110 transition-all duration-300"
            >
              <Instagram size={26} />
            </Link>
            <Link
              href="https://twitter.com/aravsnacks"
              target="_blank"
              className="hover:text-orange-400 transform hover:scale-110 transition-all duration-300"
            >
              <Twitter size={26} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 text-center text-gray-400 text-sm py-5 mt-4">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-orange-500 font-semibold">Arav Snacks</span>. All
          rights reserved.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Made with ❤️ by the Arav Snacks Team
        </p>
      </div>
    </footer>
  );
}
