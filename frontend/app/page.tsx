'use client';

import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import api from "@/utils/axios";
import { useEffect, useState } from "react";
import CategoriesSection from "@/components/CategoriesSection";
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
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="w-full mt-0">
      {/* Banner Section */}
      <Banner />

      {/* Intro Section */}
      <section className="text-center mt-16 w-full px-4 max-w-3xl mx-auto">

        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Welcome to <span className="text-orange-500 drop-shadow-md">Arav Snacks</span>
        </h1>

        <p className="mt-5 text-gray-700 text-lg">
          Fresh, crispy, and delightful snacks crafted with love, premium ingredients,
          and authentic Indian flavors.
        </p>

        {/* Decorative Line */}
        <div className="mt-6 flex justify-center">
          <div className="h-1 w-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
        </div>

        {/* Small Tagline Box */}
        <div className="mt-6 inline-block bg-orange-50 border border-orange-200 px-6 py-3 rounded-xl shadow-sm">
          <p className="text-orange-600 font-medium">
            100% Fresh • Authentic Taste • Delivered Fast
          </p>
        </div>

      </section>


   
              <>
                {/* other sections */}
                <CategoriesSection />
              </>
          


    {/* PRODUCT GRID */}
          <section className="mt-16 max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center">Our Products</h2>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {loading ? (
                <p className="text-center col-span-full">Loading products...</p>
              ) : (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </section>


            {/* WHY CHOOSE US Section */}
            <section className="mt-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-800">
          Why Choose <span className="text-orange-500">Arav Snacks?</span>
        </h2>
        <p className="text-center text-gray-600 mt-3 text-lg">
          We bring you premium quality snacks crafted with care & authentic flavors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-14">

          {/* Card 1 */}
          <div className="group bg-white/70 backdrop-blur-xl shadow-xl p-8 rounded-2xl border border-orange-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-500 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a7 7 0 0 0-7 7v3.382a3 3 0 0 1-.553 1.735L3.11 16.723A1 1 0 0 0 4 18h16a1 1 0 0 0 .89-1.277l-1.337-2.606A3 3 0 0 1 19 12.382V9a7 7 0 0 0-7-7Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mt-6">
              Fresh Ingredients
            </h3>
            <p className="text-gray-600 text-center mt-3">
              Only the finest and freshest ingredients in every batch of snacks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/70 backdrop-blur-xl shadow-xl p-8 rounded-2xl border border-orange-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-500 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3l8 6v12H4V9l8-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mt-6">
              Authentic Taste
            </h3>
            <p className="text-gray-600 text-center mt-3">
              Traditional flavors prepared with a perfect blend of spices.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/70 backdrop-blur-xl shadow-xl p-8 rounded-2xl border border-orange-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-orange-100 group-hover:bg-orange-500 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v2H3V3zm2 4h14l-1.5 12h-11L5 7zm5 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 .001 3.999A2 2 0 0 0 16 21z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mt-6">
              Fast Delivery
            </h3>
            <p className="text-gray-600 text-center mt-3">
              Quick & safe delivery — snacks reach you fresh and crispy.
            </p>
          </div>

        </div>
      </section>


 {/* TESTIMONIALS */}
<section className="mt-24 bg-gradient-to-b from-orange-50 to-white py-20 px-6">
  <h2 className="text-4xl font-extrabold text-center text-gray-900">
    What Our <span className="text-orange-500">Customers Say</span>
  </h2>
  <p className="text-center text-gray-600 mt-3 text-lg">
    Real experiences from people who love our snacks ❤️
  </p>

  <div className="max-w-6xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-3 gap-10">
    
    {/* Card 1 */}
    <div className="group bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-orange-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
      <div className="text-orange-500 text-4xl mb-3">“</div>
      <p className="text-gray-700 text-lg leading-relaxed">
        Crispy, tasty & super fresh! Arav Snacks never disappoints.
      </p>
      <h4 className="mt-6 font-bold text-orange-600 text-right">— Kunal Patel</h4>
    </div>

    {/* Card 2 */}
    <div className="group bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-orange-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
      <div className="text-orange-500 text-4xl mb-3">“</div>
      <p className="text-gray-700 text-lg leading-relaxed">
        Best snacks in town. Perfect for tea-time and family gatherings!
      </p>
      <h4 className="mt-6 font-bold text-orange-600 text-right">— Neha Sharma</h4>
    </div>

    {/* Card 3 */}
    <div className="group bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-orange-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
      <div className="text-orange-500 text-4xl mb-3">“</div>
      <p className="text-gray-700 text-lg leading-relaxed">
        Amazing quality, proper packaging & fast doorstep delivery. Loved it!
      </p>
      <h4 className="mt-6 font-bold text-orange-600 text-right">— Rakesh Gupta</h4>
    </div>

  </div>
</section>


   {/* ABOUT SHORT SECTION */}
<section className="mt-24 max-w-7xl mx-auto px-6 md:px-0">
  <div className="grid md:grid-cols-2 gap-14 items-center">

    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition"></div>
      <img
        src="/snacks.jpg"
        alt="About Arav Snacks"
        className="relative rounded-3xl shadow-xl group-hover:scale-105 transition-transform duration-500"
      />
    </div>

    <div>
      <h2 className="text-4xl font-extrabold text-gray-900">
        About <span className="text-orange-500">Arav Snacks</span>
      </h2>

      <p className="mt-5 text-gray-700 leading-relaxed text-lg">
        At Arav Snacks, we bring you freshly prepared traditional Indian snacks made 
        with authentic flavors and premium ingredients. Every bite is crafted with 
        love, hygiene, and unmatched taste.
      </p>

      <p className="mt-4 text-gray-600 leading-relaxed">
        Our goal is simple — deliver happiness packed with crunch and flavor right 
        to your doorstep.
      </p>
    </div>

  </div>
</section>

{/* CALL TO ACTION */}
<section className="mt-28 text-center py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
  <div className="absolute inset-0 opacity-20 bg-[url('/texture.png')] bg-cover"></div>

  <div className="relative">
    <h2 className="text-4xl md:text-5xl font-extrabold drop-shadow">
      Craving Something <span className="text-yellow-300">Tasty?</span>
    </h2>

    <p className="mt-4 text-xl text-orange-100">
      Explore our fresh & delicious snack collection today!
    </p>

    <a
      href="/products"
      className="mt-8 inline-block bg-white text-orange-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    >
      Order Now
    </a>
  </div>
</section>



    </div>
  );
}
