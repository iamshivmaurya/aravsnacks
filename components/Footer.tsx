import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold text-orange-500 tracking-wide">
            Arav Snacks
          </h2>
          <p className="text-gray-300">
            Tasty & healthy snacks delivered to your doorstep.
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
              <Link href="/about" className="hover:text-orange-400 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-orange-400 transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-orange-400 transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Social Media */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Follow Us
          </h3>
          <div className="flex gap-5 mt-3">
            <Link href="#" className="hover:text-orange-400 transform hover:scale-110 transition-all duration-300">
              <Facebook size={28} />
            </Link>
            <Link href="#" className="hover:text-orange-400 transform hover:scale-110 transition-all duration-300">
              <Instagram size={28} />
            </Link>
            <Link href="#" className="hover:text-orange-400 transform hover:scale-110 transition-all duration-300">
              <Twitter size={28} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 text-center text-gray-400 text-sm py-5 mt-6">
        &copy; {new Date().getFullYear()} Arav Snacks. All rights reserved.
      </div>
    </footer>
  );
}
