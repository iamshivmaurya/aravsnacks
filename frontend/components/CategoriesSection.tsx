"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/utils/axios";

interface Category {
  category_id: number;
  category_name: string;
  description: string;
  image_name: string;
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories?skip=0&limit=8`);
      const data = res.data;
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="text-center p-6 text-lg">Loading categories...</p>;

  return (
    <section className="mt-16 max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Browse Categories
      </h2>

     
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories.map((cat) => (
        <div
        key={cat.category_id}
        className=" "
      >
          {/* Circle Image */}
          <div className="flex justify-center mt-2">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-yellow-400 shadow group-hover:scale-105 transition duration-300">
              <Image
                src={
                  cat.image_name.startsWith("http")
                    ? cat.image_name
                    : `${process.env.NEXT_PUBLIC_MEDIA_URL}/media/${cat.image_name}`
                }
                alt={cat.category_name}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        
          {/* Text */}
          <h3 className="font-semibold text-center text-lg text-gray-800 mt-4">
            {cat.category_name}
          </h3>
          {/* <p className="text-sm text-gray-600 text-center mt-1 line-clamp-2">
            {cat.description}
          </p> */}
        </div>
        
        ))}
      </div>
    </section>
  );
}
