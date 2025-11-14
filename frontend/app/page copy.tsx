'use client';

import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import api from "@/utils/axios";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  product_price: number;
  image_url: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full mt-0">
      {/* Banner full-width */}
      <Banner />

      {/* Intro Section */}
      <section className="text-center mt-10 w-full px-4 md:px-0">
        <h1 className="text-4xl font-bold">Welcome to Arav Snacks</h1>
        <p className="mt-4 text-gray-600">Fresh snacks delivered to your doorstep.</p>
      </section>

      {/* Products Grid */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto px-4 md:px-0 ">
        {loading ? (
          <p className="text-center col-span-full">Loading products...</p>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </section>
    </div>
  );
}
 