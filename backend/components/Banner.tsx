'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const banners = [
  {
    src: "/banner.jpg",
    title: "Welcome to Arav Snacks",
    subtitle: "Delicious bites delivered to your door.",
  },
  {
    src: "/banner2.jpg",
    title: "Fresh & Tasty",
    subtitle: "Every snack crafted with love.",
  },
  {
    src: "/banner3.jpg",
    title: "Snack Smart",
    subtitle: "Healthy snacks for your busy lifestyle.",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-20" : "opacity-0 z-10"
          }`}
        >
          <Image
            src={banner.src}
            alt={banner.title}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {banner.title}
            </h1>
            <p className="text-lg md:text-2xl mb-6 drop-shadow-md">
              {banner.subtitle}
            </p>
            <Link href="/products">
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg transition-transform hover:scale-105">
                Shop Now
              </button>
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index ? "bg-white scale-125" : "bg-white/50"
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
}
