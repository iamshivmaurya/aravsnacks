'use client';

import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { GET_PRODUCTS_API } from '../constants';
type Product = {
  id: number;
  product_name: string;
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
        const response = await axios.get(GET_PRODUCTS_API);
        setProducts(response.data); // assuming API returns array of products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <Banner />
      <section className="text-center mt-10">
        <h1 className="text-4xl font-bold">Welcome to Arav Snacks</h1>
        <p className="mt-4 text-gray-600">Fresh snacks delivered to your doorstep.</p>
      </section>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
