'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-green-600 text-white px-4 py-3 flex justify-between">
      <h1 className="font-bold text-xl">🛒 Arav Snacks</h1>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/signup">Sign Up</Link>
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
      </div>
    </nav>
  );
}
