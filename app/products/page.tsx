'use client';

import ProductCard from '../../components/ProductCard';

const dummyProducts = [
  {
    id: 1,
    name: 'Fresh Apples',
    description: 'Crisp, sweet apples for everyday snack.',
    price: 120,
    image: '/sample-image.jpg',
  },
  {
    id: 2,
    name: 'Milk (1L)',
    description: 'Pure cow milk, full cream.',
    price: 50,
    image: '/sample-image.jpg',
  },
];

export default function ProductsPage() {
  return (
    <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {dummyProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
