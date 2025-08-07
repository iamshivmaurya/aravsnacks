import Image from "next/image";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/banner.jpg"  // Make sure to place banner.jpg in /public folder
        alt="Banner"
        fill
        className="object-cover object-center opacity-90"
        priority
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to Arav Snacks
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Delicious bites delivered to your door.
        </p>
        <Link href="/products">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-lg transition">
            Shop Now
          </button>
        </Link>
      </div>
    </section>
  );
}
