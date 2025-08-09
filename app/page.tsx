 
import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { dummyProducts } from "@/components/DummyProducts";


// const dummyProducts = [
//   {
//     id: 1,
//     name: 'Fresh Apples',
//     description: 'Crisp, sweet apples for everyday snack.',
//     price: 120,
//     image: '/sample-image.jpg',
//   },
//   {
//     id: 2,
//     name: 'Milk (1L)',
//     description: 'Pure cow milk, full cream.',
//     price: 50,
//     image: '/sample-image.jpg',
//   },
// ];





export default function Home() {
  return (
    <div>
      <Banner />
        <section className="text-center mt-10">
            <h1 className="text-4xl font-bold">Welcome to Arav Snacks</h1>
            <p className="mt-4 text-gray-600">Fresh snacks delivered to your doorstep.</p>
          </section>
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {dummyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </section>
    </div>
  );
}
