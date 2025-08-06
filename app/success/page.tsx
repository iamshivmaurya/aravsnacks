'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <section className="mt-6 text-center">
      <h1 className="text-2xl font-bold mb-4 text-green-600">🎉 Order Placed Successfully!</h1>
      <p className="text-gray-700 mb-6">Thank you for shopping with us.</p>
      <Link href="/account" className="text-blue-600 hover:underline">
        View My Orders
      </Link>
    </section>
  );
}
