import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Brand Info */}
        <div>
          <h2 className="text-2xl font-bold text-orange-500">Arav Snacks</h2>
          <p className="mt-2 text-gray-400">
            Tasty & healthy snacks delivered to your doorstep.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/" className="hover:text-orange-400">Home</Link></li>
            <li><Link href="/about" className="hover:text-orange-400">About</Link></li>
            <li><Link href="/products" className="hover:text-orange-400">Products</Link></li>
            <li><Link href="/contact" className="hover:text-orange-400">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3: Social Media */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4 text-gray-400">
            <Link href="#" className="hover:text-orange-400"><Facebook /></Link>
            <Link href="#" className="hover:text-orange-400"><Instagram /></Link>
            <Link href="#" className="hover:text-orange-400"><Twitter /></Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 text-center text-gray-500 text-sm py-4">
        &copy; {new Date().getFullYear()} Arav Snacks. All rights reserved.
      </div>
    </footer>
  );
}
